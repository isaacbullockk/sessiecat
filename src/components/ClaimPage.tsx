import React, { useState, useEffect } from 'react';
import { Clock, Navigation, MapPin, Calendar, Headphones, Euro, Lock, CheckCircle } from 'lucide-react';
import { JamEvent, JamSlot } from '../types';
import { db, handleFirestoreError, OperationType } from '../utils/firebaseAuth';
import { doc, getDoc, getDocs, collection, updateDoc, onSnapshot, deleteField, runTransaction, Timestamp } from 'firebase/firestore';

interface ClaimPageProps {
  jamId: string;
}

export function ClaimPage({ jamId }: ClaimPageProps) {
  const [jam, setJam] = useState<JamEvent | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [offerRate, setOfferRate] = useState('');
  const [status, setStatus] = useState<'browsing' | 'holding' | 'confirmed' | 'declined'>('browsing');
  const [heldSlot, setHeldSlot] = useState<JamSlot | null>(null);
  const [availabilityChoice, setAvailabilityChoice] = useState<'all' | 'custom'>('all');
  const [customAvailability, setCustomAvailability] = useState('');
  
  // Timer state for holds
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // Read from Firestore (using getDoc instead of onSnapshot to verify initial)
    const loadJam = async () => {
      try {
        const docRef = doc(db, 'events', jamId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const jamData = { id: snapshot.id, ...snapshot.data() } as any;
          
          const slotsSnap = await getDocs(collection(db, `events/${jamId}/slots`));
          const slotsData = slotsSnap.docs.map(s => ({ id: s.id, ...s.data() }));
          jamData.slots = slotsData;
          
          setJam(jamData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadJam();
    
    // Poll changes dynamically to stay updated with open slots
    const interval = setInterval(loadJam, 5000);
    return () => clearInterval(interval);
  }, [jamId]);

  useEffect(() => {
    if (status === 'holding' && heldSlot && heldSlot.holdExpiresAt) {
      const interval = setInterval(() => {
        const expires = new Date(heldSlot.holdExpiresAt!).getTime();
        const now = new Date().getTime();
        const m = Math.max(0, Math.floor((expires - now) / 60000));
        setTimeLeft(m);
        if (m === 0) setStatus('browsing');
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, heldSlot]);


  if (!jam) {
    return <div className="p-8 text-center font-mono text-white/50 uppercase">Loading Jam Payload...</div>;
  }

  const updateServerSlot = async (slotId: string, payload: Partial<JamSlot>) => {
    try {
      const slotRef = doc(db, `events/${jamId}/slots`, slotId);
      await updateDoc(slotRef, payload as any);
      setJam(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          slots: prev.slots.map(s => s.id === slotId ? { ...s, ...payload } : s)
        }
      });
    } catch(err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${jamId}/slots/${slotId}`);
    }
  };

  const activeSlot = jam.slots.find(s => s.id === selectedSlotId);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;

    try {
      const response = await fetch('/api/slots/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jamId,
          slotId: activeSlot.id,
          whatsapp,
          email,
          name,
          offerRate: offerRate ? Number(offerRate) : undefined,
          customAvailability: availabilityChoice === 'all' ? 'Commit to ALL services' : customAvailability
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error');
      }

      setHeldSlot({ ...activeSlot, status: 'held', heldByMasked: `${name.substring(0,2)}***` } as any);
      setStatus('holding');
    } catch (err: any) {
      alert(`Claim failed: ${err.message}`);
    }
  };

  const handleConfirm = async () => {
    if (!heldSlot) return;
    try {
      const response = await fetch('/api/slots/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jamId,
          slotId: heldSlot.id,
          action: 'confirm',
          whatsapp,
          email
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error');
      }

      setJam(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          slots: prev.slots.map(s => s.id === heldSlot.id ? { ...s, status: 'confirmed' } : s)
        }
      });
      setStatus('confirmed');
    } catch (err: any) {
      alert(`Confirm failed: ${err.message}`);
    }
  };

  const handleDecline = async () => {
    if (!heldSlot) return;
    try {
      const response = await fetch('/api/slots/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jamId,
          slotId: heldSlot.id,
          action: 'decline',
          whatsapp,
          email
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error');
      }

      setJam(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          slots: prev.slots.map(s => s.id === heldSlot.id ? { ...s, status: 'declined' } : s)
        }
      });
      setStatus('declined');
    } catch (err: any) {
      alert(`Decline failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white p-4 md:p-8 font-sans animate-fade-in flex flex-col items-center">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-black text-3xl tracking-tighter uppercase">{jam.name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-mono uppercase text-[#D1FF26]">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{jam.venue}, {jam.city}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{jam.date}</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-white/10 p-5 grid grid-cols-2 gap-4 text-xs font-mono mb-8">
          <div>
            <div className="text-white/40 uppercase mb-1">Call Time</div>
            <div className="text-lg">{jam.callTime}</div>
          </div>
          <div>
            <div className="text-white/40 uppercase mb-1">Set Length</div>
            <div className="text-lg">{jam.setLength}</div>
          </div>
          <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
            <div className="text-white/40 uppercase mb-1 text-[10px]">Compensation</div>
            {jam.compensationType === 'fixed' && (
              <div className="text-[#D1FF26] text-xl font-black font-sans uppercase">€{jam.ratePerShow} Fixed / show</div>
            )}
            {jam.compensationType === 'door_split' && (
              <div className="text-[#D1FF26] text-sm uppercase">{jam.doorSplitDetails}</div>
            )}
            {jam.compensationType === 'unpaid' && (
              <div className="text-white/80 text-sm uppercase">Unpaid — {jam.perks}</div>
            )}
          </div>
        </div>

        {status === 'browsing' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Available Slots</h2>
            
            <div className="grid gap-3">
              {jam.slots.map(slot => {
                const isOpen = slot.status === 'open' || slot.status === 'expired' || slot.status === 'declined';
                return (
                  <button
                    key={slot.id}
                    disabled={!isOpen}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full p-4 border text-left flex justify-between items-center transition-all cursor-pointer ${
                      !isOpen 
                        ? 'border-white/5 bg-black/50 opacity-50 cursor-not-allowed'
                        : selectedSlotId === slot.id
                          ? 'border-[#D1FF26] bg-[#D1FF26]/5'
                          : 'border-white/10 hover:border-white/30 bg-neutral-900'
                    }`}
                  >
                    <div className="font-black uppercase text-lg">{slot.role}</div>
                    <div className="text-[10px] font-mono uppercase px-2 py-0.5 tracking-widest bg-white/5">
                      {isOpen ? 'Select' : 'Filled/Held'}
                    </div>
                  </button>
                );
              })}
            </div>

            {activeSlot && (
              <form onSubmit={handleClaim} className="mt-8 bg-black border border-brand-accent p-5 space-y-4 animate-fade-in">
                <div className="font-mono text-xs uppercase text-brand-accent flex items-center gap-2 border-b border-brand-accent/20 pb-3">
                  <Headphones className="w-4 h-4" /> Claiming: {activeSlot.role}
                </div>
                
                <div className="space-y-3">
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Stage Name" className="w-full bg-neutral-900 border border-white/10 p-3 text-sm font-mono focus:border-brand-accent outline-none" />
                  <input required type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp Number" className="w-full bg-neutral-900 border border-white/10 p-3 text-sm font-mono focus:border-brand-accent outline-none" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-neutral-900 border border-white/10 p-3 text-sm font-mono focus:border-brand-accent outline-none" />
                  
                  {jam.negotiationAllowed && jam.compensationType === 'fixed' && (
                    <input type="number" value={offerRate} onChange={e => setOfferRate(e.target.value)} placeholder="Offer Rate (Optional)" className="w-full bg-neutral-900 border border-white/10 p-3 text-sm font-mono focus:border-brand-accent outline-none" />
                  )}

                  {/* Availability Commitment Model */}
                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-mono text-white/50 uppercase mb-3">Service Availability Commitment</label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer p-2 border border-white/5 hover:border-brand-accent/50 bg-black/40">
                        <input type="radio" value="all" checked={availabilityChoice === 'all'} onChange={() => setAvailabilityChoice('all')} className="mt-1 accent-brand-accent" />
                        <div>
                          <div className="text-sm font-black uppercase text-white">I can commit to ALL services</div>
                          <div className="text-[10px] font-mono text-emerald-400">Preferred by organizers (run: {jam.runDates || jam.date})</div>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer p-2 border border-white/5 hover:border-brand-accent/50 bg-black/40">
                        <input type="radio" value="custom" checked={availabilityChoice === 'custom'} onChange={() => setAvailabilityChoice('custom')} className="mt-1 accent-brand-accent" />
                        <div className="w-full">
                          <div className="text-sm font-black uppercase text-white mb-1">I can only do selected services</div>
                          {availabilityChoice === 'custom' && (
                            <input 
                              type="text" 
                              required={availabilityChoice === 'custom'}
                              value={customAvailability} 
                              onChange={e => setCustomAvailability(e.target.value)}
                              placeholder="e.g. Cannot do Oct 12th Rehearsal" 
                              className="w-full bg-neutral-900 border border-white/20 p-2 text-xs font-mono focus:border-brand-accent outline-none mt-1"
                            />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-brand-accent text-black font-black uppercase py-4 tracking-widest hover:bg-white transition-colors cursor-pointer mt-2">
                  Place Temporary Hold
                </button>
              </form>
            )}
          </div>
        )}

        {status === 'holding' && (
          <div className="bg-amber-500/10 border border-amber-500 p-6 text-center space-y-5 animate-fade-in">
            <Lock className="w-8 h-8 text-amber-500 mx-auto" />
            <div>
              <h2 className="text-xl font-black text-amber-500 uppercase tracking-tight">Hold Placed</h2>
              <p className="text-sm text-white/70 mt-2 font-mono">You have a temporary hold on the <span className="font-bold text-white">{heldSlot?.role}</span> slot.</p>
            </div>
            
            <div className="text-3xl font-black text-white font-mono">{timeLeft}m</div>
            <p className="text-[10px] text-amber-500/80 font-mono uppercase">Confirm your availability before the hold expires.</p>
            
            <div className="flex gap-4 pt-4 border-t border-amber-500/20">
              <button onClick={handleDecline} className="flex-1 py-3 text-xs font-mono text-white/50 hover:text-white uppercase tracking-widest border border-white/10 hover:border-white/30 transition-colors">
                Drop Hold
              </button>
              <button onClick={handleConfirm} className="flex-1 py-3 bg-amber-500 text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors">
                <CheckCircle className="w-4 h-4" /> Confirm Slot
              </button>
            </div>
          </div>
        )}

        {status === 'confirmed' && (
          <div className="bg-[#D1FF26]/10 border border-[#D1FF26] p-6 text-center space-y-4 animate-fade-in">
            <CheckCircle className="w-8 h-8 text-[#D1FF26] mx-auto" />
            <h2 className="text-xl font-black text-[#D1FF26] uppercase tracking-tight">Slot Confirmed</h2>
            <p className="text-sm text-white/70 font-mono leading-relaxed">
              You are confirmed for <span className="text-white font-bold">{heldSlot?.role}</span> at {jam.venue}.
              <br/><br/>
              The organiser has received your contact details and will reach out via WhatsApp.
            </p>
          </div>
        )}

        {status === 'declined' && (
          <div className="text-center font-mono text-white/50 uppercase p-8 border border-white/10 mt-8">
            Hold Released. You can return to browsing or close the page.
          </div>
        )}

      </div>
    </div>
  );
}
