import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2">
      {['en', 'nl', 'fr', 'es', 'de'].map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={`text-[9px] font-mono tracking-widest uppercase px-2 py-1 border transition-colors ${
            i18n.resolvedLanguage === lang
              ? 'bg-brand-accent text-black border-brand-accent'
              : 'bg-transparent text-white/50 border-white/20 hover:text-white hover:border-white/50'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
