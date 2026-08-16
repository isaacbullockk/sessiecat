import React, { useState, useEffect } from 'react';
import { User, Compass, Target, Navigation, ArrowRight, Zap } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111] border border-white/10 p-6 md:p-8 max-w-xl w-full relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center mb-6 md:mb-8">
           <div className="text-[#D1FF26] font-mono uppercase tracking-[0.2em] text-xs font-black flex items-center gap-2">
             <div className="w-2 h-2 bg-[#D1FF26]" />
             Sessiecat Initialization
           </div>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-center">Define Your Workspace</h2>
            <p className="text-white/60 text-sm font-sans text-center max-w-md mx-auto leading-relaxed">
              Sessiecat configures your dashboard layout based on your primary activities in the live music industry.
            </p>

            <div className="grid grid-cols-1 gap-3 mt-6 max-h-[45vh] md:max-h-none overflow-y-auto pr-2 pb-2">
               <button 
                 onClick={() => { setRole('sessionist'); setStep(2); }}
                 className={`p-4 border text-left transition-all ${role === 'sessionist' ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 bg-black hover:border-white/30'}`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`p-3 border ${role === 'sessionist' ? 'bg-brand-accent text-black border-brand-accent' : 'bg-white/5 text-white/50 border-white/10'}`}>
                     <User className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-white font-bold uppercase tracking-wider text-sm">Sessionist (Artist)</h3>
                     <p className="text-white/40 text-xs mt-1">Receive gig offers, set rate cards, accept payments.</p>
                   </div>
                 </div>
               </button>

               <button 
                 onClick={() => { setRole('touring_manager'); setStep(2); }}
                 className={`p-4 border text-left transition-all ${role === 'touring_manager' ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 bg-black hover:border-white/30'}`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`p-3 border ${role === 'touring_manager' ? 'bg-brand-accent text-black border-brand-accent' : 'bg-white/5 text-white/50 border-white/10'}`}>
                     <Compass className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-white font-bold uppercase tracking-wider text-sm">Touring Manager</h3>
                     <p className="text-white/40 text-xs mt-1">Book bands, process payments securely, monitor budget constraints.</p>
                   </div>
                 </div>
               </button>

               <button 
                 onClick={() => { setRole('jam_organizer'); setStep(2); }}
                 className={`p-4 border text-left transition-all ${role === 'jam_organizer' ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 bg-black hover:border-white/30'}`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`p-3 border ${role === 'jam_organizer' ? 'bg-brand-accent text-black border-brand-accent' : 'bg-white/5 text-white/50 border-white/10'}`}>
                     <Target className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-white font-bold uppercase tracking-wider text-sm">Jam / Theater Organizer</h3>
                     <p className="text-white/40 text-xs mt-1">Shortlist candidates, build rotational stage sheets, coordinate jams.</p>
                   </div>
                 </div>
               </button>

               <button 
                 onClick={() => { setRole('all_rounder'); setStep(2); }}
                 className={`p-4 border text-left transition-all ${role === 'all_rounder' ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 bg-black hover:border-white/30'}`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`p-3 border ${role === 'all_rounder' ? 'bg-brand-accent text-black border-brand-accent' : 'bg-white/5 text-white/50 border-white/10'}`}>
                     <Zap className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-white font-bold uppercase tracking-wider text-sm">All-Rounder (Genius)</h3>
                     <p className="text-white/40 text-xs mt-1">Artist, Manager, and Booker in one. Access all ecosystem features.</p>
                   </div>
                 </div>
               </button>

               <button 
                 onClick={() => { setRole('investor'); setStep(2); }}
                 className={`p-4 border text-left transition-all ${role === 'investor' ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 bg-black hover:border-white/30'}`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`p-3 border ${role === 'investor' ? 'bg-brand-accent text-black border-brand-accent' : 'bg-white/5 text-white/50 border-white/10'}`}>
                     <Target className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="text-white font-bold uppercase tracking-wider text-sm">Investor / Stakeholder</h3>
                     <p className="text-white/40 text-xs mt-1">Explore the platform capabilities and review platform features.</p>
                   </div>
                 </div>
               </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-center">Verify Identity</h2>
             <p className="text-white/60 text-sm font-sans text-center max-w-md mx-auto leading-relaxed">
              Introduce yourself to the network. This will be visible on your digital touring credentials.
            </p>

            <div className="space-y-4 mt-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Full Name / Alias</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-white/10 px-4 py-4 text-white focus:outline-none focus:border-brand-accent transition-all font-mono"
                  placeholder="e.g. John Doe"
                />
              </div>

              <button 
                onClick={() => {
                  if (name.trim()) onComplete(role, name);
                }}
                disabled={!name.trim()}
                className="w-full mt-6 bg-brand-accent hover:bg-[#bce620] text-black font-black uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Onboarding <Navigation className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
