import React, { useState, useEffect } from "react";
import { INITIAL_ARTISTS, INITIAL_GIGS, INITIAL_BOOKINGS, INITIAL_JAMS } from "./mockData";
import {
  Artist,
  Gig,
  Booking,
  ChatThread,
  TourEvent,
  TourRoleRequirement,
  HoldDetails,
  NegotiationStep,
  JamEvent,
} from "./types";
import { ArtistCard } from "./components/ArtistCard";
import { GigBoard } from "./components/GigBoard";
import { BookingLauncher } from "./components/BookingLauncher";
import { ChatSimulator } from "./components/ChatSimulator";
import { AddArtistForm } from "./components/AddArtistForm";
import { NDACertificate } from "./components/NDACertificate";
import { TransitTracker } from "./components/TransitTracker";
import { RehearsalPlanner } from "./components/RehearsalPlanner";
import { SafeImage } from "./components/SafeImage";
import { SessiecatLogo } from "./components/SessiecatLogo";
import { AuthErrorModal } from "./components/AuthErrorModal";
import { BandRosterCompliance } from "./components/BandRosterCompliance";
import { LiveStudioFeed } from "./components/LiveStudioFeed";
import { TourWorkspace } from "./components/TourWorkspace";
import { JamWorkspace } from "./components/JamWorkspace";
import { ClaimPage } from "./components/ClaimPage";
import { GearShops } from "./components/GearShops";
import { OnboardingPath } from "./components/OnboardingPath";
import { InviteModal } from "./components/InviteModal";
import { LeadScraper } from "./components/LeadScraper";
import { NotificationBell } from "./components/NotificationBell";
import { OnboardingWelcomeModal } from "./components/OnboardingWelcomeModal";
import { LanguageToggle } from "./components/LanguageToggle";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { DemoTools } from "./components/DemoTools";
import { useTranslation } from "react-i18next";
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  db,
  handleFirestoreError,
  auth,
  OperationType,
  getAccessToken,
} from "./utils/firebaseAuth";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { FinanceWorkspace } from "./components/FinanceWorkspace";
import { VisitorAnalytics } from "./components/VisitorAnalytics";
import { CookieConsentBanner, GDPRConsent } from "./components/CookieConsentBanner";
import { GDPRDataPanel } from "./components/GDPRDataPanel";
import { VisitorFeaturesOverview } from "./components/VisitorFeaturesOverview";
import { LandingPortal } from "./components/LandingPortal";
import {
  Search,
  Users,
  Briefcase,
  Music,
  MapPin,
  Calendar,
  CheckCircle,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  Compass,
  DollarSign,
  Heart,
  User,
  Disc,
  Clock,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Star,
  Navigation,
  Cloud,
  LogOut,
  ExternalLink,
  Check,
  Building,
  Anchor,
  Settings,
  ShoppingBag,
  ShieldAlert,
  HelpCircle,
  Lock,
  ArrowUpDown,
  Play,
  Pause,
  Share2,
  FileText,
  Send,
  Target,
  Euro,
  Eye,
} from "lucide-react";

const INITIAL_TOURS: TourEvent[] = [
  {
    id: "tour_default_1",
    name: "Westergasfabriek Live Campaign 2026",
    description:
      "Elite backing band assembly for Paradiso and Westergasfabriek leg showcases. Sight-reading of charts requested.",
    startDate: "2026-06-12",
    endDate: "2026-06-25",
    budgetShow: 1350,
    roleRequirements: [
      {
        id: "role_init_1",
        roleName: "Bass Guitarist",
        status: "Hold",
        targetBudgetShow: 450,
        assignedArtistId: "m1",
        actualRatePaidShow: 450,
        activeHold: {
          id: "hold_init_1",
          durationDays: 3,
          expiryDate: new Date(Date.now() + 86400000 * 2.5).toISOString(),
          releaseNoticeHours: 24,
          backupBench: [],
          isLocked: true,
        },
        negotiationHistory: [],
      },
      {
        id: "role_init_2",
        roleName: "Guitarist Spacer",
        status: "Open",
        targetBudgetShow: 500,
        negotiationHistory: [],
      },
      {
        id: "role_init_3",
        roleName: "Mixing FOH Director",
        status: "Open",
        targetBudgetShow: 400,
        negotiationHistory: [],
      },
    ],
  },
  {
    id: "tour_default_2",
    name: "Weekly Amstel Club Live Session",
    description:
      "Rotational live jazz series focusing on organic acoustic arrangements and minimal stage setups.",
    startDate: "2026-07-02",
    endDate: "2026-07-09",
    budgetShow: 900,
    roleRequirements: [
      {
        id: "role_init_jazz_1",
        roleName: "Double Bass Jazz Chair",
        status: "Open",
        targetBudgetShow: 400,
        negotiationHistory: [],
      },
      {
        id: "role_init_jazz_2",
        roleName: "Pedal Steel / Banjo Swell Chair",
        status: "Open",
        targetBudgetShow: 450,
        negotiationHistory: [],
      },
    ],
  },
];

