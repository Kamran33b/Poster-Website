import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Check, Copy, Sparkles } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setIsSubscribed(true);
    showToast('Welcome to the Collector Club! Use code POSTER15 for 15% off.');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('POSTER15');
    setCopied(true);
    showToast('Coupon code POSTER15 copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-16 sm:py-20 bg-stone-900 text-stone-100 border-t border-stone-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-amber-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curator’s Circle</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal mb-3">
          Join 18,000+ Design Enthusiasts
        </h2>
        
        <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
          Subscribe for early access to limited edition drops, exhibition retrospectives, and an immediate <strong className="text-white">15% off</strong> your first poster order.
        </p>

        {isSubscribed ? (
          <div className="bg-stone-800/90 border border-stone-700 p-6 rounded-2xl max-w-md mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-white mb-1">
              You're on the Guest List!
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Here is your personal 15% welcome code:
            </p>
            <div className="flex items-center justify-between bg-stone-950 px-4 py-2.5 rounded-xl border border-stone-700">
              <span className="font-mono text-base font-bold text-amber-300 tracking-wider">
                POSTER15
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs font-semibold px-3 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <div className="relative w-full">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="newsletter-email-input"
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-stone-800/90 border border-stone-700 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button
              id="newsletter-submit-btn"
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-bold rounded-xl whitespace-nowrap transition-colors shadow-lg cursor-pointer"
            >
              Get 15% Code
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-6 text-stone-500 text-xs">
          <span>✓ No spam ever</span>
          <span>✓ Unsubscribe anytime</span>
          <span>✓ Archival paper care guides</span>
        </div>
      </div>
    </section>
  );
};
