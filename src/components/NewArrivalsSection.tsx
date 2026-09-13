import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export const NewArrivalsSection: React.FC = () => {
  const { products, setCurrentView, setShopFilterTab, setSelectedCategory } = useStore();

  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  const handleViewAllNew = () => {
    setSelectedCategory('All');
    setShopFilterTab('new-arrivals');
    setCurrentView('shop');
  };

  return (
    <section className="py-16 sm:py-20 bg-stone-100/50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-amber-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Studio Fresh</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 font-normal">
              New Exhibition Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md">
              Fresh additions from European modernists and Japanese heritage archives, printed on 200 gsm acid-free cotton paper.
            </p>
          </div>

          <button
            id="view-all-new-arrivals-btn"
            type="button"
            onClick={handleViewAllNew}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-amber-700 transition-colors group cursor-pointer self-start sm:self-auto"
          >
            <span>Browse New Drops</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
