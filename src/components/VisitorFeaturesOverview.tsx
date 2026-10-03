import React, { useState } from 'react';
import {
  Sparkles,
  Music,
  Users,
  Euro,
  Target,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Search,
  Radio,
  Briefcase,
  HelpCircle,
  Flame
} from 'lucide-react';

interface VisitorFeaturesOverviewProps {
  onNavigate?: (tabId: string) => void;
}

type LanguageMode = 'nl' | 'en';

export const VisitorFeaturesOverview: React.FC<VisitorFeaturesOverviewProps> = ({ onNavigate }) => {
  const [lang, setLang] = useState<LanguageMode>('nl');
  const [activeWhoTab, setActiveWhoTab] = useState<'muzikant' | 'bandleider' | 'tourmanager'>('muzikant');

  const handleAction = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    } else {
      window.location.hash = tabId;
    }
  };

  return (
    <div className="bg-gradient-to-b from-black via-[#0F0F12] to-black border border-white/10 p-5 md:p-8 rounded-2xl space-y-8 font-sans relative overflow-hidden shadow-2xl">
      {/* Background Accent Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#D1FF26]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#AC6CFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Headline & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[#D1FF26] font-mono text-xs uppercase font-extrabold tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
            {lang === 'nl' ? 'Kort & Krachtig Uitgelegd' : 'Short & Punchy Overview'}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            Wat is Sessiecat? <span className="text-2xl">🐱🎸</span>
          </h2>
          <p className="text-[#D1FF26] font-semibold text-sm md:text-base mt-1">
            {lang === 'nl'
              ? 'Geen gedoe met WhatsApp-groepjes. Geen vage afspraken. Direct de beste muzikanten op het podium.'
              : 'No WhatsApp chaos. No vague promises. The best session musicians directly on stage.'}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-black/80 border border-white/15 p-1 rounded-lg font-mono text-xs uppercase font-bold shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setLang('nl')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              lang === 'nl'
                ? 'bg-[#D1FF26] text-black shadow-md font-black'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🇳🇱</span> NL
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              lang === 'en'
                ? 'bg-[#D1FF26] text-black shadow-md font-black'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🇬🇧</span> EN
          </button>
        </div>
      </div>

      {/* ⚡ Section 1: In 3 tellen (The 3 Steps) */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest font-black">
          <Zap className="w-4 h-4 text-[#D1FF26]" />
          {lang === 'nl' ? '⚡ In 3 tellen geregeld:' : '⚡ Ready in 3 simple steps:'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stap 1 */}
          <div className="bg-white/5 border border-white/10 hover:border-[#D1FF26]/50 p-5 rounded-xl space-y-3 transition-all hover:bg-white/[0.08] group relative">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#D1FF26]">01</span>
              <div className="w-9 h-9 rounded-lg bg-[#D1FF26]/10 border border-[#D1FF26]/30 flex items-center justify-center text-[#D1FF26] group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                <span>🔍</span> {lang === 'nl' ? 'Vind je muzikant' : 'Find your musician'}
              </h3>
              <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                {lang === 'nl'
                  ? 'Drummer, bassist of blazer nodig? Filter razendsnel op genre, stad, gage en gear. Luister direct audio-clips zonder 10 WhatsApp-groepen rond te vragen.'
                  : 'Need a drummer, bassist, or brass player? Filter fast by genre, city, rate, and gear. Listen to audio clips instantly without messaging 10 chat groups.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => handleAction('artists')}
                className="text-[11px] font-mono font-bold text-[#D1FF26] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {lang === 'nl' ? 'Bekijk muzikanten →' : 'Browse musicians →'}
              </button>
            </div>
          </div>

          {/* Stap 2 */}
          <div className="bg-white/5 border border-white/10 hover:border-[#AC6CFF]/50 p-5 rounded-xl space-y-3 transition-all hover:bg-white/[0.08] group relative">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#AC6CFF]">02</span>
              <div className="w-9 h-9 rounded-lg bg-[#AC6CFF]/10 border border-[#AC6CFF]/30 flex items-center justify-center text-[#AC6CFF] group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                <span>⏱️</span> {lang === 'nl' ? "Zet 'm vast (24u)" : 'Lock 24h Hold'}
              </h3>
              <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                {lang === 'nl'
                  ? "Claim een optie met een automatische 24-uurs timer. De muzikant bevestigt in 1 tik. Geen 'ik laat het je nog weten' of dubbele boekingen meer."
                  : 'Claim an option with an automatic 24-hour countdown timer. The musician confirms in 1 tap. No endless waiting or double bookings.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => handleAction('holds')}
                className="text-[11px] font-mono font-bold text-[#AC6CFF] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {lang === 'nl' ? 'Bekijk opties console →' : 'View holds console →'}
              </button>
            </div>
          </div>

          {/* Stap 3 */}
          <div className="bg-white/5 border border-white/10 hover:border-emerald-400/50 p-5 rounded-xl space-y-3 transition-all hover:bg-white/[0.08] group relative">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-emerald-400">03</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Euro className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                <span>💶</span> {lang === 'nl' ? 'Eerlijk betaald' : 'Fair Pay & Escrow'}
              </h3>
              <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                {lang === 'nl'
                  ? 'Geld staat veilig gereserveerd in escrow tot na de show. Eerlijke gages volgens de officiële Pop-CAO. Automatisch digitaal contract & factuur.'
                  : 'Funds safely held in escrow until after the performance. Fair rates aligned with official music standards. Automatic digital contract & payout.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => handleAction('contracts')}
                className="text-[11px] font-mono font-bold text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {lang === 'nl' ? 'Bekijk Pop-CAO & Escrow →' : 'View CAO & Escrow →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Section 2: De 4 Knoppen (Visual Quick-Action Map) */}
      <div className="relative z-10 bg-black/60 border border-white/10 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest font-black">
            <Target className="w-4 h-4 text-[#D1FF26]" />
            {lang === 'nl' ? '🎯 De 4 Knoppen in Sessiecat:' : '🎯 The 4 Core Buttons in Sessiecat:'}
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase">
            {lang === 'nl' ? 'Klik op een knop om te proberen' : 'Click any button to test'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleAction('artists')}
            className="p-4 bg-white/5 hover:bg-[#D1FF26] text-white hover:text-black border border-white/10 hover:border-[#D1FF26] rounded-lg text-left transition-all group cursor-pointer"
          >
            <div className="text-lg mb-1">🎸</div>
            <div className="font-bold text-xs uppercase font-mono tracking-wider group-hover:font-black">
              {lang === 'nl' ? '1. Vind Sessiecats' : '1. Find Sessiecats'}
            </div>
            <p className="text-[11px] opacity-70 group-hover:opacity-90 mt-1 leading-snug">
              {lang === 'nl' ? 'Zoek direct op instrument, genre, stad & gage.' : 'Filter by instrument, city, rate & genre.'}
            </p>
          </button>

          <button
            onClick={() => handleAction('jams')}
            className="p-4 bg-white/5 hover:bg-[#AC6CFF] text-white hover:text-black border border-white/10 hover:border-[#AC6CFF] rounded-lg text-left transition-all group cursor-pointer"
          >
            <div className="text-lg mb-1">🎪</div>
            <div className="font-bold text-xs uppercase font-mono tracking-wider group-hover:font-black">
              {lang === 'nl' ? '2. Bekijk Gigs' : '2. View Gigs'}
            </div>
            <p className="text-[11px] opacity-70 group-hover:opacity-90 mt-1 leading-snug">
              {lang === 'nl' ? 'Zie welke bands & zalen muzikanten zoeken.' : 'See which bands & venues need players.'}
            </p>
          </button>

          <button
            onClick={() => handleAction('holds')}
            className="p-4 bg-white/5 hover:bg-amber-400 text-white hover:text-black border border-white/10 hover:border-amber-400 rounded-lg text-left transition-all group cursor-pointer"
          >
            <div className="text-lg mb-1">⏱️</div>
            <div className="font-bold text-xs uppercase font-mono tracking-wider group-hover:font-black">
              {lang === 'nl' ? '3. Zet Optie Vast' : '3. Lock 24h Hold'}
            </div>
            <p className="text-[11px] opacity-70 group-hover:opacity-90 mt-1 leading-snug">
              {lang === 'nl' ? '24-uurs hold timer. Geen vage afspraken.' : '24-hour hold timer. Zero ambiguity.'}
            </p>
          </button>

          <button
            onClick={() => handleAction('contracts')}
            className="p-4 bg-white/5 hover:bg-emerald-400 text-white hover:text-black border border-white/10 hover:border-emerald-400 rounded-lg text-left transition-all group cursor-pointer"
          >
            <div className="text-lg mb-1">🛡️</div>
            <div className="font-bold text-xs uppercase font-mono tracking-wider group-hover:font-black">
              {lang === 'nl' ? '4. Veilig Betalen' : '4. Secure Escrow'}
            </div>
            <p className="text-[11px] opacity-70 group-hover:opacity-90 mt-1 leading-snug">
              {lang === 'nl' ? 'Escrow borgsom. Direct uitbetaald na afloop.' : 'Escrow guarantee. Released after show.'}
            </p>
          </button>
        </div>
      </div>

      {/* 👥 Section 3: Voor wie? (Audience Tabs) */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest font-black">
          <Users className="w-4 h-4 text-[#D1FF26]" />
          {lang === 'nl' ? '👥 Voor wie is Sessiecat?' : '👥 Who is Sessiecat for?'}
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveWhoTab('muzikant')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono uppercase font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeWhoTab === 'muzikant'
                ? 'bg-[#D1FF26] text-black shadow-md font-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>🎸</span> {lang === 'nl' ? 'Muzikanten & Sessiekrachten' : 'Session Musicians'}
          </button>
          <button
            onClick={() => setActiveWhoTab('bandleider')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono uppercase font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeWhoTab === 'bandleider'
                ? 'bg-[#AC6CFF] text-black shadow-md font-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>🎹</span> {lang === 'nl' ? 'Bandleiders & MD’s' : 'Bandleaders & MDs'}
          </button>
          <button
            onClick={() => setActiveWhoTab('tourmanager')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono uppercase font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeWhoTab === 'tourmanager'
                ? 'bg-amber-400 text-black shadow-md font-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>🚐</span> {lang === 'nl' ? 'Tourmanagers & Zalen' : 'Tour Managers & Venues'}
          </button>
        </div>

        {/* Dynamic Card Content */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
          {activeWhoTab === 'muzikant' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-[#D1FF26] font-mono text-xs uppercase font-black">
                <span>🎸</span> {lang === 'nl' ? 'Voor de professionele muzikant:' : 'For the professional musician:'}
              </div>
              <h3 className="text-xl font-black text-white">
                {lang === 'nl'
                  ? 'Nooit meer gratis je agenda blokkeren voor vage plannen.'
                  : 'Never block your calendar for vague plans again.'}
              </h3>
              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D1FF26] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Duidelijke gages op basis van jouw tariefkaart en de officiële Pop-CAO.'
                      : 'Clear rates based on your rate card and official live music guidelines.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D1FF26] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? '24-uurs opties: als een boeker je vraagt, staat je datum max 24 uur vast. Geen weken wachten.'
                      : '24-hour holds: bookers have 24 hours to confirm. No weeks of uncertainty.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D1FF26] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Gegarandeerd geld: de boeker stort vooraf in escrow, jij krijgt automatisch uitbetaald na de show.'
                      : 'Guaranteed pay: the booker deposits funds up front, automatically released after the show.'}
                  </span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => handleAction('artists')}
                  className="px-4 py-2 bg-[#D1FF26] text-black text-xs font-mono font-black uppercase tracking-wider rounded cursor-pointer hover:bg-white transition-colors"
                >
                  {lang === 'nl' ? 'Meld je aan als Sessiecat ➔' : 'Join as Sessiecat ➔'}
                </button>
              </div>
            </div>
          )}

          {activeWhoTab === 'bandleider' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-[#AC6CFF] font-mono text-xs uppercase font-black">
                <span>🎹</span> {lang === 'nl' ? 'Voor bandleiders & muzikaal leiders (MD):' : 'For bandleaders & musical directors:'}
              </div>
              <h3 className="text-xl font-black text-white">
                {lang === 'nl'
                  ? 'Binnen 5 minuten een complete ritmesectie geregeld.'
                  : 'Assemble a complete rhythm section in 5 minutes.'}
              </h3>
              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#AC6CFF] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Geen 15 telefoontjes meer: selecteer bas, drums en toetsen en stuur 1 gecoördineerde hold.'
                      : 'No more 15 back-and-forth calls: select bass, drums and keys and send 1 coordinated hold.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#AC6CFF] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Direct audio-samples, toonsoorten, repetitie-schema’s en setlists delen in één dashboard.'
                      : 'Share audio samples, keys, rehearsal charts, and setlists right inside one dashboard.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#AC6CFF] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Automatische reservelijst (dep): zegt er iemand af? De backup schuift direct door.'
                      : 'Automated backup bench (dep): someone cancels? The next qualified player slots in.'}
                  </span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => handleAction('tours')}
                  className="px-4 py-2 bg-[#AC6CFF] text-black text-xs font-mono font-black uppercase tracking-wider rounded cursor-pointer hover:bg-white transition-colors"
                >
                  {lang === 'nl' ? 'Start een Tour / Productie ➔' : 'Start Tour / Production ➔'}
                </button>
              </div>
            </div>
          )}

          {activeWhoTab === 'tourmanager' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-black">
                <span>🚐</span> {lang === 'nl' ? 'Voor tourmanagers, producenten & zalen:' : 'For tour managers, producers & venues:'}
              </div>
              <h3 className="text-xl font-black text-white">
                {lang === 'nl'
                  ? 'Noodgeval op tourdag? Binnen 3 klikken een ervaren vervanger op locatie.'
                  : 'Showday emergency? Professional dep on site within 3 clicks.'}
              </h3>
              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Zoek op locatie: vind direct een vervangende blazer of drummer in Groningen, Utrecht of Amsterdam.'
                      : 'Location search: instantly find a replacement horn or drum player in any city.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Volledig transparante facturatie en CAO-naleving. Geen juridische of fiscale verrassingen.'
                      : 'Transparent invoicing and union compliance. Zero legal or tax headaches.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'nl'
                      ? 'Live GPS Transit: zie precies wanneer je ingevlogen sessiekracht arriveert bij de venue.'
                      : 'Live GPS Transit: see exactly when your hired musician arrives at soundcheck.'}
                  </span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => handleAction('jams')}
                  className="px-4 py-2 bg-amber-400 text-black text-xs font-mono font-black uppercase tracking-wider rounded cursor-pointer hover:bg-white transition-colors"
                >
                  {lang === 'nl' ? 'Plaats een Oproep / Gig ➔' : 'Post a Gig / Call ➔'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 💡 Bottom Callout Banner */}
      <div className="relative z-10 bg-[#D1FF26] text-black p-4 md:p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest font-black bg-black text-[#D1FF26] px-2 py-0.5 inline-block rounded">
            {lang === 'nl' ? 'In 1 Zin Samengevat' : 'The One-Liner'}
          </div>
          <h4 className="text-base md:text-lg font-black tracking-tight">
            {lang === 'nl'
              ? 'Zalen boeken de act. Sessiecat regelt de band.'
              : 'Venues book the act. Sessiecat books the band.'}
          </h4>
        </div>

        <button
          onClick={() => handleAction('artists')}
          className="bg-black hover:bg-neutral-900 text-[#D1FF26] font-mono text-xs font-black uppercase tracking-widest px-5 py-3 rounded-lg flex items-center gap-2 cursor-pointer transition-all shrink-0 shadow-lg"
        >
          <span>{lang === 'nl' ? 'Direct Muzikanten Zoeken' : 'Browse Musicians Now'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