export default function App() {
  const { t } = useTranslation();

  // Hash Routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash || "#dashboard";
    return hash.replace(/^#/, "");
  });

  // Stakeholder UI view: 'hire' (Customer seeking artists) or 'work' (Artist seeking gigs)
  const [viewMode, setViewMode] = useState<"hire" | "work">("hire");

  // Multi-Module workspace navigation tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem("sessiecat_active_tab");
    return saved || "dashboard";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#dashboard";
      const cleanPath = hash.replace(/^#/, "") || "dashboard";
      setCurrentPath(cleanPath);

      const baseRoute = cleanPath.split("/")[0];
      setActiveTab(baseRoute);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // initial execution
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  const getRouteMatch = () => {
    const [pathPart, queryPart] = currentPath.split("?");
    const parts = pathPart.split("/");
    const query = new URLSearchParams(queryPart || "");
    return {
      base: parts[0] || "dashboard",
      param: parts[1] || null,
      query,
    };
  };

  const route = getRouteMatch();

  // Onboarding Selection checklist trackers
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("sessiecat_onboarding_completed") === "true";
  });
  const [onboardingPath, setOnboardingPath] = useState<
    "touring_manager" | "jam_organizer" | "sessionist" | "all_rounder" | "investor"
  >(() => {
    const saved = localStorage.getItem("sessiecat_onboarding_path");
    return (saved as any) || "touring_manager";
  });

  // Budget-Aware Discovery Filters
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [sortOption, setSortOption] = useState<string>("rating");

  const [jams, setJams] = useState<JamEvent[]>(INITIAL_JAMS);

  // Google Drive integrations & auth states
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // System Notifications
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [hasCheckedAuthInit, setHasCheckedAuthInit] = useState(false);

  // Load initial Google Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setHasCheckedAuthInit(true);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setHasCheckedAuthInit(true);
      },
    );
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const [gdprConsent, setGdprConsent] = useState<GDPRConsent | null>(null);

  // Automated Visitor Analytics Logging (GDPR compliant)
  useEffect(() => {
    try {
      fetch('/api/visitors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: route.base || 'dashboard',
          referrer: document.referrer || '',
          userEmail: (gdprConsent?.analytics !== false) ? (googleUser?.email || undefined) : undefined,
          userName: (gdprConsent?.analytics !== false) ? (googleUser?.displayName || undefined) : undefined,
          language: navigator.language,
          analyticsConsent: gdprConsent?.analytics !== false,
        }),
      }).catch(() => {});
    } catch (e) {
      // ignore logging errors
    }
  }, [route.base, googleUser?.email, gdprConsent?.analytics]);

  useEffect(() => {
    // Public fetch for claim page or full get for organizers
    const unsubscribe = onSnapshot(
      collection(db, "events"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            const batch = writeBatch(db);
            INITIAL_JAMS.forEach((jam) => {
              const { slots, ...jamDoc } = jam;
              batch.set(doc(db, "events", jam.id), jamDoc);
              slots.forEach((slot) => {
                batch.set(doc(db, `events/${jam.id}/slots`, slot.id), slot);
              });
            });
            await batch.commit();
            setJams(INITIAL_JAMS);
          } else {
            const eventsData = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
            const currentData = [];

            for (const ev of eventsData) {
              const slotsSnap = await getDocs(
                collection(db, `events/${ev.id}/slots`),
              );
              const slotsData = slotsSnap.docs.map((s) => ({
                id: s.id,
                ...s.data(),
              }));
              currentData.push({ ...ev, slots: slotsData } as any);
            }

            setJams(currentData);
          }
        } catch (err) {
          console.error("Failed to load events/jams:", err);
          setJams(INITIAL_JAMS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "events");
        setJams(INITIAL_JAMS);
      },
    );

    return () => unsubscribe();
  }, [googleUser, route.base]);

  // Tour workspace objects loaded from state or seeded
  const [tours, setTours] = useState<TourEvent[]>(INITIAL_TOURS);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tours"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            // Seed initial mock tours
            const batch = writeBatch(db);
            INITIAL_TOURS.forEach((tour) => {
              batch.set(doc(db, "tours", tour.id), tour);
            });
            await batch.commit();
            setTours(INITIAL_TOURS);
          } else {
            const toursData = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
            setTours(toursData as any);
          }
        } catch (err) {
          console.error("Failed to load tours", err);
          setTours(INITIAL_TOURS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "tours");
        setTours(INITIAL_TOURS);
      },
    );

    return () => unsubscribe();
  }, [googleUser, route.base]);

  // React state with localStorage persistence
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "artists"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            const batch = writeBatch(db);
            INITIAL_ARTISTS.forEach((a) =>
              batch.set(doc(db, "artists", a.id), a),
            );
            await batch.commit();
            setArtists(INITIAL_ARTISTS);
          } else {
            const dbArtists = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as Artist,
            );
            const initialMap = new Map(INITIAL_ARTISTS.map((a) => [a.id, a]));

            // To ensure local mock data is always available and up-to-date even if firestore rejects writes,
            // we override db mock artists with our latest INITIAL_ARTISTS data
            const mergedArtists = dbArtists.map((dba) =>
              initialMap.has(dba.id) ? initialMap.get(dba.id)! : dba,
            );
            const missingArtists = INITIAL_ARTISTS.filter(
              (a) => !dbArtists.some((dba) => dba.id === a.id),
            );

            setArtists((prev) => {
              const dbArtistIds = new Set(dbArtists.map(a => a.id));
              const localCustomArtists = prev.filter(a => !dbArtistIds.has(a.id) && !initialMap.has(a.id));
              return [...mergedArtists, ...missingArtists, ...localCustomArtists];
            });
          }
        } catch (err) {
          console.error(err);
          setArtists((prev) => {
            const initialMap = new Map(INITIAL_ARTISTS.map((a) => [a.id, a]));
            const localCustomArtists = prev.filter(a => !initialMap.has(a.id));
            if (localCustomArtists.length === 0 && prev.length === INITIAL_ARTISTS.length) return prev;
            return [...INITIAL_ARTISTS, ...localCustomArtists];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "artists");
        setArtists((prev) => {
          const initialMap = new Map(INITIAL_ARTISTS.map((a) => [a.id, a]));
          const localCustomArtists = prev.filter(a => !initialMap.has(a.id));
          if (localCustomArtists.length === 0 && prev.length === INITIAL_ARTISTS.length) return prev;
          return [...INITIAL_ARTISTS, ...localCustomArtists];
        });
      }
    );
    return () => unsubscribe();
  }, [googleUser, route.base]);

  const [gigs, setGigs] = useState<Gig[]>(INITIAL_GIGS);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "gigs"), async (snapshot) => {
      try {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_GIGS.forEach((g) => batch.set(doc(db, "gigs", g.id), g));
          await batch.commit();
          setGigs((prev) => {
             const localCustom = prev.filter(g => !INITIAL_GIGS.some(ig => ig.id === g.id));
             return [...INITIAL_GIGS, ...localCustom];
          });
        } else {
          const dbGigs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Gig);
          setGigs((prev) => {
             const dbIds = new Set(dbGigs.map(g => g.id));
             const localCustom = prev.filter(g => !dbIds.has(g.id) && !INITIAL_GIGS.some(ig => ig.id === g.id));
             return [...dbGigs, ...localCustom];
          });
        }
      } catch (err) {
        console.error(err);
        setGigs((prev) => {
           const localCustom = prev.filter(g => !INITIAL_GIGS.some(ig => ig.id === g.id));
           return [...INITIAL_GIGS, ...localCustom];
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "gigs");
      setGigs((prev) => {
         const localCustom = prev.filter(g => !INITIAL_GIGS.some(ig => ig.id === g.id));
         return [...INITIAL_GIGS, ...localCustom];
      });
    });
    return () => unsubscribe();
  }, [googleUser, route.base]);

  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            const batch = writeBatch(db);
            INITIAL_BOOKINGS.forEach((b) =>
              batch.set(doc(db, "bookings", b.id), b),
            );
            await batch.commit();
            setBookings((prev) => {
               const localCustom = prev.filter(b => !INITIAL_BOOKINGS.some(ib => ib.id === b.id));
               return [...INITIAL_BOOKINGS, ...localCustom];
            });
          } else {
            const dbBookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
            setBookings((prev) => {
               const dbIds = new Set(dbBookings.map(b => b.id));
               const localCustom = prev.filter(b => !dbIds.has(b.id) && !INITIAL_BOOKINGS.some(ib => ib.id === b.id));
               return [...dbBookings, ...localCustom];
            });
          }
        } catch (err) {
          console.error(err);
          setBookings((prev) => {
             const localCustom = prev.filter(b => !INITIAL_BOOKINGS.some(ib => ib.id === b.id));
             return [...INITIAL_BOOKINGS, ...localCustom];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "bookings");
        setBookings((prev) => {
           const localCustom = prev.filter(b => !INITIAL_BOOKINGS.some(ib => ib.id === b.id));
           return [...INITIAL_BOOKINGS, ...localCustom];
        });
      }
    );
    return () => unsubscribe();
  }, [googleUser, route.base]);

  const [chats, setChats] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (!googleUser && route.base !== "claim") return;
    const unsubscribe = onSnapshot(
      collection(db, "chats"),
      (snapshot) => {
        try {
          const dbChats = snapshot.docs.map(
            (doc) => ({ ...doc.data() }) as ChatThread,
          );
          setChats(dbChats);
        } catch (err) {
          console.error("Failed to load chats", err);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "chats");
      },
    );
    return () => unsubscribe();
  }, [googleUser, route.base]);

  // Flow State
  const [selectedArtistForBooking, setSelectedArtistForBooking] =
    useState<Artist | null>(null);
  const [selectedArtistForChat, setSelectedArtistForChat] =
    useState<Artist | null>(null);
  const [isAddArtistOpen, setIsAddArtistOpen] = useState(false);
  const [selectedNDACert, setSelectedNDACert] = useState<Booking | null>(null);
  const [activeTransitBooking, setActiveTransitBooking] =
    useState<Booking | null>(null);

  // Saved Favorites list
  const [favoriteArtistIds, setFavoriteArtistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("sessiecat_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [isDemoToolsOpen, setIsDemoToolsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle demo tools with Ctrl+Shift+D or Cmd+Shift+D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDemoToolsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Client / Production reputation score feedback left by booked artists
  const [clientReviews, setClientReviews] = useState<
    Array<{
      id: string;
      artistName: string;
      artistAvatar: string;
      rating: number;
      comment: string;
      date: string;
    }>
  >(() => {
    const saved = localStorage.getItem("sessiecat_client_reviews");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "cr_init_1",
            artistName: "Sam Ritchie",
            artistAvatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            rating: 5,
            comment:
              "Taylor & Team Tour paid instantly and provides top-tier in-ear monitor setups for our Melkweg live set. Absolute pleasure!",
            date: "2026-05-18",
          },
          {
            id: "cr_init_2",
            artistName: 'Anouk "Slide" van der Meer',
            artistAvatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            rating: 5,
            comment:
              "Excellent agency and stage management communication. Clear charts provided weeks ahead of time. Decreased booking competition for their Westergasfabriek leg!",
            date: "2026-04-29",
          },
        ];
  });

  // Hiring Filters
  const [hireSearch, setHireSearch] = useState("");
  const [instrumentsFilter, setInstrumentsFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showClientReviews, setShowClientReviews] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "sessiecat_favorites",
      JSON.stringify(favoriteArtistIds),
    );
  }, [favoriteArtistIds]);

  useEffect(() => {
    localStorage.setItem(
      "sessiecat_client_reviews",
      JSON.stringify(clientReviews),
    );
  }, [clientReviews]);

  useEffect(() => {
    localStorage.setItem("sessiecat_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("sessiecat_onboarding_path", onboardingPath);
  }, [onboardingPath]);

  // Alert dismisser
  useEffect(() => {
    if (successBanner) {
      const timer = setTimeout(() => setSuccessBanner(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [successBanner]);

  // Action handlers
  const handleToggleFavoriteContextAware = (artistId: string) => {
    const jamId = getRouteMatch().query.get("jamId");
    if (jamId) {
      setJams((prevJams) =>
        prevJams.map((jam) => {
          if (jam.id === jamId) {
            const isFav = jam.shortlistIds?.includes(artistId) ?? false;
            let newShortlist = jam.shortlistIds || [];
            if (isFav) {
              newShortlist = newShortlist.filter((id) => id !== artistId);
            } else {
              newShortlist = [...newShortlist, artistId];
            }
            return { ...jam, shortlistIds: newShortlist };
          }
          return jam;
        }),
      );
    } else {
      setFavoriteArtistIds((prev) => {
        const isFav = prev.includes(artistId);
        if (isFav) {
          return prev.filter((id) => id !== artistId);
        } else {
          return [...prev, artistId];
        }
      });
    }
  };

  const handleToggleFavorite = (artistId: string) => {
    setFavoriteArtistIds((prev) => {
      const isFav = prev.includes(artistId);
      if (isFav) {
        return prev.filter((id) => id !== artistId);
      } else {
        return [...prev, artistId];
      }
    });
  };

  const handleAddReview = (
    artistId: string,
    author: string,
    role: string,
    rating: number,
    comment: string,
  ) => {
    const newReview = {
      id: `r_custom_${Date.now()}`,
      author,
      role,
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
    };

    setArtists((prevList) =>
      prevList.map((m) => {
        if (m.id === artistId) {
          const updatedReviews = [newReview, ...m.reviews];
          const avgRating =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length;
          return {
            ...m,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: Math.round(avgRating * 10) / 10,
          };
        }
        return m;
      }),
    );
    setSuccessBanner(
      `Feedback locked in! Your performance review has been recorded on state.`,
    );
  };

  const handleRequestReview = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const alreadyReviewed = clientReviews.some(
      (r) => r.id === `cr_${bookingId}`,
    );
    if (alreadyReviewed) {
      setSuccessBanner(
        `A peer feedback has already been successfully filed for this booking!`,
      );
      return;
    }

    setSuccessBanner(
      `📩 Feedback petition dispatched to ${booking.artistName}! Processing orbital feedback...`,
    );

    setTimeout(() => {
      const comments = [
        "Phenomenal booking setup! They keep high-end players reserved first to decrease local gig competition.",
        "Secure escrow and ultra-swift communications. Highly creative direction & zero competitive friction!",
        "Stellar coordinator. They protect musical IP securely and respect the union's daily schedules.",
        "Total structural transparency. An absolute benchmark client for session artists.",
      ];
      const randomComment =
        comments[Math.floor(Math.random() * comments.length)];

      const newClientReview = {
        id: `cr_${bookingId}`,
        artistName: booking.artistName,
        artistAvatar: booking.artistAvatar,
        rating: 5,
        comment: randomComment,
        date: new Date().toISOString().split("T")[0],
      };

      setClientReviews((prev) => [newClientReview, ...prev]);
      setSuccessBanner(
        `🏆 ${booking.artistName} finalized their 5.0 ★ Client evaluation of your organization!`,
      );
    }, 500);
  };

  // Mock/Guest Login for Preview environments
  const handleGuestLogin = () => {
    setGoogleUser({
      uid: "guest_" + Date.now(),
      displayName: "Guest User",
      email: "guest@sessiecat.com",
    } as any);
    setGoogleToken("mock_guest_token");
    setHasCheckedAuthInit(true);
    setSuccessBanner("Logged in as Guest for preview");
  };

  // Google Drive authentications & export actions
  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSuccessBanner(
          `☁️ Google Session Authorized successfully: ${result.user.displayName || result.user.email}`,
        );
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || String(err);
      setSuccessBanner(`❌ Authentication aborted: ${errMsg}`);
      setAuthError(errMsg);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setGoogleToken(null);
    setSuccessBanner("☁️ Google account session disconnected cleanly.");
  };

  // Action handlers
  const handleApplyToGig = async (gigId: string) => {
    try {
      const targetGig = gigs.find(g => g.id === gigId);
      const newApplicants = [...(targetGig?.applicants || []), googleUser?.displayName || 'Anonymous Candidate'];
      
      await updateDoc(doc(db, "gigs", gigId), { 
        status: "Applied",
        applicants: newApplicants
      });
      setGigs((prevGigs) =>
        prevGigs.map((g) =>
          g.id === gigId ? { ...g, status: "Applied" as const, applicants: newApplicants } : g,
        ),
      );
      setSuccessBanner(
        "Application logged successfully! The booking team will review your credentials & audio stamps shortly.",
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostGig = async (newGigData: Omit<Gig, "id" | "status">) => {
    const newId = `g_custom_${Date.now()}`;
    const newGig: Gig = {
      ...newGigData,
      id: newId,
      status: "Open",
    };
    
    // Optimistically update
    setGigs((prev) => [newGig, ...prev]);
    setSuccessBanner(
      `Your session requirement was posted to the active gigboard!`,
    );
      
    try {
      await setDoc(doc(db, "gigs", newId), newGig);
    } catch (err) {
      console.warn("Could not save to firestore, keeping local mock state:", err);
    }
  };

  const handleCreateBooking = async (
    bookingData: Omit<Booking, "id" | "status" | "dateCreated">,
  ) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `b_custom_${Date.now()}`,
      status: bookingData.requireEscrow === false ? "Pending" : "Confirmed",
      dateCreated: new Date().toISOString().split("T")[0],
    };

    // Optimistically update
    setBookings((prev) => [newBooking, ...prev]);
    setSelectedArtistForBooking(null);
    setSuccessBanner(
      bookingData.requireEscrow === false 
        ? `Request sent to ${bookingData.artistName}.`
        : `Booking with ${bookingData.artistName} secured successfully!`
    );

    try {
      await setDoc(doc(db, "bookings", newBooking.id), newBooking);

      const token = await getAccessToken();
      if (token) {
        const confirmed = window.confirm(
          `Do you want to block out these dates for ${bookingData.artistName} in your authorized Google Calendar?`
        );
        if (confirmed) {
          const dates = bookingData.dateRange !== "TBD" ? bookingData.dateRange.split(' - ') : [];
          // Parse start and end dates simply
          let startDate = new Date();
          let endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // default to 1 day if TBD
          
          if (dates.length >= 1) {
            const parsedStart = new Date(dates[0]);
            if (!isNaN(parsedStart.getTime())) startDate = parsedStart;
          }
          if (dates.length === 2) {
             const parsedEnd = new Date(dates[1]);
             if (!isNaN(parsedEnd.getTime())) endDate = parsedEnd;
          } else if (dates.length === 1) {
             endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          }

          const event = {
            summary: bookingData.requireEscrow === false ? `[Sessiecat] Hold: ${bookingData.artistName}` : `[Sessiecat] Contract: ${bookingData.artistName}`,
            description: bookingData.requireEscrow === false ? `Informal Hold. Proposed Amount: €${bookingData.totalAmount}` : `Escrow booked. Amount: €${bookingData.totalAmount}`,
            start: { date: startDate.toISOString().split("T")[0] },
            end: { date: endDate.toISOString().split("T")[0] }
          };

          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });
          
          if (res.ok) {
            setSuccessBanner(`Confirmed contract and added to Google Calendar!`);
          } else {
             console.error("Calendar insertion failed:", await res.text());
             setSuccessBanner(`Contract confirmed, but failed to sync to Calendar (missing permissions?)`);
          }
        }
      }
    } catch (err) {
      console.warn("Could not save to firestore, keeping local mock state:", err);
    }
  };

  const handleAddArtist = async (newArtist: Artist) => {
    // Associate with the logged-in googleUser if available
    if (googleUser && !newArtist.userId) {
      newArtist.userId = googleUser.uid;
    }

    // Always store the listing ID locally to make it extremely easy to retrieve
    localStorage.setItem("sessiecat_my_artist_id", newArtist.id);

    // Optimistically update (or add) in local state
    setArtists((prev) => {
      const exists = prev.some((a) => a.id === newArtist.id);
      if (exists) {
        return prev.map((a) => (a.id === newArtist.id ? newArtist : a));
      } else {
        return [newArtist, ...prev];
      }
    });
    
    setIsAddArtistOpen(false);
    setSuccessBanner(
      `Profile saved! Your listing as ${newArtist.name} has been published in our escrow directory.`,
    );

    try {
      await setDoc(doc(db, "artists", newArtist.id), newArtist);
    } catch (err) {
      console.warn("Could not save to firestore, keeping local mock state:", err);
    }
  };

  const handleClaimArtist = async (artistToClaim: Artist) => {
    const targetUserId = googleUser ? googleUser.uid : "guest_linked";
    const updatedArtist: Artist = {
      ...artistToClaim,
      userId: targetUserId,
    };

    localStorage.setItem("sessiecat_my_artist_id", artistToClaim.id);

    setArtists((prev) =>
      prev.map((a) => (a.id === artistToClaim.id ? updatedArtist : a))
    );

    setSuccessBanner(
      `Pristine Claim! You have successfully linked "${artistToClaim.name}" to your account. You can now edit and manage your listing from your Dashboard!`,
    );

    try {
      await setDoc(doc(db, "artists", artistToClaim.id), updatedArtist);
    } catch (err) {
      console.warn("Could not save claimed status to Firestore:", err);
    }
  };

  const handlePlaceHoldFromCard = (
    roleId: string,
    tourId: string,
    artist: Artist,
    showRate: number,
  ) => {
    const duration = 3;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);

    const activeHold: HoldDetails = {
      id: `hold_${Date.now()}`,
      durationDays: duration,
      expiryDate: expiry.toISOString(),
      releaseNoticeHours: 24,
      backupBench: [],
      isLocked: true,
    };

    setTours((prev) =>
      prev.map((t) => {
        if (t.id === tourId) {
          return {
            ...t,
            roleRequirements: t.roleRequirements.map((r) => {
              if (r.id === roleId) {
                return {
                  ...r,
                  assignedArtistId: artist.id,
                  status: "Hold",
                  actualRatePaidShow: showRate,
                  activeHold,
                };
              }
              return r;
            }),
          };
        }
        return t;
      }),
    );

    setSuccessBanner(
      `✓ Exclusive Hold Registered! Rate locked at €${showRate} for ${artist.name}.`,
    );
    setActiveTab("tours");
  };

  const handleMakeOfferFromCard = (
    roleId: string,
    tourId: string,
    artist: Artist,
    showOffer: number,
    rehearsalOffer: number,
    note: string,
  ) => {
    const initialStep: NegotiationStep = {
      id: `step_${Date.now()}`,
      sender: "manager",
      rateOfferShow: showOffer,
      rateOfferRehearsal: rehearsalOffer,
      note: note || "Show bid proposal.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "pending",
    };

    setTours((prev) =>
      prev.map((t) => {
        if (t.id === tourId) {
          return {
            ...t,
            roleRequirements: t.roleRequirements.map((r) => {
              if (r.id === roleId) {
                return {
                  ...r,
                  assignedArtistId: artist.id,
                  status: "Negotiation",
                  negotiatedOfferShow: showOffer,
                  negotiatedOfferRehearsal: rehearsalOffer,
                  negotiationHistory: [initialStep],
                };
              }
              return r;
            }),
          };
        }
        return t;
      }),
    );

    setSuccessBanner(
      `⚡ Bid dispatch sent to ${artist.name} at €${showOffer}/show. Counter expected...`,
    );
    setActiveTab("tours");

    // Simulated Response replay timer
    setTimeout(() => {
      setTours((prev) =>
        prev.map((t) => {
          if (t.id !== tourId) return t;

          return {
            ...t,
            roleRequirements: t.roleRequirements.map((r) => {
              if (r.id !== roleId) return r;

              const listed = artist.dailyRate || 450;
              const diff = showOffer - listed;

              let replyOffer = showOffer;
              let status: "accepted" | "countered" | "declined" = "accepted";
              let replyNote = "";

              if (diff >= 0) {
                status = "accepted";
                replyNote = `Super! Listed rate of €${listed} met. Dates locked into workspace.`;
              } else if (Math.abs(diff) <= 60) {
                status = "countered";
                replyOffer = Math.round(listed - Math.abs(diff) / 2);
                replyNote = `We are close. I can counter at €${replyOffer} flat so long as sound checks list early.`;
              } else {
                status = "declined";
                replyNote = `Decline. Standard flat fee remains at least €${listed}. Let me know if you can match.`;
              }

              const step: NegotiationStep = {
                id: `step_${Date.now()}`,
                sender: "artist",
                rateOfferShow: replyOffer,
                note: replyNote,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status,
              };

              return {
                ...r,
                negotiatedOfferShow: replyOffer,
                negotiationHistory: [...r.negotiationHistory, step],
                status: status === "accepted" ? "Confirmed" : r.status,
                actualRatePaidShow:
                  status === "accepted" ? replyOffer : r.actualRatePaidShow,
              };
            }),
          };
        }),
      );
    }, 800);
  };

  const handleOpenChat = async (artist: Artist) => {
    setSelectedArtistForChat(artist);
    // Find or initialize chat thread
    const threadExists = chats.find((c) => c.artistId === artist.id);
    if (!threadExists) {
      const newThread: ChatThread = {
        artistId: artist.id,
        artistName: artist.name,
        artistAvatar: artist.avatarUrl,
        messages: [
          {
            id: `msg_init_${Date.now()}`,
            sender: "artist",
            text: `Hey! Thanks for reaching out. Let me know what kind of instrument charts or recording specs you need!`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      };

      try {
        await setDoc(doc(db, "chats", artist.id), newThread);
        setChats((prev) => [newThread, ...prev]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenChatAndDraft = async (artist: Artist, draftText?: string) => {
    setSelectedArtistForChat(artist);
    let currentThread = chats.find((c) => c.artistId === artist.id);

    if (!currentThread) {
      currentThread = {
        artistId: artist.id,
        artistName: artist.name,
        artistAvatar: artist.avatarUrl,
        messages: [
          {
            id: `msg_init_${Date.now()}`,
            sender: "artist",
            text: `Hey! Thanks for reaching out. Let me know what kind of instrument charts or recording specs you need!`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      };

      try {
        await setDoc(doc(db, "chats", artist.id), currentThread);
        setChats((prev) => [currentThread!, ...prev]);
      } catch (err) {
        console.error(err);
      }
    }

    if (draftText) {
      // Prevent duplicate identical drafts
      if (!currentThread.messages.some((msg) => msg.text === draftText)) {
        const updatedThread = {
          ...currentThread,
          messages: [
            ...currentThread.messages,
            {
              id: `draft_${Date.now()}`,
              sender: "user" as const,
              text: draftText,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        };
        try {
          await updateDoc(doc(db, "chats", artist.id), updatedThread as any);
          setChats((prevThreads) =>
            prevThreads.map((t) =>
              t.artistId === artist.id ? updatedThread : t,
            ),
          );
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedArtistForChat) return;
    const musId = selectedArtistForChat.id;

    const thread = chats.find((c) => c.artistId === musId);
    if (!thread) return;

    const updatedThread = {
      ...thread,
      messages: [
        ...thread.messages,
        {
          id: `msg_u_${Date.now()}`,
          sender: "user" as const,
          text,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    try {
      await updateDoc(doc(db, "chats", musId), updatedThread as any);
      setChats((prevThreads) =>
        prevThreads.map((t) => (t.artistId === musId ? updatedThread : t)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateReply = async (text: string) => {
    if (!selectedArtistForChat) return;
    const musId = selectedArtistForChat.id;

    const thread = chats.find((c) => c.artistId === musId);
    if (!thread) return;

    const updatedThread = {
      ...thread,
      messages: [
        ...thread.messages,
        {
          id: `msg_m_${Date.now()}`,
          sender: "artist" as const,
          text,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    try {
      await updateDoc(doc(db, "chats", musId), updatedThread as any);
      setChats((prevThreads) =>
        prevThreads.map((t) => (t.artistId === musId ? updatedThread : t)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Directory lists for filter
  const myArtistProfile = googleUser
    ? artists.find(
        (a) =>
          a.userId === googleUser.uid ||
          a.id === localStorage.getItem("sessiecat_my_artist_id")
      )
    : artists.find(
        (a) => a.id === localStorage.getItem("sessiecat_my_artist_id")
      );

  const uniqueLocations = [
    "All",
    ...Array.from(new Set(artists.map((m) => m.location))),
  ];
  const uniqueInstruments = [
    "All",
    ...Array.from(new Set(artists.flatMap((m) => m.instruments))),
  ];

  const filteredArtists = artists
    .filter((mus) => {
      const matchesSearch =
        mus.name.toLowerCase().includes(hireSearch.toLowerCase()) ||
        mus.bio.toLowerCase().includes(hireSearch.toLowerCase()) ||
        mus.genres.some((g) =>
          g.toLowerCase().includes(hireSearch.toLowerCase()),
        );
      const matchesInst =
        instrumentsFilter === "All" ||
        mus.instruments.some((i) => i === instrumentsFilter);
      const matchesLoc =
        locationFilter === "All" || mus.location === locationFilter;

      // Check favorites
      const jamId = getRouteMatch().query.get("jamId");
      const activeJamEvent = jamId ? jams.find((j) => j.id === jamId) : null;
      const isFav = activeJamEvent
        ? (activeJamEvent.shortlistIds?.includes(mus.id) ?? false)
        : favoriteArtistIds.includes(mus.id);

      const matchesFavorites = !showFavoritesOnly || isFav;

      // Budget-aware check: daily flat rate <= maxPrice slider
      const fitsPrice = (mus.dailyRate || 450) <= maxPrice;

      return (
        matchesSearch &&
        matchesInst &&
        matchesLoc &&
        matchesFavorites &&
        fitsPrice
      );
    })
    .sort((a, b) => {
      // 1. Current user's own claimed/created profile is absolute top priority
      const aIsMe = googleUser && (a.userId === googleUser.uid || a.id === localStorage.getItem("sessiecat_my_artist_id"));
      const bIsMe = googleUser && (b.userId === googleUser.uid || b.id === localStorage.getItem("sessiecat_my_artist_id"));
      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;

      // 2. Real artist profiles (like "Isaac Bullock") are high priority
      const aIsIsaac = a.name === "Isaac Bullock";
      const bIsIsaac = b.name === "Isaac Bullock";
      if (aIsIsaac && !bIsIsaac) return -1;
      if (!aIsIsaac && bIsIsaac) return 1;

      // 3. Real profiles (not in INITIAL_ARTISTS, or having a userId) vs mockups (in INITIAL_ARTISTS and not Isaac Bullock)
      const aIsMock = INITIAL_ARTISTS.some((ia) => ia.id === a.id) && a.name !== "Isaac Bullock";
      const bIsMock = INITIAL_ARTISTS.some((ia) => ia.id === b.id) && b.name !== "Isaac Bullock";
      if (!aIsMock && bIsMock) return -1;
      if (aIsMock && !bIsMock) return 1;

      // 4. Profiles created/claimed by any user
      const aHasUser = !!a.userId;
      const bHasUser = !!b.userId;
      if (aHasUser && !bHasUser) return -1;
      if (!aHasUser && bHasUser) return 1;

      // 5. Default sorting criteria
      if (sortOption === "priceAsc" || sortOption === "price-low") {
        return (a.dailyRate || 450) - (b.dailyRate || 450);
      }
      if (sortOption === "priceDesc" || sortOption === "price-high") {
        return (b.dailyRate || 450) - (a.dailyRate || 450);
      }
      if (sortOption === "reviews" || sortOption === "experience") {
        return b.reviewCount - a.reviewCount;
      }
      // Default: Sort by rating (descending)
      return b.rating - a.rating;
    });

  // Route: Public Claim Page
  if (route.base === "claim" && route.param) {
    return <ClaimPage jamId={route.param} />;
  }

  if (route.base === "privacy") {
    return <PrivacyPolicy />;
  }

  if (route.base === "terms") {
    return <TermsOfService />;
  }

  if (!hasCheckedAuthInit) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <span className="text-sm font-mono opacity-50 uppercase tracking-widest">
          Verifying session...
        </span>
      </div>
    );
  }

  if (!googleUser && route.base !== "claim") {
    return (
      <LandingPortal
        onGoogleLogin={handleGoogleLogin}
        onGuestLogin={handleGuestLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans select-none antialiased selection:bg-brand-accent selection:text-[#0A0A0A]">
      <OnboardingWelcomeModal 
        isOpen={!hasCompletedOnboarding && googleUser !== null} 
        onComplete={(role) => {
          setHasCompletedOnboarding(true);
          setOnboardingPath(role);
          localStorage.setItem("sessiecat_onboarding_completed", "true");
          localStorage.setItem("sessiecat_onboarding_path", role);
          if (role === "sessionist") {
            setViewMode("work");
          } else {
            setViewMode("hire");
          }
        }} 
      />
      {/* Universal Top Header/Hero */}
      <header className="border-b border-white/10 bg-[#0A0A0A]/95 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <SessiecatLogo size="md" />
            <div className="hidden lg:block border-l border-white/20 pl-6">
              <LanguageToggle />
            </div>
          </div>

          {/* Core Actions Container */}
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-none pr-1">
            {/* Core Flow Switcher */}
            <div className="flex bg-white/5 p-1 rounded-none border border-white/10 shrink-0">
              <button
                id="switch-view-hire"
                onClick={() => setViewMode("hire")}
                className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] whitespace-nowrap uppercase font-mono tracking-wider transition-all cursor-pointer rounded-none ${
                  viewMode === "hire"
                    ? "bg-brand-accent text-black font-extrabold"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {t('nav.artists', 'Find Sessiecats')}
              </button>
              <button
                id="switch-view-work"
                onClick={() => setViewMode("work")}
                className={`px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] whitespace-nowrap uppercase font-mono tracking-wider transition-all cursor-pointer rounded-none ${
                  viewMode === "work"
                    ? "bg-brand-accent text-black font-extrabold"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {t('nav.jams', 'Find Gigs')}
              </button>
            </div>

            {/* List Profile Trigger */}
            <button
              id="register-artist-trigger"
              onClick={() => setIsAddArtistOpen(true)}
              className="flex items-center gap-1.5 bg-brand-accent/15 hover:bg-brand-accent hover:text-black text-[9px] sm:text-[10px] text-brand-accent hover:border-brand-accent font-mono tracking-widest uppercase border border-brand-accent/35 px-3 sm:px-4.5 py-2.5 cursor-pointer transition-all rounded-none font-bold shadow-[0_0_12px_rgba(172,108,255,0.05)] shrink-0"
            >
              {myArtistProfile ? (
                <>
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Profile</span>
                  <span className="sm:hidden">Profile</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Join as a Sessiecat</span>
                  <span className="sm:hidden">Join</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[9px] sm:text-[10px] text-white/90 hover:text-white font-mono tracking-widest uppercase border border-white/20 px-3 sm:px-4.5 py-2.5 cursor-pointer transition-all rounded-none font-bold shrink-0"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invite Network</span>
              <span className="sm:hidden">Invite</span>
            </button>
            <div className="shrink-0 flex items-center justify-center">
              <NotificationBell />
            </div>

            <button
              onClick={handleGoogleLogout}
              className="flex items-center gap-1.5 hover:bg-white/10 text-[9px] sm:text-[10px] text-white/50 hover:text-white font-mono tracking-widest uppercase px-3 sm:px-4.5 py-2.5 cursor-pointer transition-all rounded-none font-bold shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Pop-up Info Overlay banner */}
      {successBanner && (
        <div className="bg-brand-accent text-black font-extrabold px-6 py-4 text-center text-xs tracking-wider uppercase animate-fade-in flex items-center justify-center gap-2.5 shadow-xl">
          <CheckCircle className="w-4 h-4 text-black shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Modular Workspace Page Tabstrip - High Contrast Luxury Navigation */}
        {viewMode === "hire" && (
          <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none font-mono text-[10.5px] uppercase tracking-wider font-bold bg-[#141414] p-1.5 select-none gap-2">
            {[
              { id: "dashboard", label: "Dashboard Workspace", icon: Compass },
              { id: "jams", label: "Bookers / Organisers", icon: Target },
              {
                id: "tours",
                label: "Tours Workspace",
                icon: Briefcase,
                count: tours.length,
              },
              {
                id: "artists",
                label: "Browse Artists",
                icon: Users,
                count: filteredArtists.length,
              },
              {
                id: "holds",
                label: "Rate Holds Console",
                icon: Lock,
                count: tours
                  .flatMap((t) => t.roleRequirements)
                  .filter((r) => r.status === "Hold").length,
              },
              { id: "leadScraper", label: "AI Lead Scraper", icon: Search },
              { id: "rehearsals", label: "Rehearsals Hub", icon: Calendar },
              { id: "gear", label: "Local Gear Shops", icon: ShoppingBag },
              {
                id: "contracts",
                label: "Digital Escrow CAO",
                icon: ShieldCheck,
              },
              { id: "finance", label: "Finance & Payroll", icon: Euro },
              { id: "visitors", label: "Visitor Traffic", icon: Eye },
              { id: "settings", label: "Cloud Vault & Chat", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = route.base === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    navigateTo(tab.id);
                  }}
                  className={`px-4 py-3 flex items-center gap-2 border cursor-pointer whitespace-nowrap rounded transition ${
                    isActive
                      ? "bg-[#D1FF26] text-black border-[#D1FF26] font-black shadow-[0_0_15px_rgba(209,255,38,0.2)]"
                      : "bg-[#1C1C1C] text-white/90 border-[#2A2A2A] hover:bg-brand-accent/10 hover:border-brand-accent/30 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[8.5px] font-sans font-black px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-black text-[#D1FF26]"
                          : "bg-[#D1FF26]/10 text-[#D1FF26]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {viewMode === "hire" ? (
          /* "Hiring Mode" content block */
          <div className="space-y-8 animate-fade-in">
            {/* Dashboard Workspace View */}
            {route.base === "dashboard" && (
              <div className="space-y-8 animate-fade-in">
                {/* Prominent Sessionist Registration & Jam CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sessionist Block */}
                  {myArtistProfile ? (
                    <div className="bg-[#D1FF26] text-black border border-[#D1FF26] p-6 lg:p-8 flex flex-col justify-between gap-6 shadow-[0_0_40px_rgba(209,255,38,0.15)] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4">
                          <SafeImage
                            src={myArtistProfile.avatarUrl}
                            alt={myArtistProfile.name}
                            textSeed={myArtistProfile.name}
                            fallbackType="avatar"
                            className="w-16 h-16 object-cover border-2 border-black rounded-none shadow-lg"
                          />
                          <div>
                            <span className="p-1 px-2 bg-black text-[#D1FF26] font-black uppercase text-[9px] tracking-widest font-mono">
                              My Listing Status: {myArtistProfile.availability}
                            </span>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mt-1 leading-none">
                              {myArtistProfile.name}
                            </h2>
                            <p className="text-xs font-mono text-black/70 mt-1">
                              {myArtistProfile.instruments.join(" • ")}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-mono text-black/70 max-w-sm leading-relaxed line-clamp-2">
                          {myArtistProfile.bio}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 relative z-10 mt-2">
                        <button
                          onClick={() => setIsAddArtistOpen(true)}
                          className="bg-black hover:bg-neutral-900 text-[#D1FF26] text-[10px] font-black uppercase tracking-widest px-5 py-3.5 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent shadow-xl"
                        >
                          <Settings className="w-4 h-4" /> Edit My Profile
                        </button>
                        <button
                          onClick={() => {
                            setViewMode("work");
                            setOnboardingPath("sessionist");
                          }}
                          className="bg-white/20 hover:bg-white/35 text-black text-[10px] font-black uppercase tracking-widest px-5 py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer border border-black/25"
                        >
                          <User className="w-4 h-4" /> Find Gigs
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#D1FF26] text-black border border-[#D1FF26] p-6 lg:p-8 flex flex-col justify-between gap-6 shadow-[0_0_40px_rgba(209,255,38,0.15)] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                          Join as a Sessiecat
                        </h2>
                        <p className="text-sm font-medium font-mono text-black/70 max-w-sm leading-relaxed">
                          Lend out your equipment, set your interactive rate
                          cards, process rapid bookings, and secure exclusive
                          touring and live sessions. Get verified and hired
                          immediately.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 relative z-10 mt-4">
                        <button
                          onClick={() => {
                            setViewMode("work");
                            setOnboardingPath("sessionist");
                          }}
                          className="bg-black hover:bg-neutral-900 text-[#D1FF26] text-xs font-black uppercase tracking-widest px-6 py-4 flex items-center justify-center gap-3 transition-colors cursor-pointer border border-transparent shadow-xl"
                        >
                          <User className="w-5 h-5" /> Let's Get to Work
                        </button>

                        <button
                          onClick={() => {
                            setViewMode("hire");
                            // Navigate to artists view
                            navigateTo("artists");
                            setSuccessBanner(
                              "Find your listing below, then click the purple 'Claim Listing (Link to Account)' button to manage it!"
                            );
                          }}
                          className="text-black/80 hover:text-black font-mono text-xs font-bold underline uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Already registered? Search & claim profile
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bookers & Organisers Block */}
                  <div className="bg-[#AC6CFF] text-black border border-[#AC6CFF] p-6 lg:p-8 flex flex-col justify-between gap-6 shadow-[0_0_40px_rgba(172,108,255,0.15)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                        Bookers / Organisers
                      </h2>
                      <p className="text-sm font-medium font-mono text-black/70 max-w-sm leading-relaxed">
                        Create events, share automated WhatsApp claim links, and
                        build rosters instantly without chasing people down in
                        groups. Ideal for session runners, festival organisers,
                        and live DJs holding rosters.
                      </p>
                    </div>
                    <button
                      onClick={() => navigateTo("jams")}
                      className="relative z-10 self-start bg-black hover:bg-neutral-900 text-[#AC6CFF] text-xs font-black uppercase tracking-widest px-6 py-4 flex items-center justify-center gap-3 transition-colors cursor-pointer border border-transparent shadow-xl"
                    >
                      <Target className="w-5 h-5" /> Create an Event
                    </button>
                  </div>
                </div>

                <OnboardingPath
                  onboardingPath={onboardingPath}
                  setOnboardingPath={setOnboardingPath}
                  setCurrentActiveTab={(tab) => navigateTo(tab)}
                />

                {/* Exclusive Competition Shield & Production Reputation Scorecard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/5 border border-white/10 p-6">
                  {/* Competition Shield Sector */}
                  <div className="space-y-3 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-accent/20 border border-brand-accent/30 text-brand-accent text-[9px] font-mono px-2 py-0.5 uppercase font-bold tracking-widest">
                        🔒 ACTIVE STATUS: ESCROW SECURED
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold uppercase tracking-tight text-white font-sans">
                      Exclusive Booking Hold Shield
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Securing rate holds ensures touring agents and event
                      bookers confirm full line-ups without sudden competition
                      markup. Holds legally lock the show contracts, bypassing
                      uncoordinated side negotiation.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[10px] text-[#D1FF26] font-mono bg-white/5 px-2.5 py-1 border border-white/10 uppercase font-semibold">
                        🔒 Rate Holds Enabled
                      </span>
                      <span className="text-[10px] text-[#AC6CFF] font-mono bg-white/5 px-2.5 py-1 border border-white/10 uppercase font-semibold">
                        🛡️ Mutual NDA Active
                      </span>
                    </div>
                  </div>

                  {/* Client Reputation scorecard */}
                  <div className="bg-black/40 border border-white/10 p-4.5 flex flex-col justify-between space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest font-black">
                          [ MY PROFILE ENDORSEMENTS ]
                        </span>
                        <span className="flex items-center gap-1 font-mono text-brand-accent text-xs font-black bg-brand-accent/15 border border-brand-accent/30 px-2 py-0.5">
                          ★ 5.0 Rating
                        </span>
                      </div>
                      <h4 className="text-xs font-mono uppercase font-black text-white mt-3 select-none">
                        Taylor Agency & Productions
                      </h4>
                      <div className="text-[10px] text-white/40 font-mono mt-1 font-sans">
                        In-app credentials endorsed by verified local artists
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        id="toggle-client-reviews-btn"
                        onClick={() => setShowClientReviews(!showClientReviews)}
                        className="flex-grow py-2 px-3 text-[9px] font-mono font-black border border-white/10 hover:border-brand-accent bg-black text-white/70 hover:text-white uppercase tracking-widest transition-all cursor-pointer"
                      >
                        {showClientReviews
                          ? "Hide Endorsements ▲"
                          : "View Endorsements ▼"}
                      </button>
                    </div>
                  </div>

                  {showClientReviews && (
                    <div className="col-span-1 lg:col-span-3 bg-black/55 border-t border-white/10 -mx-6 -mb-6 p-6 space-y-4 max-h-56 overflow-y-auto animate-fade-in">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-[#D1FF26] font-bold">
                        [ Certified Sessionist Feedbacks About You ]
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clientReviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="bg-black/45 hover:bg-black/60 p-3.5 border border-white/5 transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                  <SafeImage
                                    src={rev.artistAvatar}
                                    alt={rev.artistName}
                                    textSeed={rev.artistName}
                                    fallbackType="avatar"
                                    className="w-6 h-6 object-cover border border-white/10"
                                  />
                                  <span className="text-xs text-white font-bold">
                                    {rev.artistName}
                                  </span>
                                </div>
                                <div className="flex items-center font-mono text-brand-accent text-[10px]">
                                  <Star className="w-3 h-3 text-brand-accent fill-brand-accent mr-0.5" />
                                  <span>{rev.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-white/70 italic mt-2 leading-relaxed">
                                "{rev.comment}"
                              </p>
                            </div>
                            <div className="text-[8px] font-mono text-white/30 uppercase mt-2.5 text-right">
                              {rev.date} • Secured Hold Verified
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Features & Tools for Visitors (Bilingual English & Dutch) */}
                <VisitorFeaturesOverview />
              </div>
            )}

            {route.base === "gear" && <GearShops />}
            {route.base === "leadScraper" && <LeadScraper />}

            {/* Cloud Vault & Escrow Inbox Workspace & GDPR Settings */}
            {route.base === "settings" && (
              <div className="space-y-8 animate-fade-in">
                {/* Secure Escrow Inbox panel */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-none space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-brand-accent" />
                    <span>In-App Escrow Messenger Sandbox</span>
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Direct communication threads with certified sessionists
                    regarding transit constraints, rehearsals or soundcheck
                    rules.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-white/10 bg-black/45 p-4 rounded-none">
                    <div className="border-r border-white/10 pr-4 space-y-2">
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block font-bold">
                        [ Live Threads ]
                      </span>
                      {chats.length === 0 ? (
                        <div className="text-[10px] text-white/40 font-mono py-4">
                          No active inbox threads.
                        </div>
                      ) : (
                        chats.map((chat) => (
                          <button
                            key={chat.artistId}
                            onClick={() =>
                              setSelectedArtistForChat(
                                artists.find((m) => m.id === chat.artistId) ||
                                  null,
                              )
                            }
                            className="w-full text-left p-2 hover:bg-white/5 border-b border-white/5 text-xs truncate flex items-center gap-2 cursor-pointer rounded-none"
                          >
                            <SafeImage
                              src={chat.artistAvatar}
                              alt={chat.artistName}
                              textSeed={chat.artistName}
                              fallbackType="avatar"
                              className="w-6 h-6 object-cover border border-white/10"
                            />
                            <div className="truncate">
                              <span className="text-white block font-bold truncate">
                                {chat.artistName}
                              </span>
                              <span className="text-[8px] text-white/40 block font-mono truncate">
                                {chat.messages[chat.messages.length - 1]
                                  ?.text || "No matches"}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="col-span-2 py-8 text-center flex flex-col items-center justify-center text-white/35 text-[11px] font-sans font-light">
                      <HelpCircle className="w-8 h-8 text-brand-accent mb-2" />
                      Browse directories, and tap the message button on any
                      profile card to begin a direct conversation.
                    </div>
                  </div>
                </div>

                {/* GDPR Data & Privacy Control Panel */}
                <GDPRDataPanel
                  user={googleUser}
                  userProfile={artists.find(a => a.email === googleUser?.email)}
                  jams={jams}
                  onDeleteAccount={() => {
                    handleGoogleLogout();
                    setSuccessBanner("Account and data successfully erased pursuant to GDPR Article 17.");
                  }}
                />
              </div>
            )}

            {/* Rehearsal Planning and Studio Hub (Datumprikker) */}
            {route.base === "rehearsals" && (
              <div className="space-y-8 animate-fade-in">
                <RehearsalPlanner />
                <LiveStudioFeed />
              </div>
            )}

            {/* Band Roster & CAO Popmuziek Compliance Board */}
            {route.base === "contracts" && (
              <BandRosterCompliance
                artists={artists}
                favoriteArtistIds={favoriteArtistIds}
                bookings={bookings}
                onToggleFavorite={handleToggleFavorite}
                onBookArtist={setSelectedArtistForBooking}
                onEscrowFunded={async () => {
                   // Upon escrow funded, book all shortlisted artists that aren't already booked
                   const toBook = artists.filter(a => favoriteArtistIds.includes(a.id) && !bookings.some(b => b.artistId === a.id));
                   const newBookings: Booking[] = toBook.map(a => ({
                      id: `escrow_book_${Date.now()}_${a.id}`,
                      artistId: a.id,
                      artistName: a.name,
                      artistAvatar: a.avatarUrl,
                      clientName: googleUser?.displayName || "Sessiecat Organizer",
                      gigTitle: "Multiple Session CAO Lock",
                      dateRange: "TBD",
                      totalAmount: a.dailyRate || 400,
                      status: "Confirmed",
                      dateCreated: new Date().toISOString(),
                   }));
                   setBookings(prev => [...newBookings, ...prev]);
                   
                   try {
                     const token = await getAccessToken();
                     if (token && newBookings.length > 0) {
                        const confirmed = window.confirm(`Do you want to block out these dates for ${newBookings.length} sessionists in your Google Calendar?`);
                        if (confirmed) {
                           for (const b of newBookings) {
                              const event = {
                                 summary: `[Sessiecat] Tour Contract: ${b.artistName}`,
                                 description: `Bulk Escrow. Amount: €${b.totalAmount}`,
                                 start: { date: new Date().toISOString().split("T")[0] },
                                 end: { date: new Date(Date.now() + 86400000).toISOString().split("T")[0] }
                              };
                              await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                                 method: 'POST',
                                 headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                 body: JSON.stringify(event)
                              });
                           }
                           setSuccessBanner(`Payment secured. Booked ${newBookings.length} sessions & synced to Google Calendar!`);
                           return;
                        }
                     }
                   } catch(e) { console.error(e); }
                   setSuccessBanner(`Payment secured. Booked ${newBookings.length} sessions!`);
                }}
              />
            )}

            {route.base === "finance" && (
              <FinanceWorkspace tours={tours} jams={jams} artists={artists} />
            )}

            {route.base === "visitors" && (
              <VisitorAnalytics />
            )}

            {route.base === "jams" && (
              <JamWorkspace
                jams={jams}
                setJams={setJams}
                artists={filteredArtists}
                onFindArtists={(jamId) => {
                  window.location.hash = `artists?jamId=${jamId}`;
                }}
              />
            )}

            {/* Tour & Event Workspace Module */}
            {route.base === "tours" && (
              <TourWorkspace
                artists={artists}
                tours={tours}
                setTours={setTours}
                onOpenArtists={() => navigateTo("artists")}
                onTriggerChat={(m, draftText) => {
                  handleOpenChatAndDraft(m, draftText);
                  navigateTo("settings");
                }}
                setCurrentActiveTab={(tab) => navigateTo(tab)}
                selectedTourIdRoute={route.param || undefined}
              />
            )}

            {/* Dedicated Holds Exclusivity Management Console Pages */}
            {route.base === "holds" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-1.5 font-sans">
                        <Lock className="w-5 h-5 text-brand-accent" />
                        <span>Exclusive Rate Holds Console</span>
                      </h2>
                      <p className="text-xs text-white/50">
                        Verify exclusive locks, check hourly countdown expiry,
                        manage standby backup candidates, and finalize booking
                        dispatches.
                      </p>
                    </div>
                    <div className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 text-brand-accent">
                      🔒 Lock Mode: Popmuziek CAO compliant
                    </div>
                  </div>

                  {/* Holds list */}
                  {tours
                    .flatMap((t) =>
                      t.roleRequirements.map((r) => ({ tour: t, role: r })),
                    )
                    .filter(
                      (item) =>
                        item.role.status === "Hold" && item.role.activeHold,
                    ).length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 bg-black/20 text-white/45 rounded-xl space-y-3 font-sans">
                      <p className="text-sm font-semibold uppercase font-mono">
                        [ No Active Holds Dispatched ]
                      </p>
                      <p className="text-xs">
                        Navigate to the Tours Workspace or browse the directory
                        to place verified 24-48H holds and secure your lineup.
                      </p>
                      <button
                        onClick={() => navigateTo("artists")}
                        className="px-4 py-2 border border-[#D1FF26] text-[#D1FF26] hover:bg-[#D1FF26] hover:text-black font-mono text-[10px] uppercase font-bold transition-all cursor-pointer"
                      >
                        Browse Artists Now
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-white/10 bg-black/45">
                      <table className="w-full text-left font-sans border-collapse text-xs">
                        <thead>
                          <tr className="bg-white/5 text-white/40 uppercase font-mono tracking-wider border-b border-white/10 text-[10px]">
                            <th className="py-3.5 px-4 font-extrabold select-none">
                              Campaign/Event
                            </th>
                            <th className="py-3.5 px-4 font-extrabold select-none">
                              Role Details
                            </th>
                            <th className="py-3.5 px-4 font-extrabold select-none">
                              Assigned Sessionist
                            </th>
                            <th className="py-3.5 px-4 font-extrabold select-none text-right">
                              Locked Show Rate
                            </th>
                            <th className="py-3.5 px-4 font-extrabold select-none text-center">
                              Expiry Timer
                            </th>
                            <th className="py-3.5 px-4 font-extrabold select-none">
                              Standby Backup Bench
                            </th>
                            <th className="py-3.5 px-4 font-extrabold select-none text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {tours
                            .flatMap((t) =>
                              t.roleRequirements.map((role) => ({
                                tour: t,
                                role,
                              })),
                            )
                            .filter(
                              (item) =>
                                item.role.status === "Hold" &&
                                item.role.activeHold,
                            )
                            .map(({ tour, role }) => {
                              const artist = artists.find(
                                (m) => m.id === role.assignedArtistId,
                              );
                              const hold = role.activeHold!;

                              // Expiry calculations
                              const expiryDate = new Date(hold.expiryDate);
                              const now = new Date();
                              const diffTime =
                                expiryDate.getTime() - now.getTime();
                              const diffHours = Math.max(
                                0,
                                Math.ceil(diffTime / (1000 * 60 * 60)),
                              );
                              const isHoldExpired = diffHours === 0;

                              return (
                                <tr
                                  key={role.id}
                                  className="hover:bg-white/5 transition-colors"
                                >
                                  {/* Campaign */}
                                  <td className="py-4 px-4 font-semibold text-white uppercase font-sans">
                                    {tour.name}
                                  </td>

                                  {/* Role */}
                                  <td className="py-4 px-4 text-white">
                                    <span className="font-mono bg-[#AC6CFF]/10 text-[#AC6CFF] text-[9.5px] px-2 py-0.5 border border-[#AC6CFF]/25 font-bold uppercase">
                                      {role.roleName}
                                    </span>
                                  </td>

                                  {/* Assigned */}
                                  <td className="py-4 px-3 text-white">
                                    {artist ? (
                                      <div className="flex items-center gap-2">
                                        <SafeImage
                                          src={artist.avatarUrl}
                                          alt={artist.name}
                                          textSeed={artist.name}
                                          className="w-7 h-7 object-cover border border-white/10"
                                        />
                                        <div>
                                          <div className="font-bold text-white leading-tight">
                                            {artist.name}
                                          </div>
                                          <div className="text-[10px] text-white/50">
                                            {artist.location}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-white/40">
                                        Unassigned Candidate
                                      </span>
                                    )}
                                  </td>

                                  {/* Locked Show Rate */}
                                  <td className="py-4 px-4 text-right font-mono text-brand-accent font-black text-xs">
                                    <span className="inline-flex items-center gap-1 bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5">
                                      🔒 €
                                      {role.actualRatePaidShow ||
                                        role.targetBudgetShow}
                                    </span>
                                  </td>

                                  {/* Expiry */}
                                  <td className="py-4 px-4 text-center">
                                    {isHoldExpired ? (
                                      <span className="text-[10px] font-mono text-rose-500 font-bold uppercase bg-rose-500/10 border border-rose-500/20 px-2 py-0.5">
                                        Expired
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono text-[#D1FF26] font-bold uppercase bg-[#D1FF26]/10 border border-[#D1FF26]/20 px-2 py-0.5 inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-[#D1FF26]" />{" "}
                                        {diffHours}h left
                                      </span>
                                    )}
                                  </td>

                                  {/* Backup bench list */}
                                  <td className="py-4 px-4">
                                    {hold.backupBench &&
                                    hold.backupBench.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {hold.backupBench.map((bId) => {
                                          const backupArtist = artists.find(
                                            (m) => m.id === bId,
                                          );
                                          return backupArtist ? (
                                            <span
                                              key={bId}
                                              className="text-[8.5px] font-mono bg-white/5 hover:bg-white/15 px-1.5 py-0.5 border border-white/10 text-white/70"
                                            >
                                              {backupArtist.name.split(" ")[0]}
                                            </span>
                                          ) : null;
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-mono text-white/30 italic">
                                        No Backup configured
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          // Simulate Artist Accept
                                          setTours((prev) =>
                                            prev.map((t) => {
                                              if (t.id === tour.id) {
                                                return {
                                                  ...t,
                                                  roleRequirements:
                                                    t.roleRequirements.map(
                                                      (r) => {
                                                        if (r.id === role.id) {
                                                          return {
                                                            ...r,
                                                            status: "Confirmed",
                                                          };
                                                        }
                                                        return r;
                                                      },
                                                    ),
                                                };
                                              }
                                              return t;
                                            }),
                                          );
                                          setSuccessBanner(
                                            `✓ Secure Contract Activated: ${artist?.name} accepted hold dates! Slot verified.`,
                                          );
                                        }}
                                        className="px-2.5 py-1.5 bg-[#D1FF26] text-black text-[9px] font-mono uppercase font-black tracking-wider hover:bg-white transition cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => {
                                          // Decline Hold -> Open Slot
                                          setTours((prev) =>
                                            prev.map((t) => {
                                              if (t.id === tour.id) {
                                                return {
                                                  ...t,
                                                  roleRequirements:
                                                    t.roleRequirements.map(
                                                      (r) => {
                                                        if (r.id === role.id) {
                                                          return {
                                                            ...r,
                                                            status: "Open",
                                                            activeHold:
                                                              undefined,
                                                          };
                                                        }
                                                        return r;
                                                      },
                                                    ),
                                                };
                                              }
                                              return t;
                                            }),
                                          );
                                          setSuccessBanner(
                                            `Released lock on ${role.roleName}. Recruiting backup roster bench candidates...`,
                                          );
                                        }}
                                        className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-rose-500 hover:text-rose-400 text-white hover:bg-black text-[9px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer"
                                      >
                                        Decline / Release
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Artists Catalog Directory / Profile Sheet Routed View */}
            {route.base === "artists" && (
              <div className="space-y-8 animate-fade-in">
                {route.param ? (
                  /* HIGH FIDELITY ISOLATED PROFILE VIEW Drawer sheet */
                  (() => {
                    const selectedArtist = artists.find(
                      (m) => m.id === route.param,
                    );
                    if (!selectedArtist) {
                      return (
                        <div className="text-center py-16 bg-neutral-900 border border-neutral-800 font-sans">
                          <p className="text-sm font-semibold uppercase font-mono text-rose-500">
                            [ Sessionist Not Found ]
                          </p>
                          <button
                            onClick={() => navigateTo("artists")}
                            className="mt-4 px-4 py-2 border border-white/5 bg-black hover:border-brand-accent text-white font-mono text-xs uppercase transition cursor-pointer"
                          >
                            Return to directory
                          </button>
                        </div>
                      );
                    }

                    const rate = selectedArtist.rateCard || {
                      baseShowRate: selectedArtist.dailyRate || 450,
                      negotiable: true,
                      instrumentRates: [],
                    };

                    return (
                      <div className="space-y-8 animate-fade-in font-sans">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <button
                            onClick={() => navigateTo("artists")}
                            className="flex items-center gap-1.5 text-xs text-brand-accent hover:text-white font-mono uppercase font-black tracking-wider transition cursor-pointer"
                          >
                            &larr; Back to Directory
                          </button>
                          <span className="text-xs font-mono text-white/40 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1">
                            Profile Verified:{" "}
                            {selectedArtist.verified
                              ? "✓ Certified Pro"
                              : "Standby Candidate"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Left Column: Basic Details & Sampler */}
                          <div className="space-y-6 lg:col-span-1">
                            <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col items-center text-center">
                              <SafeImage
                                src={selectedArtist.avatarUrl}
                                alt={selectedArtist.name}
                                textSeed={selectedArtist.name}
                                fallbackType="avatar"
                                className="w-32 h-32 object-cover border-2 border-brand-accent mb-4 grayscale hover:grayscale-0 transition-all duration-300 shadow-[0_0_20px_rgba(172,108,255,0.15)]"
                              />
                              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                {selectedArtist.name}
                              </h2>
                              <div className="text-xs text-brand-accent font-mono mt-1 uppercase tracking-widest">
                                {selectedArtist.location}
                              </div>

                              <p className="text-xs text-white/60 leading-relaxed font-light mt-4 italic">
                                "{selectedArtist.bio}"
                              </p>

                              <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                                {selectedArtist.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 text-white/50 uppercase font-bold"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Audio Portfolio */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                              <h3 className="text-xs font-mono text-white/40 uppercase block font-black">
                                [ Professional Audio Portfolio ]
                              </h3>
                              <div className="space-y-2">
                                {(
                                  selectedArtist.audioSamples || [
                                    selectedArtist.audioSample,
                                  ]
                                ).map((sample, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-black/50 p-3 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex-1 w-full truncate text-left">
                                      <div className="font-bold text-white truncate w-full">
                                        {sample.title}
                                      </div>
                                      <div className="text-[10px] text-brand-accent font-mono mt-0.5">
                                        {sample.duration} duration • ready to
                                        stream
                                      </div>
                                    </div>
                                    {sample.audioUrl ? (
                                      <audio
                                        controls
                                        src={sample.audioUrl}
                                        className="w-full md:w-[220px] h-[34px] shrink-0"
                                      />
                                    ) : (
                                      <button
                                        onClick={() =>
                                          alert(
                                            `Now streaming: ${sample.title} (${sample.duration})`,
                                          )
                                        }
                                        className="p-2 border border-brand-accent/20 hover:border-[#D1FF26] text-[#D1FF26] hover:bg-[#D1FF26] hover:text-black transition uppercase font-mono text-[9px] font-bold cursor-pointer shrink-0"
                                      >
                                        Play Audio
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Video Showcase (Exactly 2 Video Clips) */}
                            {selectedArtist.videoSamples &&
                              selectedArtist.videoSamples.length > 0 && (
                                <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                                  <h3 className="text-xs font-mono text-white/40 uppercase block font-black">
                                    [ Professional Video Showcase (
                                    {selectedArtist.videoSamples.length} Clips)
                                    ]
                                  </h3>
                                  <div className="grid grid-cols-1 gap-4">
                                    {selectedArtist.videoSamples.map(
                                      (vClip, idx) => (
                                        <div
                                          key={vClip.id || `v-${idx}`}
                                          className="bg-black/50 border border-white/5 overflow-hidden group"
                                        >
                                          <div className="aspect-video w-full bg-neutral-950 relative flex items-center justify-center border-b border-white/5">
                                            {vClip.videoUrl &&
                                            (vClip.videoUrl.includes(
                                              "youtube",
                                            ) ||
                                              vClip.videoUrl.includes(
                                                "youtu.be",
                                              )) ? (
                                              <iframe
                                                src={`https://www.youtube.com/embed/${vClip.videoUrl.split("v=")[1]?.split("&")[0] || vClip.videoUrl.split("youtu.be/")[1] || ""}?controls=1&showinfo=0&rel=0&modestbranding=1`}
                                                className="absolute inset-0 w-full h-full border-0"
                                                title={vClip.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                              ></iframe>
                                            ) : vClip.videoUrl &&
                                              vClip.videoUrl.startsWith(
                                                "blob:",
                                              ) ? (
                                              <video
                                                src={vClip.videoUrl}
                                                controls
                                                className="absolute inset-0 w-full h-full object-cover"
                                              ></video>
                                            ) : (
                                              <>
                                                <img
                                                  src={
                                                    vClip.videoUrl ||
                                                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"
                                                  }
                                                  alt={vClip.title}
                                                  className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-45 transition-opacity duration-300"
                                                  referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute top-2 right-2 bg-black/75 px-1.5 py-0.5 text-[8px] font-mono text-white/70">
                                                  {vClip.duration}
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    alert(
                                                      `Simulating playback for video: "${vClip.title}"`,
                                                    )
                                                  }
                                                  className="p-3 bg-brand-accent text-black rounded-full hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg z-10"
                                                >
                                                  <Play className="w-4 h-4 fill-black ml-0.5" />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                          <div className="p-3 text-xs">
                                            <span className="text-[8px] font-mono text-brand-accent uppercase block tracking-wider">
                                              [ VIDEO SESSION MATCH #{idx + 1} ]
                                            </span>
                                            <span className="font-extrabold text-white block mt-0.5 truncate uppercase">
                                              {vClip.title}
                                            </span>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Right Column: Rate Card & Direct Actions */}
                          <div className="space-y-6 lg:col-span-2">
                            {/* Rate Card Specification */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4 relative">
                              <div className="absolute top-6 right-6 flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${rate.negotiable ? "bg-[#D1FF26]/10 text-[#D1FF26] border border-[#D1FF26]/20" : "bg-white/5 text-white/40 border border-white/10"}`}
                                >
                                  {rate.negotiable
                                    ? "Negotiable Rates"
                                    : "Fixed Flat Fees"}
                                </span>
                              </div>

                              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 font-sans">
                                <DollarSign className="w-5 h-5 text-[#D1FF26]" />
                                <span>Transparent Rate Card Guide</span>
                              </h3>

                              <p className="text-xs text-white/50 leading-relaxed font-light">
                                This schedule is Popmuziek CAO compliant and
                                represents locked rate guarantees. Rate includes
                                standard transport in Amsterdam Area unless rush
                                travel is triggered.
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                                <div className="bg-black/45 border border-white/5 p-3">
                                  <div className="text-[9px] font-mono text-white/40 uppercase">
                                    Base Show Rate
                                  </div>
                                  <div className="text-base font-black text-[#D1FF26] font-mono mt-1">
                                    €{rate.baseShowRate}
                                  </div>
                                  <div className="text-[8px] text-white/30 font-mono mt-0.5">
                                    Per-show, Incl. monitor mix
                                  </div>
                                </div>
                                <div className="bg-black/45 border border-white/5 p-3">
                                  <div className="text-[9px] font-mono text-white/40 uppercase">
                                    Base Rehearsal
                                  </div>
                                  <div className="text-base font-black text-[#AC6CFF] font-mono mt-1">
                                    €{rate.baseRehearsalRate || 200}
                                  </div>
                                  <div className="text-[8px] text-white/30 font-mono mt-0.5">
                                    Under 4 hours schedule
                                  </div>
                                </div>
                                <div className="bg-black/45 border border-white/5 p-3">
                                  <div className="text-[9px] font-mono text-white/40 uppercase">
                                    Emergency Rush Fee
                                  </div>
                                  <div className="text-base font-black text-white font-mono mt-1">
                                    €{rate.baseRushFee || 150}
                                  </div>
                                  <div className="text-[8px] text-white/30 font-mono mt-0.5">
                                    Under 24h booking notifications
                                  </div>
                                </div>
                                <div className="bg-black/45 border border-white/5 p-3">
                                  <div className="text-[9px] font-mono text-white/40 uppercase">
                                    Minimum Show Fee
                                  </div>
                                  <div className="text-base font-black text-white/80 font-mono mt-1">
                                    €{rate.baseMinFee || 350}
                                  </div>
                                  <div className="text-[8px] text-white/30 font-mono mt-0.5">
                                    Short gig floor guarantee
                                  </div>
                                </div>
                              </div>

                              {/* Sub-roles & instruments specialized rate cards */}
                              <div className="space-y-2.5 pt-4">
                                <span className="text-[10px] font-mono text-white/40 uppercase block font-black">
                                  [ Role-Based Instrument Rates ]
                                </span>
                                <div className="divide-y divide-white/5 bg-black/30 border border-white/5">
                                  {selectedArtist.instruments.map(
                                    (inst, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-3 text-xs"
                                      >
                                        <span className="font-bold text-white uppercase">
                                          {inst} Specialist
                                        </span>
                                        <span className="font-mono text-[#D1FF26] font-extrabold flex items-center gap-1 bg-[#D1FF26]/5 border border-[#D1FF26]/10 px-2 py-0.5">
                                          €
                                          {rate.baseShowRate +
                                            (index === 0 ? 0 : 50)}{" "}
                                          / show
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Profile Gear & Technical Assets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2.5">
                                <span className="text-[9.5px] font-mono text-white/40 uppercase block font-black">
                                  [ Verified Gear Inventory ]
                                </span>
                                <p className="text-xs text-white/70 font-light leading-relaxed">
                                  {selectedArtist.gear ||
                                    "Certified active sound tools & standard monitoring gear."}
                                </p>
                              </div>

                              <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2.5">
                                <span className="text-[9.5px] font-mono text-white/40 uppercase block font-black">
                                  [ Logistics Vehicle Transport ]
                                </span>
                                <p className="text-xs text-white/70 font-light leading-relaxed">
                                  {selectedArtist.transport ||
                                    "Acoustically isolated transit bike and public transport sync."}
                                </p>
                              </div>
                            </div>

                            {selectedArtist.rentableEquipment &&
                              selectedArtist.rentableEquipment.length > 0 && (
                                <div className="bg-neutral-900 border border-brand-accent/20 p-5 space-y-4">
                                  <span className="text-[9.5px] font-mono text-brand-accent uppercase block font-black flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" /> [ Gear
                                    Available For Rent ]
                                  </span>
                                  <div className="grid grid-cols-1 gap-3">
                                    {selectedArtist.rentableEquipment.map(
                                      (eq) => (
                                        <div
                                          key={eq.id}
                                          className="bg-black border border-white/10 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4"
                                        >
                                          <div>
                                            <div className="font-bold text-white text-sm uppercase">
                                              {eq.name}
                                            </div>
                                            <div className="text-xs text-white/50 mt-1 max-w-sm">
                                              {eq.description}
                                            </div>
                                            <div className="text-[9px] font-mono text-white/30 uppercase mt-2">
                                              Condition: {eq.condition}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-brand-accent font-black text-lg">
                                              €{eq.pricePerDay}
                                              <span className="text-[10px] text-white/40 font-mono ml-1 font-normal">
                                                / day
                                              </span>
                                            </div>
                                            <button
                                              onClick={() =>
                                                alert(
                                                  `Requested to rent ${eq.name} from ${selectedArtist.name} for €${eq.pricePerDay}/day.`,
                                                )
                                              }
                                              className="px-4 py-2 border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-black uppercase font-mono text-[10px] font-bold transition-colors cursor-pointer"
                                            >
                                              Rent Item
                                            </button>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Core UI Actions panel */}
                            <div className="bg-white/5 border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <div className="text-xs font-bold text-white uppercase font-sans">
                                  Dispatch Booking Contract
                                </div>
                                <div className="text-[10px] text-white/40 font-light">
                                  Simulate immediate contract locks or custom
                                  negotiations.
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedArtistForBooking(selectedArtist);
                                  }}
                                  className="px-4 py-2.5 bg-[#D1FF26] text-black font-mono text-xs uppercase font-black hover:bg-white cursor-pointer transition rounded-none"
                                >
                                  Book Exclusive Hold
                                </button>
                                <button
                                  onClick={() => {
                                    handleOpenChat(selectedArtist);
                                    navigateTo("settings");
                                  }}
                                  className="px-4 py-2.5 bg-[#AC6CFF]/15 hover:bg-[#AC6CFF] hover:text-black text-[11px] text-[#AC6CFF] font-mono uppercase border border-[#AC6CFF]/35 transition cursor-pointer rounded-none animate-none"
                                >
                                  Send Message Offer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    {/* Active Jam Banner */}
                    {(() => {
                      const jamId = route.query.get("jamId");
                      const jam = jamId
                        ? jams.find((j) => j.id === jamId)
                        : null;
                      if (!jam) return null;
                      return (
                        <div className="bg-[#D1FF26]/10 border border-[#D1FF26] p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in shadow-[0_0_15px_rgba(209,255,38,0.1)]">
                          <div>
                            <div className="text-[10px] font-mono uppercase text-[#D1FF26] font-bold tracking-widest mb-1 flex items-center gap-2">
                              <Target className="w-3.5 h-3.5" /> Targeting
                              Candidates for Event
                            </div>
                            <h3 className="text-lg font-black uppercase text-white leading-none">
                              {jam.name}
                            </h3>
                            <div className="text-xs font-mono text-white/50 mt-2 uppercase flex items-center gap-2">
                              <span>{jam.city}</span> • <span>{jam.date}</span>{" "}
                              •{" "}
                              <span>
                                {jam.compensationType === "fixed"
                                  ? `€${jam.ratePerShow} FIXED`
                                  : jam.compensationType === "door_split"
                                    ? "DOOR SPLIT"
                                    : "UNPAID"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => (window.location.hash = "jams")}
                            className="bg-[#D1FF26] text-black font-black uppercase text-[10px] tracking-wider px-4 py-2 hover:bg-white transition-colors cursor-pointer"
                          >
                            View Event Roster
                          </button>
                        </div>
                      );
                    })()}

                    {/* Filters layout */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 font-sans animate-fade-in">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-black text-white uppercase tracking-tight font-sans">
                            Browse Session{" "}
                            <span className="text-brand-accent italic">
                              Elite
                            </span>
                          </h2>
                          <p className="text-xs text-white/50">
                            Apply dynamic real-time filtering parameters across
                            specialized instrument families and locations.
                          </p>

                          {/* Price limit filter slider */}
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                              Show Rate Target:
                            </span>
                            <input
                              id="price-filter-slider"
                              type="range"
                              min="50"
                              max="6000"
                              step="50"
                              value={maxPrice}
                              onChange={(e) =>
                                setMaxPrice(Number(e.target.value))
                              }
                              className="w-32 bg-white/10 outline-none accent-[#D1FF26]"
                            />
                            <span className="text-xs font-mono text-brand-accent font-black">
                              €{maxPrice.toLocaleString()} Max
                            </span>
                          </div>
                        </div>
                        {/* Search Bar */}
                        <div className="w-full md:w-80 relative font-sans">
                          <span className="absolute left-3 top-3 text-white/40">
                            <Search className="w-4 h-4" />
                          </span>
                          <input
                            id="artist-search"
                            type="text"
                            value={hireSearch}
                            onChange={(e) => setHireSearch(e.target.value)}
                            placeholder="Search instrument, genre, bio..."
                            className="w-full bg-black border border-white/10 rounded-none pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-brand-accent transition-colors"
                          />
                        </div>
                      </div>

                      {/* Tag Filters Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-accent" />
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                              Filters:
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4">
                            {/* Select Instrument filter */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                                Instrument:
                              </span>
                              <select
                                id="filter-instrument-select"
                                value={instrumentsFilter}
                                onChange={(e) =>
                                  setInstrumentsFilter(e.target.value)
                                }
                                className="bg-[#0A0A0A] border border-white/10 text-white font-mono uppercase text-[10px] tracking-wider px-3 py-1.5 focus:border-brand-accent outline-none rounded-none cursor-pointer"
                              >
                                {uniqueInstruments.map((inst) => (
                                  <option key={inst} value={inst}>
                                    {inst}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Select Location filter */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                                Location:
                              </span>
                              <select
                                id="filter-location-select"
                                value={locationFilter}
                                onChange={(e) =>
                                  setLocationFilter(e.target.value)
                                }
                                className="bg-[#0A0A0A] border border-white/10 text-white font-mono uppercase text-[10px] tracking-wider px-3 py-1.5 focus:border-brand-accent outline-none rounded-none cursor-pointer"
                              >
                                {uniqueLocations.map((loc) => (
                                  <option key={loc} value={loc}>
                                    {loc}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Sorting Preference Select Dropdown */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                                Sort:
                              </span>
                              <select
                                id="filter-sort-select"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-[#0A0A0A] border border-white/10 text-white font-mono uppercase text-[10px] tracking-wider px-3 py-1.5 focus:border-brand-accent outline-none rounded-none cursor-pointer"
                              >
                                <option value="rating">
                                  Stars (High to Low)
                                </option>
                                <option value="price-low">
                                  Show Cost (Low to High)
                                </option>
                                <option value="price-high">
                                  Show Cost (High to Low)
                                </option>
                                <option value="experience">
                                  Highly Verified Gigs
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Saved favorites quick toggle badge */}
                        {(() => {
                          const jamId = getRouteMatch().query.get("jamId");
                          const activeJamEvent = jamId
                            ? jams.find((j) => j.id === jamId)
                            : null;
                          const count = activeJamEvent
                            ? activeJamEvent.shortlistIds?.length || 0
                            : favoriteArtistIds.length;
                          const listLabel = activeJamEvent
                            ? "Event Shortlist"
                            : "Starred List";

                          return (
                            <button
                              id="favorites-only-quick-toggle"
                              type="button"
                              onClick={() =>
                                setShowFavoritesOnly(!showFavoritesOnly)
                              }
                              className={`py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer rounded-none ${
                                showFavoritesOnly
                                  ? "bg-brand-accent text-black border-brand-accent"
                                  : "bg-black text-white/65 border-white/10 hover:border-brand-accent/40 hover:text-white"
                              }`}
                              title={`Filter by ${listLabel.toLowerCase()}`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-black text-black" : "text-brand-accent"}`}
                              />
                              <span>
                                {listLabel} ({count})
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Artists Master Listing Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                      {filteredArtists.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white/5 border border-white/10 rounded-none">
                          <p className="text-white/40 font-mono text-xs uppercase tracking-wider">
                            No local artists found matching your current filter
                            criteria.
                          </p>
                        </div>
                      ) : (
                        filteredArtists.map((artist) => {
                          const jamId = getRouteMatch().query.get("jamId");
                          const activeJamEvent = jamId
                            ? jams.find((j) => j.id === jamId)
                            : null;
                          const isFav = activeJamEvent
                            ? (activeJamEvent.shortlistIds?.includes(
                                artist.id,
                              ) ?? false)
                            : favoriteArtistIds.includes(artist.id);

                          return (
                            <div
                              key={artist.id}
                              className="cursor-pointer"
                              onClick={(e) => {
                                // If they clicked on buttons/controls, don't trigger the details navigation page
                                const target = e.target as HTMLElement;
                                if (
                                  target.closest("button") ||
                                  target.closest("select") ||
                                  target.closest("input") ||
                                  target.closest("a")
                                ) {
                                  return;
                                }
                                navigateTo(`artists/${artist.id}`);
                              }}
                            >
                              <ArtistCard
                                artist={artist}
                                isFavorite={isFav}
                                onToggleFavorite={
                                  handleToggleFavoriteContextAware
                                }
                                onAddReview={handleAddReview}
                                onBook={(m) => setSelectedArtistForBooking(m)}
                                onChat={handleOpenChat}
                                tours={tours}
                                onPlaceHold={handlePlaceHoldFromCard}
                                onMakeOffer={handleMakeOfferFromCard}
                                googleUser={googleUser}
                                onClaim={handleClaimArtist}
                                onEdit={(a) => {
                                  setIsAddArtistOpen(true);
                                }}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* "Gigs/Artist Mode" content block */
          <div className="space-y-8 animate-fade-in">
            <GigBoard
              gigs={gigs}
              onApply={handleApplyToGig}
              onPostGig={handlePostGig}
            />
          </div>
        )}

        {/* Global Bookings Dashboard (displays on bottom of page in elegant manner) */}
        <section className="bg-white/5 border border-white/10 rounded-none p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">
                My Confirmed{" "}
                <span className="text-brand-accent italic">Bookings</span>
              </h3>
              <p className="text-xs text-white/50">
                Live bookings safely secured for current shows or
                session schedules.
              </p>
            </div>
            <span className="bg-black text-white/55 font-mono text-[10px] px-3 py-1.5 rounded-none border border-white/10 uppercase tracking-wider">
              {bookings.length} Contracts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-white/40 font-mono uppercase tracking-wider">
                You currently have no active session listings booked or locked.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  id={`contract-item-${booking.id}`}
                  className="bg-black/40 p-4 rounded-none border border-white/10 flex flex-col gap-3 hover:border-brand-accent/40 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={booking.artistAvatar}
                        alt={booking.artistName}
                        textSeed={booking.artistName}
                        fallbackType="avatar"
                        className="w-10 h-10 rounded-none object-cover border border-white/10"
                      />
                      <div>
                        <div className="text-white font-bold text-xs uppercase tracking-wider">
                          {booking.artistName}
                        </div>
                        <div className="text-[10px] text-white/50 mt-0.5">
                          {booking.gigTitle}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/40 mt-1.5 font-mono uppercase">
                          <span className="flex items-center gap-1 font-semibold text-brand-accent">
                            <Clock className="w-3" />
                            {booking.dateRange}
                          </span>
                          <span>Client: {booking.clientName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-black text-brand-accent">
                        €{booking.totalAmount}
                      </div>
                      <span className="inline-block bg-brand-accent/10 text-brand-accent border border-brand-accent/30 text-[9px] px-2 py-0.5 rounded-none uppercase tracking-wider font-extrabold mt-1.5">
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Realtime Transit Action Trigger Box */}
                  <div className="pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 bg-emerald-950/15 px-4 py-2 mt-1 -mx-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-brand-accent animate-ping"
                        style={{ animationDuration: "2s" }}
                      />
                      <span className="text-[9px] font-mono text-white/60 tracking-wider uppercase font-extrabold">
                        Live Dispatch Active
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleRequestReview(booking.id)}
                        className="bg-black hover:bg-[#1A1A1A] text-brand-accent text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 transition-all cursor-pointer rounded-none flex items-center gap-1 border border-white/10 hover:border-brand-accent"
                        title="Ask this session artist to review your production's professional backing"
                      >
                        <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
                        <span>Ask For Review</span>
                      </button>
                      <button
                        onClick={() => setActiveTransitBooking(booking)}
                        className="bg-brand-accent hover:bg-white text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-all cursor-pointer rounded-none flex items-center gap-1.5 border border-transparent shadow-[0_0_8px_rgba(209,255,38,0.15)]"
                      >
                        <Navigation className="w-3 h-3 rotate-45" />
                        <span>Track Live Transit</span>
                      </button>
                    </div>
                  </div>

                  {booking.ideaProtectionEnabled && (
                    <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[9px] font-mono uppercase bg-[#AC6CFF]/5 -mx-4 -mb-4 p-3 border-t border-[#AC6CFF]/15">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-black">
                          🛡️ IDEA SHIELD ACTIVE
                        </span>
                        <span className="text-[8px] bg-[#AC6CFF]/15 text-[#AC6CFF] px-1.5 py-0.5 border border-[#AC6CFF]/20 font-bold">
                          {booking.securedIdeaHash}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedNDACert(booking)}
                        className="text-brand-accent hover:text-white text-[8px] tracking-widest font-black uppercase text-left sm:text-right underline cursor-pointer"
                      >
                        View Secure NDA Certificate &rarr;
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Booking Launcher Modal Sheet popup */}
      {selectedArtistForBooking && (
        <BookingLauncher
          artist={selectedArtistForBooking}
          onClose={() => setSelectedArtistForBooking(null)}
          onSubmitBooking={handleCreateBooking}
        />
      )}

      {/* Chat Simulator Canvas popup */}
      {selectedArtistForChat && (
        <ChatSimulator
          artist={selectedArtistForChat}
          thread={
            chats.find((c) => c.artistId === selectedArtistForChat.id) || {
              artistId: selectedArtistForChat.id,
              artistName: selectedArtistForChat.name,
              artistAvatar: selectedArtistForChat.avatarUrl,
              messages: [],
            }
          }
          onClose={() => setSelectedArtistForChat(null)}
          onSendMessage={handleSendMessage}
          onSimulateArtistReply={handleSimulateReply}
        />
      )}

      {/* Session Artist Form Modal Registration */}
      {isAddArtistOpen && (
        <AddArtistForm
          onClose={() => setIsAddArtistOpen(false)}
          onAddArtist={handleAddArtist}
          artistToEdit={myArtistProfile}
        />
      )}

      {/* NDA Certificate Viewer Overlay */}
      {selectedNDACert && (
        <NDACertificate
          booking={selectedNDACert}
          onClose={() => setSelectedNDACert(null)}
        />
      )}

      {/* Real-time Transit Tracker Overlay */}
      {activeTransitBooking && (
        <TransitTracker
          booking={activeTransitBooking}
          artist={artists.find((m) => m.id === activeTransitBooking.artistId)}
          onClose={() => setActiveTransitBooking(null)}
        />
      )}

      {/* Invite Network Modal */}
      {isInviteOpen && <InviteModal onClose={() => setIsInviteOpen(false)} />}

      {/* Authentication Error Sandbox Assistant Modal */}
      {authError && (
        <AuthErrorModal error={authError} onClose={() => setAuthError(null)} />
      )}

      {isDemoToolsOpen && (
        <DemoTools onClose={() => setIsDemoToolsOpen(false)} />
      )}

      {/* Footer information */}
      <footer className="bg-black border-t border-white/10 py-8 text-center text-[10px] text-white/30 font-mono tracking-widest mt-12 gap-2 flex flex-col items-center">
        <div>© 2026 SESSIECAT SYSTEM LTD. ALL RIGHTS SECURED BY ESCROW.</div>
        <div className="flex flex-wrap justify-center gap-4 text-white/30 uppercase tracking-widest text-[9px] mt-1.5">
          <a href="#privacy" className="hover:text-[#D1FF26] transition-colors">
            Privacy Policy (GDPR)
          </a>
          <a href="#terms" className="hover:text-[#D1FF26] transition-colors">
            Terms of Service
          </a>
          <button 
            onClick={() => {
              localStorage.removeItem('sessiecat_gdpr_consent');
              window.location.reload();
            }}
            className="hover:text-[#D1FF26] transition-colors cursor-pointer"
          >
            Manage Cookie Preferences
          </button>
        </div>
      </footer>

      {/* GDPR Cookie & Privacy Choice Banner */}
      <CookieConsentBanner onConsentChange={setGdprConsent} />
    </div>
  );
}
