import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  MapPin,
  MessageSquare,
  Lock,
  Globe,
  Play,
  ChevronDown
} from "lucide-react";
import { SessiecatLogo } from "./SessiecatLogo";
import { INITIAL_ARTISTS } from "../mockData";
import { VisitorFeaturesOverview } from "./VisitorFeaturesOverview";

interface LandingPortalProps {
  onGoogleLogin: () => void;
  onGuestLogin: () => void;
}

type SupportedLang = "en" | "nl" | "de" | "fr" | "es";

const LANG_LABELS: Record<SupportedLang, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇬🇧" },
  nl: { name: "Nederlands", flag: "🇳🇱" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" }
};

const LANDING_TEXTS: Record<SupportedLang, {
  badge: string;
  tagline: string;
  subheadline: string;
  accessTitle: string;
  accessDesc: string;
  signInGoogle: string;
  continueGuest: string;
  guestBadge: string;
  guideBtn: string;
  guideBtnHide: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  rosterTitle: string;
  rosterSubtitle: string;
  viewAll: string;
  calcTitle: string;
  calcSubtitle: string;
  musiciansLabel: string;
  rateLabel: string;
  hoursLabel: string;
  subtotalLabel: string;
  feeLabel: string;
  totalLabel: string;
  testHoldBtn: string;
  footerText: string;
  sslLabel: string;
  gdprLabel: string;
  hoursUnit: string;
  artistUnit: string;
}> = {
  en: {
    badge: "Live Music • Theater • Stage Productions",
    tagline: "The Operating System for Theatermakers, Tour Managers & Live Productions",
    subheadline: "From booking session musicians, actors, and stage crew to coordinating rehearsals, venue leads, NDAs, and escrow payouts — all in one connected workspace.",
    accessTitle: "Get Started",
    accessDesc: "Sign in to manage your production, or explore the free guest preview immediately.",
    signInGoogle: "Sign in with Google",
    continueGuest: "Try Guest Demo (No sign in needed)",
    guestBadge: "INSTANT",
    guideBtn: "How it works",
    guideBtnHide: "Close guide",
    feature1Title: "Cast & Crew Holds",
    feature1Desc: "Send 1-click availability requests to actors, musicians, sound engineers, and stage crew via SMS or WhatsApp.",
    feature2Title: "Protected Escrow Payouts",
    feature2Desc: "Funds are held in secure escrow until the curtain falls or show completes, protecting both producers and performers.",
    feature3Title: "Scripts, Scripts & Rehearsals",
    feature3Desc: "Share setlists, script cues, NDAs, and rehearsal schedules directly with your entire cast and crew in real time.",
    rosterTitle: "Verified Performers & Stage Talent",
    rosterSubtitle: "Browse verified session musicians, actors, sound technicians, and stage crew ready for rehearsals and shows.",
    viewAll: "Explore All Talent",
    calcTitle: "Calculate Production & Gig Costs",
    calcSubtitle: "Estimate artist fees, crew rates, and escrow deposits before booking.",
    musiciansLabel: "Cast & Crew needed:",
    rateLabel: "Hourly rate per person:",
    hoursLabel: "Show / rehearsal duration:",
    subtotalLabel: "Talent & crew fees:",
    feeLabel: "Escrow protection fee (5%):",
    totalLabel: "Total deposit:",
    testHoldBtn: "Test Booking in Demo",
    footerText: "© 2026 Sessiecat. Empowering theatermakers, producers, tour managers, and performers worldwide.",
    sslLabel: "Secure SSL Connection",
    gdprLabel: "Privacy Protected",
    hoursUnit: "Hours",
    artistUnit: "People"
  },
  nl: {
    badge: "Live Muziek • Theater • Podiumproducties",
    tagline: "Het Besturingssysteem voor Theatermakers, Tourmanagers & Podiumproducties",
    subheadline: "Van het boeken van muzikanten, acteurs en podiumcrew tot het coördineren van repetities, NDAs en escrow-betalingen — alles in één verbonden werkruimte.",
    accessTitle: "Aan de slag",
    accessDesc: "Meld je aan om je productie te beheren, of probeer direct de gratis gastdemo.",
    signInGoogle: "Inloggen met Google",
    continueGuest: "Probeer Gastdemo (Geen inlog nodig)",
    guestBadge: "DIRECT",
    guideBtn: "Hoe het werkt",
    guideBtnHide: "Sluit gids",
    feature1Title: "Cast & Crew Boekingen",
    feature1Desc: "Stuur met 1 klik beschikbaarheidsverzoeken naar acteurs, muzikanten en geluidstechnici via SMS of WhatsApp.",
    feature2Title: "Veilige Escrow Betalingen",
    feature2Desc: "Geld staat veilig gereserveerd tot de voorstelling is afgerond. Zekerheid voor producent, cast en crew.",
    feature3Title: "Script, Repetities & Chat",
    feature3Desc: "Deel scripts, schema's, NDA's en repetitieschema's rechtstreeks met al je cast- en crewleden.",
    rosterTitle: "Beschikbaar Talent & Crew",
    rosterSubtitle: "Bekijk ervaren muzikanten, acteurs, technici en podiumcrew voor repetities en shows.",
    viewAll: "Bekijk Al Het Talent",
    calcTitle: "Bereken je Productiekosten",
    calcSubtitle: "Schat eenvoudig gages, crew-tarieven en borgsommen in voordat je boekt.",
    musiciansLabel: "Aantal cast & crew:",
    rateLabel: "Uurtarief per persoon:",
    hoursLabel: "Duur van show / repetitie:",
    subtotalLabel: "Gages & vergoedingen:",
    feeLabel: "Escrow bescherming (5%):",
    totalLabel: "Totale borgsom:",
    testHoldBtn: "Test Boeking in Demo",
    footerText: "© 2026 Sessiecat. Ondersteunt theatermakers, producenten, tourmanagers en artiesten.",
    sslLabel: "Beveiligde SSL Verbinding",
    gdprLabel: "Privacy Beschermd",
    hoursUnit: "Uur",
    artistUnit: "Mensen"
  },
  de: {
    badge: "Live-Musik • Theater • Bühnenproduktionen",
    tagline: "Das Betriebssystem für Theatermacher, Tour-Manager & Live-Produktionen",
    subheadline: "Von der Buchung von Musikern, Schauspielern und Technikern bis hin zur Koordination von Proben, NDAs und Treuhand-Auszahlungen.",
    accessTitle: "Jetzt starten",
    accessDesc: "Melde dich an oder teste sofort die kostenlose Gast-Demo.",
    signInGoogle: "Mit Google anmelden",
    continueGuest: "Gast-Demo testen (Ohne Anmeldung)",
    guestBadge: "SOFORT",
    guideBtn: "So funktioniert's",
    guideBtnHide: "Anleitung schließen",
    feature1Title: "Besetzung & Crew Anfragen",
    feature1Desc: "Sende mit 1 Klick Anfragen an Schauspieler, Musiker und Tontechniker per SMS oder WhatsApp.",
    feature2Title: "Sichere Treuhand-Auszahlungen",
    feature2Desc: "Gagen bleiben sicher verwahrt, bis der Vorhang fällt – Schutz für Produzenten und Darsteller.",
    feature3Title: "Skripte, Proben & Chat",
    feature3Desc: "Teile Skripte, Probenpläne und NDAs direkt mit deinem gesamten Team.",
    rosterTitle: "Verfügbare Darsteller & Techniker",
    rosterSubtitle: "Finde erfahrene Musiker, Schauspieler und Bühnencrew für Proben und Auftritte.",
    viewAll: "Alle Talenten anzeigen",
    calcTitle: "Berechne deine Produktionskosten",
    calcSubtitle: "Schätze Gagen und Kautionen vor der Buchung ab.",
    musiciansLabel: "Benötigte Personen:",
    rateLabel: "Stundensatz pro Person:",
    hoursLabel: "Dauer der Show / Probe:",
    subtotalLabel: "Gagen & Gehälter:",
    feeLabel: "Treuhand-Gebühr (5%):",
    totalLabel: "Gesamtsumme:",
    testHoldBtn: "Buchung in der Demo testen",
    footerText: "© 2026 Sessiecat. Verbindet Theatermacher, Produzenten und Künstler weltweit.",
    sslLabel: "Sichere SSL Verbindung",
    gdprLabel: "Datenschutz konform",
    hoursUnit: "Stunden",
    artistUnit: "Personen"
  },
  fr: {
    badge: "Musique Live • Théâtre • Productions Scéniques",
    tagline: "Le Système d'Exploitation pour Hommes de Théâtre, Régisseurs & Spectacles",
    subheadline: "De la réservation de musiciens, comédiens et techniciens à la coordination des répétitions, NDAs et paiements sécurisés.",
    accessTitle: "Commencer",
    accessDesc: "Connectez-vous pour gérer votre production ou essayez la démo gratuite.",
    signInGoogle: "Se connecter avec Google",
    continueGuest: "Essayer la Démo (Sans inscription)",
    guestBadge: "INSTANTANÉ",
    guideBtn: "Comment ça marche",
    guideBtnHide: "Fermer le guide",
    feature1Title: "Options Cast & Équipe Technique",
    feature1Desc: "Envoyez des demandes en 1 clic aux comédiens, musiciens et ingénieurs du son via SMS ou WhatsApp.",
    feature2Title: "Paiements Sécurisés",
    feature2Desc: "Les fonds sont conservés en sécurité jusqu'à la fin de la représentation.",
    feature3Title: "Textes, Répétitions & Chat",
    feature3Desc: "Partagez scripts, plannings de répétition et contrats directement avec votre équipe.",
    rosterTitle: "Artistes & Techniciens Disponibles",
    rosterSubtitle: "Découvrez des musiciens, comédiens et techniciens de scène prêts pour répétitions et spectacles.",
    viewAll: "Voir Tous les Talents",
    calcTitle: "Calculez le Coût de Production",
    calcSubtitle: "Estimez les cachets et dépôts de garantie avant de réserver.",
    musiciansLabel: "Personnes nécessaires:",
    rateLabel: "Tarif horaire par personne:",
    hoursLabel: "Durée du spectacle / répétition:",
    subtotalLabel: "Cachets & honoraires:",
    feeLabel: "Frais de protection (5%):",
    totalLabel: "Dépôt total:",
    testHoldBtn: "Tester la Réservation dans la Démo",
    footerText: "© 2026 Sessiecat. Dédié aux producteurs de théâtre, régisseurs et artistes.",
    sslLabel: "Connexion SSL Sécurisée",
    gdprLabel: "Données Protégées",
    hoursUnit: "Heures",
    artistUnit: "Personnes"
  },
  es: {
    badge: "Música en Vivo • Teatro • Producciones Escénicas",
    tagline: "El Sistema Operativo para Creadores de Teatro, Directores y Giras",
    subheadline: "Desde reservar músicos, actores y técnicos de escenario hasta coordinar ensayos, acuerdos de confidencialidad y pagos en garantía.",
    accessTitle: "Comenzar",
    accessDesc: "Inicia sesión para administrar tu producción o prueba la demo gratuita.",
    signInGoogle: "Iniciar sesión con Google",
    continueGuest: "Probar Demo (Sin registro)",
    guestBadge: "INSTANTÁNEO",
    guideBtn: "Cómo funciona",
    guideBtnHide: "Cerrar guía",
    feature1Title: "Reservas de Elenco y Equipo",
    feature1Desc: "Envía solicitudes con 1 clic a actores, músicos y técnicos por SMS o WhatsApp.",
    feature2Title: "Pagos Seguros en Garantía",
    feature2Desc: "Los fondos se retienen de forma segura hasta que cae el telón.",
    feature3Title: "Guiones, Ensayos y Chat",
    feature3Desc: "Comparte guiones, calendarios de ensayo y contratos directamente con todo tu equipo.",
    rosterTitle: "Artistas y Equipo de Escenario",
    rosterSubtitle: "Explora músicos, actores y técnicos listos para ensayos y funciones.",
    viewAll: "Ver Todos los Talentos",
    calcTitle: "Calcula los Costos de Producción",
    calcSubtitle: "Calcula honorarios y depósitos antes de reservar.",
    musiciansLabel: "Personas necesarias:",
    rateLabel: "Tarifa por hora por persona:",
    hoursLabel: "Duración de la función / ensayo:",
    subtotalLabel: "Honorarios de elenco y equipo:",
    feeLabel: "Garantía de protección (5%):",
    totalLabel: "Depósito total:",
    testHoldBtn: "Probar Reserva en la Demo",
    footerText: "© 2026 Sessiecat. Potenciando creadores de teatro, directores y artistas.",
    sslLabel: "Conexión SSL Segura",
    gdprLabel: "Protección de Datos",
    hoursUnit: "Horas",
    artistUnit: "Personas"
  }
};

