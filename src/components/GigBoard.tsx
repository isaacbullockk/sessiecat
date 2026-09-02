import React, { useState } from 'react';
import { Gig } from '../types';
import { Tag, MapPin, Calendar, Clock, DollarSign, Send, CheckCircle, Plus, Sparkles, Building, User } from 'lucide-react';

interface GigBoardProps {
  gigs: Gig[];
  onApply: (gigId: string) => void;
  onPostGig: (newGig: Omit<Gig, 'id' | 'status'>) => void;
}

export function GigBoard({ gigs, onApply, onPostGig }: GigBoardProps) {
  const [instrumentFilter, setInstrumentFilter] = useState('All');
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

  const instrumentsList = ['All', 'Bass Guitar', 'Pedal Steel', 'Moog Synthesizer', 'Lead Vocals', 'Electric Guitar', 'Acoustic Drums'];

  const filteredGigs = gigs.filter((gig) => {
    const matchesInstrument = instrumentFilter === 'All' || gig.instrumentRequired === instrumentFilter;
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gig.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gig.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesInstrument && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient || !newLocation || !newDateRange || !newPayOffer || !newDesc) {
      setValidationError('Please fill out all fields marked with an asterisk (*).');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-none">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-sans text-white uppercase tracking-tight flex items-center gap-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-brand-accent shrink-0" />
            <span>Active Session</span> <span className="text-brand-accent italic">Opportunities</span>
          </h2>
          <p className="text-white/60 text-sm mt-2">
            Browse available gigs posted by traveling artists & local agencies. Apply instantly to secure session slots.
          </p>
        </div>
        <button
          id="btn-post-gig-toggle"
          onClick={() => {
            setValidationError('');
            setShowPostForm(!showPostForm);
          }}
          className="bg-white hover:bg-brand-accent text-black hover:border-brand-accent border border-white font-extrabold text-xs tracking-wider uppercase px-4 py-3 rounded-none flex items-center gap-2 transition-all self-start md:self-center"
        >
          <Plus className="w-4 h-4 text-neutral-950" />
          {showPostForm ? 'Cancel Post' : 'Post Session Need'}
        </button>
      </div>

      {/* Post Gig form drawer inline */}
      {showPostForm && (
        <form
          onSubmit={handleSubmit}
          id="post-gig-form"
          className="bg-white/5 border border-white/25 rounded-none p-6 space-y-4 animate-fade-in"
        >
          <h3 className="text-lg font-extrabold text-white border-b border-white/10 pb-2 uppercase tracking-wide">
            Post a Session Gig / Project Inquiry
          </h3>

          {validationError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-none text-xs font-semibold">
              {validationError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Gig Project Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Festival Support Synthesizer"
                className="w-full bg-black/45 border border-white/10 text-white placeholder-white/20 rounded-none px-3 py-2 text-sm focus:border-brand-accent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Your Band / Agency Name *</label>
              <input
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="e.g. Soundwave Group"
                className="w-full bg-black/45 border border-white/10 text-white placeholder-white/20 rounded-none px-3 py-2 text-sm focus:border-brand-accent outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Client Category</label>
              <select
                value={newClientType}
                onChange={(e) => setNewClientType(e.target.value as 'Agency' | 'Artist')}
                className="w-full bg-black/45 border border-white/10 text-white rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              >
                <option value="Agency" className="bg-neutral-950">Agency / Recording Studio</option>
                <option value="Artist" className="bg-neutral-950">Traveling Solo Artist / Band</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Required Instrument *</label>
              <select
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                className="w-full bg-black/45 border border-white/10 text-white rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              >
                {instrumentsList.slice(1).map((instrument) => (
                  <option key={instrument} value={instrument} className="bg-neutral-950">{instrument}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Pay Offer (Flat or Daily) *</label>
              <input
                type="text"
                value={newPayOffer}
                onChange={(e) => setNewPayOffer(e.target.value)}
                placeholder="e.g. €450 / Day or €1,200 Flat"
                className="w-full bg-black/45 border border-white/10 text-white placeholder-white/20 rounded-none px-3 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Gig Location *</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Amsterdam-Centrum (Jordaan Studio)"
                className="w-full bg-black/45 border border-white/10 text-white placeholder-white/20 rounded-none px-3 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Date Range *</label>
              <input
                type="text"
                value={newDateRange}
                onChange={(e) => setNewDateRange(e.target.value)}
                placeholder="e.g. June 15 - June 18, 2026"
                className="w-full bg-black/45 border border-white/10 text-white placeholder-white/20 rounded-none px-3 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Detailed Description & Specs *</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              placeholder="Provide context regarding charts to read, recording style requirements, touring load-ins, or physical location dynamics."
              className="w-full bg-black/45 border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="px-4 py-2.5 border border-white/20 hover:border-white text-white/60 hover:text-white rounded-none text-xs font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-accent text-black font-extrabold text-xs uppercase tracking-wider rounded-none transition"
            >
              Post Gig Now
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
            placeholder="Search gigs, clients, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-none px-4 py-3.5 text-xs focus:border-brand-accent outline-none transition-all font-sans"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest whitespace-nowrap">Filter:</span>
          {instrumentsList.map((inst) => (
            <button
              key={inst}
              onClick={() => setInstrumentFilter(inst)}
              className={`px-3 py-2 rounded-none text-[10px] font-mono uppercase tracking-wide cursor-pointer transition-all whitespace-nowrap border ${
                instrumentFilter === inst
                  ? 'bg-brand-accent text-black font-extrabold border-brand-accent'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:border-white/30'
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
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-none">
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider">No active opportunities match your filters or search term.</p>
          </div>
        ) : (
          filteredGigs.map((gig) => (
            <div
              key={gig.id}
              id={`gig-item-${gig.id}`}
              className="bg-white/5 border border-white/10 rounded-none p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-brand-accent/40"
            >
              <div className="space-y-3 max-w-2xl">
                {/* Header info */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-brand-accent/10 text-brand-accent border border-brand-accent/20 font-bold font-mono text-[9px] px-2.5 py-1 rounded-none uppercase tracking-wider">
                    {gig.instrumentRequired}
                  </span>
                  
                  <span className="text-white/40 flex items-center gap-1 text-xs font-mono uppercase tracking-wider">
                    {gig.clientType === 'Agency' ? <Building className="w-3.5 h-3.5 text-white/50" /> : <User className="w-3.5 h-3.5 text-white/50" />}
                    {gig.clientName}
                  </span>
                </div>

                {/* Main Gig Details */}
                <div>
                  <h3 className="text-white font-sans font-extrabold text-lg uppercase tracking-tight leading-snug">
                    {gig.title}
                  </h3>
                  <p className="text-white/75 text-sm mt-1 leading-relaxed">
                    {gig.description}
                  </p>
                </div>

                {/* Logistics */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/50 pt-1 font-mono uppercase">
                  <span className="flex items-center gap-1.5 leading-none">
                    <MapPin className="w-3.5 h-3.5 text-brand-accent" />
                    {gig.location}
                  </span>
                  <span className="flex items-center gap-1.5 leading-none border-l border-white/10 pl-4">
                    <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                    {gig.dateRange}
                  </span>
                  <span className="flex items-center gap-1 text-brand-accent font-black border-l border-white/10 pl-4">
                    <DollarSign className="w-3.5 h-3.5" />
                    {gig.payOffer}
                  </span>
                </div>
                
                {gig.applicants && gig.applicants.length > 0 && (
                   <div className="mt-3 text-[9px] font-mono uppercase tracking-widest text-[#D1FF26] bg-[#D1FF26]/5 border border-[#D1FF26]/20 px-2 py-1.5 self-start">
                     {gig.applicants.length} Applicant(s): {gig.applicants.filter(Boolean).join(', ')}
                   </div>
                )}
              </div>

              {/* Apply / Status Button */}
              <div className="flex items-center self-start md:self-center">
                {gig.status === 'Applied' ? (
                  <span className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs px-4 py-2.5 rounded-none flex items-center gap-2 font-bold uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" />
                    In Review
                  </span>
                ) : (
                  <button
                    id={`apply-gig-btn-${gig.id}`}
                    onClick={() => onApply(gig.id)}
                    className="w-full md:w-auto bg-[#0A0A0A] border border-white hover:border-brand-accent hover:bg-brand-accent hover:text-black text-white text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Express Interest
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
