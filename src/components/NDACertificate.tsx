import React from 'react';
import { Booking } from '../types';
import { X, Shield, Calendar, Award, FileText, Printer, CheckCircle } from 'lucide-react';

interface NDACertificateProps {
  booking: Booking;
  onClose: () => void;
}

export function NDACertificate({ booking, onClose }: NDACertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="nda-cert-modal" className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        id="nda-cert-container"
        className="w-full max-w-xl bg-brand-bg border border-white/10 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh] my-4 rounded-none h-fit"
      >
        <div className="space-y-6">
          {/* Top Seal / Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-brand-accent animate-pulse" />
              <div>
                <span className="text-[9px] bg-brand-accent text-black p-0.5 px-2 font-mono font-black uppercase tracking-widest">
                  IP Secured
                </span>
                <h3 className="font-sans font-black text-md text-white uppercase tracking-tight mt-1">
                  Cryptographic NDA & Idea Anchor
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition p-2 hover:bg-white/5 rounded-none border border-white/10"
              title="Close Certificate"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stamped Certification Block */}
          <div className="bg-white/5 border border-[#AC6CFF]/20 p-5 space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <span className="text-[9px] text-white/40 block uppercase tracking-widest">Certificate Anchor:</span>
                <span className="text-xs text-brand-accent font-bold">{booking.securedIdeaHash || 'SES-MD5-A8F9K4-2026'}</span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[9px] text-white/40 block uppercase tracking-widest">Timestamp (UTC):</span>
                <span className="text-xs text-white/80">May 23, 2026 16:45:00 UTC</span>
              </div>
            </div>

            {/* Core Legal Parties and Content info */}
            <div className="space-y-3.5 text-xs text-white/80 leading-relaxed font-sans">
              <p>
                This unilateral non-disclosure agreement has been securely encrypted and timestamped by the client <strong className="text-white uppercase tracking-wider">{booking.clientName}</strong>, targeting the session artist <strong className="text-white uppercase tracking-wider">{booking.artistName}</strong>, for the collaborative record project entitled <strong>&ldquo;{booking.gigTitle}&rdquo;</strong>.
              </p>

              <div className="bg-black p-4 border border-white/10 font-mono space-y-1.5">
                <span className="text-[9px] text-brand-accent uppercase tracking-widest font-black block">Registered Songwriting Concept:</span>
                <p className="text-white leading-normal text-xs normal-case italic">
                  &ldquo;{booking.ideaDescription || 'Standard Professional Session stems, lyrics, hook design, and songwriting arrangement patterns.'}&rdquo;
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] border-t border-white/5 pt-3 leading-normal text-white/60">
                <div className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-white uppercase font-mono">1. Proprietary Rights:</span> {booking.artistName} acknowledges that the registered concept, melody seeds, dynamic structure, and lyrics remain the absolute sole propriety of {booking.clientName}.
                  </p>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-white uppercase font-mono">2. Direct Restraint:</span> The artist shall not leak, play, release, sample, use, or credit themselves with the registered concept on any public domains or separate creations.
                  </p>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-white uppercase font-mono">3. Co-writing Waiver:</span> This session assignment operates under standard "work-for-hire" guidelines. No performance or co-writing credit will accrue to the sessionist unless explicitly authorized via a separate written amendment.
                  </p>
                </div>
              </div>
            </div>

            {/* Electronic Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div className="p-3 bg-black/60 border border-white/10 space-y-1.5">
                <span className="text-[8px] text-white/40 uppercase tracking-widest block font-bold">Stanchioned Client signature:</span>
                <span className="font-black text-xs text-white block italic font-serif">/ e-signed: {booking.clientName} /</span>
                <span className="text-[8px] text-brand-accent/60 block font-mono">Status: Securely Logged</span>
              </div>
              <div className="p-3 bg-black/60 border border-white/10 space-y-1.5">
                <span className="text-[8px] text-white/40 uppercase tracking-widest block font-bold">Stsessionist Agreement code:</span>
                <span className="font-black text-xs text-white block italic font-serif">/ e-signed: {booking.artistName} /</span>
                <span className="text-[8px] text-brand-accent/60 block font-mono">Signed at checkout validation</span>
              </div>
            </div>
          </div>

          {/* Legal Footnote explaining enforcement and safety */}
          <div className="p-3.5 bg-brand-accent/5 border border-brand-accent/20 text-[10px] text-white/70 leading-relaxed font-sans space-y-1">
            <span className="text-[#AC6CFF] font-black uppercase tracking-wider font-mono block text-xs">🛡️ Sessiecat Protection Policy</span>
            <p>
              Sessiecat's digital agreements are legally binding. This timestamp certificate can be officially subpoenaed in any royalty audit or trademark claim. Sessionists cannot claim ignorance of ownership since this intellectual pipeline is sealed directly by the platform.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[9px] text-white/35 font-mono uppercase tracking-widest">
            <Award className="w-4 h-4 text-brand-accent shrink-0" />
            <span>ID: {booking.id.slice(-6).toUpperCase()}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest rounded-none transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white text-black hover:bg-brand-accent hover:border-brand-accent border border-white text-[10px] font-black uppercase tracking-widest rounded-none transition cursor-pointer"
            >
              Accept & Close View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
