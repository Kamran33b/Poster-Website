import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowRight, Flame } from 'lucide-react';

export const BestSellersSection: React.FC = () => {
  const { products, setCurrentView, setShopFilterTab, setSelectedCategory } = useStore();

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  const handleViewAllBestSellers = () => {
    setSelectedCategory('All');
    setShopFilterTab('best-sellers');
    setCurrentView('shop');
  };

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-amber-700 mb-1">
            <Flame className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
            <span>Collector Favorites</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 font-normal">
            Most Coveted Best Sellers
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md">
            Our most frequently ordered archival museum posters, curated for contemporary aesthetics and tactile depth.
          </p>
        </div>

        <motion.button
          id="view-all-bestsellers-btn"
          type="button"
          whileHover="hover"
          whileTap="tap"
          initial="initial"
          onClick={handleViewAllBestSellers}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-amber-700 select-none cursor-pointer self-start sm:self-auto"
        >
          <span>Explore All Best Sellers</span>
          <motion.span
            variants={{
              initial: { x: 0 },
              hover: { x: 4 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </motion.button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {bestSellers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
