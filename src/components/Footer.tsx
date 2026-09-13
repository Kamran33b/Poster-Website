import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, RefreshCw, SlidersHorizontal, Heart, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    setCurrentView, 
    setSelectedCategory,
    openAdminPortal
  } = useStore();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* Guarantees Ribbon */}
      <div className="border-b border-stone-800/80 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-amber-400 shrink-0 border border-stone-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-white uppercase tracking-wider">Museum-Grade Quality</h5>
              <p className="text-[11px] text-stone-400 mt-0.5">Heavy 200 gsm acid-free archival matte paper</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-amber-400 shrink-0 border border-stone-800">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-white uppercase tracking-wider">Protected Shipping</h5>
              <p className="text-[11px] text-stone-400 mt-0.5">Reinforced cardboard tubes and corner casing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-amber-400 shrink-0 border border-stone-800">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-white uppercase tracking-wider">30-Day Guarantee</h5>
              <p className="text-[11px] text-stone-400 mt-0.5">Hassle-free returns or print replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-amber-400 shrink-0 border border-stone-800">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-white uppercase tracking-wider">Custom Hand-Framed</h5>
              <p className="text-[11px] text-stone-400 mt-0.5">Solid oak and anodized aluminum frames</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold tracking-[0.25em] text-white">
                LUMINA
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-[0.35em] text-stone-500">
                Fine Art Posters
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Lumina creates and curates tactile physical art prints for modern living spaces. 
              Our studio combines classical art curation with certified sustainable paper, 
              archival mineral pigment inks, and hand-finished framing.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[11px] font-mono text-stone-500">Curated in Copenhagen & New York</span>
            </div>
          </div>

          {/* Col 2: Art Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Bauhaus & Geometry');
                    setCurrentView('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Bauhaus & Geometry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Botanical & Flora');
                    setCurrentView('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Botanical & Flora
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Japanese Woodblock & Heritage');
                    setCurrentView('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Japanese Woodblock
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Architectural & Brutalism');
                    setCurrentView('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Architectural & Brutalism
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Abstract Expressionism');
                    setCurrentView('shop');
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Abstract Expressionism
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Accounts */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('account')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Order Tracking & History
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('account')}
                  className="hover:text-amber-400 transition-colors"
                >
                  My Saved Wishlist
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('account')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Customer Account
                </button>
              </li>
              <li>
                <span className="text-stone-500">Shipping & Delivery (3-5 Days)</span>
              </li>
              <li>
                <span className="text-stone-500">Frame Assembly Guide</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Management & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Store Operations</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  id="footer-admin-link"
                  type="button"
                  onClick={openAdminPortal}
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              </li>
              <li>
                <span className="text-stone-500">Live Inventory Management</span>
              </li>
              <li>
                <span className="text-stone-500">Real-Time Database Sync</span>
              </li>
              <li>
                <span className="text-stone-500">Coupon Generator</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with payment icons & copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} LUMINA Fine Art Posters. All rights reserved. Physical prints crafted on demand.
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-stone-900 rounded text-[10px] font-mono text-stone-400 border border-stone-800">
              SSL 256-Bit Encrypted
            </span>
            <span className="px-2 py-1 bg-stone-900 rounded text-[10px] font-mono text-stone-400 border border-stone-800">
              Visa / MC / Amex
            </span>
            <span className="px-2 py-1 bg-stone-900 rounded text-[10px] font-mono text-stone-400 border border-stone-800">
              Apple Pay
            </span>
            <span className="px-2 py-1 bg-stone-900 rounded text-[10px] font-mono text-stone-400 border border-stone-800">
              PayPal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
