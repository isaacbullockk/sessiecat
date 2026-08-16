import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, CreditCard, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

// Stripe promise
// @ts-ignore
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_sample');

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
}

const CheckoutForm = ({ amount, onSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'An unknown error occurred');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsProcessing(false);
      onSuccess();
    } else {
      setIsProcessing(false);
      setErrorMessage('Payment did not complete successfully.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement className="my-4" options={{ 
        layout: 'tabs',
        fields: {
          billingDetails: {
            name: 'auto',
            email: 'auto'
          }
        }
      }} />
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs flex gap-2">
           <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
           {errorMessage}
        </div>
      )}
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-[#D1FF26] text-black font-black uppercase tracking-widest text-[11px] py-3.5 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? 'Processing payment...' : `Pay Securely (€${amount})`}
        {!isProcessing && <ArrowRight className="w-4 h-4" />}
      </button>
      <p className="text-[9px] text-white/40 font-mono text-center mt-3 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Secured by Stripe — Supports iDEAL & Credit Card
      </p>
    </form>
  );
};

interface PaymentEscrowWidgetProps {
  amount: number;
  onSuccess?: () => void;
}

export function PaymentEscrowWidget({ amount, onSuccess }: PaymentEscrowWidgetProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isMockKey, setIsMockKey] = useState(false);

  useEffect(() => {
    if (amount <= 0) return;

    // Check if we hit internal API to get standard payment intent
    fetch('/api/create-payment-intent', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: 'eur' }),
    }).then(r => r.json()).then(data => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else if (data.error && data.error.includes("Stripe is not configured")) {
        // Mock fallback if Stripe server keys are missing
        setIsMockKey(true);
      }
    }).catch(err => {
      console.warn("Could not fetch payment intent, turning on fallback mode.", err);
      setIsMockKey(true);
    });
  }, [amount]);

  if (amount <= 0) {
    return (
      <div className="p-6 bg-black/50 border border-white/5 flex flex-col items-center justify-center min-h-[200px] text-center">
         <ShieldCheck className="w-10 h-10 text-white/20 mb-3" />
         <p className="text-white/40 text-[11px] font-mono uppercase tracking-widest">Payment Ready</p>
         <p className="text-white/30 text-xs mt-1">Add artists to compute totals</p>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="p-8 border border-[#D1FF26]/30 bg-[#D1FF26]/5 flex flex-col items-center justify-center text-center">
         <CheckCircle className="w-12 h-12 text-[#D1FF26] mb-4" />
         <h4 className="text-white uppercase font-black text-lg tracking-wider">Payment Secured</h4>
         <p className="text-white/60 text-sm mt-2 max-w-sm">
            €{amount} has been successfully secured. Funds will be released via CAO automatic split payments post-performance.
         </p>
         <div className="mt-6 px-4 py-2 border border-[#D1FF26]/20 bg-black text-[#D1FF26] font-mono text-[10px] break-all max-w-full">
            ESCROW_REF_TRX_9281XAC
         </div>
      </div>
    );
  }

  return (
    <div className="border border-brand-accent/20 bg-black/60 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="mb-6 flex items-start gap-4 border-b border-white/5 pb-5">
        <div className="p-2.5 bg-brand-accent/10 border border-brand-accent/20">
          <CreditCard className="w-5 h-5 text-brand-accent" />
        </div>
        <div>
          <h4 className="text-white font-black uppercase tracking-wider">Secure Payment processing</h4>
          <p className="text-white/50 text-[11px] mt-1 max-w-md">
            Pay with iDEAL or Credit Card. Funds are securely held and dispersed according to CAO popmuziek union frameworks.
          </p>
        </div>
      </div>

      {isMockKey ? (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 text-xs font-mono text-amber-300 mb-4 flex gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0" />
             <div>
               <strong className="block text-amber-200 mb-1">Stripe keys missing (.env)</strong>
               Running in fallback preview mode. You can test the interaction flow, but this represents a live checkout element that would render here.
             </div>
          </div>
          <button 
            onClick={() => {
              setIsPaid(true);
              if (onSuccess) onSuccess();
            }}
            className="w-full bg-[#D1FF26] text-black font-black uppercase tracking-widest text-[11px] py-3.5 hover:bg-white transition flex items-center justify-center gap-2"
          >
            Mock Payment (€{amount})
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => {
              setIsPaid(true);
              if (onSuccess) onSuccess();
            }}
            className="w-full mt-3 bg-transparent border border-white/20 text-white/70 font-bold uppercase tracking-widest text-[10px] py-3 hover:bg-white/5 hover:text-white transition flex items-center justify-center gap-2"
          >
            Skip payment for now
          </button>
        </div>
      ) : (
        clientSecret ? (
          <div className="space-y-4">
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#D1FF26' } } }}>
              <CheckoutForm amount={amount} onSuccess={() => {
                setIsPaid(true);
                if (onSuccess) onSuccess();
              }} />
            </Elements>
            <div className="pt-2 text-center">
              <button 
                onClick={() => {
                  setIsPaid(true);
                  if (onSuccess) onSuccess();
                }}
                className="w-full bg-transparent border border-white/20 text-white/70 font-bold uppercase tracking-widest text-[10px] py-3 hover:bg-white/5 hover:text-white transition flex items-center justify-center gap-2"
              >
                Skip payment for now
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 font-mono text-[10px] uppercase text-white/40 animate-pulse">
             Initializing Secure Socket...
          </div>
        )
      )}
    </div>
  );
}
