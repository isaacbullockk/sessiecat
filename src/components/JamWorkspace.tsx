import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, Clock, Euro, RefreshCw, Send, CheckCircle, AlertCircle, XCircle, Share2, MessageCircle, Cpu } from 'lucide-react';
import { JamEvent, JamSlot, Artist } from '../types';
import { db, handleFirestoreError, OperationType, auth } from '../utils/firebaseAuth';
import { doc, writeBatch, updateDoc, deleteField } from 'firebase/firestore';

export function JamWorkspace({ 
  jams, 
  setJams,
  artists,
  onFindArtists 
}: { 
  jams: JamEvent[];
  setJams: React.Dispatch<React.SetStateAction<JamEvent[]>>;
  artists: Artist[];
  onFindArtists?: (jamId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'roster' | 'create'>('roster');
  const [selectedJamId, setSelectedJamId] = useState<string | null>(null);
  const [isAutoPiloting, setIsAutoPiloting] = useState(false);

  // Form states
  const [jamTemplate, setJamTemplate] = useState<'standard' | 'mahler'>('standard');
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  
  // Mahler template specific 
  const [services, setServices] = useState('7 rehearsals + 3 concerts');
  const [runDates, setRunDates] = useState('');
  const [callTime, setCallTime] = useState('');
  const [setLength, setSetLength] = useState('');
  const [compType, setCompType] = useState<'fixed' | 'door_split' | 'unpaid'>('fixed');
  const [ratePerShow, setRatePerShow] = useState('');
  const [doorSplitDetails, setDoorSplitDetails] = useState('');
  const [perks, setPerks] = useState('');
  const [rolesNeededStr, setRolesNeededStr] = useState('');
  const [negotiationAllowed, setNegotiationAllowed] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const updateHolds = async () => {
      const now = new Date();
      for (const jam of jams) {
        if (jam.ownerId !== auth.currentUser?.uid) continue;
        
        for (const slot of jam.slots) {
          if (slot.status === 'held' && slot.holdExpiresAt && new Date(slot.holdExpiresAt) < now) {
            try {
              const slotRef = doc(db, `events/${jam.id}/slots`, slot.id);
              const expiredCount = Number((slot as any).expiredCount || 0) + 1;
              await updateDoc(slotRef, { 
                status: 'open',
                expiredCount,
                lastExpiredAt: now.toISOString(),
                heldBy: deleteField(),
                holdExpiresAt: deleteField(),
                rateLocked: deleteField(),
                offerRate: deleteField()
              });
            } catch(e) {
              console.error('Failed to auto-expire slot:', e);
            }
          }
        }
      }
    };

    const interval = setInterval(updateHolds, 10000);
    return () => clearInterval(interval);
  }, [jams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    let roles = rolesNeededStr.split(',').map(r => r.trim()).filter(Boolean);
    
    if (jamTemplate === 'mahler') {
      roles = [
        'Violin I', 'Violin I (sub)', 'Violin II', 'Viola', 
        'Cello', 'Double Bass', 'Flute (piccolo doubling)', 
        'Oboe', 'Clarinet', 'Bassoon', 'Horn', 'Trumpet', 'Timpani'
      ];
    }

    const newId = `jam_${Date.now()}`;
    const newSlots: JamSlot[] = roles.map(r => ({
      id: `slot_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      role: r,
      status: 'open'
    }));

    const newJamBase = {
      id: newId,
      ownerId: auth.currentUser?.uid || 'me',
      name,
      venue,
      city,
      date,
      callTime,
      setLength,
      compensationType: compType,
      rolesNeeded: roles,
      negotiationAllowed,
      notes,
      status: 'live',
      createdAt: new Date().toISOString(),
      templateType: jamTemplate
    };
    
    // Remove undefined fields strictly for Firebase
    const newJam = { ...newJamBase } as any;
    if (compType === 'fixed') newJam.ratePerShow = Number(ratePerShow);
    if (compType === 'door_split') newJam.doorSplitDetails = doorSplitDetails;
    if (compType === 'unpaid') newJam.perks = perks;
    if (jamTemplate === 'mahler') {
      newJam.runDates = runDates;
      newJam.servicesCount = services;
    }

    try {
      const batch = writeBatch(db);
      const eventRef = doc(db, 'events', newId);
      batch.set(eventRef, newJam);
      
      newSlots.forEach(slot => {
        const slotRef = doc(db, `events/${newId}/slots`, slot.id);
        batch.set(slotRef, {
          role: slot.role,
          status: slot.status
        });
      });
      await batch.commit();

      // UI state reset
      setName('');
      setVenue('');
      setCity('');
      setDate('');
      setCallTime('');
      setSetLength('');
      setCompType('fixed');
      setRatePerShow('');
      setDoorSplitDetails('');
      setPerks('');
      setRolesNeededStr('');
      setNotes('');
      
      setSelectedJamId(newId);
      setActiveTab('roster');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `events/${newId}`);
    }
  };

  const selectedJam = jams.find(j => j.id === selectedJamId) || jams[0];

  const handleShareWhatsApp = (jam: JamEvent) => {
    const appUrl = window.location.origin + window.location.pathname;
    const claimUrl = `${appUrl}#claim/${jam.id}`;
    
    let text = '';
    
    if (jam.templateType === 'mahler') {
      const compSummary = jam.compensationType === 'fixed' ? `€${jam.ratePerShow}/service (transparent)` : jam.compensationType === 'door_split' ? `Door split: ${jam.doorSplitDetails}` : `Unpaid (${jam.perks})`;
      text = `PRODUCTION COVERAGE — ${jam.name} — ${jam.venue} — ${jam.city}
Services: ${jam.servicesCount} (run: ${jam.runDates})
Pay: ${compSummary}
Need: ${jam.rolesNeeded.join(', ')}
Requirement: commit to full run preferred + sight-reading

Claim/confirm here: ${claimUrl}`;
    } else {
      let compSummary = '';
      if (jam.compensationType === 'fixed') compSummary = `€${jam.ratePerShow}/show`;
      if (jam.compensationType === 'door_split') compSummary = `Door split: ${jam.doorSplitDetails}`;
      if (jam.compensationType === 'unpaid') compSummary = `Unpaid (perks: ${jam.perks})`;

      text = `EVENT LINEUP — ${jam.venue} — ${jam.city} — ${jam.date}
Slots: ${jam.rolesNeeded.join(', ')}
Pay: ${compSummary}
Call: ${jam.callTime} • Set: ${jam.setLength}

Claim a slot: ${claimUrl}`;
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleReleaseHold = async (jamId: string, slotId: string) => {
    try {
      const slotRef = doc(db, `events/${jamId}/slots`, slotId);
      await updateDoc(slotRef, { 
        status: 'open',
        heldBy: deleteField(),
        holdExpiresAt: deleteField(),
        rateLocked: deleteField(),
        offerRate: deleteField()
      });
    } catch(err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${jamId}/slots/${slotId}`);
    }
  };

  const handleJamAutoPilot = async (jam: JamEvent) => {
    setIsAutoPiloting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      
      const mockTour = {
         id: jam.id,
         name: jam.name,
         description: jam.name,
         budgetShow: jam.ratePerShow || 0,
         roleRequirements: jam.slots.map(s => ({
            role: s.role,
            status: s.status === 'open' ? 'Open' : 'Confirmed',
            targetBudgetShow: jam.ratePerShow || 0
         }))
      };

      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: "Fully automate this event. Find matches for all open roles, shortlist candidates, lock 24H holds matching budget.",
          tour: mockTour,
          artists: artists,
          history: []
        })
      });

      if (!response.ok) throw new Error("Auto-Pilot failed to respond");
      const data = await response.json();
      
      let heldSlotsCount = 0;
      if (data.actions && data.actions.length > 0) {
        for (const act of data.actions) {
          if (act.intent === 'place_holds') {
            const holdsList: any[] = act.params?.holds || [];
            
            for (const h of holdsList) {
              // Find the open slot that matches this hold roughly
              const openSlot = jam.slots.find(s => s.status === 'open' && (s.role === h.role || s.role.toLowerCase().includes(h.role.toLowerCase().split(' ')[0])));
              if (openSlot) {
                const artist = artists.find(a => a.id === h.artistId);
                const slotRef = doc(db, `events/${jam.id}/slots`, openSlot.id);
                await updateDoc(slotRef, {
                  status: 'held',
                  heldByMasked: `${artist?.name?.substring(0,2) || 'St'}***`,
                  holdExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                });
                heldSlotsCount++;
              }
            }
          }
        }
      }

      alert(`🤖 Auto-Pilot Mission Complete:\n\n${data.response}\n\nProcessed ${heldSlotsCount} new holds for ${jam.name}. Roles are now blocked waiting for verification.`);
    } catch(err) {
      console.error(err);
      alert("Auto-Pilot encountered a cloud error.");
    } finally {
      setIsAutoPiloting(false);
    }
  };

  const renderRoster = (jam: JamEvent) => {
    const confirmed = jam.slots.filter(s => s.status === 'confirmed');
    const held = jam.slots.filter(s => s.status === 'held');
    const missing = jam.slots.filter(s => s.status === 'open' || s.status === 'expired' || s.status === 'declined');

    return (
      <div className="space-y-6">
        <div className="bg-neutral-900 border border-white/10 p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{jam.name}</h2>
              <p className="text-[#D1FF26] text-xs font-mono uppercase tracking-widest mt-1">
                {jam.venue} — {jam.city}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleJamAutoPilot(jam)}
                disabled={isAutoPiloting}
                className="flex items-center gap-2 text-xs font-black font-mono uppercase bg-[#AC6CFF] text-black hover:bg-white border border-[#AC6CFF] hover:border-white px-4 py-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Cpu className={`w-4 h-4 ${isAutoPiloting ? 'animate-spin' : ''}`} /> 
                {isAutoPiloting ? 'Auto-Piloting...' : 'Auto-Pilot Event'}
              </button>
              <button
                onClick={() => handleShareWhatsApp(jam)}
                className="bg-[#D1FF26] text-black hover:bg-white text-xs font-black uppercase tracking-wider px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Share
              </button>
              {onFindArtists && (
                <button
                  onClick={() => onFindArtists(jam.id)}
                  className="bg-black hover:bg-neutral-800 text-[#D1FF26] text-xs font-black border border-[#D1FF26]/30 uppercase tracking-wider px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4" />
                  Candidates
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase">
              <Calendar className="w-3.5 h-3.5" /> {jam.date}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase">
              <Clock className="w-3.5 h-3.5" /> Call: {jam.callTime}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase">
              <RefreshCw className="w-3.5 h-3.5" /> Set: {jam.setLength}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase text-brand-accent">
              <Euro className="w-3.5 h-3.5" /> 
              {jam.compensationType === 'fixed' ? `€${jam.ratePerShow} Fixed` : jam.compensationType === 'door_split' ? 'Door Split' : 'Unpaid'}
            </div>
          </div>
          <div className="text-[10px] bg-white/5 border border-white/10 px-3 py-2 font-mono text-white/50 break-all">
            Link: {window.location.origin + window.location.pathname}#claim/{jam.id}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 pb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Confirmed ({confirmed.length})
            </h3>
            {confirmed.length === 0 && <p className="text-xs text-white/30 font-mono italic">None yet</p>}
            {confirmed.map(slot => (
              <div key={slot.id} className="bg-emerald-500/5 border border-emerald-500/20 p-3">
                <div className="text-emerald-400 font-black uppercase text-sm mb-1">{slot.role}</div>
                <div className="text-white/80 font-mono text-xs">{slot.heldBy?.name || slot.heldBy?.whatsapp || 'Unknown'}</div>
                {(slot.heldBy as any)?.availability && (
                  <div className="text-[9px] font-mono mt-1 text-emerald-400 opacity-80 uppercase tracking-widest break-words bg-emerald-500/10 px-1 p-0.5 inline-block">
                    Avail: {(slot.heldBy as any)?.availability}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Held ⏳ ({held.length})
            </h3>
            {held.length === 0 && <p className="text-xs text-white/30 font-mono italic">No active holds</p>}
            {held.map(slot => {
              const expires = slot.holdExpiresAt ? new Date(slot.holdExpiresAt) : new Date();
              const mins = Math.max(0, Math.floor((expires.getTime() - Date.now()) / 60000));
              return (
                <div key={slot.id} className="bg-amber-500/5 border border-amber-500/20 p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-amber-400 font-black uppercase text-sm mb-1">{slot.role}</div>
                      <div className="text-white/80 font-mono text-xs mb-1">{slot.heldBy?.whatsapp}</div>
                      {(slot.heldBy as any)?.availability && (
                        <div className="text-[9px] font-mono mb-1 text-amber-400 opacity-80 uppercase tracking-widest break-words bg-amber-500/10 px-1 p-0.5 inline-block">
                          Avail: {(slot.heldBy as any)?.availability}
                        </div>
                      )}
                      {slot.offerRate && <div className="text-[#D1FF26] font-mono text-[10px] mb-1 font-bold">Counter: €{slot.offerRate}</div>}
                      <div className="text-amber-500/70 font-mono text-[10px] block mt-1">Expires in ~{mins}m</div>
                    </div>
                    <button 
                      onClick={() => handleReleaseHold(jam.id, slot.id)}
                      className="text-xs font-mono border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 px-2 py-1 uppercase"
                    >
                      Release
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest border-b border-rose-500/20 pb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Missing ({missing.length})
            </h3>
            {missing.length === 0 && <p className="text-xs text-white/30 font-mono italic">All filled</p>}
            {missing.map(slot => (
              <div key={slot.id} className="bg-rose-500/5 border border-rose-500/20 p-3 flex justify-between items-center">
                <div className="text-rose-400 font-black uppercase text-sm">{slot.role}</div>
                <div className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 uppercase">Open</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('roster')}
          className={`text-xs font-black uppercase tracking-widest pb-4 -mb-4 px-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'roster' ? 'border-[#D1FF26] text-[#D1FF26]' : 'border-transparent text-white/50 hover:text-white'}`}
        >
          Live Roster
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`text-xs font-black uppercase tracking-widest pb-4 -mb-4 px-2 border-b-2 transition-colors cursor-pointer flex gap-1 items-center ${activeTab === 'create' ? 'border-[#D1FF26] text-[#D1FF26]' : 'border-transparent text-white/50 hover:text-white'}`}
        >
          <Plus className="w-3.5 h-3.5" /> Create Event
        </button>
      </div>

      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className="max-w-3xl space-y-6">
          <div className="bg-neutral-900 border border-white/10 p-6 space-y-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black uppercase tracking-widest block">Event Details</h3>
              <select 
                value={jamTemplate}
                onChange={e => setJamTemplate(e.target.value as 'standard' | 'mahler')}
                className="bg-black border border-[#D1FF26]/50 p-2 text-xs font-bold font-mono text-[#D1FF26] focus:border-[#D1FF26] outline-none transition-colors uppercase tracking-widest cursor-pointer"
              >
                <option value="standard">Standard Session / Event</option>
                <option value="mahler">Classical Production (Mahler Orchestral Run)</option>
              </select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">Event Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acid Jazz Sunday Session" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">Venue</label>
                <input required value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Melkweg" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">City</label>
                <input required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Amsterdam" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
              </div>
              
              {jamTemplate === 'mahler' ? (
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase mb-1">Run Dates</label>
                  <input required value={runDates} onChange={e => setRunDates(e.target.value)} placeholder="e.g. Oct 10 - Oct 25" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase mb-1">Date</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                </div>
              )}
              
              {jamTemplate === 'mahler' ? (
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase mb-1">Total Services</label>
                  <input required value={services} onChange={e => setServices(e.target.value)} placeholder="7 rehearsals + 3 concerts" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-mono text-white/50 uppercase mb-1">Call Time</label>
                    <input type="time" required value={callTime} onChange={e => setCallTime(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 uppercase mb-1">Set Length</label>
                    <input required value={setLength} onChange={e => setSetLength(e.target.value)} placeholder="e.g. 45 mins" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-neutral-900 border border-white/10 p-6 space-y-5">
            <h3 className="text-lg font-black uppercase tracking-widest mb-4">Compensation & Roles</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-2">Compensation Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="fixed" checked={compType === 'fixed'} onChange={() => setCompType('fixed')} className="accent-[#D1FF26] bg-black" />
                    <span className="text-sm font-mono uppercase text-white/80">Fixed €</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="door_split" checked={compType === 'door_split'} onChange={() => setCompType('door_split')} className="accent-[#D1FF26] bg-black" />
                    <span className="text-sm font-mono uppercase text-white/80">Door Split</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="unpaid" checked={compType === 'unpaid'} onChange={() => setCompType('unpaid')} className="accent-[#D1FF26] bg-black" />
                    <span className="text-sm font-mono uppercase text-white/80">Unpaid / Perks</span>
                  </label>
                </div>
              </div>

              {compType === 'fixed' && (
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase mb-1">Rate Per Show (€)</label>
                  <input type="number" required value={ratePerShow} onChange={e => setRatePerShow(e.target.value)} placeholder="0" className="w-full md:w-1/2 bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={negotiationAllowed} onChange={e => setNegotiationAllowed(e.target.checked)} className="accent-[#D1FF26] bg-black" />
                    <span className="text-xs font-mono uppercase text-white/50">Allow Artists to Counter Offer</span>
                  </label>
                </div>
              )}
              {compType === 'door_split' && (
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase mb-1">Door Split Details</label>
                  <input required value={doorSplitDetails} onChange={e => setDoorSplitDetails(e.target.value)} placeholder="e.g. 70/30 after costs" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                </div>
              )}
              {compType === 'unpaid' && (
                <div>
                  <label className="block text-xs font-mono text-white/50 uppercase mb-1">Perks Offered</label>
                  <input required value={perks} onChange={e => setPerks(e.target.value)} placeholder="e.g. Free drinks, Exposure, Video" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-white/50 uppercase mb-1">Roles Needed (comma separated)</label>
                <input required value={rolesNeededStr} onChange={e => setRolesNeededStr(e.target.value)} placeholder="e.g. Drums, Bass, Trumpet" className="w-full bg-black border border-white/10 p-3 text-sm font-mono text-white focus:border-[#D1FF26] outline-none transition-colors" />
                <p className="text-[10px] text-white/40 font-mono mt-1 uppercase">Sessiecat handles 1 slot per role.</p>
              </div>
            </div>
            
            <button type="submit" className="w-full py-4 mt-6 bg-[#D1FF26] text-black font-black uppercase tracking-widest hover:bg-white transition-colors cursor-pointer">
              Launch Event Post
            </button>
          </div>
        </form>
      )}

      {activeTab === 'roster' && (
        <div className="flex gap-6 items-start">
          <div className="w-64 shrink-0 space-y-2">
            {jams.length === 0 ? (
              <div className="text-sm font-mono text-white/50 italic p-4">No active events yet.</div>
            ) : (
              jams.map(jam => (
                <button
                  key={jam.id}
                  onClick={() => setSelectedJamId(jam.id)}
                  className={`w-full text-left p-3 border cursor-pointer font-mono text-sm uppercase transition-colors
                    ${selectedJamId === jam.id 
                      ? 'border-[#D1FF26] bg-[#D1FF26]/10 text-white' 
                      : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                >
                  <div className="font-bold truncate">{jam.name}</div>
                  <div className="text-[10px] opacity-60 truncate mt-1">{jam.date} • {jam.venue}</div>
                </button>
              ))
            )}
          </div>
          <div className="flex-1">
            {selectedJam ? renderRoster(selectedJam) : (
              <div className="text-center p-12 text-white/20 font-mono uppercase border border-white/5">
                Select or create an event to view roster
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
