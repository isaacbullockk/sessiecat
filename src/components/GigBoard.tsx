import React, { useState } from 'react';
import { Gig } from '../types';
import { Tag, MapPin, Calendar, Clock, DollarSign, Send, CheckCircle, Plus, Sparkles, Building, User, ShieldCheck } from 'lucide-react';

interface GigBoardProps {
  gigs: Gig[];
  onApply: (gigId: string) => void;
  onPostGig: (newGig: Omit<Gig, 'id' | 'status'>) => void;
  onOpenManifest?: () => void;
}

export function GigBoard({ gigs, onApply, onPostGig, onOpenManifest }: GigBoardProps) {
  const [instrumentFilter, setInstrumentFilter] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New gig post form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newClientType, setNewClientType] = useState<'Agency' | 'Artist'>('Agency');
  const [newLocation, setNewLocation] = useState('');
  const [newDateRange, setNewDateRange] = useState('');
  const [newPayOffer, setNewPayOffer] = useState('');
  const [newInstrument, setNewInstrument] = useState('Bass Guitar');
  const [newDesc, setNewDesc] = useState('');
  const [validationError, setValidationError] = useState('');

  const instrumentsList = ['Alle', 'Bass Guitar', 'Pedal Steel', 'Moog Synthesizer', 'Lead Vocals', 'Electric Guitar', 'Acoustic Drums', 'FOH Sound Engineer'];

  const filteredGigs = gigs.filter((gig) => {
    const matchesInstrument = instrumentFilter === 'Alle' || gig.instrumentRequired === instrumentFilter;
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gig.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gig.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesInstrument && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient || !newLocation || !newDateRange || !newPayOffer || !newDesc) {
      setValidationError('Vul alle velden gemarkeerd met een sterretje (*) in.');
      return;
    }

    setValidationError('');
    onPostGig({
      title: newTitle,
      clientName: newClient,
      clientType: newClientType,
      location: newLocation,
      dateRange: newDateRange,
      payOffer: newPayOffer,
      instrumentRequired: newInstrument,
      description: newDesc
    });

    // Reset fields
    setNewTitle('');
    setNewClient('');
    setNewLocation('');
    setNewDateRange('');
    setNewPayOffer('');
    setNewDesc('');
    setShowPostForm(false);
  };

  return (
    <div id="gig-board-container" className="space-y-6">
      {/* Gig Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] border border-white/10 p-6 rounded-xl shadow-lg">
        <div>
          <div className="text-[10px] font-mono text-[#D1FF26] uppercase tracking-widest font-black block mb-1">
            🎸 Live Aanvragen & Gigs
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-sans text-white uppercase tracking-tight flex items-center gap-2 flex-wrap">
            <span>Ik Wil Gigs /</span> <span className="text-[#D1FF26] italic">Openstaande Sessies</span>
          </h2>
          <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Direct betaalde optredens, studio-sessies en invallersklussen. Reageer direct met je profiel en word uitbetaald via Pop-CAO escrow.
          </p>
        </div>
        <button
          id="btn-post-gig-toggle"
          onClick={() => {
            setValidationError('');
            setShowPostForm(!showPostForm);
          }}
          className="bg-[#D1FF26] hover:bg-white text-black font-black text-xs tracking-wider uppercase px-5 py-3.5 rounded-lg flex items-center gap-2 transition-all self-start md:self-center cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-black" />
          {showPostForm ? 'Annuleren' : '+ Oproep / Gig Plaatsen'}
        </button>
      </div>

      {/* 100% Menselijk & Fair Practice Trust Banner */}
      <div className="bg-[#141414] border-l-4 border-l-[#D1FF26] border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D1FF26]/10 text-[#D1FF26] rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-white tracking-wide">
                100% Menselijk Muzikanten Netwerk
              </span>
              <span className="text-[9px] font-mono text-[#D1FF26] bg-black px-1.5 py-0.5 rounded border border-[#D1FF26]/40 uppercase font-bold">
                0% AI Audio
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase font-bold">
                Pop-CAO Norm
              </span>
            </div>
            <p className="text-[11px] text-white/60 font-mono mt-0.5">
              Alle sessies en gigs worden gespeeld door échte mensen tegen eerlijke tarieven. Wij trainen géén AI-modellen op jouw muziek.
            </p>
          </div>
        </div>
        {onOpenManifest && (
          <button
            onClick={onOpenManifest}
            className="text-xs font-mono font-bold text-[#D1FF26] hover:underline flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center cursor-pointer shrink-0"
          >
            Lees ons Manifest ➔
          </button>
        )}
      </div>

      {/* Post Gig form drawer inline */}
      {showPostForm && (
        <form
          onSubmit={handleSubmit}
          id="post-gig-form"
          className="bg-[#181818] border border-[#D1FF26]/30 rounded-xl p-6 space-y-4 animate-fade-in shadow-xl"
        >
          <h3 className="text-base font-black text-white border-b border-white/10 pb-3 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D1FF26]" />
            Plaats een Oproep voor een Muzikant of Gig
          </h3>

          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold">
              {validationError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Titel van de gig / productie *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="bijv. Festival Support Toetsenist"
                className="w-full bg-black/60 border border-white/15 text-white placeholder-white/30 rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Naam van Band / Zaal / Organisatie *</label>
              <input
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="bijv. Paradiso / Soundwave Group"
                className="w-full bg-black/60 border border-white/15 text-white placeholder-white/30 rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Type Opdrachtgever</label>
              <select
                value={newClientType}
                onChange={(e) => setNewClientType(e.target.value as 'Agency' | 'Artist')}
                className="w-full bg-black/60 border border-white/15 text-white rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
              >
                <option value="Agency" className="bg-neutral-950">Boekingskantoor / Zaal</option>
                <option value="Artist" className="bg-neutral-950">Band / Artiest / Producer</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Vereist Instrument *</label>
              <select
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                className="w-full bg-black/60 border border-white/15 text-white rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
              >
                {instrumentsList.slice(1).map((instrument) => (
                  <option key={instrument} value={instrument} className="bg-neutral-950">{instrument}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Gage / Vergoeding (CAO-conform) *</label>
              <input
                type="text"
                value={newPayOffer}
                onChange={(e) => setNewPayOffer(e.target.value)}
                placeholder="bijv. €450 / dag of €1.200 vast"
                className="w-full bg-black/60 border border-white/15 text-white placeholder-white/30 rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Locatie *</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="bijv. Amsterdam-Noord (NDSM Werf)"
                className="w-full bg-black/60 border border-white/15 text-white placeholder-white/30 rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Speeldatum(s) / Periode *</label>
              <input
                type="text"
                value={newDateRange}
                onChange={(e) => setNewDateRange(e.target.value)}
                placeholder="bijv. 15 juni - 18 juni 2026"
                className="w-full bg-black/60 border border-white/15 text-white placeholder-white/30 rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">Omschrijving & Details *</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              placeholder="Geef details over repetities, speelstijl, bladmuziek/akkoorden, catering en soundcheck."
              className="w-full bg-black/60 border border-white/15 text-white placeholder-white/30 rounded-lg px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="px-4 py-2.5 border border-white/20 hover:border-white text-white/60 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#D1FF26] text-black font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer shadow-md"
            >
              Plaats Oproep Nu
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <input
            id="gigs-search"
            type="text"
            placeholder="Zoek op stad, instrument, zaal of artiest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-3 text-xs focus:border-[#D1FF26] outline-none transition font-sans"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest whitespace-nowrap">Filter:</span>
          {instrumentsList.map((inst) => (
            <button
              key={inst}
              onClick={() => setInstrumentFilter(inst)}
              className={`px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wide cursor-pointer transition whitespace-nowrap border ${
                instrumentFilter === inst
                  ? 'bg-[#D1FF26] text-black font-black border-[#D1FF26]'
                  : 'bg-white/5 text-white/70 border-white/10 hover:text-white hover:border-white/30'
              }`}
            >
              {inst}
            </button>
          ))}
        </div>
      </div>

      {/* Gigs List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGigs.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-white/50 font-mono text-xs uppercase tracking-wider">Geen gigs gevonden die voldoen aan deze zoekopdracht.</p>
          </div>
        ) : (
          filteredGigs.map((gig) => (
            <div
              key={gig.id}
              id={`gig-item-${gig.id}`}
              className="bg-[#141414] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition hover:border-[#D1FF26]/50 shadow-md"
            >
              <div className="space-y-3 max-w-2xl">
                {/* Header info */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#D1FF26]/15 text-[#D1FF26] border border-[#D1FF26]/30 font-black font-mono text-[9px] px-2.5 py-1 rounded uppercase tracking-wider">
                    {gig.instrumentRequired}
                  </span>
                  
                  <span className="text-white/60 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
                    {gig.clientType === 'Agency' ? <Building className="w-3.5 h-3.5 text-white/60" /> : <User className="w-3.5 h-3.5 text-white/60" />}
                    {gig.clientName}
                  </span>
                </div>

                {/* Main Gig Details */}
                <div>
                  <h3 className="text-white font-sans font-black text-lg uppercase tracking-tight leading-snug">
                    {gig.title}
                  </h3>
                  <p className="text-white/80 text-sm mt-1 leading-relaxed">
                    {gig.description}
                  </p>
                </div>

                {/* Logistics */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/60 pt-1 font-mono uppercase">
                  <span className="flex items-center gap-1.5 leading-none">
                    <MapPin className="w-3.5 h-3.5 text-[#D1FF26]" />
                    {gig.location}
                  </span>
                  <span className="flex items-center gap-1.5 leading-none border-l border-white/15 pl-4">
                    <Calendar className="w-3.5 h-3.5 text-[#D1FF26]" />
                    {gig.dateRange}
                  </span>
                  <span className="flex items-center gap-1 text-[#D1FF26] font-black border-l border-white/15 pl-4">
                    <DollarSign className="w-3.5 h-3.5" />
                    {gig.payOffer}
                  </span>
                </div>
                
                {gig.applicants && gig.applicants.length > 0 && (
                   <div className="mt-3 text-[9px] font-mono uppercase tracking-widest text-[#D1FF26] bg-[#D1FF26]/10 border border-[#D1FF26]/20 px-2.5 py-1.5 self-start rounded">
                     {gig.applicants.length} Reactie(s) ontvangen
                   </div>
                )}
              </div>

              {/* Apply / Status Button */}
              <div className="flex items-center self-start md:self-center shrink-0">
                {gig.status === 'Applied' ? (
                  <span className="bg-[#D1FF26]/20 border border-[#D1FF26]/40 text-[#D1FF26] text-xs px-4 py-3 rounded-lg flex items-center gap-2 font-black uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 text-[#D1FF26]" />
                    Aanmelding Verstuurd
                  </span>
                ) : (
                  <button
                    id={`apply-gig-btn-${gig.id}`}
                    onClick={() => onApply(gig.id)}
                    className="w-full md:w-auto bg-[#D1FF26] hover:bg-white text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Direct Reageren ➔
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
