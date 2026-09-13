import React from 'react';
import { useStore } from '../context/StoreContext';
import { Star, ShieldCheck, ThumbsUp, Quote } from 'lucide-react';

export const CustomerReviewsSection: React.FC = () => {
  const { reviews } = useStore();

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-stone-200 pb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
            Collector Feedback
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-950 font-normal mt-1">
            Loved by Interior Stylists & Homeowners
          </h2>
        </div>

        {/* Aggregate Score Card */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm self-start md:self-auto">
          <div className="text-3xl font-bold font-serif text-stone-950">
            4.9<span className="text-sm font-sans text-stone-400 font-normal">/5</span>
          </div>
          <div className="flex flex-col">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-stone-500 font-medium mt-0.5">
              Based on 280+ verified collector deliveries
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.slice(0, 4).map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Stars & Verified */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Order
                  </span>
                )}
              </div>

              {/* Title & Comment */}
              <h4 className="font-serif text-base font-semibold text-stone-900 mb-2">
                "{rev.title}"
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic line-clamp-4">
                {rev.comment}
              </p>
            </div>

            {/* Author & Artwork Name */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col">
              <span className="text-xs font-semibold text-stone-950">
                {rev.author}
              </span>
              <span className="text-[11px] text-stone-400 truncate">
                Purchased: {rev.productName}
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5">
                {rev.location ? `${rev.location} • ` : ''}{rev.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
