import React, { useState } from 'react';
import { User, Compass, Target, Navigation, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface OnboardingWelcomeModalProps {
  isOpen: boolean;
  onComplete: (role: 'touring_manager' | 'jam_organizer' | 'sessionist' | 'all_rounder' | 'investor', name: string) => void;
}

export const OnboardingWelcomeModal: React.FC<OnboardingWelcomeModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'touring_manager' | 'jam_organizer' | 'sessionist' | 'all_rounder' | 'investor'>('sessionist');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#111] border border-white/15 p-6 md:p-8 max-w-xl w-full relative max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <div className="flex items-center justify-center mb-5">
           <div className="text-[#D1FF26] font-mono uppercase tracking-widest text-xs font-black flex items-center gap-2 bg-[#D1FF26]/10 px-3 py-1 rounded-full border border-[#D1FF26]/30">
             <span>🐱🎸</span>
             <span>Welkom bij Sessiecat</span>
           </div>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight text-center">
              Wat kom je doen?
            </h2>
            <p className="text-[#D1FF26] text-xs sm:text-sm font-medium text-center max-w-md mx-auto leading-relaxed">
              Zalen boeken de act. Sessiecat regelt de band. Kies je rol in 1 klik:
            </p>

            <div className="grid grid-cols-1 gap-3 mt-4">
               {/* 1. Muzikant */}
               <button 
                 onClick={() => { setRole('sessionist'); setStep(2); }}
                 className="p-4 border border-white/10 hover:border-[#D1FF26] bg-black hover:bg-white/5 rounded-xl text-left transition-all cursor-pointer group"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 border border-[#D1FF26]/30 bg-[#D1FF26]/10 text-[#D1FF26] rounded-lg group-hover:scale-110 transition-transform">
                     <span className="text-xl">🎸</span>
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between">
                       <h3 className="text-white font-bold uppercase tracking-wider text-sm group-hover:text-[#D1FF26] transition-colors">
                         Muzikant / Sessiecat
                       </h3>
                       <span className="text-[10px] font-mono text-[#D1FF26] uppercase font-bold">Spelen ➔</span>
                     </div>
                     <p className="text-white/60 text-xs mt-1">
                       Gigs scoren, eigen gage bepalen en direct eerlijk betaald volgens Pop-CAO.
                     </p>
                   </div>
                 </div>
               </button>

               {/* 2. Bandleider / MD */}
               <button 
                 onClick={() => { setRole('touring_manager'); setStep(2); }}
                 className="p-4 border border-white/10 hover:border-[#AC6CFF] bg-black hover:bg-white/5 rounded-xl text-left transition-all cursor-pointer group"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 border border-[#AC6CFF]/30 bg-[#AC6CFF]/10 text-[#AC6CFF] rounded-lg group-hover:scale-110 transition-transform">
                     <span className="text-xl">🎹</span>
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between">
                       <h3 className="text-white font-bold uppercase tracking-wider text-sm group-hover:text-[#AC6CFF] transition-colors">
                         Bandleider / Tourmanager
                       </h3>
                       <span className="text-[10px] font-mono text-[#AC6CFF] uppercase font-bold">Boeken ➔</span>
                     </div>
                     <p className="text-white/60 text-xs mt-1">
                       Binnen 5 minuten een ritmesectie geregeld met automatische 24u-opties.
                     </p>
                   </div>
                 </div>
               </button>

               {/* 3. Zaal / Jam Organisator */}
               <button 
                 onClick={() => { setRole('jam_organizer'); setStep(2); }}
                 className="p-4 border border-white/10 hover:border-amber-400 bg-black hover:bg-white/5 rounded-xl text-left transition-all cursor-pointer group"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 border border-amber-400/30 bg-amber-400/10 text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
                     <span className="text-xl">🎪</span>
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between">
                       <h3 className="text-white font-bold uppercase tracking-wider text-sm group-hover:text-amber-400 transition-colors">
                         Zaal / Festival / Sessie-Runner
                       </h3>
                       <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Plaatsen ➔</span>
                     </div>
                     <p className="text-white/60 text-xs mt-1">
                       Plaats gigs, deel een WhatsApp-claimlink en vul je line-up zonder chaotische groepen.
                     </p>
                   </div>
                 </div>
               </button>

               {/* 4. All-Rounder */}
               <button 
                 onClick={() => { setRole('all_rounder'); setStep(2); }}
                 className="p-4 border border-white/10 hover:border-emerald-400 bg-black hover:bg-white/5 rounded-xl text-left transition-all cursor-pointer group"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                     <span className="text-xl">⚡</span>
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between">
                       <h3 className="text-white font-bold uppercase tracking-wider text-sm group-hover:text-emerald-400 transition-colors">
                         Alles-in-één (Muzikant én Boeker)
                       </h3>
                       <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Alles ➔</span>
                     </div>
                     <p className="text-white/60 text-xs mt-1">
                       Ik speel zelf én regel muzikanten voor projecten. Toon alle knoppen.
                     </p>
                   </div>
                 </div>
               </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center space-y-1">
               <h2 className="text-2xl font-black text-white uppercase tracking-tight">Hoe heet je?</h2>
               <p className="text-white/60 text-xs font-mono">
                 Je artiestennaam of naam voor op het contract en de optielijst.
               </p>
             </div>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-white/50 uppercase tracking-widest block font-bold">
                  Naam / Artiestennaam
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-3.5 text-white focus:outline-none focus:border-[#D1FF26] transition-all font-mono rounded-lg text-sm"
                  placeholder="bijv. Sam de Drummer"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 border border-white/20 text-white/70 hover:text-white text-xs font-mono font-bold py-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  ← Terug
                </button>
                <button 
                  onClick={() => {
                    if (name.trim()) onComplete(role, name);
                  }}
                  disabled={!name.trim()}
                  className="flex-1 bg-[#D1FF26] hover:bg-white text-black font-black uppercase tracking-wider text-xs py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                >
                  <span>Starten met Sessiecat</span>
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
