import React, { useState } from 'react';
import { Artist, Booking } from '../types';
import { Calendar, X, DollarSign, Calculator, MapPin, Layers, Music, Lock } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface BookingLauncherProps {
  artist: Artist;
  onClose: () => void;
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'status' | 'dateCreated'>) => void;
}

export function BookingLauncher({ artist, onClose, onSubmitBooking }: BookingLauncherProps) {
  const [days, setDays] = useState(1);
  const [gigTitle, setGigTitle] = useState('');
  const [yourName, setYourName] = useState('');
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');
  const [rateType, setRateType] = useState<'Daily' | 'Hourly'>('Daily');
  const [calcHours, setCalcHours] = useState(4);
  const [validationError, setValidationError] = useState('');
  const [requireEscrow, setRequireEscrow] = useState(true);

  // Idea/Intellectual property protection states
  const [ideaProtectionEnabled, setIdeaProtectionEnabled] = useState(false);
  const [ideaDescription, setIdeaDescription] = useState('');

  // Custom Calendar Integration States (May & June 2026 grid arrays)
  const [currentViewMonth, setCurrentViewMonth] = useState<4 | 5>(4); // Default to May 2026
  const [selectedStart, setSelectedStart] = useState<{ day: number; month: number } | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<{ day: number; month: number } | null>(null);

  const MONTHS_DATA = [
    { name: 'May 2026', number: 4, days: 31, startOffset: 5 },
    { name: 'June 2026', number: 5, days: 30, startOffset: 1 }
  ];

  // Stable deterministic availability schedule per artist (Escrow held bookings)
  const getUnavailableDaysForArtist = (artistId: string, month: number): number[] => {
    const hash = artistId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    if (month === 4) { // May 2026
      const base = (hash % 15) + 2;
      return [base, base + 1, base + 5, base + 12].filter(d => d >= 1 && d <= 31);
    } else { // June 2026
      const base = (hash % 12) + 2;
      return [base, base + 1, base + 6, base + 10].filter(d => d >= 1 && d <= 30);
    }
  };

  const hasOverlapWithUnavailable = (start: { day: number; month: number }, end: { day: number; month: number }) => {
    const startD = new Date(2026, start.month, start.day);
    const endD = new Date(2026, end.month, end.day);
    
    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      const currentM = d.getMonth();
      const currentDay = d.getDate();
      const unavs = getUnavailableDaysForArtist(artist.id, currentM);
      if (unavs.includes(currentDay)) {
        return true;
      }
    }
    return false;
  };

  const formatDateRange = (start: { day: number; month: number } | null, end: { day: number; month: number } | null) => {
    if (!start) return '';
    const startMonthName = start.month === 4 ? 'May' : 'June';
    const paddedStartDay = start.day < 10 ? `0${start.day}` : start.day;
    if (!end) {
      return `${startMonthName} ${paddedStartDay}, 2026`;
    }
    const endMonthName = end.month === 4 ? 'May' : 'June';
    const paddedEndDay = end.day < 10 ? `0${end.day}` : end.day;
    return `${startMonthName} ${paddedStartDay} - ${endMonthName} ${paddedEndDay}, 2026`;
  };

  const getDaysArray = (month: 4 | 5) => {
    const monthInfo = MONTHS_DATA.find(m => m.number === month);
    if (!monthInfo) return [];
    
    const arr = [];
    for (let i = 0; i < monthInfo.startOffset; i++) {
      arr.push(null);
    }
    for (let i = 1; i <= monthInfo.days; i++) {
      arr.push(i);
    }
    return arr;
  };

  const handleDaySelect = (day: number) => {
    const unavs = getUnavailableDaysForArtist(artist.id, currentViewMonth);
    if (unavs.includes(day)) {
      setValidationError('Selected day is currently locked under another session escrow.');
      return;
    }

    const clickedDate = { day, month: currentViewMonth };

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(clickedDate);
      setSelectedEnd(null);
      setDates(formatDateRange(clickedDate, null));
      setDays(1);
      setValidationError('');
    } else {
      const startD = new Date(2026, selectedStart.month, selectedStart.day);
      const endD = new Date(2026, clickedDate.month, clickedDate.day);

      if (endD < startD) {
        setSelectedStart(clickedDate);
        setSelectedEnd(null);
        setDates(formatDateRange(clickedDate, null));
        setDays(1);
        setValidationError('');
      } else {
        const hasOverlap = hasOverlapWithUnavailable(selectedStart, clickedDate);
        if (hasOverlap) {
          setValidationError('Selected calendar range intersects with an existing locked escrow period!');
          return;
        }

        setSelectedEnd(clickedDate);
        const formatted = formatDateRange(selectedStart, clickedDate);
        setDates(formatted);
        
        const diffTime = Math.abs(endD.getTime() - startD.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDays(diffDays);
        setValidationError('');
      }
    }
  };

  const getDayStatus = (day: number) => {
    const unavs = getUnavailableDaysForArtist(artist.id, currentViewMonth);
    if (unavs.includes(day)) return 'unavailable';

    if (selectedStart) {
      if (!selectedEnd) {
        if (selectedStart.day === day && selectedStart.month === currentViewMonth) {
          return 'selected';
        }
      } else {
        const currentD = new Date(2026, currentViewMonth, day).getTime();
        const startD = new Date(2026, selectedStart.month, selectedStart.day).getTime();
        const endD = new Date(2026, selectedEnd.month, selectedEnd.day).getTime();
        if (currentD >= startD && currentD <= endD) {
          return 'selected';
        }
      }
    }
    return 'available';
  };

  const calculateTotal = () => {
    if (rateType === 'Daily') {
      return artist.dailyRate * days;
    }
    return artist.hourlyRate * calcHours;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gigTitle || !yourName || !location || !dates) {
       setValidationError('Please fill out all project specifications.');
      return;
    }

    setValidationError('');
    
    const codeHash = ideaProtectionEnabled
      ? 'SES-MD5-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString().slice(-4)
      : undefined;

    const payload = {
      artistId: artist.id,
      artistName: artist.name,
      artistAvatar: artist.avatarUrl,
      clientName: yourName,
      gigTitle: gigTitle,
      dateRange: dates,
      location: location,
      totalAmount: calculateTotal(),
      ideaProtectionEnabled,
      ideaDescription: ideaProtectionEnabled ? ideaDescription : undefined,
      securedIdeaHash: codeHash,
      requireEscrow,
    };

    onSubmitBooking(payload);
  };

  return (
    <div id="booking-drawer-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-end z-50">
      <div
        id="booking-drawer-content"
        className="w-full max-w-md h-full bg-brand-bg border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto animate-slide-in rounded-none"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-accent" />
              <h3 className="font-sans font-black text-lg text-white uppercase tracking-tight">Session <span className="text-brand-accent italic">Agreement Sheet</span></h3>
            </div>
            <button
              id="close-booking-drawer"
              onClick={onClose}
              className="text-white/40 hover:text-white transition p-1 hover:bg-white/5 rounded-none border border-white/10"
              title="Close Booking Sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Artist Details */}
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-none border border-white/10 mb-6 font-sans">
            <SafeImage
              src={artist.avatarUrl}
              alt={artist.name}
              textSeed={artist.name}
              fallbackType="avatar"
              className="w-12 h-12 rounded-none object-cover border border-white/15"
            />
            <div>
              <div className="text-white font-bold text-sm uppercase tracking-tight">{artist.name}</div>
              <div className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5 font-mono">
                <Music className="w-3.5 h-3.5 text-brand-accent" />
                <span>{artist.instruments.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Booking Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-none text-xs font-semibold">
                {validationError}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1">Your Artist / Agency Name *</label>
              <input
                type="text"
                required
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g. Electric Dreams Agency"
                className="w-full bg-black/65 border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1">Gig Project / Track Name *</label>
              <input
                type="text"
                required
                value={gigTitle}
                onChange={(e) => setGigTitle(e.target.value)}
                placeholder="e.g. Sax Solo Overdub or Summer Music Fest"
                className="w-full bg-black/65 border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1">Venue / Studio *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Abbey Road Studio 2"
                className="w-full bg-black/65 border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              />
            </div>

            {/* Visual Calendar Date Range Selector */}
            <div className="bg-black/40 border border-white/10 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest font-black">Select Session Dates *</label>
                  <p className="text-[10px] text-white/50 lowercase mt-0.5 font-sans">Click start & end dates on the grid below</p>
                </div>
                
                {/* Month Toggles (May / June 2026) */}
                <div className="flex bg-black border border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setCurrentViewMonth(4)}
                    className={`px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      currentViewMonth === 4 ? 'bg-brand-accent text-black font-extrabold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    May
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentViewMonth(5)}
                    className={`px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      currentViewMonth === 5 ? 'bg-brand-accent text-black font-extrabold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    June
                  </button>
                </div>
              </div>

              {/* Read-only feedback string */}
              <div className="bg-black border border-white/5 px-3 py-2 text-xs font-mono flex items-center justify-between">
                <span className="text-white/40 uppercase text-[9px] tracking-wider font-bold">Session Route:</span>
                <span className={`text-[11px] font-bold ${dates ? 'text-brand-accent' : 'text-white/20 italic'}`}>
                  {dates || 'Choose start & end days...'}
                </span>
                <input type="hidden" required value={dates} name="dates" />
              </div>

              {/* Grid Column Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-white/30 uppercase tracking-widest border-b border-white/5 pb-1">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Calendar Grid Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysArray(currentViewMonth).map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="aspect-square bg-transparent" />;
                  }

                  const status = getDayStatus(day);
                  let btnClass = '';
                  
                  if (status === 'unavailable') {
                    btnClass = 'text-white/25 bg-white/2 cursor-not-allowed line-through relative border border-transparent';
                  } else if (status === 'selected') {
                    btnClass = 'bg-[#AC6CFF] text-black font-black scale-105 shadow-[0_0_10px_rgba(172,108,255,0.4)] border-transparent z-10';
                  } else {
                    btnClass = 'bg-black border border-white/5 text-white/80 hover:border-brand-accent/50 hover:bg-white/5';
                  }

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      disabled={status === 'unavailable'}
                      onClick={() => handleDaySelect(day)}
                      title={status === 'unavailable' ? 'Currently blocked holding period' : `Select day ${day}`}
                      className={`aspect-square text-[10px] font-mono uppercase transition-all flex items-center justify-center cursor-pointer ${btnClass}`}
                    >
                      {day}
                      {status === 'unavailable' && (
                        <span className="absolute bottom-1 right-1 w-1 h-1 bg-red-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status indicators legend */}
              <div className="flex justify-between items-center text-[9px] font-mono text-white/40 pt-2 border-t border-white/5 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-black border border-white/10 inline-block" />
                  <span>Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-white/2 border border-white/5 relative inline-block text-[6px] flex items-center justify-center">
                    <span className="absolute inset-0 bg-red-500/50 w-full h-[1px] m-auto" />
                  </span>
                  <span>Escrow Hold</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#AC6CFF] inline-block" />
                  <span>Selected</span>
                </div>
              </div>
            </div>

            {/* Rate structures calculator */}
            <div className="bg-white/5 rounded-none p-4 border border-white/10 mt-2 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80 font-mono uppercase tracking-wide">Rate Structure</span>
                <div className="flex bg-black rounded-none p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setRateType('Daily')}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all rounded-none ${
                      rateType === 'Daily' ? 'bg-brand-accent text-black font-extrabold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Daily Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateType('Hourly')}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all rounded-none ${
                      rateType === 'Hourly' ? 'bg-brand-accent text-black font-extrabold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Hourly Min
                  </button>
                </div>
              </div>

              {rateType === 'Daily' ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50 font-mono uppercase text-[10px] tracking-wider">Number of Days</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={days <= 1}
                      onClick={() => setDays(days - 1)}
                      className="w-6 h-6 rounded-none bg-white/5 border border-white/15 hover:bg-white/10 text-white disabled:opacity-40 font-mono"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-white font-mono font-bold text-sm">{days}</span>
                    <button
                      type="button"
                      onClick={() => setDays(days + 1)}
                      className="w-6 h-6 rounded-none bg-white/5 border border-white/15 hover:bg-white/10 text-white font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50 font-mono uppercase text-[10px] tracking-wider">Estimated Hours</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={calcHours <= 2}
                      onClick={() => setCalcHours(calcHours - 1)}
                      className="w-6 h-6 rounded-none bg-white/5 border border-white/15 hover:bg-white/10 text-white disabled:opacity-40 font-mono"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-white font-mono font-bold text-sm">{calcHours}</span>
                    <button
                      type="button"
                      onClick={() => setCalcHours(calcHours + 1)}
                      className="w-6 h-6 rounded-none bg-white/5 border border-white/15 hover:bg-white/10 text-white font-mono"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-white/80 flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider">
                  <Calculator className="w-4 h-4 text-white/40" />
                  Calculated Gross
                </span>
                <span className="text-brand-accent font-mono font-black text-xl">
                  €{calculateTotal()}
                </span>
              </div>

              <div className="text-[10px] font-mono text-white/40 flex items-center justify-between pt-1 border-t border-white/5">
                <span>Dutch Union Floor:</span>
                {rateType === 'Daily' ? (
                  artist.dailyRate >= 320 ? (
                    <span className="text-emerald-400 font-bold">✓ Compliant (≥ €320/d)</span>
                  ) : (
                    <span className="text-amber-400 font-bold">⚠️ Below €320 Daily Standard</span>
                  )
                ) : (
                  artist.hourlyRate >= 75 ? (
                    <span className="text-emerald-400 font-bold">✓ Compliant (≥ €75/h)</span>
                  ) : (
                    <span className="text-amber-400 font-bold">⚠️ Below €75 Hourly Standard</span>
                  )
                )}
              </div>
            </div>

            {/* IP & Songwriting Idea Protection Shield */}
            <div id="idea-protection-shield-section" className="bg-[#AC6CFF]/5 border border-[#AC6CFF]/20 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="toggle-idea-protection"
                  checked={ideaProtectionEnabled}
                  onChange={(e) => setIdeaProtectionEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#AC6CFF] border-white/10 rounded-none bg-black cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="toggle-idea-protection" className="block text-[10px] font-mono text-white tracking-wider uppercase font-black cursor-pointer select-none">
                    🔒 Enable Sessiecat Idea Shield
                  </label>
                  <p className="text-[10px] text-white/50 leading-normal mt-0.5 font-sans">
                    Force session artist to sign an automated, unilateral professional NDA, and issue a cryptographic timestamp anchor for your songwriting concept before asset delivery.
                  </p>
                </div>
              </div>

              {ideaProtectionEnabled && (
                <div className="space-y-2 pt-2 border-t border-white/10 animate-fade-in">
                  <span className="block text-[9px] font-mono text-[#AC6CFF] uppercase tracking-wider font-extrabold">
                    Songwriting Seed Description (To Seal in Timestamp):
                  </span>
                  <textarea
                    rows={2}
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    placeholder="Describe chord progressions, lyrics, vocal hooks, or sonic layout (e.g., 'Alternative rock arrangement with dynamic pre-chorus shift in F# minor')..."
                    className="w-full bg-black border border-white/20 text-white placeholder-white/30 rounded-none px-3 py-2 text-xs focus:border-brand-accent outline-none"
                    required={ideaProtectionEnabled}
                  />
                  <div className="p-2.5 bg-black/60 border border-white/5 font-mono text-[9px] text-[#AC6CFF] uppercase leading-relaxed flex flex-col gap-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>✓ Platform Legal Escrow Activated</span>
                    </div>
                    <span>Upon locking escrow, {artist.name} will be prohibited from copying, adapting, or retaining the registered concept, protecting your co-writing royalties & original masters.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Optionality Toggle */}
            <div className="bg-black border border-white/5 p-3.5 space-y-3">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="toggle-escrow-requirement"
                  checked={requireEscrow}
                  onChange={(e) => setRequireEscrow(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-brand-accent border-white/10 rounded-none bg-black cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="toggle-escrow-requirement" className="block text-[10px] font-mono text-white tracking-wider uppercase font-black cursor-pointer select-none">
                    Secure payment now
                  </label>
                  <p className="text-[10px] text-white/50 leading-normal mt-0.5 font-sans">
                    Leave unchecked to just ask if they're available for these dates without paying yet.
                  </p>
                </div>
              </div>
            </div>

            {/* Application Feedback logic based on Escrow Option */}
            <div className="bg-black border border-white/5 p-3.5 text-white/40 text-[10px] font-mono leading-normal">
              {requireEscrow ? (
                <><span className="text-brand-accent font-bold uppercase tracking-wider">Secure Payment</span>: We'll hold the money safe until the job is done.</>
              ) : (
                <><span className="text-amber-400 font-bold uppercase tracking-wider">Check Availability</span>: We'll ask to save the dates, no money needed right now.</>
              )}
            </div>
            
            <button
               id="confirm-session-booking-btn"
               type="submit"
               className={`w-full ${requireEscrow ? 'bg-white hover:bg-brand-accent text-black hover:border-brand-accent border-white' : 'bg-transparent text-white border-white/40 hover:border-white hover:bg-white/5'} border font-black uppercase text-xs tracking-widest py-3.5 rounded-none flex items-center justify-center gap-2 transition-all mt-6 cursor-pointer`}
             >
               <Lock className="w-4 h-4" />
               {requireEscrow ? 'Book and Pay' : 'Send Request'}
             </button>
          </form>
        </div>

        <div className="text-center text-[10px] text-white/20 font-mono tracking-widest mt-6 border-t border-white/5 pt-4">
          SESSIECAT APPLET SYSTEM CONTRACT v2.0
        </div>
      </div>
    </div>
  );
}
