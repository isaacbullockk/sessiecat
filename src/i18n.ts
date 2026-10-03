import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Short, punchy, visual translations
const resources = {
  nl: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Zalen boeken de act. Sessiecat regelt de band.",
        "pitch": "Geen WhatsApp-chaos. Direct de beste muzikanten op het podium.",
      },
      "nav": {
        "artists": "Vind Muzikanten 🎸",
        "jams": "Vind Gigs 🎪",
        "calendar": "Tour Hub 🚐",
        "holds": "24u Opties ⏱️",
        "escrow": "Eerlijk Betaald 💶",
        "rehearsals": "Repetities 🥁"
      },
      "roles": {
        "hire": "Muzikanten Boeken 🔍",
        "work": "Gigs Spelen 🎸"
      }
    }
  },
  en: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Venues book the act. Sessiecat books the band.",
        "pitch": "No WhatsApp chaos. The best session musicians on stage.",
      },
      "nav": {
        "artists": "Find Musicians 🎸",
        "jams": "Find Gigs 🎪",
        "calendar": "Tour Hub 🚐",
        "holds": "24h Holds ⏱️",
        "escrow": "Fair Pay 💶",
        "rehearsals": "Rehearsals 🥁"
      },
      "roles": {
        "hire": "Book Musicians 🔍",
        "work": "Play Gigs 🎸"
      }
    }
  },
  fr: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Les salles réservent l'affiche. Sessiecat gère le groupe.",
      },
      "nav": {
        "artists": "Trouver des Musiciens 🎸",
        "jams": "Trouver des Concerts 🎪",
        "calendar": "Centre de Tournée 🚐",
      }
    }
  },
  es: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Las salas programan el bolo. Sessiecat organiza la banda.",
      },
      "nav": {
        "artists": "Buscar Músicos 🎸",
        "jams": "Buscar Bolos 🎪",
        "calendar": "Centro de Gira 🚐",
      }
    }
  },
  de: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Clubs buchen den Act. Sessiecat organisiert die Band.",
      },
      "nav": {
        "artists": "Musiker Finden 🎸",
        "jams": "Gigs Finden 🎪",
        "calendar": "Tour Hub 🚐",
      }
    }
  }
};

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'nl', // default to Dutch as requested
    fallbackLng: 'nl',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;

