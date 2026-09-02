import React, { useState } from 'react';
import { Artist, Booking } from '../types';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Coins, 
  ArrowRight, 
  Music, 
  Heart, 
  Sparkles, 
  Lock, 
  Plus, 
  Info,
  DollarSign
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { PaymentEscrowWidget } from './PaymentEscrowWidget';

interface BandRosterComplianceProps {
  artists: Artist[];
  favoriteArtistIds: string[];
  bookings: Booking[];
  onToggleFavorite: (id: string) => void;
  onBookArtist: (artist: Artist) => void;
  onEscrowFunded?: () => void;
}

export function BandRosterCompliance({
  artists,
  favoriteArtistIds,
  bookings,
  onToggleFavorite,
  onBookArtist,
  onEscrowFunded
}: BandRosterComplianceProps) {
  // Toggle between checking "Shortlisted (Starred)" band or "Confirmed Bookings" band
  const [targetPool, setTargetPool] = useState<'starred' | 'booked'>('starred');

  // Load target artists
  const activeArtistsPool = targetPool === 'starred'
    ? artists.filter(m => favoriteArtistIds.includes(m.id))
    : artists.filter(m => bookings.some(b => b.artistId === m.id));

  // Rate structures
  const DUTCH_UNION_HOURLY_MIN = 75; // Euros/hr Pop CAO Freelance Min
  const DUTCH_UNION_DAILY_MIN = 320;  // Euros/day Pop CAO Freelance Min

  // Classifier helper for the standard Six-Man Band roles
  const classifyArtistRole = (artist: Artist) => {
    const textToSearch = [
      artist.name,
      ...artist.instruments,
      ...artist.genres,
      artist.bio
    ].join(' ').toLowerCase();

    if (textToSearch.includes('guitar') || textToSearch.includes('gitar') || textToSearch.includes('gtr') || textToSearch.includes('banjo') || textToSearch.includes('pedal steel')) {
      return 'guitar';
    }
    if (textToSearch.includes('drum') || textToSearch.includes('percussion') || textToSearch.includes('schlagzeug') || textToSearch.includes('spd-sx') || textToSearch.includes('pads') || textToSearch.includes('trigger')) {
      return 'drums';
    }
    if (textToSearch.includes('piano') || textToSearch.includes('keys') || textToSearch.includes('keyboard') || textToSearch.includes('synth') || textToSearch.includes('rhodes') || textToSearch.includes('hammond') || textToSearch.includes('mellotron')) {
      return 'keys';
    }
    if (textToSearch.includes('vocals') || textToSearch.includes('vocal') || textToSearch.includes('singer') || textToSearch.includes('voice') || textToSearch.includes('vocalist') || textToSearch.includes('sing')) {
      return 'vocals';
    }
    if (textToSearch.includes('trumpet') || textToSearch.includes('flugelhorn') || textToSearch.includes('trombone') || textToSearch.includes('horn') || textToSearch.includes('saxophone') || textToSearch.includes('sax') || textToSearch.includes('brass') || textToSearch.includes('blazer') || textToSearch.includes('flute') || textToSearch.includes('clarinet')) {
      return 'blazers';
    }
    if (textToSearch.includes('bass') || textToSearch.includes('contrabass') || textToSearch.includes('double bass') || textToSearch.includes('bas')) {
      return 'bass';
    }
    return 'other';
  };

  // Define band status based on target pool
  const bandRoster = activeArtistsPool.map(m => ({
    artist: m,
    roleCategory: classifyArtistRole(m)
  }));

  const rolesFound = {
    guitar: bandRoster.filter(item => item.roleCategory === 'guitar'),
    drums: bandRoster.filter(item => item.roleCategory === 'drums'),
    keys: bandRoster.filter(item => item.roleCategory === 'keys'),
    vocals: bandRoster.filter(item => item.roleCategory === 'vocals'),
    blazers: bandRoster.filter(item => item.roleCategory === 'blazers'),
    bass: bandRoster.filter(item => item.roleCategory === 'bass')
  };

  const rolesConfig = [
    { key: 'guitar', label: 'Guitarist', group: rolesFound.guitar, fallbackCandidateTag: 'Vintage Gear' },
    { key: 'drums', label: 'Drummer', group: rolesFound.drums, fallbackCandidateTag: 'Hybrid Rig' },
    { key: 'keys', label: 'Keyboardist', group: rolesFound.keys, fallbackCandidateTag: 'Synthesist' },
    { key: 'vocals', label: 'Lead/Backing Vocalist', group: rolesFound.vocals, fallbackCandidateTag: 'Vocal Arranger' },
    { key: 'blazers', label: 'Blazers / Brass Soloist', group: rolesFound.blazers, fallbackCandidateTag: 'Bimhuis Regular' },
    { key: 'bass', label: 'Bass Guitarist / Double Bass', group: rolesFound.bass, fallbackCandidateTag: 'ADE Ready' }
  ];

  // Recommendations for missing roles
  const getCandidatesForRole = (roleKey: string) => {
    return artists.filter(m => {
      const assignedRole = classifyArtistRole(m);
      if (assignedRole !== roleKey) return false;
      // Do not recommend if already in active pool
      const isAlreadyIncluded = activeArtistsPool.some(p => p.id === m.id);
      return !isAlreadyIncluded;
    }).slice(0, 2);
  };

  // Total rate stats for the selected team
  const totalHourlyRate = activeArtistsPool.reduce((sum, m) => sum + m.hourlyRate, 0);
  const totalDailyRate = activeArtistsPool.reduce((sum, m) => sum + m.dailyRate, 0);

  // Check rate compliance against Dutch NTB / Pop CAO Union standards
  const unionIssues = activeArtistsPool.map(m => {
    const hourlyNonCompliant = m.hourlyRate < DUTCH_UNION_HOURLY_MIN;
    const dailyNonCompliant = m.dailyRate < DUTCH_UNION_DAILY_MIN;
    return {
      artist: m,
      hourlyNonCompliant,
      dailyNonCompliant,
      issues: [
        hourlyNonCompliant ? `Hourly rate (€${m.hourlyRate}) is below the Pop CAO freelance floor of €${DUTCH_UNION_HOURLY_MIN}/Hr` : null,
        dailyNonCompliant ? `Daily flat rate (€${m.dailyRate}) is below the Union minimum floor of €${DUTCH_UNION_DAILY_MIN}/Session` : null,
      ].filter(Boolean) as string[]
    };
  }).filter(item => item.issues.length > 0);

  const isUnionFullyCompliant = unionIssues.length === 0;
  const isSixManTargetMet = activeArtistsPool.length >= 6;

  return (
    <div id="band-roster-compliance-widget" className="bg-black/55 border-2 border-brand-accent/20 p-6 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Widget Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#D1FF26]/10 border border-[#D1FF26]/30 text-[#D1FF26] text-[9.5px] font-mono px-2.5 py-0.5 uppercase tracking-widest font-black flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>CAO Popmuziek & Band Composition Monitor</span>
            </span>
          </div>
          <h3 className="text-lg font-black uppercase text-white tracking-widest mt-1.5 font-sans">
            Roster Assembler & Union Auditor
          </h3>
          <p className="text-[11px] text-white/50 font-light max-w-xl">
            Normally, standard touring bands in the Netherlands require at least a <strong className="text-white">six-man band</strong> (Guitar, Drums, Keys, Vocals, Blazers, Bass) complying with CAO Popmuziek minimum freelance rules.
          </p>
        </div>

        {/* Source Pool Toggle */}
        <div className="flex bg-black p-1 border border-white/15 self-start md:self-center shrink-0">
          <button
            onClick={() => setTargetPool('starred')}
            className={`px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded-none flex items-center gap-1.5 ${
              targetPool === 'starred' 
                ? 'bg-[#D1FF26] text-black font-extrabold' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0" />
            <span>Shortlist ({favoriteArtistIds.length})</span>
          </button>
          <button
            onClick={() => setTargetPool('booked')}
            className={`px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded-none flex items-center gap-1.5 ${
              targetPool === 'booked' 
                ? 'bg-[#D1FF26] text-black font-extrabold' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Booked ({bookings.length})</span>
          </button>
        </div>
      </div>

      {/* Main Roster Checklist & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Roster Grid Slots (Six chairs) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">
              [ SIX-MAN BAND TARGET TEMPLATE ]
            </span>
            <span className="text-[11px] font-mono text-white/80">
              Roster: <strong className={isSixManTargetMet ? 'text-brand-accent' : 'text-amber-400'}>{activeArtistsPool.length}/6 Members</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {rolesConfig.map(role => {
              const isFilled = role.group.length > 0;
              const candidates = getCandidatesForRole(role.key);

              return (
                <div 
                  key={role.key}
                  className={`border p-4 flex flex-col justify-between transition-all ${
                    isFilled 
                      ? 'bg-brand-accent/5 border-[#D1FF26]/30 shadow-[0_0_12px_rgba(209,255,38,0.02)]' 
                      : 'bg-black/40 border-dashed border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Required Chair</span>
                      <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5 mt-0.5">
                        <Music className="w-3.5 h-3.5 text-brand-accent" />
                        <span>{role.label}</span>
                      </h4>
                    </div>

                    {isFilled ? (
                      <span className="bg-[#D1FF26]/10 border border-[#D1FF26]/30 text-brand-accent text-[8px] font-mono px-1.5 py-0.5 uppercase font-bold">
                        ✓ FILLED
                      </span>
                    ) : (
                      <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono px-1.5 py-0.5 uppercase font-bold">
                        ⚠️ NEEDED
                      </span>
                    )}
                  </div>

                  {/* Filled State Artist Cards */}
                  {isFilled ? (
                    <div className="mt-4 space-y-2">
                      {role.group.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-black/50 p-2 border border-white/5">
                          <SafeImage
                            src={item.artist.avatarUrl}
                            alt={item.artist.name}
                            textSeed={item.artist.name}
                            fallbackType="avatar"
                            className="w-7 h-7 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-white font-bold block truncate leading-tight">{item.artist.name}</span>
                            <span className="text-[9px] text-[#D1FF26] font-mono block">€{item.artist.dailyRate}/Day • €{item.artist.hourlyRate}/Hr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Missing State with Instant Star Candidate Suggestions
                    <div className="mt-4 space-y-2 text-[11px] text-white/50">
                      <p className="italic text-[10px] leading-snug">Roster is missing this instrument. Suggested candidate specialists:</p>
                      
                      {candidates.length === 0 ? (
                        <span className="text-[9.5px] font-mono text-white/30 truncate block">No immediate matches currently standby.</span>
                      ) : (
                        <div className="space-y-1.5">
                          {candidates.map(candidate => (
                            <div 
                              key={candidate.id} 
                              className="flex items-center justify-between gap-1.5 bg-neutral-900 border border-neutral-800 p-2 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <SafeImage
                                  src={candidate.avatarUrl}
                                  alt={candidate.name}
                                  textSeed={candidate.name}
                                  fallbackType="avatar"
                                  className="w-5 h-5 object-cover shrink-0"
                                />
                                <span className="text-white font-medium truncate text-[11px] block">{candidate.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  onToggleFavorite(candidate.id);
                                }}
                                className="px-2 py-1 bg-brand-accent hover:bg-white text-black text-[9px] font-mono uppercase tracking-widest font-black shrink-0 transition"
                              >
                                {targetPool === 'starred' ? '★ Add Star' : 'Book'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Union Minimum compliance scores */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block font-bold">
              [ UNION CAO AUDIT REPORT ]
            </span>
          </div>

          <div className="bg-black/60 border border-white/10 p-5 space-y-4 font-sans">
            {/* Live CAO popmuziek thresholds panel */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 bg-[#D1FF26]/5 border border-[#D1FF26]/15 p-2.5 text-xs">
                <Coins className="w-4 h-4 text-brand-accent shrink-0" />
                <div>
                  <strong className="text-white block font-mono text-[10px] uppercase">Ntb / CAO Popmuziek Floor</strong>
                  <span className="text-white/70 text-[10.5px]">Pop freelancers minimum hourly floor: <strong className="text-[#D1FF26] font-mono">€{DUTCH_UNION_HOURLY_MIN}</strong>. Session flat minimum floor: <strong className="text-[#D1FF26] font-mono">€{DUTCH_UNION_DAILY_MIN}</strong>.</span>
                </div>
              </div>
            </div>

            {/* Total Band Cost projection */}
            <div className="border-t border-b border-white/5 py-4 space-y-1.5">
              <span className="text-[10px] font-mono text-white/40 uppercase block font-bold">PROJECTED SESSION UNION BUDGET</span>
              
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-white/60">Band Daily Total ({activeArtistsPool.length} man):</span>
                <span className="text-lg font-black font-mono text-brand-accent">€{totalDailyRate} <span className="text-[10px] text-white/40">EUR</span></span>
              </div>
              
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-white/60">Band Combined Hourly Rate:</span>
                <span className="text-sm font-bold font-mono text-white">€{totalHourlyRate}/Hr</span>
              </div>
            </div>

            {/* Compliance Diagnosis Alert */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-white/40 uppercase block font-bold">COMPLIANCE DIAGNOSIS</span>

              {!isSixManTargetMet && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/25 text-amber-300 text-[11px] leading-relaxed flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200 block mb-0.5 uppercase tracking-wide text-[9.5px] font-mono">⚠️ Band Size Warning</strong>
                    Roster currently stands at <strong className="text-white">{activeArtistsPool.length} members</strong>. Under typical Dutch tour/show environments, arranging a solid live band requires at least six instrumentalists.
                  </div>
                </div>
              )}

              {activeArtistsPool.length > 0 && !isUnionFullyCompliant ? (
                <div className="p-3 bg-red-500/5 box-border border border-red-500/25 text-red-300 text-[11px] leading-relaxed flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-200 block mb-0.5 uppercase tracking-wide text-[9.5px] font-mono">⚠️ Non-Compliant Rates</strong>
                    {unionIssues.length} artists in your selected band fall below the recommended Dutch Union tariff parameters. Review contracts to maintain fair practice scores.
                  </div>
                </div>
              ) : activeArtistsPool.length > 0 ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed flex gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-200 block mb-0.5 uppercase tracking-wide text-[9.5px] font-mono">✓ CAO Tariff Compliant</strong>
                    All active sessionists in the current pool meet the freelance Popmuziek union minimum thresholds!
                  </div>
                </div>
              ) : null}

              {isSixManTargetMet && isUnionFullyCompliant && activeArtistsPool.length > 0 && (
                <div className="p-3 bg-[#D1FF26]/10 border border-[#D1FF26]/20 text-white text-[11px] leading-relaxed flex gap-2">
                  <Sparkles className="w-4 h-4 text-[#D1FF26] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-brand-accent block mb-0.5 uppercase tracking-wide text-[9.5px] font-mono">✓ GOLD ELITE STATUS</strong>
                    Your roster meets both the 6-man minimum band threshold and complies fully with Dutch freelance labor union regulations!
                  </div>
                </div>
              )}
            </div>
          </div>

          <PaymentEscrowWidget amount={totalDailyRate} onSuccess={onEscrowFunded} />
        </div>
      </div>
    </div>
  );
}
