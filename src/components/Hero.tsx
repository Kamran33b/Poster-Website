import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Award, Palette } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setCurrentView, setSelectedProductId, formatPrice } = useStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#f5f1ea] to-[#faf8f5] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-200/80">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e2d9_1px,transparent_1px),linear-gradient(to_bottom,#e7e2d9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-200/70 border border-stone-300 text-stone-800 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Autumn Art Curation 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-950 leading-[1.12]">
              Curated art prints for the <span className="italic font-normal">modern collector</span>.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-2xl">
              Printed on heavy 200 gsm acid-free archival museum paper using 12-color mineral pigments. 
              Paired with handcrafted solid oak and matte aluminum frames ready to hang.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <button
                id="hero-shop-now-btn"
                type="button"
                onClick={() => setCurrentView('shop')}
                className="w-full sm:w-auto px-8 py-4 bg-stone-950 hover:bg-stone-800 text-white font-medium text-sm rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer hover:translate-y-[-1px]"
              >
                <span>Explore Shop</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                id="hero-view-bestsellers-btn"
                type="button"
                onClick={() => {
                  setSelectedProductId('prod-01');
                  setCurrentView('product-detail');
                }}
                className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-stone-100 text-stone-800 font-medium text-sm rounded-xl border border-stone-300 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Featured Print: Bauhaus Form</span>
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-200/90 w-full">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs text-stone-700 font-medium">75-Yr Archival Inks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs text-stone-700 font-medium">Free Shipping &gt;{formatPrice(75)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs text-stone-700 font-medium">FSC Solid Wood Frames</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Fine Art Poster Stage */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-6">
            {/* Ambient Shadow glow */}
            <div className="absolute w-72 h-72 bg-amber-200/30 rounded-full filter blur-3xl -z-10" />

            <div className="relative w-full max-w-md h-[460px] flex items-center justify-center">
              {/* Back Layer Poster 1 (Botanical) */}
              <div 
                onClick={() => {
                  setSelectedProductId('prod-02');
                  setCurrentView('product-detail');
                }}
                className="absolute left-0 top-6 w-52 h-72 bg-white p-2 rounded shadow-2xl border-4 border-stone-800 -rotate-6 transition-transform hover:rotate-0 hover:z-30 cursor-pointer duration-300"
              >
                <img
                  src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80"
                  alt="Eucalyptus botanical print"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 bg-stone-900/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  Botanical No. 12
                </div>
              </div>

              {/* Back Layer Poster 2 (Mount Fuji) */}
              <div 
                onClick={() => {
                  setSelectedProductId('prod-03');
                  setCurrentView('product-detail');
                }}
                className="absolute right-0 top-10 w-56 h-80 bg-white p-2.5 rounded shadow-2xl border-4 border-[#c29b68] rotate-6 transition-transform hover:rotate-0 hover:z-30 cursor-pointer duration-300"
              >
                <img
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80"
                  alt="Mount Fuji Indigo poster"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 left-3 bg-stone-900/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  Solid Oak Framed
                </div>
              </div>

              {/* Center Prominent Poster (Bauhaus Form) */}
              <div 
                onClick={() => {
                  setSelectedProductId('prod-01');
                  setCurrentView('product-detail');
                }}
                className="relative z-20 w-64 h-92 bg-white p-3 rounded-lg shadow-[0_25px_50px_rgba(0,0,0,0.25)] border-[6px] border-stone-900 transition-all hover:scale-105 cursor-pointer duration-300"
              >
                <img
                  src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=85"
                  alt="Bauhaus Form & Space No. 04"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Tag */}
                <div className="absolute -bottom-3 -right-3 bg-amber-500 text-stone-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Best Seller • {formatPrice(28)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
