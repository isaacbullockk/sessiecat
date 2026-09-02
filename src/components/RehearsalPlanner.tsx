import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Plus, Check, ThumbsUp, Sparkles, Building2, HelpCircle, Navigation2, CheckCircle, Info, Compass, RefreshCw } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface Participant {
  name: string;
  avatarUrl?: string;
  role: string;
}

interface RehearsalSlot {
  id: string;
  date: string;
  time: string;
  votes: string[]; // names of participants who voted "yes"
}

interface RehearsalSpace {
  id: string;
  name: string;
  district: string;
  description: string;
  hourlyRate: number;
  featuredGear: string[];
  distanceKm: number;
  lat: number;
  lng: number;
  amenities: string[];
  imageUrl: string;
  bearing?: string;
}

const PRESET_BEACONS = [
  { name: 'Amsterdam Centraal Station', lat: 52.3791, lng: 4.9003, desc: 'Central hub of the channel system' },
  { name: 'NDSM Wharf (Noord)', lat: 52.4014, lng: 4.8920, desc: 'Alternative industrial art wharf' },
  { name: 'Leidseplein (Grachtengordel)', lat: 52.3637, lng: 4.8824, desc: 'Clubs and live music core' },
  { name: 'Amsterdam-Oost (Oosterpark)', lat: 52.3615, lng: 4.9221, desc: 'Hip multicultural residential quarters' },
  { name: 'Amsterdam-Zuid (WTC)', lat: 52.3375, lng: 4.8732, desc: 'Modern highrise hub' },
  { name: 'Hilversum Media Park', lat: 52.2427, lng: 5.1747, desc: 'Famous broadcasting suburb outside AMS' }
];

