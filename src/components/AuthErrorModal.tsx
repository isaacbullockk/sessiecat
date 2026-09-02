import React from 'react';
import { X, ExternalLink, ShieldAlert, Cookie, Info, Lock, Play } from 'lucide-react';

interface AuthErrorModalProps {
  error: string;
  onClose: () => void;
  onGuestLogin?: () => void;
}

export function AuthErrorModal({ error, onClose, onGuestLogin }: AuthErrorModalProps) {
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
              Google Security / Browser Notice
            </span>
            <h3 className="font-black text-lg uppercase tracking-tight text-white mt-0.5">
              Sign-in Action Required
            </h3>
          </div>
        </div>

        {/* Detailed Error Box */}
        <div className="bg-red-500/5 border border-red-500/15 p-3 mb-5 font-mono text-[11px] text-red-300 rounded-none overflow-x-auto max-h-24 scrollbar-thin">
          <span className="text-red-400/60 font-bold block mb-1">MESSAGE:</span>
          {error}
        </div>

        {/* Informative Explanation */}
        <div className="space-y-4 text-xs text-white/70 leading-relaxed mb-6 font-sans">
          <p>
            If sign-in was blocked by a popup blocker or sandbox environment, you can open the app in a new tab or instantly access the full platform in guest mode.
          </p>
          
          <div className="grid grid-cols-1 gap-2.5 pt-1.5">
            <div className="flex items-start gap-2.5 bg-white/5 p-3 border border-white/5">
              <Lock className="w-4 h-4 text-[#AC6CFF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Popup / Cross-Origin Policy</strong>
                Browsers or mobile webviews may block external Google authentication popups until permitted.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white/5 p-3 border border-white/5">
              <Cookie className="w-4 h-4 text-[#D1FF26] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Session Persistence</strong>
                Your session is automatically saved across refreshes once signed in.
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col gap-2.5 border-t border-white/10 pt-5">
          {onGuestLogin && (
            <button
              onClick={() => {
                onGuestLogin();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#D1FF26] hover:bg-white text-black font-black text-xs uppercase tracking-widest px-5 py-3 transition-colors rounded-none cursor-pointer"
            >
              <Play className="w-4 h-4 text-black fill-black shrink-0" />
              <span>Continue with Instant Demo Mode</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleOpenInNewTab}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-widest px-4 py-2.5 transition-colors rounded-none cursor-pointer"
            >
              <span>Open in Dedicated Tab</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70 shrink-0" />
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-mono text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-wide">
          <Info className="w-3.5 h-3.5 text-[#D1FF26] shrink-0" />
          <span>Tip: You can use all features immediately in Demo Mode.</span>
        </div>
      </div>
    </div>
  );
}
