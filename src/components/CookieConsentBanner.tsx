import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, Settings, X, Lock } from 'lucide-react';

export interface GDPRConsent {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsentBanner({
  onConsentChange,
}: {
  onConsentChange?: (consent: GDPRConsent) => void;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);

  useEffect(() => {
    const savedConsent = localStorage.getItem('sessiecat_gdpr_consent');
    if (!savedConsent) {
      // Show banner after 800ms
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(savedConsent) as GDPRConsent;
        if (onConsentChange) onConsentChange(parsed);
      } catch (e) {
        setIsVisible(true);
      }
    }
  }, []);

  const saveConsent = (allowAnalytics: boolean) => {
    const consentObj: GDPRConsent = {
      essential: true, // Always required for Auth & session
      analytics: allowAnalytics,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('sessiecat_gdpr_consent', JSON.stringify(consentObj));
    setIsVisible(false);
    if (onConsentChange) onConsentChange(consentObj);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl animate-slide-up text-white font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Info */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-[#D1FF26]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D1FF26]">
              GDPR Cookie & Privacy Choice
            </span>
            <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded text-[10px] font-mono">
              EU Compliant
            </span>
          </div>

          <p className="text-xs md:text-sm text-white/80 leading-relaxed font-sans">
            Sessiecat uses essential cookies to keep you logged in and optional anonymized session analytics to improve session matching. We respect your data rights under the General Data Protection Regulation (GDPR).
          </p>

          {showDetails && (
            <div className="pt-3 border-t border-white/10 mt-3 space-y-3 animate-fade-in text-xs text-white/70">
              <div className="flex items-center justify-between bg-white/5 p-2.5 rounded border border-white/5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-bold text-white">Essential Cookies & Storage</p>
                    <p className="text-[11px] text-white/50">Firebase Authentication tokens and active session states.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  ALWAYS ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-2.5 rounded border border-white/5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D1FF26]" />
                  <div>
                    <p className="font-bold text-white">Anonymized Analytics & Visitor Logs</p>
                    <p className="text-[11px] text-white/50">Helps us monitor platform performance and active roster traffic.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D1FF26]"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs font-mono uppercase text-white/60 hover:text-white px-3 py-2 border border-white/10 hover:bg-white/5 rounded transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#D1FF26]" />
            {showDetails ? 'Hide Options' : 'Preferences'}
          </button>

          <button
            onClick={() => saveConsent(false)}
            className="flex-1 md:flex-initial text-xs font-mono uppercase font-bold text-white/90 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded transition-all cursor-pointer"
          >
            Essential Only
          </button>

          <button
            onClick={() => saveConsent(showDetails ? analyticsConsent : true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 text-xs font-mono uppercase font-bold text-black bg-[#D1FF26] hover:bg-[#bce61e] px-5 py-2.5 rounded shadow-lg transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Accept All
          </button>
        </div>

      </div>
    </div>
  );
}
