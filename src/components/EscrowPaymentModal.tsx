import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, Activity, CheckCircle, X } from 'lucide-react';

interface EscrowPaymentModalProps {
  amount: number;
  recipientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({ amount, recipientName, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111] border border-white/10 p-6 md:p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {success ? (
           <div className="text-center space-y-4 py-8">
             <CheckCircle className="w-16 h-16 text-brand-accent mx-auto" />
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Funds Secured</h3>
             <p className="text-xs text-white/50 font-mono">€{amount.toLocaleString()} has been securely processed.</p>
           </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-accent/10 flex items-center justify-center rounded-none border border-brand-accent/30">
                <ShieldCheck className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Lock Funds</h3>
                <p className="text-xs text-white/40 font-mono">Secure Payment Checkout</p>
              </div>
            </div>

            <div className="bg-black/50 border border-white/5 p-4 mb-6 flex justify-between items-center text-sm font-sans">
              <span className="text-white/60">Payee: <span className="text-white font-bold">{recipientName}</span></span>
              <span className="text-brand-accent font-black tracking-widest text-lg">€{amount.toLocaleString()}</span>
            </div>

            <form onSubmit={handlePay} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Card Details (Simulated)</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000" 
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 pl-10 pr-3 py-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/30 font-mono"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Expiry</label>
                  <input 
                    type="text" 
                    required
                    placeholder="MM/YY" 
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-3 py-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/30 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">CVC</label>
                  <input 
                    type="text" 
                    required
                    placeholder="123" 
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-3 py-3 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/30 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                 <button 
                   type="submit" 
                   disabled={loading || !cardNumber}
                   className="w-full bg-brand-accent hover:bg-[#bce620] text-black font-black uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   {loading ? (
                     <><Activity className="w-4 h-4 animate-spin" /> Verifying Vault...</>
                   ) : (
                     <><Lock className="w-4 h-4" /> Secure Payment of €{amount.toLocaleString()}</>
                   )}
                 </button>
                 <p className="text-center text-[9px] text-white/40 font-mono leading-relaxed">
                   Funds are cryptographically locked until the project is marked completed.
                 </p>
              </div>
            </form>
          </  >
        )}
      </div>
    </div>
  );
};
