import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, Star, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductId, setCurrentView, toggleWishlist, isInWishlist, addToCart, formatPrice } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImageIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6; // Max 6deg tilt
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0];
    const defaultFrame = product.frameOptions[0];
    addToCart(product, defaultSize, defaultFrame, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      style={{ perspective: 1000 }}
      className="group relative cursor-pointer flex flex-col bg-white rounded-xl border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-shadow duration-300 overflow-hidden"
    >
      {/* Poster Image Stage with Mock Frame Matting */}
      <div className="relative w-full aspect-[3/4] bg-[#f4efe8] p-4 sm:p-5 flex items-center justify-center overflow-hidden">
        {/* Frame / Paper Shadow with inset shift */}
        <motion.div
          className="relative w-full h-full shadow-[0_6px_20px_rgba(0,0,0,0.15)] bg-white p-1.5 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <img
            src={product.images[selectedImageIdx] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Glare / Studio reflection overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundPosition: `${(tilt.y + 6) * 10}% ${(tilt.x + 6) * 10}%`,
            }}
          />
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wider uppercase">
              Save {discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-stone-900 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wider uppercase">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-stone-100 text-stone-800 border border-stone-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wider uppercase">
              New Drop
            </span>
          )}
        </div>

        {/* Wishlist Heart Button with Heartbeat Particle Burst */}
        <motion.button
          id={`wishlist-toggle-${product.id}`}
          type="button"
          onClick={handleWishlistToggle}
          whileTap={{ scale: 0.75 }}
          whileHover={{ scale: 1.1 }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-950 shadow-sm opacity-90 group-hover:opacity-100'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <motion.div
            animate={inWishlist ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
          </motion.div>
        </motion.button>

        {/* Quick Actions Hover Overlay */}
        <div
          className={`absolute bottom-3 inset-x-3 flex gap-2 z-10 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <motion.button
            id={`quick-add-${product.id}`}
            type="button"
            onClick={handleQuickAdd}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 text-xs font-semibold py-2.5 px-3 rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-950 text-white hover:bg-stone-800'
            }`}
          >
            <AnimatePresence mode="wait">
              {justAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Added!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Add</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="p-2.5 bg-white/90 hover:bg-white text-stone-800 rounded-lg shadow-lg transition-colors"
            title="View details and custom frame options"
          >
            <Eye className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1">
            <span className="uppercase tracking-wider truncate">{product.category}</span>
            <div className="flex items-center gap-1 text-stone-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Framing indicator */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-stone-950">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-[11px] text-stone-500 ml-1">
              from {product.sizes[0]?.dimensions.split(' ')[0]}
            </span>
          </div>

          <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
            {product.frameOptions.length} Frames
          </span>
        </div>
      </div>
    </motion.div>
  );
};

