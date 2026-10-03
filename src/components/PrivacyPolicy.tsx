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
              <p>Sessiecat utilizes secure third-party infrastructure located within the EU or compliant with international data transfer frameworks (including Standard Contractual Clauses - SCCs):</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-white/60">
                <li><strong className="text-white">Google Cloud & Firebase (EU / Europe-West):</strong> Authentication, cloud hosting, real-time database storage, and cryptographic session verification.</li>
                <li><strong className="text-white">Smart Bio & Form Assistance (Google Cloud Vertex / GenAI):</strong> Transient processing of user-provided bio text for form formatting. Under strict enterprise API agreements, no user data, audio recordings, or artist likeness are ever used for model training or data harvesting.</li>
                <li><strong className="text-white">Stripe / Escrow Infrastructure:</strong> PCI-DSS Level 1 compliant payment processing for Pop-CAO tour budgets and musician deposits.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">4. Data Retention Policy</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed">
              <p>We retain active account data only for as long as your Sessiecat profile remains active. Anonymized visitor traffic logs are retained for a maximum of 30 days. If you request account deletion, all personal data is permanently purged immediately or within 14 days maximum.</p>
            </div>
          </section>

          {/* Section 5 - Rights */}
          <section className="space-y-4 bg-white/5 p-6 border border-white/10 rounded-lg">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">5. Your Rights Under GDPR (Articles 15-22)</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed space-y-3">
              <p>Under European data protection law (AVG / GDPR), you hold the following statutory rights regarding your data:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-white/60 text-sm">
                <li><strong>Right to Access & Portability (Art. 15 & 20):</strong> Request and download a complete machine-readable copy (JSON) of all data linked to your account via the GDPR Panel.</li>
                <li><strong>Right to Erasure / Right to be Forgotten (Art. 17):</strong> Request complete, permanent deletion of your account, musician profile, and session records with one click.</li>
                <li><strong>Right to Rectification (Art. 16):</strong> Update, correct, or refine your profile, rates, and gear details anytime in Settings.</li>
                <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Reset or withdraw your cookie and analytics consent preferences at any time.</li>
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

          {/* Section 6 - Security by Design */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">6. Security & Privacy by Design (GDPR Article 25)</h2>
            <div className="prose prose-invert max-w-none text-white/70 font-sans leading-relaxed space-y-3">
              <p>In accordance with GDPR Article 25 ("Data protection by design and by default"), Sessiecat embeds technical safeguards into the architecture at every layer:</p>
              <ul className="list-disc pl-5 space-y-2 text-white/60">
                <li><strong className="text-white">Pseudonymization & Contact Masking:</strong> Email addresses and telephone numbers posted in communication channels are automatically sanitized and masked. Unconfirmed candidate holds show masked initials (e.g. <code>Al***</code>) to prevent data harvesting by third parties.</li>
                <li><strong className="text-white">Granular Access Rules (Least Privilege):</strong> Database security rules enforce user isolation so that private profiles, contract documents, and payment details can only be written or edited by their verified owner.</li>
                <li><strong className="text-white">Traffic Anonymization:</strong> IP addresses logged in server telemetry are truncated (last octet stripped), preventing identification of individual end-user devices.</li>
                <li><strong className="text-white">Cryptographic Transport:</strong> 100% of data in transit is encrypted using TLS 1.3/HTTPS, fortified with strict Content Security Policies (CSP), HTTP Strict Transport Security (HSTS), and XSS prevention headers via Helmet.</li>
                <li><strong className="text-white">Zero Model Training:</strong> Audio files, demo videos, and repertoire notes are never fed into public machine-learning pipelines or used to train generative models.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#D1FF26]">7. Data Controller & DPO Contact</h2>
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
