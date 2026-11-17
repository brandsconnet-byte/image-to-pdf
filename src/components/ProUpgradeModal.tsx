import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Zap, ArrowLeft, ExternalLink } from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirectFallback, setShowDirectFallback] = useState(false);

  if (!isOpen) return null;

  const directCheckoutUrl = `https://buy.polar.sh/df9d7e1b-60d4-4ac2-8d91-aabb80d586ce`;

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: 'df9d7e1b-60d4-4ac2-8d91-aabb80d586ce' 
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from Polar');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not load checkout automatically.');
      setShowDirectFallback(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative">
        {/* Navigation & Close */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold backdrop-blur-md"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer backdrop-blur-md"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-700 pt-16 pb-8 px-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 text-amber-300">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Unlock ImageToPDF PRO</h2>
          <p className="text-indigo-100 text-xs mt-1 max-w-xs mx-auto">
            Lifetime access to all advanced features, batch conversions, and OCR.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-900 font-black text-sm shadow-md">
            <span>$5 USD</span>
            <span className="text-[11px] font-normal opacity-90">• One-time payment</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-medium">Unlimited batch image-to-PDF conversions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-medium">Advanced OCR text recognition & search</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-medium">Lossless quality & custom page layouts</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-medium">Lifetime updates & priority conversions</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Secure Checkout...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Upgrade Now for $5</span>
                </>
              )}
            </button>

            {/* Direct Link Fallback button */}
            <a
              href={directCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <span>Open Direct Polar Checkout Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure checkout powered by Polar & Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
