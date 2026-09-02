import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { SessiecatLogo } from './SessiecatLogo';

export function PrivacyPolicy() {
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
              <Shield className="w-4 h-4 text-[#D1FF26]" />
              <span className="text-[10px] font-mono text-[#D1FF26] uppercase tracking-widest">Legal & Compliance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Privacy Policy</h1>
            <p className="text-white/50 font-mono text-sm max-w-2xl leading-relaxed">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-12 animate-fade-in [animation-delay:100ms]">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">1. Information We Collect</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>When you use Sessiecat, we may collect and process the following categories of personal data under the EU General Data Protection Regulation (GDPR):</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-white/60">
                <li><strong className="text-white">Identity Data:</strong> Name, Google Account identifier, email address, and profile picture provided via Google Authentication.</li>
                <li><strong className="text-white">Musician Profile Data:</strong> Instrument expertise, bio, gig rates, availability status, and social media links.</li>
                <li><strong className="text-white">Session & Tour Data:</strong> Booking holds, roster selections, financial payouts, and chat messages created within session workspaces.</li>
                <li><strong className="text-white">Technical & Usage Data (Anonymized):</strong> Anonymized IP addresses (last octet masked, e.g. 192.168.1.xxx), user agent, browser type, and page access timestamps.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">2. Legal Basis for Processing (GDPR Article 6)</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>We process your personal data strictly in accordance with lawful bases defined under GDPR Article 6:</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-white/60">
                <li><strong className="text-white">Contractual Necessity (Art. 6(1)(b)):</strong> To register your profile, coordinate jam sessions, process gig holds, and manage roster payouts.</li>
                <li><strong className="text-white">Consent (Art. 6(1)(a)):</strong> For optional cookie usage, analytics logging, and public profile indexing. You may withdraw consent at any time.</li>
                <li><strong className="text-white">Legitimate Interests (Art. 6(1)(f)):</strong> To safeguard platform security, prevent fraudulent holds, and maintain service performance.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">3. Data Subprocessors & Transfers</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>Sessiecat utilizes secure third-party infrastructure. All subprocessors are compliant with international data transfer frameworks (including Standard Contractual Clauses - SCCs):</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-white/60">
                <li><strong className="text-white">Google Cloud & Firebase:</strong> Authentication, cloud hosting, and real-time database storage.</li>
                <li><strong className="text-white">Google Gemini AI:</strong> Processing raw bio/profile inputs for smart assistant features. Data processed via AI is not used for global model training.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">4. Data Retention Policy</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>We retain active account data only for as long as your Sessiecat profile remains active. Anonymized visitor traffic logs are retained for a maximum of 30 days. If you request account deletion, all personal data is permanently purged within 14 days.</p>
            </div>
          </section>

          {/* Section 5 - Rights */}
          <section className="space-y-4 bg-white/5 p-6 border border-white/10 rounded-lg">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">5. Your Rights Under GDPR (Articles 15-22)</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed space-y-3">
              <p>Under European data protection law, you hold the following rights regarding your data:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-white/60 text-sm">
                <li><strong>Right to Access & Portability (Art. 15 & 20):</strong> Request a downloadable machine-readable copy (JSON) of all data linked to your account.</li>
                <li><strong>Right to Erasure / Right to be Forgotten (Art. 17):</strong> Request complete deletion of your account, musician profile, and session records.</li>
                <li><strong>Right to Rectification (Art. 16):</strong> Update or correct your profile details anytime in Settings.</li>
                <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Reset your cookie consent preferences at any time.</li>
              </ul>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('sessiecat_gdpr_consent');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-[#D1FF26] text-black text-xs font-mono font-bold uppercase rounded hover:bg-[#bce61e] transition-all cursor-pointer"
                >
                  Reset Cookie Consent
                </button>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">6. Data Controller & DPO Contact</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>The Data Controller for Sessiecat is Isaac Bullock. For any GDPR inquiries, data access requests, or deletion notices, please contact our Data Protection Team at:</p>
              <p className="mt-2 font-mono text-[#D1FF26] bg-black/50 p-3 border border-white/10 rounded inline-block">
                Email: <a href="mailto:privacy@sessiecat.com" className="underline">privacy@sessiecat.com</a>
              </p>
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
