import React, { useState } from 'react';
import { Artist } from '../types';
import { X, Plus, Sparkles, Truck, Disc, ShieldCheck } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { SessiecatLogo } from './SessiecatLogo';

interface AddArtistFormProps {
  onClose: () => void;
  onAddArtist: (newArtist: Artist) => void;
  artistToEdit?: Artist;
}

const STOCK_BLACK_AVATARS = [
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export function AddArtistForm({ onClose, onAddArtist, artistToEdit }: AddArtistFormProps) {
  const [name, setName] = useState(artistToEdit ? artistToEdit.name : '');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(artistToEdit ? artistToEdit.avatarUrl : '');
  const [location, setLocation] = useState(artistToEdit ? artistToEdit.location : '');
  const [bio, setBio] = useState(artistToEdit ? artistToEdit.bio : '');
  const [hourlyRate, setHourlyRate] = useState(artistToEdit ? artistToEdit.hourlyRate : 60);
  const [dailyRate, setDailyRate] = useState(artistToEdit ? artistToEdit.dailyRate : 400);
  const [profileType, setProfileType] = useState<'individual'|'band'>(artistToEdit?.type || 'individual');
  const [membersCount, setMembersCount] = useState(artistToEdit?.membersCount || 1);
  
  // Tag / Select states
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(artistToEdit ? artistToEdit.instruments : []);
  const [customInstrument, setCustomInstrument] = useState('');
  const [genres, setGenres] = useState(artistToEdit ? artistToEdit.genres.join(', ') : '');
  
  // Gear and Logistics Transport
  const [gear, setGear] = useState(artistToEdit ? artistToEdit.gear || '' : '');
  const [transport, setTransport] = useState(artistToEdit ? artistToEdit.transport || 'Urban Arrow Family Cargo Bike (fits small-to-medium session rigs)' : 'Urban Arrow Family Cargo Bike (fits small-to-medium session rigs)');

  // Audio sample simulation parameters (3 Sample Clips)
  const [clip1Title, setClip1Title] = useState(artistToEdit?.audioSamples?.[0]?.title || '');
  const [clip1Duration, setClip1Duration] = useState(artistToEdit?.audioSamples?.[0]?.duration || '1:45');
  const [clip1Url, setClip1Url] = useState(artistToEdit?.audioSamples?.[0]?.audioUrl || '');
  
  const [clip2Title, setClip2Title] = useState(artistToEdit?.audioSamples?.[1]?.title || '');
  const [clip2Duration, setClip2Duration] = useState(artistToEdit?.audioSamples?.[1]?.duration || '2:10');
  const [clip2Url, setClip2Url] = useState(artistToEdit?.audioSamples?.[1]?.audioUrl || '');

  const [clip3Title, setClip3Title] = useState(artistToEdit?.audioSamples?.[2]?.title || '');
  const [clip3Duration, setClip3Duration] = useState(artistToEdit?.audioSamples?.[2]?.duration || '1:30');
  const [clip3Url, setClip3Url] = useState(artistToEdit?.audioSamples?.[2]?.audioUrl || '');

  const [videoTitle, setVideoTitle] = useState(artistToEdit?.videoSamples?.[0]?.title || '');
  const [videoUrl, setVideoUrl] = useState(artistToEdit?.videoSamples?.[0]?.videoUrl || '');
  const [videoDuration, setVideoDuration] = useState(artistToEdit?.videoSamples?.[0]?.duration || '3:00');

  // Social Links
  const [instagram, setInstagram] = useState(artistToEdit?.socialLinks?.instagram || '');
  const [youtube, setYoutube] = useState(artistToEdit?.socialLinks?.youtube || '');
  const [spotify, setSpotify] = useState(artistToEdit?.socialLinks?.spotify || '');
  const [website, setWebsite] = useState(artistToEdit?.socialLinks?.website || '');

  const [validationError, setValidationError] = useState('');
  
  // AI Profile Assistant states
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiRawInput, setAiRawInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  const handleAiAutoFill = async () => {
    if (!aiRawInput.trim()) return;
    setIsAiLoading(true);
    setValidationError('');
    setAiSuccessMsg('');
    try {
      const token = localStorage.getItem("sessiecat_id_token");
      const response = await fetch('/api/gemini/profile-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text: aiRawInput })
      });
      if (!response.ok) {
        throw new Error('Could not contact Gemini AI service.');
      }
      const data = await response.json();
      
      if (data.name) setName(data.name);
      if (data.location) setLocation(data.location);
      if (data.type) setProfileType(data.type === 'band' ? 'band' : 'individual');
      if (data.membersCount) setMembersCount(data.membersCount);
      if (data.instruments && Array.isArray(data.instruments)) {
        setSelectedInstruments(data.instruments);
      }
      if (data.genres && Array.isArray(data.genres)) {
        setGenres(data.genres.join(', '));
      }
      if (data.hourlyRate) setHourlyRate(data.hourlyRate);
      if (data.dailyRate) setDailyRate(data.dailyRate);
      if (data.gear) setGear(data.gear);
      if (data.transport) setTransport(data.transport);
      if (data.bio) setBio(data.bio);
      if (data.socialLinks) {
        if (data.socialLinks.instagram) setInstagram(data.socialLinks.instagram);
        if (data.socialLinks.youtube) setYoutube(data.socialLinks.youtube);
        if (data.socialLinks.spotify) setSpotify(data.socialLinks.spotify);
        if (data.socialLinks.website) setWebsite(data.socialLinks.website);
      }
      
      if (data.warning) {
        setAiSuccessMsg(data.warning);
      } else {
        setAiSuccessMsg('✨ Magic Auto-Fill completed! Your profile details have been parsed and loaded.');
      }
      setIsAiDrawerOpen(false);
    } catch (err: any) {
      console.error(err);
      setValidationError('AI Auto-Fill encountered an error: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Availability / Blocked Dates
  const [unavailableStartDate, setUnavailableStartDate] = useState('');
  const [unavailableEndDate, setUnavailableEndDate] = useState('');
  const [unavailableDates, setUnavailableDates] = useState<{ start: string; end: string }[]>(artistToEdit?.unavailableDates || []);
  const [recurringUnavailableDays, setRecurringUnavailableDays] = useState<number[]>(artistToEdit?.unavailableDaysOfWeek || []);

  const PRESET_INSTRUMENTS = [
    'Bass Guitar',
    'Double Bass',
    'Electric Guitar',
    'Acoustic Guitar',
    'Pedal Steel',
    'Piano',
    'Hammond B3',
    'Trumpet',
    'Flugelhorn',
    'Lead Vocals',
    'Acoustic Drums',
    'Synthesizer',
    'FOH Sound Engineer',
    'Monitor Mix Engineer',
    'Recording Engineer',
    'Mix & Master Engineer'
  ];

  const TRANSPORT_OPTIONS = [
    'Urban Arrow Family Cargo Bike (fits small-to-medium session rigs)',
    'Bakfiets / Carrier Bicycle (fits guitars & lightweight setups)',
    'Personal Electric Tour Van (holds full drums/grand keyboard racks)',
    'OV-Fiets / Tram-Ready (compact hand-carry instruments & fly rigs)',
    'Remote Session Only (Fully equipped home studio connected via fiber)'
  ];

  const togglePresetInstrument = (inst: string) => {
    setSelectedInstruments(prev => 
      prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
    );
  };

  const handleAddCustomInstrument = () => {
    if (!customInstrument.trim()) return;
    if (!selectedInstruments.includes(customInstrument.trim())) {
      setSelectedInstruments(prev => [...prev, customInstrument.trim()]);
    }
    setCustomInstrument('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (selectedInstruments.length === 0) {
      setValidationError('Please select or write at least one instrument.');
      return;
    }

    if (!name.trim()) {
      setValidationError('Please enter your Stage or Real name.');
      return;
    }

    if (!location.trim()) {
      setValidationError('Please specify your primary location (e.g. Austin, US).');
      return;
    }

    // Split custom genres
    const genreArray = genres
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    const finalGenres = genreArray.length > 0 ? genreArray : ['Sessionist', 'Studio Artist'];
    const finalAvatar = customAvatarUrl.trim() || STOCK_BLACK_AVATARS[avatarIndex];

    const finalSamples = [
      {
        id: `mc_${Date.now()}_s1`,
        title: clip1Title.trim() || `${selectedInstruments[0] || 'Session'} Primary Take`,
        duration: clip1Duration.trim() || '1:45',
        audioUrl: clip1Url
      },
      {
        id: `mc_${Date.now()}_s2`,
        title: clip2Title.trim() || `${selectedInstruments[0] || 'Session'} Alternate Swing Take`,
        duration: clip2Duration.trim() || '2:10',
        audioUrl: clip2Url
      },
      {
        id: `mc_${Date.now()}_s3`,
        title: clip3Title.trim() || `${selectedInstruments[0] || 'Session'} Ambient / Raw Mix`,
        duration: clip3Duration.trim() || '1:30',
        audioUrl: clip3Url
      }
    ];

    const finalVideoSamples = [];
    if (videoTitle.trim() || videoUrl.trim()) {
      finalVideoSamples.push({
        id: `mc_${Date.now()}_v1`,
        title: videoTitle.trim() || `${selectedInstruments[0] || 'Session'} Showreel`,
        duration: videoDuration.trim() || '3:00',
        videoUrl: videoUrl
      });
    }

    const newArtist: Artist = {
      id: artistToEdit ? artistToEdit.id : `m_custom_${Date.now()}`,
      userId: artistToEdit ? artistToEdit.userId : undefined,
      type: profileType,
      membersCount: profileType === 'band' ? membersCount : undefined,
      name: name.trim(),
      avatarUrl: finalAvatar,
      location: location.trim(),
      instruments: selectedInstruments,
      genres: finalGenres,
      rating: artistToEdit ? artistToEdit.rating : 5.0,
      reviewCount: artistToEdit ? artistToEdit.reviewCount : 0,
      hourlyRate: Number(hourlyRate) || 60,
      dailyRate: Number(dailyRate) || 400,
      bio: bio.trim() || 'Professional multi-session artist on the Sessiecat Grid.',
      audioSample: finalSamples[0],
      audioSamples: finalSamples,
      videoSamples: finalVideoSamples,
      availability: artistToEdit ? artistToEdit.availability : 'Available',
      verified: artistToEdit ? artistToEdit.verified : false,
      tags: artistToEdit ? artistToEdit.tags : ['New Sessionist', 'Own Gear'],
      socialLinks: {
        instagram: instagram.trim() || undefined,
        youtube: youtube.trim() || undefined,
        spotify: spotify.trim() || undefined,
        website: website.trim() || undefined,
      },
      reviews: artistToEdit ? artistToEdit.reviews : [],
      gear: gear.trim() || 'Standard professional setup & direct analog boxes.',
      transport: transport,
      unavailableDates: unavailableDates,
      unavailableDaysOfWeek: recurringUnavailableDays
    };

    onAddArtist(newArtist);
  };

  return (
    <div id="add-artist-modal" className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        id="add-artist-container"
        className="w-full max-w-2xl bg-brand-bg border border-white/10 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh] my-4 rounded-none h-fit"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <SessiecatLogo size="sm" showText={false} />
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-brand-accent text-black font-black uppercase text-[9px] tracking-widest font-mono">
                  Artist Console
                </span>
                <h3 className="font-sans font-black text-lg text-white uppercase tracking-tight">
                  {artistToEdit ? 'Edit Your Profile' : 'Join Sessiecat Elite'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition p-2 hover:bg-white/5 rounded-none border border-white/10"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {validationError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[11px] leading-normal uppercase">
              ⚠️ Alert: {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {/* AI Magic Profile Assistant Card */}
            <div className="bg-gradient-to-r from-[#AC6CFF]/10 to-[#D1FF26]/10 border border-white/10 p-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#AC6CFF] animate-pulse" />
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      <span>AI Profile Assistant</span>
                      <span className="bg-[#AC6CFF]/20 text-[#AC6CFF] text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-none font-mono">
                        Beta
                      </span>
                    </h4>
                    <p className="text-[10px] text-white/40 font-mono">Paste bio or raw notes to auto-populate this entire form instantly!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
                  className="px-3.5 py-2 bg-[#AC6CFF] text-black hover:bg-white text-[10px] font-black uppercase tracking-widest rounded-none transition-all duration-300 w-full sm:w-auto text-center"
                >
                  {isAiDrawerOpen ? 'Hide AI Builder' : '✨ Launch AI Builder'}
                </button>
              </div>

              {aiSuccessMsg && (
                <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase">
                  {aiSuccessMsg}
                </div>
              )}

              {isAiDrawerOpen && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest font-bold">
                    Raw Bio, Website Text, Resume, or Rough Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={aiRawInput}
                    onChange={(e) => setAiRawInput(e.target.value)}
                    placeholder="e.g. I am Alex Rivers, a professional funk/jazz bass guitarist based in Amsterdam. I charge €65 per hour or €450 daily. I travel using my Urban Arrow Cargo bike, carry a Moog Subsequent 37 synth & Fender Jazz bass, and love experimental synth music. Instagram is @rivers_bass, web is alexrivers.com."
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-[#AC6CFF] outline-none transition"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[9px] text-white/30 font-mono leading-tight max-w-[100%] sm:max-w-[60%]">
                      💡 <span className="text-white/50">Tip:</span> Paste your existing social media bios, Linktree details, or any text to skip manual typing.
                    </div>
                    <button
                      type="button"
                      disabled={isAiLoading || !aiRawInput.trim()}
                      onClick={handleAiAutoFill}
                      className={`px-4 py-2.5 bg-[#D1FF26] text-black font-black uppercase text-[10px] tracking-widest rounded-none transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                        isAiLoading || !aiRawInput.trim()
                          ? 'opacity-40 cursor-not-allowed bg-neutral-800 text-white/50 border border-white/10'
                          : 'hover:bg-white cursor-pointer shadow-[0_0_15px_rgba(209,255,38,0.3)] border-0'
                      }`}
                    >
                      {isAiLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-black" />
                          <span>✨ Magic Auto-Fill</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Type Selection */}
            <div className="bg-white/5 border border-white/10 p-4">
              <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-3 font-bold">Registration Type *</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className={`flex flex-1 items-center gap-3 p-3 border cursor-pointer transition-all ${profileType === 'individual' ? 'border-[#AC6CFF] bg-[#AC6CFF]/10' : 'border-white/10 hover:border-white/30'}`}>
                  <input
                    type="radio"
                    name="profileType"
                    value="individual"
                    checked={profileType === 'individual'}
                    onChange={() => setProfileType('individual')}
                    className="accent-[#AC6CFF]"
                  />
                  <div>
                    <div className="text-white text-xs font-bold uppercase tracking-wider">Individual Musician</div>
                    <div className="text-white/40 text-[10px] font-mono mt-0.5">Available for solo hire or dep work</div>
                  </div>
                </label>
                <label className={`flex flex-1 items-center gap-3 p-3 border cursor-pointer transition-all ${profileType === 'band' ? 'border-[#D1FF26] bg-[#D1FF26]/10' : 'border-white/10 hover:border-white/30'}`}>
                  <input
                    type="radio"
                    name="profileType"
                    value="band"
                    checked={profileType === 'band'}
                    onChange={() => setProfileType('band')}
                    className="accent-[#D1FF26]"
                  />
                  <div>
                    <div className="text-white text-xs font-bold uppercase tracking-wider">Complete Band</div>
                    <div className="text-white/40 text-[10px] font-mono mt-0.5">Intact performing unit</div>
                  </div>
                </label>
              </div>
              
              {profileType === 'band' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">Total Members *</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    required
                    value={membersCount}
                    onChange={(e) => setMembersCount(Number(e.target.value))}
                    className="w-32 bg-black border border-white/10 text-white rounded-none px-3.5 py-2.5 text-xs focus:border-[#D1FF26] outline-none transition"
                  />
                </div>
              )}
            </div>

            {/* Stage Name & Avatars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">{profileType === 'band' ? 'Band Name *' : 'Stage or Real Name *'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={profileType === 'band' ? "e.g. The Midnight Echo" : "e.g. Alex Rivers"}
                  className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">Primary Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Amsterdam, NL"
                  className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
                />
              </div>
            </div>

            {/* Avatar Selectors */}
            <div>
              <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">Select Profile Portrait</label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {STOCK_BLACK_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarIndex(idx);
                      setCustomAvatarUrl('');
                    }}
                    className={`w-12 h-12 border transition-all ${
                      customAvatarUrl === '' && avatarIndex === idx
                        ? 'border-brand-accent scale-105 ring-2 ring-brand-accent/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <SafeImage src={url} alt={`Preset ${idx + 1}`} textSeed={`Preset ${idx + 1}`} fallbackType="avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
                
                <input
                  type="text"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="Or paste custom image URL..."
                  className="flex-1 min-w-[200px] bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-3 text-xs focus:border-brand-accent outline-none transition"
                />
                
                <label className="flex items-center justify-center gap-2 px-3 h-12 border border-white/10 hover:border-brand-accent bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-mono tracking-widest cursor-pointer transition">
                  <Plus className="w-3.5 h-3.5" /> Photo
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCustomAvatarUrl(URL.createObjectURL(file));
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Select Instruments presets */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest font-bold">
                Instruments / Skills * (Select multiple)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white/5 border border-white/10">
                {PRESET_INSTRUMENTS.map((inst) => {
                  const isSelected = selectedInstruments.includes(inst);
                  return (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => togglePresetInstrument(inst)}
                      className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-accent text-black font-extrabold border-brand-accent'
                          : 'bg-black text-white/50 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {inst}
                    </button>
                  );
                })}
              </div>
              
              {/* Add Custom Instrument Option */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInstrument}
                  onChange={(e) => setCustomInstrument(e.target.value)}
                  placeholder="Can't find your specialized instrument? Type custom here..."
                  className="flex-1 bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomInstrument();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomInstrument}
                  className="bg-white/5 border border-white/15 text-white px-4 hover:bg-white/10 text-xs font-mono uppercase tracking-widest transition-all"
                >
                  Add
                </button>
              </div>

              {selectedInstruments.length > 0 && (
                <div className="text-[10px] text-white/40 font-mono mt-1">
                  Selected: <span className="text-brand-accent font-bold">{selectedInstruments.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Rates & Styles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">Hourly Rate (EUR, Min €50) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/30 font-mono text-xs">€</span>
                  <input
                    type="number"
                    required
                    min={50}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none pl-7 pr-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">Daily Flat Rate (EUR, Min €50) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/30 font-mono text-xs">€</span>
                  <input
                    type="number"
                    required
                    min={50}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none pl-7 pr-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">Genre Tag Styles</label>
                <input
                  type="text"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="Funk, Ambient, Salsa (comma split)"
                  className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
                />
              </div>
            </div>

            {/* Availability Matrix */}
            <div className="grid grid-cols-1 gap-4 bg-white/5 border border-white/10 p-4">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#AC6CFF] font-black border-b border-white/5 pb-2">
                🗓️ Availability Matrix
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">
                  Flag Blocked Tour Dates
                </label>
                <div className="flex gap-2 items-center mb-2">
                  <input
                    type="date"
                    value={unavailableStartDate}
                    onChange={(e) => setUnavailableStartDate(e.target.value)}
                    className="bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-2 py-1 text-[10px] font-mono focus:border-brand-accent outline-none [color-scheme:dark]"
                  />
                  <span className="text-white/40 text-[10px] uppercase font-mono">to</span>
                  <input
                    type="date"
                    value={unavailableEndDate}
                    onChange={(e) => setUnavailableEndDate(e.target.value)}
                    className="bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-2 py-1 text-[10px] font-mono focus:border-brand-accent outline-none [color-scheme:dark]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if(unavailableStartDate && unavailableEndDate) {
                        setUnavailableDates(prev => [...prev, {start: unavailableStartDate, end: unavailableEndDate}]);
                        setUnavailableStartDate('');
                        setUnavailableEndDate('');
                      }
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider rounded-none"
                  >
                    Block
                  </button>
                </div>
                {unavailableDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {unavailableDates.map((dateRange, idx) => (
                      <span key={idx} className="bg-black border border-white/20 text-white/70 px-2 py-1 text-[9px] font-mono flex items-center gap-1">
                        {dateRange.start} ➝ {dateRange.end}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-400" 
                          onClick={() => setUnavailableDates(prev => prev.filter((_, i) => i !== idx))}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">
                  Recurring Unavailable Days
                </label>
                <div className="flex gap-4 flex-wrap">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                    <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurringUnavailableDays.includes(idx)}
                        onChange={(e) => {
                          if (e.target.checked) setRecurringUnavailableDays(prev => [...prev, idx]);
                          else setRecurringUnavailableDays(prev => prev.filter(d => d !== idx));
                        }}
                        className="accent-brand-accent w-3 h-3 bg-black border-white/10 rounded-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-white/70 uppercase cursor-pointer select-none">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Gear & Logistics Transport Requirements */}
            <div className="grid grid-cols-1 gap-4 bg-white/5 border border-white/10 p-4">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#AC6CFF] font-black border-b border-white/5 pb-2">
                🔒 Gear & Transport Checklist
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">
                  Instrument Gear Catalog (Amps, Rig, Pedals, Mics) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={gear}
                  onChange={(e) => setGear(e.target.value)}
                  placeholder="Detail your gigging equipment (e.g., Fender Twin Tube Amp, Deluxe Custom Boards, Audio Technica Pro mics...)"
                  className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">
                  Transport Option / Logistics Capability *
                </label>
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white font-mono uppercase text-[10px] tracking-wider px-3.5 py-3 focus:border-brand-accent outline-none rounded-none cursor-pointer"
                >
                  {TRANSPORT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audio clip simulation details (3 Clips) */}
            <div className="space-y-4 border border-white/10 bg-black/30 p-4">
              <span className="block text-[10px] font-mono text-[#D1FF26] uppercase tracking-wider font-extrabold">
                [ DEMO AUDIO TRACK PORTFOLIO (3 CLIPS REQUIRED) ]
              </span>
              
              {/* Clip 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Clip 1 Title (Primary Showcase) *</label>
                  <input
                    type="text"
                    required
                    value={clip1Title}
                    onChange={(e) => setClip1Title(e.target.value)}
                    placeholder="e.g. Fingerstyle Funk Showcase (Direct Clean)"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Clip 1 Duration *</label>
                  <input
                    type="text"
                    required
                    value={clip1Duration}
                    onChange={(e) => setClip1Duration(e.target.value)}
                    placeholder="e.g. 1:45"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Audio File</label>
                  <label className="flex items-center justify-center h-[38px] border border-white/10 hover:border-brand-accent bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-mono tracking-widest cursor-pointer transition">
                    <Plus className="w-3 h-3 mr-1" /> {clip1Url ? 'Selected' : 'Upload'}
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setClip1Url(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Clip 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Clip 2 Title (Alternate take) *</label>
                  <input
                    type="text"
                    required
                    value={clip2Title}
                    onChange={(e) => setClip2Title(e.target.value)}
                    placeholder="e.g. Upright Jazz Swing Walk (German Double Bass)"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Clip 2 Duration *</label>
                  <input
                    type="text"
                    required
                    value={clip2Duration}
                    onChange={(e) => setClip2Duration(e.target.value)}
                    placeholder="e.g. 2:10"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Audio File</label>
                  <label className="flex items-center justify-center h-[38px] border border-white/10 hover:border-brand-accent bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-mono tracking-widest cursor-pointer transition">
                    <Plus className="w-3 h-3 mr-1" /> {clip2Url ? 'Selected' : 'Upload'}
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setClip2Url(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Clip 3 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Clip 3 Title (Ambient / Raw Mic) *</label>
                  <input
                    type="text"
                    required
                    value={clip3Title}
                    onChange={(e) => setClip3Title(e.target.value)}
                    placeholder="e.g. Moog Sub37 Synthesizer Heavy Modulations"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Clip 3 Duration *</label>
                  <input
                    type="text"
                    required
                    value={clip3Duration}
                    onChange={(e) => setClip3Duration(e.target.value)}
                    placeholder="e.g. 1:30"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Audio File</label>
                  <label className="flex items-center justify-center h-[38px] border border-white/10 hover:border-brand-accent bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-mono tracking-widest cursor-pointer transition">
                    <Plus className="w-3 h-3 mr-1" /> {clip3Url ? 'Selected' : 'Upload'}
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setClip3Url(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Video clip upload */}
            <div className="space-y-4 border border-white/10 bg-black/30 p-4">
              <span className="block text-[10px] font-mono text-brand-accent uppercase tracking-wider font-extrabold mb-2">
                [ VIDEO SHOWREEL (OPTIONAL) ]
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Video Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Live at North Sea Jazz"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Duration</label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="e.g. 3:00"
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Video File</label>
                  <label className="flex items-center justify-center h-[38px] border border-white/10 hover:border-brand-accent bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-mono tracking-widest cursor-pointer transition">
                    <Plus className="w-3 h-3 mr-1" /> {videoUrl ? 'Selected' : 'Upload'}
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setVideoUrl(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4 border border-white/10 bg-black/30 p-4">
              <span className="block text-[10px] font-mono text-[#AC6CFF] uppercase tracking-wider font-extrabold mb-2">
                [ SOCIAL LINKS & PORTFOLIO (OPTIONAL) ]
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Instagram URL</label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">YouTube Channel / Video</label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Spotify Artist URL</label>
                  <input
                    type="url"
                    value={spotify}
                    onChange={(e) => setSpotify(e.target.value)}
                    placeholder="https://open.spotify.com/..."
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1 font-bold">Personal Website / Linktree</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/45 uppercase tracking-widest mb-1.5 font-bold">Artist Bio & Studio Pitch</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly pitch your session performance, sight-reading capabilities, and previous notable collaborators..."
                className="w-full bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-3.5 py-2.5 text-xs focus:border-brand-accent outline-none transition"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-tight text-left">
                <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
                <span>Your profile specs will be instantly listed in the live directory.</span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3.5 border border-white/15 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-white text-black hover:bg-brand-accent hover:border-brand-accent border border-white text-xs font-black uppercase tracking-widest rounded-none transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(172,108,255,0.15)]"
                >
                  <Plus className="w-4 h-4" />
                  {artistToEdit ? 'Save Changes' : 'List My Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