export const LandingPortal: React.FC<LandingPortalProps> = ({
  onGoogleLogin,
  onGuestLogin,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || "en") as SupportedLang;
  const [lang, setLang] = useState<SupportedLang>(
    LANG_LABELS[currentLang] ? currentLang : "en"
  );
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showFeaturesOverview, setShowFeaturesOverview] = useState(false);

  // Calculator State
  const [calcRate, setCalcRate] = useState<number>(150);
  const [calcHours, setCalcHours] = useState<number>(4);
  const [calcMusicians, setCalcMusicians] = useState<number>(3);

  const handleLanguageChange = (newLang: SupportedLang) => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
    setShowLangMenu(false);
  };

  const t = LANDING_TEXTS[lang] || LANDING_TEXTS.en;

  // Escrow Calculations
  const rawSubtotal = calcRate * calcHours * calcMusicians;
  const escrowFee = Math.round(rawSubtotal * 0.05);
  const totalEscrow = rawSubtotal + escrowFee;

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans select-none antialiased relative overflow-x-hidden">
      {/* Soft Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-[450px] h-[450px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-30 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/10">
        <SessiecatLogo size="md" />

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Multilingual Toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all cursor-pointer"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D1FF26]" />
              <span>{LANG_LABELS[lang].flag} {LANG_LABELS[lang].name}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-[#14151C] border border-white/15 rounded-xl shadow-2xl py-1 z-50 animate-fade-in">
                {(Object.keys(LANG_LABELS) as SupportedLang[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                      lang === code
                        ? "bg-[#D1FF26]/15 text-[#D1FF26] font-bold"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{LANG_LABELS[code].flag}</span>
                    <span>{LANG_LABELS[code].name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Guide Toggle */}
          <button
            onClick={() => setShowFeaturesOverview(!showFeaturesOverview)}
            className="text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{showFeaturesOverview ? t.guideBtnHide : t.guideBtn}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFeaturesOverview ? "rotate-180" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col items-center space-y-16">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-6 pt-2">
          <div className="inline-flex items-center gap-2 bg-[#D1FF26]/10 border border-[#D1FF26]/30 px-3.5 py-1 rounded-full text-xs font-medium text-[#D1FF26]">
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight font-sans">
            {t.tagline}
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            {t.subheadline}
          </p>

          {/* Access Card */}
          <div className="pt-2 max-w-md mx-auto w-full">
            <div className="bg-[#12131A] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              
              <div className="space-y-1 text-center">
                <h2 className="text-lg font-bold text-white">
                  {t.accessTitle}
                </h2>
                <p className="text-xs text-white/60">
                  {t.accessDesc}
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onGoogleLogin}
                  className="w-full bg-[#D1FF26] hover:bg-white text-black font-bold text-sm py-3.5 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{t.signInGoogle}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-black/60 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onGuestLogin}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold text-sm py-3.5 px-5 rounded-xl transition-all border border-white/15 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-[#D1FF26] fill-[#D1FF26] shrink-0" />
                  <span>{t.continueGuest}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D1FF26]" /> {t.sslLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t.gdprLabel}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview Drawer */}
        {showFeaturesOverview && (
          <div className="w-full animate-fade-in">
            <VisitorFeaturesOverview />
          </div>
        )}

        {/* Feature Cards Grid */}
        <section className="w-full space-y-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#12131A] border border-white/10 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 bg-[#D1FF26]/10 rounded-lg flex items-center justify-center text-[#D1FF26]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.feature1Title}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {t.feature1Desc}
              </p>
            </div>

            <div className="bg-[#12131A] border border-white/10 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.feature2Title}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {t.feature2Desc}
              </p>
            </div>

            <div className="bg-[#12131A] border border-white/10 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.feature3Title}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {t.feature3Desc}
              </p>
            </div>

          </div>
        </section>

        {/* Available Musicians Showcase */}
        <section className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {t.rosterTitle}
              </h2>
              <p className="text-xs text-white/60">
                {t.rosterSubtitle}
              </p>
            </div>
            <button
              onClick={onGuestLogin}
              className="text-xs text-[#D1FF26] hover:underline font-medium cursor-pointer"
            >
              {t.viewAll} &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INITIAL_ARTISTS.slice(0, 4).map((artist) => (
              <div
                key={artist.id}
                onClick={onGuestLogin}
                className="bg-[#12131A] border border-white/10 hover:border-[#D1FF26]/50 p-4 rounded-xl space-y-3 cursor-pointer transition-all hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={artist.avatarUrl}
                    alt={artist.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <div className="font-bold text-sm text-white">
                      {artist.name}
                    </div>
                    <div className="text-xs text-[#D1FF26]">
                      {artist.instruments.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white/40" />
                    {artist.location.split(",")[0]}
                  </span>
                  <span className="font-semibold text-white">€{artist.hourlyRate}/hr</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Calculator */}
        <section className="w-full bg-[#12131A] border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white">
              {t.calcTitle}
            </h2>
            <p className="text-xs text-white/60">
              {t.calcSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-5 md:col-span-2 text-xs">
              <div>
                <div className="flex justify-between mb-2 text-white/80">
                  <span>{t.musiciansLabel}</span>
                  <span className="text-[#D1FF26] font-bold">{calcMusicians} {t.artistUnit}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={calcMusicians}
                  onChange={(e) => setCalcMusicians(Number(e.target.value))}
                  className="w-full accent-[#D1FF26] bg-white/10 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2 text-white/80">
                  <span>{t.rateLabel}</span>
                  <span className="text-[#D1FF26] font-bold">€{calcRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full accent-[#D1FF26] bg-white/10 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2 text-white/80">
                  <span>{t.hoursLabel}</span>
                  <span className="text-[#D1FF26] font-bold">{calcHours} {t.hoursUnit}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={calcHours}
                  onChange={(e) => setCalcHours(Number(e.target.value))}
                  className="w-full accent-[#D1FF26] bg-white/10 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 p-5 rounded-xl flex flex-col justify-between space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>{t.subtotalLabel}</span>
                  <span>€{rawSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>{t.feeLabel}</span>
                  <span>€{escrowFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                  <span>{t.totalLabel}</span>
                  <span className="text-[#D1FF26]">€{totalEscrow.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={onGuestLogin}
                className="w-full bg-[#D1FF26] hover:bg-white text-black font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-center"
              >
                {t.testHoldBtn} &rarr;
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 py-6 text-center text-xs text-white/50 space-y-2 bg-[#0A0B0E]">
        <div>{t.footerText}</div>
        <div className="flex justify-center gap-6 text-xs">
          <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

