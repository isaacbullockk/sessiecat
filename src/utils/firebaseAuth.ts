import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App & Auth
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
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

// In-memory token cache (least privilege, avoiding localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initializes the auth state listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const pendingRedirect = sessionStorage.getItem('sessiecat_pending_redirect');

  if (pendingRedirect) {
    sessionStorage.removeItem('sessiecat_pending_redirect');
    let isCheckingRedirect = true;

    // First, check if we just came back from a redirect login.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            cachedAccessToken = credential.accessToken;
          }
        }
      })
      .catch((err) => {
        console.error('Redirect sign-in error:', err);
      })
      .finally(() => {
        isCheckingRedirect = false;
        if (auth.currentUser) {
          if (cachedAccessToken) {
            if (onAuthSuccess) onAuthSuccess(auth.currentUser, cachedAccessToken);
          } else {
            if (onAuthFailure) onAuthFailure();
          }
        } else {
          if (onAuthFailure) onAuthFailure();
        }
      });

    return onAuthStateChanged(auth, async (user: User | null) => {
      if (isCheckingRedirect) return;
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else {
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  }

  // Normal flow, no redirect check overhead
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If the user is logged in but the token is not cached (e.g. reload), 
        // they'll need to re-click sign in to fetch a fresh token.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Executes a popup login flow
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to extract Google Access Token from Authentication response.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sessiecat Google Sign-in Error:', error);
    
    // Fallback to redirect if popup fails (e.g., in mobile webviews or custom tabs)
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/unauthorized-domain') {
       console.log('Falling back to redirect logic...');
       sessionStorage.setItem('sessiecat_pending_redirect', 'true');
       await signInWithRedirect(auth, provider);
       return null; 
    }
    
    // If it's a domain error, Firebase will throw 'auth/unauthorized-domain'
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve current active access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out of current Google session
 */
export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