export function RehearsalPlanner() {
  // --- Datumprikker (Scheduler) State ---
  const [schedulerActive, setSchedulerActive] = useState(false); // Default to false so they see nearest studio finder right away or we toggle
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real-Time Geolocation States
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 52.3791, lng: 4.9003 }); // Default: Amsterdam Central
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Default options
  const defaultParticipants: Participant[] = [
    { name: 'Sam Ritchie', role: 'trumpet', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { name: 'Marcin Ajo', role: 'foh engineer', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { name: 'Marko Dundovic', role: 'keys/synth', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { name: 'Ben Stone', role: 'drums', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
  ];

  const [slots, setSlots] = useState<RehearsalSlot[]>([
    { id: '1', date: 'Wednesday, May 27', time: '19:30 - 22:30', votes: ['Sam Ritchie', 'Marcin Ajo', 'You / Producer'] },
    { id: '2', date: 'Thursday, May 28', time: '20:00 - 23:00', votes: ['Sam Ritchie', 'Marcin Ajo', 'Marko Dundovic', 'Ben Stone'] },
    { id: '3', date: 'Saturday, May 30', time: '13:00 - 16:00', votes: ['Marko Dundovic', 'Ben Stone', 'You / Producer'] },
    { id: '4', date: 'Monday, June 01', time: '19:00 - 22:00', votes: ['Sam Ritchie', 'Marko Dundovic'] },
  ]);

  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [pinnedSlotId, setPinnedSlotId] = useState<string | null>('2'); // default Thursday
  const [bookedSpaceId, setBookedSpaceId] = useState<string | null>(null);

  // --- Closest Rehearsal Spaces in Amsterdam Data ---
  const REHEARSAL_SPACES: RehearsalSpace[] = [
    {
      id: 's1',
      name: 'Q-Factory Amsterdam',
      district: 'Amsterdam-Oost (Atlantisplein)',
      description: 'The biggest music-maker center in Europe. Professional acoustic insulation, loaded with top-tier Marshall, Fender, and Ampeg heavy backlines, Yamaha upright piano, and a brand new digital FOH sound booth.',
      hourlyRate: 16,
      featuredGear: ['Midas M32 Mix Console', 'Ludwig Drum Kit', 'Ampeg SVT Classic', 'Marshall JVM410H Stack'],
      distanceKm: 2.8,
      lat: 52.3621,
      lng: 4.9318,
      amenities: ['Bar/Cafe', 'Gear Lockers', 'Loading Dock Elevators', 'High-Speed Wi-Fi'],
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 's2',
      name: 'OT301 Music Vault',
      district: 'Amsterdam-West (Overtoom)',
      description: 'Famous artist-run alternative project. Earthy DIY ambiance with marvelous sound isolation in the old film academy basement. Cozy, warm vibe with highly responsive monitors and friendly rates.',
      hourlyRate: 12,
      featuredGear: ['Soundcraft Analog Desk', 'Pearl Export Drum Kit', 'Fender Twin Reverb', 'Vintage Synthesizer Stand'],
      distanceKm: 1.5,
      lat: 52.3611,
      lng: 4.8694,
      amenities: ['DIY Espresso Bar', 'Vegan Kitchen Upstairs', 'Bicycle Racks', 'Vocal Monitors'],
      imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 's3',
      name: 'NDSM Treehouse Studios',
      district: 'Amsterdam-Noord (T.T. Vasumweg)',
      description: 'Industrial artistic shipping container complex over Het IJ. Outstanding spatial acoustics for avant-garde session rehearsals, tracking demos, and live streaming setups. Connected with high bandwidth fiber.',
      hourlyRate: 14,
      featuredGear: ['PreSonus StudioLive Board', 'Gretsch Catalina Club Drum Kit', 'Vox AC30 Combo', 'Strymon Multi-FX Board'],
      distanceKm: 0.9,
      lat: 52.4014,
      lng: 4.8920,
      amenities: ['IJ River View Terrace', 'NDSM Ferry Adjacent', 'Coffee Bar', 'Ample Parking Slot'],
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 's4',
      name: 'Muziekcentrum Volta',
      district: 'Amsterdam-West (Houtmankade)',
      description: 'Dynamic neighborhood sanctuary for experimental pop, acoustic brass ensembles, and heavy rock. Great acoustic treatment and dedicated FOH/monitor engineer test beds. Highly affordable.',
      hourlyRate: 13,
      featuredGear: ['Allen & Heath SQ5', 'Sonor Custom Kit', 'Roland KC-550 Keyboard Amp', 'Shure SM58 Microphones'],
      distanceKm: 2.1,
      lat: 52.3895,
      lng: 4.8872,
      amenities: ['Snack Bar', 'Lounge couches', 'Easy Tram Access', 'Free Ground Load-In'],
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 's5',
      name: 'Wisseloord Studios (Amstel/Hilversum Area)',
      district: 'Hilversum (20m Train/Electric bike flow)',
      description: 'Legendary historical powerhouse recording complex where Elton John, Def Leppard, and Coldplay tracked. World-class acoustics, SSL & Neve mix rooms, and calibrated sound-proofed orchestral rehearsal stages.',
      hourlyRate: 45,
      featuredGear: ['SSL 4000G Console', 'Steinway & Sons Grand Piano D', 'Custom ATC SCM150 Monitors', 'Vintage Neumann Cole mics'],
      distanceKm: 18.0,
      lat: 52.2346,
      lng: 5.1911,
      amenities: ['Pristine garden lounge', 'Catering service', 'High-end instrument vaults', 'Private parking dispatches'],
      imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400&auto=format&fit=crop&q=80'
    }
  ];

  // Tally votes to find consensus
  const getConsensusSlot = () => {
    let maxVotes = -1;
    let consensus: RehearsalSlot | null = null;
    slots.forEach(s => {
      if (s.votes.length > maxVotes) {
        maxVotes = s.votes.length;
        consensus = s;
      }
    });
    return consensus as RehearsalSlot | null;
  };

  const consensus = getConsensusSlot();

  // User toggle vote (Priks)
  const handleToggleVote = (slotId: string) => {
    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        const hasVoted = s.votes.includes('You / Producer');
        return {
          ...s,
          votes: hasVoted 
            ? s.votes.filter(name => name !== 'You / Producer') 
            : [...s.votes, 'You / Producer']
        };
      }
      return s;
    }));
    setSuccessMessage('Your "Datumprikker" status was updated cleanly in the collaborative state!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Add custom proposal to Datumprikker
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate || !customTime) return;

    const newSlot: RehearsalSlot = {
      id: `slot_c_${Date.now()}`,
      date: customDate,
      time: customTime,
      votes: ['You / Producer']
    };

    setSlots(prev => [...prev, newSlot]);
    setCustomDate('');
    setCustomTime('');
    setSuccessMessage(`New prospective rehearsal date proposed: ${newSlot.date} at ${newSlot.time}!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Select consensus date as active
  const handleLockConsensusDate = (slot: RehearsalSlot) => {
    setPinnedSlotId(slot.id);
    setSuccessMessage(`📅 Rehearsal date officially secured & pinned as the target: ${slot.date} (${slot.time}).`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Secure closest rehearsal space
  const handleBookSpace = (space: RehearsalSpace) => {
    setBookedSpaceId(space.id);
    const targetDate = slots.find(s => s.id === pinnedSlotId);
    setSuccessMessage(`🔊 Spot Secured! "${space.name}" is booked for our consensus rehearsal date ${targetDate ? targetDate.date + ' ' + targetDate.time : 'selection'}! Notification dispatched to all artists & sound engineers.`);
    setTimeout(() => setSuccessMessage(null), 4500);
  };

  // --- Geolocation Calculations ---
  
  // Haversine formula to compute geographic path length in km
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const getBearingDirection = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    let brng = Math.atan2(y, x) * (180 / Math.PI);
    brng = (brng + 360) % 360;
    
    if (brng >= 337.5 || brng < 22.5) return 'North ⬆️';
    if (brng >= 22.5 && brng < 67.5) return 'North-East ↗️';
    if (brng >= 67.5 && brng < 112.5) return 'East ➡️';
    if (brng >= 112.5 && brng < 157.5) return 'South-East ↘️';
    if (brng >= 157.5 && brng < 202.5) return 'South ⬇️';
    if (brng >= 202.5 && brng < 247.5) return 'South-West ↙️';
    if (brng >= 247.5 && brng < 292.5) return 'West ⬅️';
    return 'North-West ↖️';
  };

  const syncGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsActive(true);
        setGpsLoading(false);
        setSuccessMessage('🌍 Live Browser GPS Successfully Synchronized! Custom-sorted nearest studios in real-time.');
        setTimeout(() => setSuccessMessage(null), 3500);
      },
      (err) => {
        setGpsError(`GPS Access Refused (${err.message}). Falling back to simulation mode.`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Compute live distances dynamically based on selected coordinates state, and sort ascending
  const computedSpaces = REHEARSAL_SPACES.map(space => {
    const rawDist = getDistanceFromLatLonInKm(coords.lat, coords.lng, space.lat, space.lng);
    const bearing = getBearingDirection(coords.lat, coords.lng, space.lat, space.lng);
    return {
      ...space,
      distanceKm: Number(rawDist.toFixed(1)),
      bearing
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="bg-white/5 border border-white/10 p-6 md:p-8 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-[9px] font-mono px-2 py-0.5 uppercase font-bold tracking-widest">
              🇳🇱 AMSTERDAM REHEARSAL SYNC MODULE
            </span>
          </div>
          <h2 className="text-xl font-black uppercase text-white tracking-tight mt-1.5 font-sans">
            Datumprikker & Rehearsal Hub
          </h2>
          <p className="text-xs text-white/50 font-light mt-1">
            Coordinate rehearsal dates with sessionists & sound engineers, then book the closest studio spot in Amsterdam.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-black p-1 border border-white/15">
          <button
            onClick={() => setSchedulerActive(true)}
            className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded-none ${
              schedulerActive 
                ? 'bg-brand-accent text-black font-extrabold' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            🗓️ Datumprikker Poll
          </button>
          <button
            onClick={() => setSchedulerActive(false)}
            className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer rounded-none ${
              !schedulerActive 
                ? 'bg-brand-accent text-black font-extrabold' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            🏢 Nearest Studio Finder
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-[#D1FF26] text-black text-xs font-mono font-black p-3.5 uppercase tracking-wide flex items-center gap-2.5 animate-fade-in border border-black/25">
          <CheckCircle className="w-4 h-4 text-black shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {schedulerActive ? (
        // --- DATUMPRIKKER SCHEDULER TAB CONTENT ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Main Slots Poll Grid */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block font-bold">
                [ Active Date Poll Options ]
              </span>
              <span className="text-[10px] text-brand-accent font-mono uppercase font-semibold">
                * Click Thumbs Up button to place a "prik"
              </span>
            </div>

            <div className="space-y-3.5">
              {slots.map((slot) => {
                const isConsensusWinner = consensus && consensus.id === slot.id;
                const userHasVoted = slot.votes.includes('You / Producer');
                const isPinned = pinnedSlotId === slot.id;

                return (
                  <div 
                    key={slot.id} 
                    className={`p-4 border transition-all duration-300 relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isPinned 
                        ? 'bg-brand-accent/5 border-brand-accent/50 shadow-[0_0_15px_rgba(209,255,38,0.05)]' 
                        : isConsensusWinner
                          ? 'bg-white/5 border-white/20'
                          : 'bg-black/30 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {isPinned && (
                      <span className="absolute -top-2.5 right-4 bg-brand-accent text-black text-[8px] font-mono px-2 py-0.5 uppercase tracking-widest font-black">
                        📌 SECURED TARGET DATE
                      </span>
                    )}
                    {isConsensusWinner && !isPinned && (
                      <span className="absolute -top-2.5 right-4 bg-[#AC6CFF]/20 border border-[#AC6CFF]/30 text-[#AC6CFF] text-[8px] font-mono px-2 py-0.5 uppercase tracking-widest font-black">
                        🌟 TOP CONSENSUS
                      </span>
                    )}

                    {/* Date/Time Left Side */}
                    <div className="flex items-start gap-3.5">
                      <div className="p-3.5 bg-white/5 border border-white/10 text-center flex flex-col justify-center min-w-[70px]">
                        <Calendar className="w-5 h-5 mx-auto text-brand-accent" />
                        <span className="text-[9px] font-mono text-white/50 mt-1 uppercase">REHEARSE</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-tight">{slot.date}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono mt-1">
                          <Clock className="w-3.5 h-3.5 text-white/30" />
                          <span>{slot.time} (Amsterdam local)</span>
                        </div>
                        
                        {/* Participants list who voted */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          <span className="text-[9px] font-mono text-white/40 uppercase">Voted Prik:</span>
                          {slot.votes.length === 0 ? (
                            <span className="text-[10px] font-mono text-white/30 italic">No votes yet</span>
                          ) : (
                            slot.votes.map((p, pIdx) => (
                              <span 
                                key={pIdx} 
                                className={`text-[9px] px-1.5 py-0.5 font-mono uppercase font-bold border ${
                                  p.startsWith('You') 
                                    ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/30' 
                                    : 'bg-[#AC6CFF]/15 text-[#AC6CFF] border-[#AC6CFF]/30'
                                }`}
                              >
                                {p.split(' ')[0]}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side Interaction */}
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      {/* Vote Button */}
                      <button
                        onClick={() => handleToggleVote(slot.id)}
                        className={`px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider font-extrabold cursor-pointer border flex items-center gap-1.5 transition-all w-full md:w-auto justify-center ${
                          userHasVoted 
                            ? 'bg-[#D1FF26] text-black border-[#D1FF26]' 
                            : 'bg-black text-[#D1FF26] border-white/10 hover:border-brand-accent hover:bg-brand-accent/5'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{userHasVoted ? 'Prik OK!' : 'Add Prik'}</span>
                      </button>

                      {/* Select/Pin target rehearsal slot Button */}
                      <button
                        onClick={() => handleLockConsensusDate(slot)}
                        className={`px-3.5 py-2.5 font-mono text-[9px] uppercase tracking-widest font-bold border transition-all w-full md:w-auto ${
                          isPinned 
                            ? 'bg-transparent text-white/30 border-white/5 cursor-not-allowed hidden' 
                            : 'bg-white text-black border-white hover:bg-brand-accent hover:border-brand-accent'
                        }`}
                      >
                        Pin Date
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dutch Datumprikker info block */}
            <div className="bg-black/45 p-4 border border-white/5 flex gap-3 h-fit items-start">
              <Info className="w-4 h-4 text-[#AC6CFF] shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/60 leading-normal">
                <strong className="text-white">Pro Tip:</strong> Rehearsal scheduling fits standard Dutch <em className="text-brand-accent">"Datumprikker"</em> mechanics. Session artists & live sound engineers are notified instantly once a consensus date reaches maximum "Priks". You can then book and map your route to the closest rehearsal spaces inside the A10 ring below.
              </p>
            </div>
          </div>

          {/* Right Side Block: Proposed new rehearsal date & active consensus */}
          <div className="space-y-6">
            {/* Active Consesus Panel */}
            <div className="bg-[#111] border border-white/10 p-5 space-y-4">
              <div className="font-mono text-[10px] uppercase font-black tracking-widest text-[#D1FF26]">
                🗳️ POLL STATUS & CONSENSUS
              </div>

              {consensus ? (
                <div className="space-y-3.5">
                  <div className="p-3 bg-black/60 border border-white/5 text-xs">
                    <div className="text-[10px] font-mono text-white/40 uppercase">Top Voted Slot:</div>
                    <div className="font-bold text-white text-sm mt-1">{consensus.date}</div>
                    <div className="text-brand-accent font-mono text-[11px] mt-0.5">{consensus.time}</div>
                    <div className="text-[10px] text-white/50 font-mono mt-2">
                       Consensus tally: <span className="text-brand-accent font-bold font-mono">{consensus.votes.length} votes</span>
                    </div>
                  </div>

                  {/* Booking alert based on state */}
                  <div className="text-[11px] leading-relaxed text-white/70">
                    The session roster (including FOH engineer Marcin and bassist Sam) has voted this slot as the optimal time.
                  </div>

                  <button
                    onClick={() => {
                      if (consensus) handleLockConsensusDate(consensus);
                    }}
                    className="w-full py-3 bg-brand-accent hover:bg-white text-black font-black uppercase text-[10px] tracking-widest font-mono cursor-pointer transition-all border border-brand-accent hover:border-white shadow-[0_0_12px_rgba(209,255,38,0.15)]"
                  >
                    🚀 Accept & Lock Consensus
                  </button>
                </div>
              ) : (
                <p className="text-xs text-white/40 font-mono italic">No consensus reached yet.</p>
              )}
            </div>

            {/* Custom Day Proposer Form */}
            <div className="bg-black/50 border border-white/10 p-5 space-y-4">
              <div className="font-mono text-[10px] uppercase font-black tracking-widest text-white/70">
                ➕ PROPOSE ALTERNATIVE DATE
              </div>

              <form onSubmit={handleAddSlot} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Proposed Date</label>
                  <input
                    type="text"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    placeholder="e.g. Tuesday, June 02"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3 py-2 text-xs focus:border-[#D1FF26] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase mb-1">Time Range</label>
                  <input
                    type="text"
                    required
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    placeholder="e.g. 19:00 - 22:00"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3 py-2 text-xs focus:border-[#D1FF26] outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white/5 hover:bg-white border border-white/10 hover:border-black text-white hover:text-black font-extrabold text-[10px] tracking-widest font-mono uppercase cursor-pointer transition-all"
                >
                  Post Proposal
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // --- AMSTERDAM NEAREST STUDIO FINDER TAB CONTENT ---
        <div className="space-y-8 animate-fade-in">
          {/* Realtime Geo-Telemetry Control Dashboard panel */}
          <div className="bg-[#0c0c0c] border border-white/10 p-5 md:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D1FF26] animate-pulse"></span>
                  <div className="text-[10px] font-mono uppercase font-black text-brand-accent tracking-widest">
                    📡 LIVE GPS BEACON & DISTANCE TELEMETRY MATRIX
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-normal mt-1">
                  Real-time Proximity Sorting Engine
                </h3>
              </div>

              {/* HTML5 Geo Sync Action */}
              <button
                onClick={syncGps}
                disabled={gpsLoading}
                className={`px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider font-extrabold cursor-pointer border flex items-center gap-2 transition-all ${
                  gpsActive
                    ? 'bg-[#D1FF26] text-black border-[#D1FF26]'
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-[#D1FF26]'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'SENSING GPS...' : gpsActive ? '🌍 LIVE GPS BOUND' : '🛰️ CONNECT LIVE BROWSER GPS'}</span>
              </button>
            </div>

            {/* Coordinates state grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-black border border-white/5 rounded-none space-y-1">
                <span className="text-[9px] font-mono text-white/40 uppercase">ACTIVE BEACON LATITUDE</span>
                <div className="text-sm font-mono text-white font-bold tracking-wider">
                  {coords.lat.toFixed(5)}° N
                </div>
              </div>
              <div className="p-3.5 bg-black border border-white/5 rounded-none space-y-1">
                <span className="text-[9px] font-mono text-white/40 uppercase">ACTIVE BEACON LONGITUDE</span>
                <div className="text-sm font-mono text-white font-bold tracking-wider">
                  {coords.lng.toFixed(5)}° E
                </div>
              </div>
              <div className="p-3.5 bg-black border border-white/5 rounded-none space-y-1">
                <span className="text-[9px] font-mono text-white/40 uppercase">PROXIMITY ENGINE STATUS</span>
                <div className="text-xs font-mono text-[#D1FF26] uppercase font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                  <span>{gpsActive ? 'GPS OVERRIDE ONLINE' : 'SIMULATION MODE'}</span>
                </div>
              </div>
            </div>

            {gpsError && (
              <div className="bg-red-500/10 border border-red-500/35 p-3 text-[11px] font-mono text-red-400 capitalize">
                ⚠ {gpsError}
              </div>
            )}

            {/* Presets Grid */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                [ OR SIMULATE AN AMSTERDAM NEIGHBORHOOD BEACON ]
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {PRESET_BEACONS.map((b, idx) => {
                  const isSelected = !gpsActive && coords.lat === b.lat && coords.lng === b.lng;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCoords({ lat: b.lat, lng: b.lng });
                        setSelectedPresetIndex(idx);
                        setGpsActive(false);
                        setGpsError(null);
                        setSuccessMessage(`Simulated coordinate beacon moved cleanly to ${b.name}!`);
                        setTimeout(() => setSuccessMessage(null), 2500);
                      }}
                      className={`p-2 border font-mono text-[9px] text-left transition-all relative ${
                        isSelected 
                          ? 'bg-brand-accent/15 border-brand-accent text-brand-accent' 
                          : 'bg-black border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="font-bold truncate">{b.name}</div>
                      <div className="text-[8px] text-white/30 truncate mt-0.5">{b.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Informative advice if located far */}
            {getDistanceFromLatLonInKm(coords.lat, coords.lng, 52.3702, 4.8952) > 40 && (
              <div className="bg-[#AC6CFF]/10 border border-[#AC6CFF]/20 p-3 flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-[#AC6CFF] shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/60 leading-normal font-mono">
                  <strong className="text-white">Notice:</strong> Your current coordinates place you <span className="text-brand-accent font-bold">{getDistanceFromLatLonInKm(coords.lat, coords.lng, 52.3702, 4.8952).toFixed(0)} km</span> outside Amsterdam. We calculated real distances correctly! Feel free to click any Amsterdam simulation buttons above to test closest studio sorting within Amsterdam.
                </p>
              </div>
            )}
          </div>

          {/* Target Consensus Date Pinned Notification Banner */}
          {pinnedSlotId && (
            <div className="bg-black border border-brand-accent/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Active Rehearsal Hold Date</span>
                  <span className="text-white text-xs font-bold leading-normal">
                    {slots.find(s => s.id === pinnedSlotId)?.date} • {slots.find(s => s.id === pinnedSlotId)?.time}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono text-brand-accent uppercase font-bold bg-brand-accent/15 px-2 py-1 border border-brand-accent/20">
                  ⚡ Auto-Sync Active
                </span>
              </div>
            </div>
          )}

          {/* Directory Grid with real-time computed & sorted studios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {computedSpaces.map((space) => {
              const isBooked = bookedSpaceId === space.id;
              const isClose = space.distanceKm <= 3.0;
              
              return (
                <div 
                  key={space.id} 
                  className={`group relative border bg-[#0e0e0e] overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                    isBooked
                      ? 'border-brand-accent ring-2 ring-brand-accent/20'
                      : 'border-white/10 hover:border-brand-accent/40'
                  }`}
                >
                  {/* Studio Image Header */}
                  <div className="h-44 relative bg-black/60 overflow-hidden shrink-0">
                    <SafeImage 
                      src={space.imageUrl} 
                      alt={space.name} 
                      textSeed={space.name}
                      fallbackType="banner"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                    />
                    
                    <span className="absolute top-3.5 left-3.5 bg-black/75 border border-white/10 text-white font-mono text-[9px] px-2 py-0.5 uppercase">
                      ⚓ {space.district.split(' ')[0]}
                    </span>

                    <span className="absolute top-3.5 right-3.5 bg-brand-accent text-black font-mono font-black text-xs px-2.5 py-0.5">
                      €{space.hourlyRate}/Hr
                    </span>

                    {/* Proximity Pill Badges */}
                    <div className="absolute bottom-3.5 left-3.5 flex gap-1.5 flex-wrap">
                      {isClose && (
                        <span className="bg-emerald-500 text-black text-[8px] font-mono font-black px-1.5 py-0.5 uppercase tracking-widest">
                          📍 LOCAL (≤3KM)
                        </span>
                      )}
                      <span className="bg-black/85 text-white/90 text-[8px] font-mono px-1.5 py-0.5 uppercase">
                        🧭 Bearing: {space.bearing}
                      </span>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-sans font-black text-white text-lg uppercase tracking-tight leading-snug">
                          {space.name}
                        </h4>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-brand-accent font-mono font-black block">
                            {space.distanceKm} km
                          </span>
                          <span className="text-[8px] text-white/30 font-mono uppercase block">
                            away
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-white/40 font-mono uppercase mt-1">
                        📍 {space.district}
                      </div>

                      <p className="text-white/70 text-xs font-light mt-3 leading-relaxed">
                        {space.description}
                      </p>

                      {/* Featured gear items */}
                      <div className="mt-4 pt-3.5 border-t border-white/5">
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                          [ Backline & Live Sound System ]
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {space.featuredGear.map((g, idx) => (
                            <span 
                              key={idx} 
                              className="text-[9px] font-mono text-brand-accent bg-[#D1FF26]/5 border border-[#D1FF26]/15 px-1.5 py-0.5 uppercase"
                            >
                              /{g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Amenities checkboxes */}
                      <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-wrap gap-x-3 gap-y-1 items-center">
                        <span className="text-[9px] font-mono text-white/40 uppercase block font-bold">Amenities:</span>
                        {space.amenities.map((a, idx) => (
                          <span key={idx} className="text-[9px] text-white/60 font-sans flex items-center gap-0.5">
                            <span className="text-brand-accent">✓</span> {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Book Studio Spot Buttons */}
                    <div className="mt-6">
                      <button
                        onClick={() => handleBookSpace(space)}
                        className={`w-full py-3 text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isBooked
                            ? 'bg-[#D1FF26] text-black border border-[#D1FF26]'
                            : 'bg-white hover:bg-brand-accent text-black border border-white'
                        }`}
                      >
                        {isBooked ? (
                          <>
                            <Check className="w-4 h-4 text-black" />
                            <span>Rehearsal Slot Locked here!</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-4 h-4" />
                            <span>Book Space for Target Date</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
