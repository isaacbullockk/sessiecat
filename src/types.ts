export interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AudioSample {
  id?: string;
  title: string;
  duration: string;
  audioUrl?: string;
}

export interface VideoSample {
  id?: string;
  title: string;
  duration: string;
  videoUrl?: string;
}

export interface InstrumentRate {
  instrument: string;
  ratePerShow: number;
  ratePerRehearsal?: number;
  rushFee?: number;
  minFee?: number;
  negotiable: boolean;
}

export interface RateCard {
  baseShowRate: number; // Required per-show rate
  baseRehearsalRate?: number; // Optional
  baseRushFee?: number; // Optional
  baseMinFee?: number; // Optional
  negotiable: boolean; // Negotiable toggle
  instrumentRates: InstrumentRate[]; // Role-based instrument rates
}

export interface RentableEquipment {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  condition: string;
}

export interface DiscographyItem {
  id: string;
  title: string;
  artistProject: string; // The primary artist or band name
  year: string;
  role: string; // E.g. "Session Bass", "Producer"
  link?: string;
}

export interface Artist {
  id: string;
  userId?: string;
  type?: 'individual' | 'band';
  membersCount?: number;
  name: string;
  avatarUrl: string;
  location: string;
  instruments: string[];
  genres: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  dailyRate: number;
  bio: string;
  audioSample: AudioSample;
  audioSamples?: AudioSample[];
  videoSamples?: VideoSample[];
  discography?: DiscographyItem[];
  availability: 'Available' | 'Fully Booked' | 'Limited';
  verified: boolean;
  tags: string[];
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    website?: string;
  };
  reviews: Review[];
  gear?: string;
  rentableEquipment?: RentableEquipment[];
  transport?: string;
  rateCard?: RateCard; // Rich nested Rate Card object (optional for mock backward compatibility)
  whatsapp?: string;
  phone?: string;
  email?: string;
  unavailableDates?: { start: string; end: string }[];
  unavailableDaysOfWeek?: number[]; // 0 for Sunday, 1 for Monday, etc.
}

export interface NegotiationStep {
  id: string;
  sender: 'manager' | 'artist';
  rateOfferShow: number;
  rateOfferRehearsal?: number;
  note?: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface HoldDetails {
  id: string;
  durationDays: number;
  expiryDate: string; // Countdown target timestamp
  releaseNoticeHours: number;
  backupBench: string[]; // List of back-up artist IDs
  isLocked: boolean; // Hold locks rates
}

export interface TourRoleRequirement {
  id: string;
  roleName: string; // e.g., "Bass Guitarist"
  assignedArtistId?: string;
  status: 'Open' | 'Hold' | 'Negotiation' | 'Confirmed';
  targetBudgetShow: number;
  actualRatePaidShow?: number;
  negotiatedOfferShow?: number;
  negotiationHistory: NegotiationStep[];
  activeHold?: HoldDetails;
}

export interface TourEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  budgetShow: number; // Total budget per show
  roleRequirements: TourRoleRequirement[];
}

export interface Gig {
  id: string;
  title: string;
  clientName: string;
  clientType: 'Agency' | 'Artist';
  location: string;
  dateRange: string;
  payOffer: string;
  instrumentRequired: string;
  description: string;
  status: 'Open' | 'Applied' | 'Closed';
  applicants?: string[]; // user IDs or names
}

export interface Booking {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  clientName: string;
  gigTitle: string;
  dateRange: string;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Declined';
  dateCreated: string;
  location?: string;
  ideaProtectionEnabled?: boolean;
  ideaDescription?: string;
  securedIdeaHash?: string;
  requireEscrow?: boolean;
}

export interface JamSlot {
  id: string;
  role: string;
  status: 'open' | 'held' | 'confirmed' | 'expired' | 'declined';
  heldBy?: {
    whatsapp?: string;
    email?: string;
    name?: string;
  };
  holdExpiresAt?: string;
  confirmedAt?: string;
  rateLocked?: number;
  offerRate?: number;
}

export interface JamEvent {
  id: string;
  ownerId: string;
  name: string;
  venue: string;
  city: string;
  date: string;
  callTime: string;
  setLength: string;
  compensationType: 'fixed' | 'door_split' | 'unpaid';
  ratePerShow?: number;
  doorSplitDetails?: string;
  perks?: string;
  rolesNeeded: string[];
  slots: JamSlot[];
  shortlistIds?: string[];
  negotiationAllowed: boolean;
  notes: string;
  status: 'draft' | 'live' | 'done';
  createdAt: string;
  templateType?: string;
  servicesCount?: number;
  runDates?: string;
}

export interface ChatThread {
  artistId: string;
  artistName: string;
  artistAvatar: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'artist';
    text: string;
    timestamp: string;
  }>;
}
