import React, { useState } from 'react';
import { X, Copy, Check, Users, Share2, Link as LinkIcon, Send } from 'lucide-react';

interface InviteModalProps {
  onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/invite/beta-v1-x8y9z`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Tired of missed gigs in messy group chats? I'm using Sessiecat to manage availability, lock in rates, and get booked faster. Join my roster:\n\n${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Invite: Join my Sessiecat roster");
    const body = encodeURIComponent(`Hey,\n\nTired of missed gigs in messy group chats?\n\nI'm using Sessiecat to manage availability, lock in rates, and get booked faster. No more endless back-and-forth.\n\nJoin my roster so we can play:\n${inviteLink}\n\nLet's get to work.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#111] border border-white/10 shadow-2xl flex flex-col font-sans max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-accent/10 border border-brand-accent/20">
              <Users className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Invite Your Network</h2>
              <p className="text-[10px] text-white/50 font-mono mt-0.5">Build your roster. Find better gigs.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Your Unique Invite Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 bg-black border border-white/10 px-4 py-3 font-mono text-xs text-white/80 overflow-hidden">
                <LinkIcon className="w-4 h-4 text-white/20 shrink-0" />
                <span className="truncate">{inviteLink}</span>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-2 bg-brand-accent text-black font-bold uppercase tracking-wider text-[10px] px-5 py-3 hover:bg-[#c8ff00] transition-colors cursor-pointer min-w-[120px] justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div className="space-y-4">
            <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Quick Share</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] px-4 py-3 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp Group
              </button>

              <button
                onClick={handleEmailShare}
                className="flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 px-4 py-3 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Email Invite
              </button>
            </div>
          </div>

          <div className="bg-black/50 border border-white/5 p-4 flex gap-3">
            <div className="w-1 h-auto bg-brand-accent rounded-full shrink-0" />
            <p className="text-xs text-white/60 leading-relaxed font-mono">
              <span className="text-white/90 font-bold block mb-1">PRO TIP:</span>
              Share this link in your WhatsApp groups. Musicians who join via your link are automatically added to your priority contacts for quick booking.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
