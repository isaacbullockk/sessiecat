import React, { useState } from 'react';
import { Euro, FileText, CheckCircle, Clock, Zap, Download, Lock } from 'lucide-react';
import { TourEvent, JamEvent, Artist } from '../types';

interface Props {
  tours: TourEvent[];
  jams: JamEvent[];
  artists: Artist[];
}

export const FinanceWorkspace: React.FC<Props> = ({ tours, jams, artists }) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payouts'>('invoices');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-sans tracking-tight font-light flex items-center gap-3">
            <Euro className="w-6 h-6 text-[#D1FF26]" />
            Automated Finance & Invoicing
          </h2>
          <p className="text-white/50 text-sm mt-1 max-w-2xl">
            Streamlined payment flows inspired by industry leaders. We automatically generate 
            compliant invoices for your roster and process bulk payouts in a single click, 
            so you never have to chase banking details again.
          </p>
        </div>
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-sm">
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors ${activeTab === 'invoices' ? 'bg-[#D1FF26] text-black' : 'text-white/60 hover:text-white'}`}
          >
            Invoices
          </button>
          <button 
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider transition-colors ${activeTab === 'payouts' ? 'bg-[#D1FF26] text-black' : 'text-white/60 hover:text-white'}`}
          >
            Bulk Payouts
          </button>
        </div>
      </div>

      {activeTab === 'invoices' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {jams.filter(j => j.slots.some(s => s.status === 'confirmed' || s.status === 'held')).map(jam => (
              <div key={jam.id} className="border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{jam.name}</h3>
                    <p className="text-white/50 font-mono text-xs">{new Date(jam.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#D1FF26] bg-[#D1FF26]/10 px-3 py-1 font-mono text-xs font-bold uppercase">
                    <CheckCircle className="w-3.5 h-3.5" /> Auto-Invoiced
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  {jam.slots.filter(s => (s.status === 'confirmed' || s.status === 'held') && s.heldBy).map(slot => (
                    <div key={slot.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-white/40" />
                        <div>
                          <p className="font-bold text-sm">{slot.heldBy?.name || 'Session Artist'}</p>
                          <p className="text-white/50 font-mono text-[10px] uppercase">{slot.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-sm font-bold">€{slot.rateLocked || slot.offerRate || 250}</span>
                        <button className="flex items-center gap-1 text-white/50 hover:text-white transition-colors font-mono text-[10px] uppercase">
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {jams.filter(j => j.slots.some(s => s.status === 'confirmed' || s.status === 'held')).length === 0 && (
              <div className="text-center py-12 border border-dashed border-white/10 bg-black/20 text-white/45">
                <p className="font-mono text-xs uppercase">No confirmed bookings to invoice yet.</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="bg-[#D1FF26] text-black p-6 space-y-4">
              <h3 className="font-mono font-bold uppercase text-xs flex items-center gap-2">
                <Zap className="w-4 h-4" /> Platform Automation
              </h3>
              <p className="text-sm font-medium">
                When a sessionist confirms a booking via Escrow, we automatically collect their VAT/Tax details and generate a reverse-charge invoice on your behalf.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-emerald-500/30 bg-[#0F1C15]/80 p-8 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                <Lock className="w-4 h-4" /> Secure Escrow Vault
              </div>
              <h3 className="text-3xl font-light text-white">
                €
                {jams.reduce((acc, jam) => {
                  return acc + jam.slots.filter(s => s.status === 'confirmed' || s.status === 'held').reduce((slotAcc, slot) => {
                    return slotAcc + (slot.rateLocked || slot.offerRate || 250);
                  }, 0)
                }, 0).toLocaleString()}
              </h3>
              <p className="text-emerald-500/70 text-sm">Total pending payouts across all active bookings</p>
            </div>
            <button className="bg-emerald-500 text-black px-8 py-4 font-mono font-bold uppercase text-xs hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Process Bulk Payout
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* Example pending payouts */}
             {jams.flatMap(j => j.slots.filter(s => (s.status === 'confirmed' || s.status === 'held') && s.heldBy).map(s => (
               <div key={`${j.id}-${s.id}`} className="bg-white/5 border border-white/10 p-4 space-y-2">
                 <p className="text-xs text-white/50 font-mono uppercase">{new Date(j.date).toLocaleDateString()}</p>
                 <p className="font-bold">{s.heldBy?.name || 'Sessionist'}</p>
                 <p className="font-mono text-[#D1FF26] font-bold">€{s.rateLocked || s.offerRate || 250}</p>
               </div>
             )))}
          </div>
        </div>
      )}
    </div>
  );
};
