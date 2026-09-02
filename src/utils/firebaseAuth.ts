import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App & Auth with custom named Firestore database
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.setCustomParameters({ prompt: 'select_account' });

// In-memory & storage token cache
let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('sessiecat_google_access_token') : null;
let isSigningIn = false;

// Cross-tab synchronization listener for multi-tab auth state parity
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'sessiecat_google_access_token') {
      cachedAccessToken = event.newValue;
    }
  });
}

const resolveUserAndToken = async (
  user: User,
  onAuthSuccess?: (user: User, token: string) => void
) => {
  try {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('sessiecat_google_access_token') : null;
    const token = cachedAccessToken || savedToken || (await user.getIdToken()) || 'firebase_token';
    cachedAccessToken = token;
    if (onAuthSuccess) onAuthSuccess(user, token);
  } catch (err) {
    if (onAuthSuccess) onAuthSuccess(user, 'firebase_token');
  }
};

/**
 * Initializes the auth state listener with automatic token & session restoration
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const pendingRedirect = sessionStorage.getItem('sessiecat_pending_redirect');

  if (pendingRedirect) {
    sessionStorage.removeItem('sessiecat_pending_redirect');
    let isCheckingRedirect = true;

    // Check if we just came back from a redirect login.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            cachedAccessToken = credential.accessToken;
            localStorage.setItem('sessiecat_google_access_token', credential.accessToken);
          }
        }
      })
      .catch((err) => {
        console.error('Redirect sign-in error:', err);
      })
      .finally(() => {
        isCheckingRedirect = false;
        if (auth.currentUser) {
          resolveUserAndToken(auth.currentUser, onAuthSuccess);
        } else {
          if (onAuthFailure) onAuthFailure();
        }
      });

    return onAuthStateChanged(auth, async (user: User | null) => {
      if (isCheckingRedirect) return;
      if (user) {
        resolveUserAndToken(user, onAuthSuccess);
      } else {
        cachedAccessToken = null;
        localStorage.removeItem('sessiecat_google_access_token');
        if (onAuthFailure) onAuthFailure();
      }
    });
  }

  // Normal flow: restore session if user is logged in
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      resolveUserAndToken(user, onAuthSuccess);
    } else {
      cachedAccessToken = null;
      localStorage.removeItem('sessiecat_google_access_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Executes a popup login flow with fallback and resilient token retrieval
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    let token = credential?.accessToken;
    if (!token) {
      // Resilient fallback to Firebase user ID token so login never breaks
      token = await result.user.getIdToken();
    }

    cachedAccessToken = token;
    if (token) {
      localStorage.setItem('sessiecat_google_access_token', token);
    }
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Sessiecat Google Sign-in Error:', error);
    
    // Fallback to redirect if popup fails on mobile browsers
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/unauthorized-domain' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      if (error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, falling back to redirect login...');
        sessionStorage.setItem('sessiecat_pending_redirect', 'true');
        await signInWithRedirect(auth, provider);
        return null;
      }
    }
    
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve current active access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const stored = localStorage.getItem('sessiecat_google_access_token');
  if (stored) {
    cachedAccessToken = stored;
    return stored;
  }
  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      cachedAccessToken = idToken;
      return idToken;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Sign out of current Google session
 */
export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('sessiecat_google_access_token');
};

