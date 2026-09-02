import React from 'react';
import { Scale, ArrowLeft } from 'lucide-react';
import { SessiecatLogo } from './SessiecatLogo';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#D1FF26] selection:text-black">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 space-y-16">
        
        {/* Header */}
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.hash = ''}
              className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
            </button>
            <SessiecatLogo size="md" />
          </div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10">
              <Scale className="w-4 h-4 text-[#D1FF26]" />
              <span className="text-[10px] font-mono text-[#D1FF26] uppercase tracking-widest">Legal & Compliance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Terms of Service</h1>
            <p className="text-white/50 font-mono text-sm max-w-2xl leading-relaxed">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-12 animate-fade-in [animation-delay:100ms]">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">1. Acceptance of Terms</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>By accessing or using Sessiecat, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">2. Description of Service</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>Sessiecat provides a platform for organizing music tours, coordinating bands, and managing session musicians. We facilitate connections but are not a party to any agreements made between organizers and musicians regarding performances or payments.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">3. User Responsibilities</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <ul className="list-disc pl-5 space-y-2 text-white/60">
                <li>You must provide accurate and complete information when creating an account or building a profile.</li>
                <li>You are responsible for maintaining the security of your account.</li>
                <li>You agree not to use the platform for any illegal or unauthorized purpose.</li>
                <li>You must respect the holds and booking processes established within the platform.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">4. Content & Intellectual Property</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>You retain all rights to the content you post on Sessiecat. However, by posting content, you grant us a non-exclusive license to use, display, and distribute that content within the platform to provide our services.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">5. Termination</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>We reserve the right to suspend or terminate your account at any time for violations of these Terms of Service or for any other reason at our sole discretion.</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-white/10 flex justify-between items-center text-xs font-mono text-white/30">
          <p>© {new Date().getFullYear()} Sessiecat. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => window.location.hash = ''} className="hover:text-white transition-colors">Return to App</button>
          </div>
        </div>

      </div>
    </div>
  );
}
