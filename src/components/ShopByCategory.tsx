import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowUpRight } from 'lucide-react';

export const ShopByCategory: React.FC = () => {
  const { categories, setSelectedCategory, setCurrentView, products } = useStore();

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentView('shop');
  };

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            Curated Expressions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 font-normal mt-1">
            Shop by Category
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('All');
            setCurrentView('shop');
          }}
          className="text-sm font-semibold text-stone-900 hover:text-amber-800 transition-colors inline-flex items-center gap-1 group self-start md:self-auto"
        >
          <span>View All 8 Collections</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat.name).length;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
              />

              {/* Scrim overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent transition-opacity duration-300 group-hover:from-stone-950/90" />

              {/* Text Card content */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                    {count} {count === 1 ? 'Artwork' : 'Artworks'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white text-stone-950">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-normal mt-1 mb-2 tracking-wide">
                  {cat.name}
                </h3>

                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
