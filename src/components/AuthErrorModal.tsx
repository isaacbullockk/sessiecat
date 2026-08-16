import React from 'react';
import { X, ExternalLink, ShieldAlert, Cookie, Info, Lock } from 'lucide-react';

interface AuthErrorModalProps {
  error: string;
  onClose: () => void;
}

export function AuthErrorModal({ error, onClose }: AuthErrorModalProps) {
  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="auth-error-modal" 
        className="w-full max-w-lg bg-[#0C0C0E] border-2 border-red-500/30 text-white shadow-2xl p-6 relative font-sans animate-fade-in"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/5 p-1 rounded-none transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Indicator */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-red-400/80 font-bold block">
              Google Security Sandbox Restriction
            </span>
            <h3 className="font-black text-lg uppercase tracking-tight text-white mt-0.5">
              Secure Sign-in Blocked
            </h3>
          </div>
        </div>

        {/* Detailed Error Box */}
        <div className="bg-red-500/5 border border-red-500/15 p-3 mb-5 font-mono text-[11px] text-red-300 rounded-none overflow-x-auto max-h-24 scrollbar-thin">
          <span className="text-red-400/60 font-bold block mb-1">RAW EXCEPTION LOG:</span>
          {error}
        </div>

        {/* Informative Explanation */}
        <div className="space-y-4 text-xs text-white/70 leading-relaxed mb-6 font-sans">
          <p>
            This error usually occurs because the <span className="text-[#D1FF26] font-bold">Sessiecat</span> application is currently embedded within an <strong>interactive preview iframe</strong> on Google AI Studio. 
          </p>
          
          <div className="grid grid-cols-1 gap-2.5 pt-1.5">
            <div className="flex items-start gap-2.5 bg-white/5 p-3 border border-white/5">
              <Lock className="w-4 h-4 text-[#AC6CFF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Iframe Cross-Origin Block</strong>
                Browsers enforce strict isolation inside iframes. Popups launched within an iframe are blocked from exchanging secure session authentication signals back to the parent frame.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white/5 p-3 border border-white/5">
              <Cookie className="w-4 h-4 text-[#D1FF26] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Cookie Guard Partitioning</strong>
                Modern browser policies (especially Safari/iOS and Chrome incognito) automatically discard third-party security cookies inside iframe elements to prevent tracking. This stops Firebase from caching your active state.
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row gap-3 border-t border-white/10 pt-5">
          {/* Primary Call-to-Action */}
          <button
            onClick={handleOpenInNewTab}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#AC6CFF] via-[#FB4B87] to-[#D1FF26] text-black font-black text-xs uppercase tracking-widest px-5 py-3 hover:scale-[1.02] transition-transform shadow-[0_4px_20px_rgba(172,108,255,0.25)] rounded-none cursor-pointer"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-4 h-4 text-black shrink-0" />
          </button>

          {/* Neutral Dismiss */}
          <button
            onClick={onClose}
            className="px-5 py-3 bg-white/15 hover:bg-white/20 border border-white/10 text-white font-mono text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
          >
            Acknowledge
          </button>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-wide">
          <Info className="w-3.5 h-3.5 text-[#D1FF26] shrink-0" />
          <span>Tip: Opening in a dedicated tab bypasses iframe sandbox rules completely!</span>
        </div>
      </div>
    </div>
  );
}
