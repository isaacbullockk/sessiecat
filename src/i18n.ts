import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Minimal translation setup for proof of concept
const resources = {
  en: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Find the perfect musicians.",
      },
      "nav": {
        "artists": "Band Roster",
        "jams": "Gig Boards",
        "calendar": "Tour Hub",
      }
    }
  },
  nl: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Vind de perfecte muzikanten.",
      },
      "nav": {
        "artists": "Band Roster",
        "jams": "Gig Borden",
        "calendar": "Tour Hub",
      }
    }
  },
  fr: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Trouvez les musiciens parfaits.",
      },
      "nav": {
        "artists": "Liste des groupes",
        "jams": "Tableaux de concerts",
        "calendar": "Centre de tournée",
      }
    }
  },
  es: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Encuentra a los músicos perfectos.",
      },
      "nav": {
        "artists": "Lista de bandas",
        "jams": "Tableros de conciertos",
        "calendar": "Centro de giras",
      }
    }
  },
  de: {
    translation: {
      "app": {
        "title": "Sessiecat",
        "tagline": "Finde die perfekten Musiker.",
      },
      "nav": {
        "artists": "Band-Kader",
        "jams": "Gig-Boards",
        "calendar": "Tour-Zentrum",
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
