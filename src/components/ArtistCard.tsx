import React, { useState, useEffect } from "react";
import { Artist, TourEvent } from "../types";
import {
  Star,
  MapPin,
  CheckCircle,
  Play,
  Pause,
  Video,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  Heart,
  Send,
  Coins,
  Check,
  Zap,
  Lock,
  MessageCircle,
  Target,
  Disc,
  Instagram,
  Youtube,
  Globe,
  Music2,
} from "lucide-react";
import { SafeImage } from "./SafeImage";

interface ArtistCardProps {
  key?: string | number;
  artist: Artist;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddReview: (
    artistId: string,
    author: string,
    role: string,
    rating: number,
    comment: string,
  ) => void;
  onBook: (artist: Artist) => void;
  onChat: (artist: Artist) => void;
  tours?: TourEvent[];
  onPlaceHold?: (
    roleId: string,
    tourId: string,
    artist: Artist,
    showRate: number,
  ) => void;
  onMakeOffer?: (
    roleId: string,
    tourId: string,
    artist: Artist,
    showRate: number,
    rehearsalRate: number,
    note: string,
  ) => void;
  googleUser?: any;
  onClaim?: (artist: Artist) => void;
  onEdit?: (artist: Artist) => void;
}

export function ArtistCard({
  artist,
  isFavorite,
  onToggleFavorite,
  onAddReview,
  onBook,
  onChat,
  tours = [],
  onPlaceHold,
  onMakeOffer,
  googleUser,
  onClaim,
  onEdit,
}: ArtistCardProps) {
  const [selectedClipIndex, setSelectedClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReviews, setShowReviews] = useState(false);

  // Workspace integration states
  const [selectedTourId, setSelectedTourId] = useState<string>(
    tours[0]?.id || "",
  );
  const [selectedTourRoleId, setSelectedTourRoleId] = useState<string>("");
  const [isOfferMode, setIsOfferMode] = useState(false);
  const [customShowOffer, setCustomShowOffer] = useState<number>(400);
  const [customRehearsalOffer, setCustomRehearsalOffer] = useState<number>(150);
  const [offerNote, setOfferNote] = useState("");

  // New review submission states
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("Artist / Agency");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const isReal = !!(artist.userId || artist.name === "Isaac Bullock" || !["m_band_01", "m1", "m2", "e1", "e2", "m3", "m4", "m5", "m6", "m8", "m9", "m10", "m11", "m12"].includes(artist.id));

  // Define fallback Rate Card calculation
  const defaultShowRate = artist.dailyRate || 450;
  const defaultRehearsalRate = artist.hourlyRate
    ? Math.round(artist.hourlyRate * 3)
    : 200;
  const defaultRushFee = 150;
  const defaultMinFee = defaultShowRate - 100 > 0 ? defaultShowRate - 100 : 300;
  const isDefaultNegotiable = artist.availability === "Available";

  const rateCard = artist.rateCard || {
    baseShowRate: defaultShowRate,
    baseRehearsalRate: defaultRehearsalRate,
    baseRushFee: defaultRushFee,
    baseMinFee: defaultMinFee,
    negotiable: isDefaultNegotiable,
    instrumentRates: artist.instruments.map((inst, index) => {
      const isPremium = [
        "Double Bass",
        "Pedal Steel",
        "Synth Bass",
        "Hammond Rotary Jam",
        "FOH Sound Engineer",
        "Dolby Atmos",
      ].some((p) => inst.includes(p));
      const multiplier = isPremium ? 1.25 : 1.0;
      return {
        instrument: inst,
        ratePerShow: Math.round(defaultShowRate * multiplier),
        ratePerRehearsal: Math.round(
          defaultRehearsalRate * (isPremium ? 1.15 : 1.0),
        ),
        rushFee: index === 0 ? defaultRushFee : undefined,
        minFee: defaultMinFee,
        negotiable: isDefaultNegotiable,
      };
    }),
  };

  // State for active chosen instrument / role inside the Rate Card (above the fold)
  const [activeInstIndex, setActiveInstIndex] = useState(0);
  const activeRate = rateCard.instrumentRates[activeInstIndex] || {
    instrument: artist.instruments[0] || "Sessionist",
    ratePerShow: rateCard.baseShowRate,
    ratePerRehearsal: rateCard.baseRehearsalRate,
    rushFee: rateCard.baseRushFee,
    minFee: rateCard.baseMinFee,
    negotiable: rateCard.negotiable,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (tours[0]) {
      setSelectedTourId(tours[0].id);
    }
  }, [tours]);

  const activeTour = tours.find((t) => t.id === selectedTourId);
  useEffect(() => {
    if (activeTour && activeTour.roleRequirements[0]) {
      setSelectedTourRoleId(activeTour.roleRequirements[0].id);
    }
  }, [activeTour]);

  const clips =
    artist.audioSamples && artist.audioSamples.length > 0
      ? artist.audioSamples
      : [artist.audioSample];

  const handlePlayClipIndex = (idx: number) => {
    if (selectedClipIndex === idx) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedClipIndex(idx);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  return (
    <div
      id={`artist-card-${artist.id}`}
      className={`group relative border overflow-hidden transition-all duration-300 flex flex-col h-full rounded-none ${
        isReal 
          ? "border-emerald-500/30 bg-[#0F1C15]/40 shadow-[0_0_15px_rgba(16,185,129,0.03)] hover:border-[#D1FF26] hover:shadow-[0_0_25px_rgba(209,255,38,0.15)]"
          : "border-white/10 bg-white/5 hover:border-white/30"
      }`}
    >
      {/* Top Badge for Verified status */}
      {isReal ? (
        <div className="absolute top-0 right-0 bg-[#D1FF26] text-black px-3 py-1 font-mono font-black text-[9px] uppercase tracking-wider z-20 flex items-center gap-1 shadow-lg">
          <Zap className="w-2.5 h-2.5 fill-black" /> Verified Real
        </div>
      ) : (
        <div className="absolute top-0 right-0 bg-white/10 text-white/50 px-3 py-1 font-mono font-bold text-[9px] uppercase tracking-wider z-20">
          Demo Mockup
        </div>
      )}

      {/* Favorite Selection Heart Button */}
      <button
        id={`fav-btn-${artist.id}`}
        type="button"
        onClick={() => onToggleFavorite(artist.id)}
        className="absolute top-2.5 left-2.5 z-20 p-1.5 bg-black/80 hover:bg-black text-[#D1FF26] border border-white/10 hover:border-brand-accent cursor-pointer transition-colors"
        title={isFavorite ? "Remove from Saved Favorites" : "Save to Favorites"}
      >
        <Heart
          className={`w-3.5 h-3.5 ${isFavorite ? "text-brand-accent fill-brand-accent" : "text-white/40"}`}
        />
      </button>

      {/* Main Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Avatar and Name Above fold */}
          <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0 self-start sm:self-auto">
                <SafeImage
                  src={artist.avatarUrl}
                  alt={artist.name}
                  textSeed={artist.name}
                  fallbackType="avatar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-none object-cover border border-white/10 transition-all duration-500"
                />
              </div>
              <div>
                <h3 className="font-sans font-extrabold text-lg text-white tracking-tight uppercase leading-snug flex items-center gap-2">
                  {artist.name}
                  {artist.type === 'band' && (
                    <span className="bg-[#D1FF26] text-black text-[9px] px-1.5 py-0.5 rounded-none tracking-widest font-mono">COMPLETE BAND ({artist.membersCount} Pcs)</span>
                  )}
                </h3>

                {/* Tour-Ready Tags Minimum Cognitive Load */}
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  <span className="px-1 py-0.5 bg-white/10 text-white/70 text-[8px] font-mono uppercase border border-white/5">
                    Sight-read
                  </span>
                  <span className="px-1 py-0.5 bg-white/10 text-white/70 text-[8px] font-mono uppercase border border-white/5">
                    IEM-ready
                  </span>
                  <span className="px-1 py-0.5 bg-white/10 text-white/70 text-[8px] font-mono uppercase border border-white/5">
                    Tracks/Click
                  </span>
                  <span className="px-1 py-0.5 bg-brand-accent/10 text-brand-accent text-[8px] font-mono uppercase border border-brand-accent/20">
                    MD Exp.
                  </span>
                  {artist.genres.slice(0, 2).map((g, idx) => (
                    <span
                      key={idx}
                      className="px-1 py-0.5 bg-[#AC6CFF]/10 text-[#AC6CFF] text-[8px] font-mono uppercase border border-[#AC6CFF]/20"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-0.5 text-white/50 text-[10px] mt-0.5 font-mono uppercase">
                  <div className="flex items-center gap-1.5 text-white/80 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="truncate">
                      Based in: {artist.location.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-5 text-white/50">
                    <span>Can travel: NL/BE/DE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="text-right">
              <span
                className={`inline-block text-[8px] font-mono uppercase px-2 py-0.5 ${
                  artist.availability === "Available"
                    ? "bg-[#D1FF26]/10 text-brand-accent border border-[#D1FF26]/20"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                }`}
              >
                ●{" "}
                {artist.availability === "Available"
                  ? "NEXT AVAIL: JUN 12-18"
                  : artist.availability}
              </span>
            </div>
          </div>

          {/* Transparent Artist-set pricing ABOVE THE FOLD Rate Card */}
          <div className="mt-4 bg-black/60 border border-white/10 p-3 flex flex-col gap-2">
            {/* Top Priority Stats (Decision fields) */}
            <div className="grid grid-cols-3 gap-2 pt-1 pb-3 border-b border-white/5">
              <div className="flex flex-col items-center text-center p-1">
                <span className="text-[8px] uppercase font-mono text-white/40 mb-1">
                  Fee / Show
                </span>
                <span className="text-brand-accent text-lg font-black font-sans leading-none">
                  €{activeRate.ratePerShow}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-1 border-l border-white/10">
                <span className="text-[8px] uppercase font-mono text-white/40 mb-1">
                  Reliability
                </span>
                <span className="text-white text-[10px] font-bold font-sans leading-none">
                  Responds &lt; 2h
                </span>
                <span className="text-white/50 text-[8px] font-mono mt-0.5">
                  No-show: Low
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-1 border-l border-white/10">
                <span className="text-[8px] uppercase font-mono text-white/40 mb-1">
                  Credits
                </span>
                <span className="text-[#AC6CFF] text-[10px] font-bold font-sans leading-none flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Top Verified
                </span>
                <span className="text-white/50 text-[8px] font-mono mt-1">
                  Touring / Club
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-wider mt-1">
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-[#D1FF26]" />
                Select Role Configuration
              </span>
              <span className="text-brand-accent">Rate locked when held</span>
            </div>

            {/* Instrument selector tabs for rate card */}
            <div className="flex flex-wrap gap-1">
              {rateCard.instrumentRates.map((ir, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveInstIndex(i);
                    setCustomShowOffer(ir.ratePerShow);
                    setCustomRehearsalOffer(ir.ratePerRehearsal || 200);
                  }}
                  className={`px-2 py-1 text-[8.5px] uppercase font-mono border transition ${
                    activeInstIndex === i
                      ? "bg-brand-accent border-brand-accent text-[#0A0A0A] font-black"
                      : "bg-black/50 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {ir.instrument}
                </button>
              ))}
            </div>

            {/* Rate values grid */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Show Rate (REQUIRED) */}
              <div className="bg-white/5 p-2 rounded-none border border-white/5">
                <span className="block text-[8px] font-mono uppercase text-white/40">
                  Show Rate (Required)
                </span>
                <span className="text-sm font-sans font-black text-brand-accent block mt-0.5">
                  €{activeRate.ratePerShow}
                  <span className="text-[10px] text-white/50 font-mono font-medium ml-1">
                    /show
                  </span>
                </span>
              </div>

              {/* Rehearsal Rate (OPTIONAL) */}
              <div className="bg-white/5 p-2 rounded-none border border-white/5">
                <span className="block text-[8px] font-mono uppercase text-white/40">
                  Rehearsal Rate
                </span>
                <span className="text-sm font-sans font-bold text-white block mt-0.5">
                  {activeRate.ratePerRehearsal
                    ? `€${activeRate.ratePerRehearsal}`
                    : "Included"}
                  <span className="text-[10px] text-white/50 font-mono font-medium ml-1">
                    /rehearsal
                  </span>
                </span>
              </div>

              {/* Rush fee */}
              <div className="bg-white/5 p-2 rounded-none border border-white/5">
                <span className="block text-[8px] font-mono uppercase text-white/40">
                  Emergency Rush Fee
                </span>
                <span className="text-xs font-mono font-bold text-white/95 block mt-1">
                  {activeRate.rushFee
                    ? `+€${activeRate.rushFee}`
                    : "€0 No Rush"}
                </span>
              </div>

              {/* Negotiability tag */}
              <div className="bg-white/5 p-2 rounded-none border border-white/5 flex flex-col justify-center">
                <span className="block text-[8px] font-mono uppercase text-white/40">
                  Negotiation Policy
                </span>
                <div className="text-[9px] font-mono font-extrabold uppercase mt-1 flex items-center gap-1">
                  {activeRate.negotiable ? (
                    <span className="text-emerald-400">✓ Negotiable Offer</span>
                  ) : (
                    <span className="text-amber-400">🔒 Rate Locked</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[8px] font-mono text-white/30 text-center uppercase tracking-wider">
              Minimum fee: €{activeRate.minFee}
            </div>
          </div>

          <p className="mt-3 text-white/70 text-sm leading-relaxed line-clamp-2">
            {artist.bio}
          </p>

          {/* Styles display */}
          <div className="mt-3.5 pt-2 border-t border-white/5 flex flex-wrap gap-1.5 items-center justify-between">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[9px] text-white/40 font-mono uppercase mr-1">
                Styles:
              </span>
              {artist.genres.map((genre, idx) => (
                <span
                  key={idx}
                  className="text-[#D1FF26] font-mono text-[9px] uppercase tracking-normal"
                >
                  /{genre}
                </span>
              ))}
            </div>

            {artist.socialLinks && (
              <div className="flex items-center gap-2 text-white/30">
                {artist.socialLinks.instagram && (
                  <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors" title="Instagram">
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {artist.socialLinks.youtube && (
                  <a href={artist.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors" title="YouTube">
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                )}
                {artist.socialLinks.spotify && (
                  <a href={artist.socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors" title="Spotify">
                    <Music2 className="w-3.5 h-3.5" />
                  </a>
                )}
                {artist.socialLinks.website && (
                  <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Website">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Gear & Logistics Details */}
          {(artist.gear || artist.transport) && (
            <div className="mt-3 pt-3 border-t border-white/15 space-y-2">
              {artist.gear && (
                <div className="space-y-0.5">
                  <span className="text-[8.5px] text-white/40 font-mono uppercase block font-bold">
                    [ Setup Spec ]
                  </span>
                  <p className="text-[11px] text-white/75 italic truncate">
                    {artist.gear}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Portfolio Preview (Exactly 1 Audio Clip) */}
        <div className="bg-black/45 rounded-none p-3 border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-white/50 border-b border-white/5 pb-1">
            <span className="flex items-center gap-1 text-white/80 font-mono uppercase font-bold text-[9px]">
              <Clock className="w-3.5 h-3.5 text-brand-accent shrink-0" /> Audio
              Portfolio ({clips.length} Track{clips.length !== 1 ? "s" : ""})
            </span>
            {isPlaying && (
              <span className="text-[8px] text-[#D1FF26] font-mono animate-pulse">
                STREAMING ACTIVE
              </span>
            )}
          </div>

          <div className="space-y-1.5 ">
            {clips.map((clip, index) => {
              const isCurrent = selectedClipIndex === index;
              const isClipPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={clip.id || `clip-${index}`}
                  className={`p-1.5 border transition-all duration-200 flex flex-col gap-2.5 ${
                    isClipPlaying
                      ? "bg-brand-accent/5 border-[#D1FF26]/30"
                      : "bg-black/30 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5 w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {!clip.audioUrl && (
                        <button
                          id={`play-clip-${artist.id}-${index}`}
                          type="button"
                          onClick={() => handlePlayClipIndex(index)}
                          className="w-5 h-5 shrink-0 bg-white/5 hover:bg-brand-accent text-[#D1FF26] hover:text-black border border-white/10 flex items-center justify-center transition cursor-pointer"
                        >
                          {isClipPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-1.5 ml-0.5" />
                          )}
                        </button>
                      )}
                      <span className="text-[10px] font-mono truncate text-white/90">
                        {clip.title}
                      </span>
                    </div>
                    <span className="font-mono text-[8.5px] text-white/40">
                      {clip.duration}
                    </span>
                  </div>
                  {clip.audioUrl && (
                    <audio
                      controls
                      src={clip.audioUrl}
                      className="w-full h-8"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Showcase Preview (Exactly 2 Video Clips) */}
        <div className="bg-black/45 rounded-none p-3 border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-white/50 border-b border-white/5 pb-1">
            <span className="flex items-center gap-1 text-white/80 font-mono uppercase font-bold text-[9px]">
              <Video className="w-3.5 h-3.5 text-brand-accent shrink-0" /> Video
              Showreels ({Math.min(2, artist.videoSamples?.length || 0)} Clips)
            </span>
            <span className="text-[8px] text-white/30 font-mono uppercase">
              Live Setup
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-1">
            {artist.videoSamples && artist.videoSamples.length > 0 ? (
              artist.videoSamples.slice(0, 2).map((vClip, index) => (
                <div
                  key={vClip.id || `vclip-${index}`}
                  className="group/v relative bg-black/60 border border-white/5 overflow-hidden flex flex-col transition-all duration-200"
                >
                  {vClip.videoUrl &&
                  (vClip.videoUrl.includes("youtube") ||
                    vClip.videoUrl.includes("youtu.be")) ? (
                    <div className="w-full relative pt-[56.25%] bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${vClip.videoUrl.includes("youtu.be/") ? vClip.videoUrl.split("youtu.be/")[1].split("?")[0] : vClip.videoUrl.split("v=")[1]?.split("&")[0] || ""}?controls=1&showinfo=0&rel=0&modestbranding=1`}
                        className="absolute inset-0 w-full h-full border-0"
                        title={vClip.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : vClip.videoUrl && vClip.videoUrl.startsWith("blob:") ? (
                    <div className="w-full relative pt-[56.25%] bg-black">
                      <video
                        src={vClip.videoUrl}
                        controls
                        className="absolute inset-0 w-full h-full object-cover"
                      ></video>
                    </div>
                  ) : vClip.videoUrl && vClip.videoUrl.includes("unsplash") ? (
                    <div className="w-full relative pt-[56.25%] bg-black">
                      <img
                        src={vClip.videoUrl}
                        alt={vClip.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover/v:opacity-45 transition-opacity"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            `Launching visual playback for: "${vClip.title}" (${vClip.duration})`,
                          )
                        }
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-[#D1FF26] hover:scale-110 transition cursor-pointer"
                      >
                        <Play className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Launching visual playback for: "${vClip.title}" (${vClip.duration} session duration)`,
                        )
                      }
                      className="text-left p-2.5 hover:bg-brand-accent/5 hover:border-brand-accent/20 cursor-pointer h-16 flex flex-col justify-between"
                    >
                      <div className="text-[10px] font-sans font-bold text-white/90 group-hover/v:text-brand-accent line-clamp-2 leading-tight uppercase tracking-tight">
                        {vClip.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[8px] font-mono text-white/30">
                        <span className="text-[#AC6CFF] flex items-center gap-0.5 uppercase tracking-tighter">
                          ▶ Play
                        </span>
                        <span>{vClip.duration}</span>
                      </div>
                    </button>
                  )}
                  {vClip.videoUrl &&
                    (vClip.videoUrl.includes("youtube") ||
                      vClip.videoUrl.includes("youtu.be")) && (
                      <div className="p-2 border-t border-white/5 bg-black/20 flex flex-col">
                        <span className="text-[9px] font-sans font-bold text-white/90 uppercase truncate">
                          {vClip.title}
                        </span>
                        <span className="text-[8px] font-mono text-white/40">
                          {vClip.duration}
                        </span>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className="h-16 flex items-center justify-center font-mono text-[9px] uppercase text-white/30">
                No Showreels uploaded
              </div>
            )}
          </div>
        </div>

        {artist.discography && artist.discography.length > 0 && (
          <div className="bg-black/45 rounded-none p-3 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-white/50 border-b border-white/5 pb-1">
              <span className="flex items-center gap-1 text-white/80 font-mono uppercase font-bold text-[9px]">
                <Disc className="w-3.5 h-3.5 text-[#AC6CFF] shrink-0" /> Selected Credits ({artist.discography.length})
              </span>
            </div>
            
            <div className="space-y-1 mt-0.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {artist.discography.map((item) => (
                <div key={item.id} className="p-1.5 border border-white/5 bg-black/30 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    <span className="text-[10px] font-sans font-bold text-white/90 truncate">{item.title}</span>
                    <span className="text-[8.5px] font-mono text-white/40 truncate">{item.artistProject} • {item.role}</span>
                  </div>
                  <span className="text-[8.5px] font-mono text-white/50 shrink-0">{item.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls & Direct Hold/Offer workspace inputs */}
      <div className="bg-black/30 border-t border-white/10 px-6 py-4 flex flex-col gap-3">
        {/* Accordion ratings */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-white/90 font-mono">
            <Star className="w-3.5 h-3.5 text-brand-accent fill-brand-accent mr-0.5" />
            <span className="font-bold">{artist.rating.toFixed(1)}</span>
            <span className="text-white/40">
              ({artist.reviewCount} Reviews)
            </span>
          </div>
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="text-white/50 text-[10px] hover:text-brand-accent font-mono uppercase tracking-wide flex items-center gap-0.5 cursor-pointer"
          >
            <span>{showReviews ? "Hide Reviews ▲" : "Read Reviews ▼"}</span>
          </button>
        </div>

        {showReviews && (
          <div className="bg-black/40 border border-white/10 p-3 max-h-40 overflow-y-auto space-y-2.5 text-xs">
            {artist.reviews.slice(0, 2).map((review) => (
              <div
                key={review.id}
                className="border-b border-white/5 last:border-0 pb-1.5 font-sans"
              >
                <div className="flex items-center justify-between text-white font-bold text-[11px]">
                  <span>{review.author}</span>
                  <span className="text-brand-accent font-mono text-[10px]">
                    {review.rating}★
                  </span>
                </div>
                <p className="text-white/60 text-[10.5px] italic mt-1 font-light">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Workspace Quick Dispatch Panel (Hold Rate & Propose Counter Offer) */}
        {tours.length > 0 && (
          <div className="border-t border-white/5 pt-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest font-black flex items-center gap-1">
                <Zap className="w-3 h-3 text-brand-accent animate-pulse" />
                WORKSPACE DISPATCH ROUTER
              </span>
              <button
                onClick={() => setIsOfferMode(!isOfferMode)}
                className="text-[8px] font-mono text-brand-accent uppercase hover:underline cursor-pointer"
              >
                {isOfferMode
                  ? "Switch to Instant Hold"
                  : "Switch to Propose Bid"}
              </button>
            </div>

            {/* Tour selector dropdown */}
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-white/40 uppercase text-[7.5px]">
                  Select Campaign Tour:
                </span>
                <select
                  value={selectedTourId}
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  className="bg-black border border-white/10 text-white/95 text-[9px] uppercase font-bold p-1 outline-none"
                >
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {activeTour && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/40 uppercase text-[7.5px]">
                    Instrument Chair Role:
                  </span>
                  <select
                    value={selectedTourRoleId}
                    onChange={(e) => setSelectedTourRoleId(e.target.value)}
                    className="bg-black border border-white/10 text-brand-accent text-[9px] font-bold p-1 outline-none"
                  >
                    {activeTour.roleRequirements.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roleName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Propose offer input frame */}
            {isOfferMode ? (
              <div className="bg-black/60 p-2.5 border border-[#AC6CFF]/20 space-y-2 font-mono text-[10px] animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-white/40 text-[7.5px] uppercase">
                      My Show Offer (€):
                    </span>
                    <input
                      type="number"
                      value={customShowOffer}
                      onChange={(e) =>
                        setCustomShowOffer(Number(e.target.value))
                      }
                      className="w-full bg-black border border-white/10 text-white p-1"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-white/40 text-[7.5px] uppercase">
                      Rehearsal Offer (€):
                    </span>
                    <input
                      type="number"
                      value={customRehearsalOffer}
                      onChange={(e) =>
                        setCustomRehearsalOffer(Number(e.target.value))
                      }
                      className="w-full bg-black border border-white/10 text-white p-1"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Memo/Notes (e.g., locking dates config)..."
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  className="w-full bg-black border border-[#AC6CFF]/15 text-white p-1 text-[9px] rounded-none placeholder-white/20"
                />

                <button
                  onClick={() => {
                    if (onMakeOffer && selectedTourRoleId && selectedTourId) {
                      onMakeOffer(
                        selectedTourRoleId,
                        selectedTourId,
                        artist,
                        customShowOffer,
                        customRehearsalOffer,
                        offerNote ||
                          `Offering rate for ${activeRate.instrument}`,
                      );
                      setOfferNote("");
                      setIsOfferMode(false);
                    }
                  }}
                  className="w-full py-1.5 bg-[#AC6CFF] text-black text-[9px] uppercase font-black tracking-widest transition cursor-pointer"
                >
                  ⚡ DISPATCH BID PROPOSAL
                </button>
              </div>
            ) : (
              // Instant rate lock button (Locks rates during holds duration)
              <button
                onClick={() => {
                  if (onPlaceHold && selectedTourId && selectedTourRoleId) {
                    onPlaceHold(
                      selectedTourRoleId,
                      selectedTourId,
                      artist,
                      activeRate.ratePerShow,
                    );
                  }
                }}
                className="w-full py-2 bg-[#D1FF26] hover:bg-white text-black text-[9px] uppercase font-mono tracking-widest font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-black" />
                <span>
                  Lock Exclusive Rate Hold (Listed rate €
                  {activeRate.ratePerShow})
                </span>
              </button>
            )}
          </div>
        )}

        {/* Execution CTAs */}
        {(() => {
          const isMyProfile = googleUser
            ? artist.userId === googleUser.uid || artist.id === localStorage.getItem("sessiecat_my_artist_id")
            : artist.id === localStorage.getItem("sessiecat_my_artist_id");

          const isUnclaimed = !artist.userId && !isMyProfile;

          if (isMyProfile) {
            return (
              <div className="grid grid-cols-1 gap-2 mt-2">
                <button
                  onClick={() => onEdit?.(artist)}
                  className="w-full py-2.5 bg-[#D1FF26] hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(209,255,38,0.3)] border-0"
                >
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>Edit My Profile</span>
                </button>
              </div>
            );
          }

          const params = new URLSearchParams(
            window.location.hash.split("?")[1] || "",
          );
          const currentJamId = params.get("jamId");

          if (currentJamId) {
            return (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {isUnclaimed && (
                  <button
                    onClick={() => onClaim?.(artist)}
                    className="col-span-2 py-2.5 bg-[#AC6CFF] hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(172,108,255,0.3)] border-0"
                  >
                    <Zap className="w-3.5 h-3.5 text-black animate-pulse" />
                    <span>Claim Listing (Link to Account)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    alert(
                      `Requested 60 min Hold for ${artist.name} on jam ${currentJamId}`,
                    );
                  }}
                  className="col-span-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-black" />
                  <span>Hold 60 Min</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(artist.id)}
                  className="px-3 py-2 border border-brand-accent hover:bg-brand-accent text-brand-accent hover:text-black text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Target className="w-3 h-3" />
                  <span>Add as Backup</span>
                </button>

                <button
                  onClick={() => onChat(artist)}
                  className="px-3 py-2 border border-white/15 hover:border-white hover:bg-white/5 text-white/80 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Message</span>
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {isUnclaimed && (
                <button
                  onClick={() => onClaim?.(artist)}
                  className="col-span-2 py-2.5 bg-[#AC6CFF] hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(172,108,255,0.3)] border-0"
                >
                  <Zap className="w-3.5 h-3.5 text-black animate-pulse" />
                  <span>Claim Listing (Link to Account)</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (onPlaceHold && selectedTourId && selectedTourRoleId) {
                    onPlaceHold(
                      selectedTourRoleId,
                      selectedTourId,
                      artist,
                      activeRate.ratePerShow,
                    );
                  } else {
                    alert(`Requested 24h Hold for ${artist.name}`);
                  }
                }}
                className="col-span-2 py-2.5 bg-[#D1FF26] hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-black" />
                <span>Hold 24h</span>
              </button>

              <button
                onClick={() => onBook(artist)}
                className="px-3 py-2 border border-white hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Add to Shortlist</span>
              </button>

              <button
                onClick={() => onChat(artist)}
                className="px-3 py-2 border border-white/15 hover:border-white hover:bg-white/5 text-white/80 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Message</span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
