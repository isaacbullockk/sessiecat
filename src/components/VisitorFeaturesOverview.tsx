import React, { useState } from 'react';
import {
  Sparkles,
  Music,
  Users,
  Euro,
  Briefcase,
  ShoppingBag,
  Eye,
  Globe,
  Layers,
  CheckCircle2,
  ListMusic,
  UserCheck,
  ShieldCheck,
  Navigation,
  Compass,
  Lock,
} from 'lucide-react';

type LanguageMode = 'en' | 'nl' | 'both';

export const VisitorFeaturesOverview: React.FC = () => {
  const [lang, setLang] = useState<LanguageMode>('both');

  return (
    <div className="bg-gradient-to-b from-black/80 via-[#0F0F12] to-black border border-white/10 p-6 md:p-8 rounded-none space-y-8 font-sans relative overflow-hidden shadow-2xl">
      {/* Background Accent Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#D1FF26]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#AC6CFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Language Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[#D1FF26] font-mono text-xs uppercase font-bold tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4 text-[#D1FF26] animate-pulse" />
            Visitor Overview & Feature Guide / Bezoekersgids
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Key Features & Tools in Sessiecat
          </h2>
          <p className="text-white/60 text-xs md:text-sm mt-1 max-w-2xl font-mono">
            {lang === 'nl'
              ? 'Alles wat je moet weten over het Sessiecat platform in eenvoudig Nederlands en Engels.'
              : 'Everything you need to know about the Sessiecat platform in plain English and Dutch.'}
          </p>
        </div>

        {/* Language Selector Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 border border-white/15 p-1 rounded font-mono text-xs uppercase font-bold shrink-0">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              lang === 'en'
                ? 'bg-[#D1FF26] text-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🇬🇧</span> English
          </button>
          <button
            onClick={() => setLang('nl')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              lang === 'nl'
                ? 'bg-[#D1FF26] text-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🇳🇱</span> Nederlands
          </button>
          <button
            onClick={() => setLang('both')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              lang === 'both'
                ? 'bg-[#AC6CFF] text-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🌐</span> Both / Beide
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* 1. Jam & Gig Workspace */}
        <div className="bg-white/5 border border-white/10 hover:border-[#D1FF26]/50 p-6 rounded-none space-y-4 transition-all duration-300 hover:bg-white/[0.07] group">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#D1FF26]/10 border border-[#D1FF26]/30 rounded text-[#D1FF26] group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#D1FF26] bg-[#D1FF26]/10 px-2.5 py-1 border border-[#D1FF26]/20 uppercase">
              01 • Workspace
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#D1FF26] transition-colors">
              Jam & Gig Workspace
            </h3>
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
              Jam & Optreden Workspace
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* EN */}
            {(lang === 'en' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#D1FF26] pl-3 py-0.5">
                <p className="text-white/90">
                  <strong className="text-[#D1FF26]">Roster Matching & Holds:</strong> Organizers can create jam sessions or tour dates, define required instruments (e.g., Drums, Bass, Keys, Sax), set gig rates, and send booking holds directly to available musicians.
                </p>
                <p className="text-white/90">
                  <strong className="text-[#D1FF26]">Interactive Song Flow:</strong> Attach setlists, song keys, sheet music, and Spotify/YouTube links so musicians arrive prepared.
                </p>
              </div>
            )}

            {/* NL */}
            {(lang === 'nl' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#AC6CFF] pl-3 py-0.5 text-white/80">
                <span className="text-[10px] font-mono text-[#AC6CFF] uppercase font-bold block">🇳🇱 Nederlands:</span>
                <p>
                  <strong className="text-white">Roster Matching & Reserveringen:</strong> Organisatoren kunnen jamsessies of tourdata aanmaken, benodigde instrumenten instellen (bijv. Drums, Bas, Toetsen, Sax), optreedtarieven vastleggen en direct boekingsopties sturen naar beschikbare muzikanten.
                </p>
                <p>
                  <strong className="text-white">Interactieve Song-Flow:</strong> Voeg setlists, toonsoorten, bladmuziek en Spotify/YouTube-links toe zodat muzikanten goed voorbereid opdagen.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Musician Directory & Roster Search */}
        <div className="bg-white/5 border border-white/10 hover:border-[#AC6CFF]/50 p-6 rounded-none space-y-4 transition-all duration-300 hover:bg-white/[0.07] group">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#AC6CFF]/10 border border-[#AC6CFF]/30 rounded text-[#AC6CFF] group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#AC6CFF] bg-[#AC6CFF]/10 px-2.5 py-1 border border-[#AC6CFF]/20 uppercase">
              02 • Directory
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#AC6CFF] transition-colors">
              Musician Directory & Roster Search
            </h3>
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
              Muzikantengids & Roster Zoeken
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* EN */}
            {(lang === 'en' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#AC6CFF] pl-3 py-0.5">
                <p className="text-white/90">
                  Search vetted session musicians by instrument, location, hourly/gig rates, genres, and availability status.
                </p>
                <p className="text-white/90">
                  View detailed musician cards with instrument expertise, bios, and direct messaging.
                </p>
              </div>
            )}

            {/* NL */}
            {(lang === 'nl' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#D1FF26] pl-3 py-0.5 text-white/80">
                <span className="text-[10px] font-mono text-[#D1FF26] uppercase font-bold block">🇳🇱 Nederlands:</span>
                <p>
                  Zoek geverifieerde sessiemuzikanten op instrument, locatie, uur/optreedtarieven, genres en beschikbaarheid.
                </p>
                <p>
                  Bekijk gedetailleerde muzikantenkaarten met instrumentkennis, biografieën en directe berichten.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Finance & Payroll Workspace */}
        <div className="bg-white/5 border border-white/10 hover:border-[#D1FF26]/50 p-6 rounded-none space-y-4 transition-all duration-300 hover:bg-white/[0.07] group">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#D1FF26]/10 border border-[#D1FF26]/30 rounded text-[#D1FF26] group-hover:scale-110 transition-transform">
              <Euro className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#D1FF26] bg-[#D1FF26]/10 px-2.5 py-1 border border-[#D1FF26]/20 uppercase">
              03 • Finance
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#D1FF26] transition-colors">
              Finance & Payroll Workspace
            </h3>
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
              Financiën & Uitbetalingen Workspace
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* EN */}
            {(lang === 'en' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#D1FF26] pl-3 py-0.5">
                <p className="text-white/90">
                  Track session budgets, gig deposits, individual musician payouts, and tour finances.
                </p>
                <p className="text-white/90">
                  Transparent financial summaries with escrow guarantees for band payments.
                </p>
              </div>
            )}

            {/* NL */}
            {(lang === 'nl' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#AC6CFF] pl-3 py-0.5 text-white/80">
                <span className="text-[10px] font-mono text-[#AC6CFF] uppercase font-bold block">🇳🇱 Nederlands:</span>
                <p>
                  Beheer sessiebudgetten, aanbetalingen, individuele muzikantenuitbetalingen en tourfinanciën.
                </p>
                <p>
                  Transparante financiële overzichten met escrow-garanties voor bandbetalingen.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Tour & Logistics Management */}
        <div className="bg-white/5 border border-white/10 hover:border-[#AC6CFF]/50 p-6 rounded-none space-y-4 transition-all duration-300 hover:bg-white/[0.07] group">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#AC6CFF]/10 border border-[#AC6CFF]/30 rounded text-[#AC6CFF] group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#AC6CFF] bg-[#AC6CFF]/10 px-2.5 py-1 border border-[#AC6CFF]/20 uppercase">
              04 • Logistics
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#AC6CFF] transition-colors">
              Tour & Logistics Management
            </h3>
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
              Tour & Logistiek Beheer
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* EN */}
            {(lang === 'en' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#AC6CFF] pl-3 py-0.5">
                <p className="text-white/90">
                  Manage multi-stop tour itineraries, hotel check-ins, soundcheck schedules, venue contacts, and gear requirements.
                </p>
              </div>
            )}

            {/* NL */}
            {(lang === 'nl' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#D1FF26] pl-3 py-0.5 text-white/80">
                <span className="text-[10px] font-mono text-[#D1FF26] uppercase font-bold block">🇳🇱 Nederlands:</span>
                <p>
                  Beheer tourschema's met meerdere stops, hotel check-ins, soundchecktijden, zaalcontacten en apparatuurvereisten.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Local Gear Shops & Lead Scraper */}
        <div className="bg-white/5 border border-white/10 hover:border-[#D1FF26]/50 p-6 rounded-none space-y-4 transition-all duration-300 hover:bg-white/[0.07] group">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#D1FF26]/10 border border-[#D1FF26]/30 rounded text-[#D1FF26] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#D1FF26] bg-[#D1FF26]/10 px-2.5 py-1 border border-[#D1FF26]/20 uppercase">
              05 • Discovery
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#D1FF26] transition-colors">
              Local Gear Shops & Lead Scraper
            </h3>
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
              Lokale Muziekwinkels & Lead Scraper
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* EN */}
            {(lang === 'en' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#D1FF26] pl-3 py-0.5">
                <p className="text-white/90">
                  Discover nearby music stores, rehearsal spaces, and repair shops when on tour.
                </p>
                <p className="text-white/90">
                  Find venue leads and gig opportunities across cities.
                </p>
              </div>
            )}

            {/* NL */}
            {(lang === 'nl' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#AC6CFF] pl-3 py-0.5 text-white/80">
                <span className="text-[10px] font-mono text-[#AC6CFF] uppercase font-bold block">🇳🇱 Nederlands:</span>
                <p>
                  Ontdek muziekwinkels, repetitieruimtes en reparatiewinkels in de buurt als je op tournee bent.
                </p>
                <p>
                  Vind zaalleads en optreedmogelijkheden in verschillende steden.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 6. Real-Time Visitor Traffic & Privacy (GDPR) */}
        <div className="bg-white/5 border border-white/10 hover:border-[#AC6CFF]/50 p-6 rounded-none space-y-4 transition-all duration-300 hover:bg-white/[0.07] group">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#AC6CFF]/10 border border-[#AC6CFF]/30 rounded text-[#AC6CFF] group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#AC6CFF] bg-[#AC6CFF]/10 px-2.5 py-1 border border-[#AC6CFF]/20 uppercase">
              06 • Analytics & GDPR
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#AC6CFF] transition-colors">
              Real-Time Visitor Traffic & Privacy (GDPR)
            </h3>
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
              Live Bezoekersverkeer & Privacy (AVG/GDPR)
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* EN */}
            {(lang === 'en' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#AC6CFF] pl-3 py-0.5">
                <p className="text-white/90">
                  Track live audience and organizer traffic to your session posts.
                </p>
                <p className="text-white/90">
                  Full GDPR compliance with data export, account erasure controls, and cookie preferences.
                </p>
              </div>
            )}

            {/* NL */}
            {(lang === 'nl' || lang === 'both') && (
              <div className="space-y-2 border-l-2 border-[#D1FF26] pl-3 py-0.5 text-white/80">
                <span className="text-[10px] font-mono text-[#D1FF26] uppercase font-bold block">🇳🇱 Nederlands:</span>
                <p>
                  Volg live publieks- en organisatorenverkeer naar je sessieposts.
                </p>
                <p>
                  Volledige AVG/GDPR-naleving met gegevensexport, accountverwijdering en cookievoorkeuren.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Banner */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D1FF26]" />
          <span>Sessiecat Platform Overview • Plain English & Nederlands</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-white/30">Need support?</span>
          <a href="mailto:support@sessiecat.com" className="text-[#D1FF26] hover:underline font-bold">
            support@sessiecat.com
          </a>
        </div>
      </div>
    </div>
  );
};
