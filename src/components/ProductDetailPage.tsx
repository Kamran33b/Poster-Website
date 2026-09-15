import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  Heart, 
  ShoppingBag, 
  Zap, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Eye, 
  Maximize2,
  ChevronLeft,
  ChevronDown,
  Share2,
  Send
} from 'lucide-react';
import { PosterSize, FrameOption } from '../types';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    setCurrentView,
    addToCart,
    toggleWishlist,
    isInWishlist,
    reviews,
    submitReview,
    showToast,
    formatPrice,
    settings
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  // Selected configurations
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<PosterSize>(product?.sizes[0] || {
    id: 's-a4',
    name: 'A4 Size',
    dimensions: '21 × 30 cm (8.3 × 11.7″)',
    priceMultiplier: 1.0,
    inStock: true
  });

  // Sync selected size if product changes
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      if (!product.sizes.some((s) => s.id === selectedSize.id)) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);
  const [selectedFrame, setSelectedFrame] = useState<FrameOption>(product?.frameOptions[0] || {
    id: 'f-none',
    name: 'Print Only (Unframed)',
    material: 'Archival 200gsm Matte Paper',
    price: 0,
    colorHex: '#e5e5e5',
    borderStyle: 'border-transparent'
  });
  const [quantity, setQuantity] = useState(1);
  const [isRoomView, setIsRoomView] = useState(false);
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { left, top, width, height } = elem.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;
    setMagnifierPos({ x, y, bgX, bgY });
  };

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-stone-900 mb-4">Poster not found</h2>
        <button
          type="button"
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // Calculate live dynamic price
  const basePrice = product.discountPrice || product.price;
  const calculatedUnitPrice = parseFloat((basePrice * selectedSize.priceMultiplier + selectedFrame.price).toFixed(2));
  const hasDiscount = Boolean(product.discountPrice);

  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Related products from same category or collection
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.collection === product.collection))
    .slice(0, 3);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedFrame, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedFrame, quantity);
    setCurrentView('checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      showToast('Please fill in your name and review comment');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await submitReview({
        productId: product.id,
        productName: product.name,
        author: reviewAuthor,
        rating: reviewRating,
        title: reviewTitle || 'Exceptional print quality',
        comment: reviewComment,
        verified: true,
        location: 'Verified Collector'
      });
      setShowReviewForm(false);
      setReviewAuthor('');
      setReviewTitle('');
      setReviewComment('');
      showToast('Thank you! Your verified review has been published.');
    } catch {
      showToast('Failed to post review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper for dynamic frame styling
  const getFrameCssBorder = (frame: FrameOption) => {
    if (frame.id === 'f-none') return 'border-stone-200 border-[1px]';
    if (frame.id === 'f-oak') return 'border-[#9c723f] border-[14px] shadow-2xl';
    if (frame.id === 'f-black') return 'border-[#18181b] border-[12px] shadow-2xl';
    if (frame.id === 'f-white') return 'border-[#fafafa] border-[14px] shadow-2xl ring-1 ring-stone-300';
    if (frame.id === 'f-brass') return 'border-[#d4af37] border-[10px] shadow-2xl';
    return 'border-stone-800 border-[10px]';
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <button
            id="back-to-shop-btn"
            type="button"
            onClick={() => setCurrentView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Collection</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard');
              }}
              className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/60 transition-colors"
              title="Share print"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="detail-wishlist-toggle"
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`p-2 rounded-full border transition-colors ${
                inWishlist
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-stone-300 bg-white text-stone-600 hover:text-stone-950'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left: Gallery & Interactive Visual Frame Stage */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* View Mode Toggle: Studio vs Living Room Preview */}
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoomView(false)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    !isRoomView ? 'bg-stone-900 text-white' : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  Print Detail
                </button>
                <button
                  type="button"
                  onClick={() => setIsRoomView(true)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isRoomView ? 'bg-stone-900 text-white' : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Room Mockup</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-stone-400">
                Frame: <strong className="text-stone-800">{selectedFrame.name}</strong>
              </span>
            </div>

            {/* Stage Container */}
            <div className="w-full bg-[#f3efe8] rounded-2xl p-6 sm:p-10 border border-stone-200 shadow-inner flex items-center justify-center min-h-[440px] sm:min-h-[540px] relative overflow-hidden">
              
              {isRoomView ? (
                /* Living Room In-Situ Mockup */
                <div className="relative w-full h-[460px] rounded-xl overflow-hidden shadow-2xl border border-stone-300">
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
                    alt="Living Room Mockup"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Poster hung on wall inside mockup */}
                  <div className="absolute left-[34%] top-[16%] w-36 sm:w-44 aspect-[3/4] shadow-2xl">
                    <div className={`w-full h-full bg-white p-1 ${getFrameCssBorder(selectedFrame)}`}>
                      <img
                        src={product.images[selectedImageIdx] || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full">
                    Living room display visualizer
                  </div>
                </div>
              ) : (
                /* Studio Archival Poster with Real-time Frame Border Simulation & Loupe Magnifier */
                <div className="relative max-w-sm sm:max-w-md w-full transition-all duration-300">
                  <motion.div
                    key={selectedFrame.id + selectedSize.id}
                    initial={{ scale: 0.97, opacity: 0.9 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`bg-white transition-all duration-300 ${getFrameCssBorder(selectedFrame)}`}
                  >
                    {/* White Matting Border */}
                    <div className="bg-[#fcfbf9] p-3 sm:p-4">
                      <div
                        className="aspect-[3/4] overflow-hidden bg-stone-100 shadow-sm relative cursor-crosshair group/loupe"
                        onMouseEnter={() => setIsMagnifying(true)}
                        onMouseLeave={() => setIsMagnifying(false)}
                        onMouseMove={handleImageMouseMove}
                      >
                        <img
                          src={product.images[selectedImageIdx] || product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Soft light wash */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

                        {/* Interactive Loupe Magnifier Circle */}
                        {isMagnifying && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute w-36 h-36 rounded-full border-2 border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.35)] pointer-events-none z-20 overflow-hidden"
                            style={{
                              left: `${magnifierPos.x - 72}px`,
                              top: `${magnifierPos.y - 72}px`,
                              backgroundImage: `url(${product.images[selectedImageIdx] || product.images[0]})`,
                              backgroundSize: '300%',
                              backgroundPosition: `${magnifierPos.bgX}% ${magnifierPos.bgY}%`,
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-white/90 bg-black/40 px-1 rounded backdrop-blur-xs">
                              2.5x Archival Zoom
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Dimension tag overlay */}
                  <div className="text-center mt-3 flex items-center justify-center gap-2">
                    <span className="text-xs text-stone-500 font-mono bg-white/80 px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs">
                      Dimensions: {selectedSize.dimensions}
                    </span>
                    <span className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                      Hover image to zoom details
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery Row */}
            <div className="flex items-center gap-3 mt-4 overflow-x-auto w-full justify-center py-1">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImageIdx(idx);
                    setIsRoomView(false);
                  }}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIdx === idx && !isRoomView
                      ? 'border-stone-950 shadow-md scale-105'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details, Size/Frame Selectors & CTAs */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-1.5">
                <span className="uppercase tracking-widest text-amber-800 font-semibold">{product.category}</span>
                <span className="font-mono text-stone-400">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-stone-950 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-900">{product.rating}</span>
                  <span className="text-xs text-stone-500">({product.reviewCount} reviews)</span>
                </div>

                <span className="text-stone-300">•</span>

                <span className={`text-xs font-medium flex items-center gap-1 ${
                  product.stock > 10 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {product.stock > 10 ? `In Stock (${product.stock} available)` : `Only ${product.stock} left in lab`}
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-serif text-stone-950">
                    {formatPrice(calculatedUnitPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-stone-400 line-through">
                      {formatPrice(product.price * selectedSize.priceMultiplier + selectedFrame.price)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded uppercase">
                      Special Rate
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Includes taxes. Free shipping on orders over {formatPrice(settings.freeShippingThreshold)}.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Collection</span>
                <span className="text-xs font-semibold text-stone-800">{product.collection}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* 1. Size Selection Dropdown with Dynamic Price Calculation */}
            <div className="space-y-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="product-size-select" className="font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5 cursor-pointer">
                  <span>1. Select Poster Size</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full font-mono">
                    {selectedSize.name}
                  </span>
                </label>
                <span className="text-stone-500 font-mono text-[11px]">
                  {selectedSize.dimensions}
                </span>
              </div>

              {/* Main Size Dropdown (<select>) */}
              <div className="relative">
                <select
                  id="product-size-select"
                  value={selectedSize.id}
                  onChange={(e) => {
                    const found = product.sizes.find((s) => s.id === e.target.value);
                    if (found) setSelectedSize(found);
                  }}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-stone-900 appearance-none focus:outline-none focus:ring-2 focus:ring-stone-950 focus:bg-white transition-all cursor-pointer pr-10 shadow-2xs"
                >
                  {product.sizes.map((sz) => {
                    const szUnitPrice = basePrice * sz.priceMultiplier + selectedFrame.price;
                    const isCurrent = sz.id === selectedSize.id;
                    const diff = szUnitPrice - calculatedUnitPrice;
                    const diffText = isCurrent 
                      ? ' (Selected)' 
                      : diff > 0 
                        ? ` (+${formatPrice(diff)})` 
                        : ` (-${formatPrice(Math.abs(diff))})`;

                    return (
                      <option key={sz.id} value={sz.id} className="py-1">
                        {sz.name} — {sz.dimensions} | {formatPrice(szUnitPrice)}{diffText}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-600">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize.id === sz.id;
                  const szUnitPrice = basePrice * sz.priceMultiplier + selectedFrame.price;
                  return (
                    <motion.button
                      key={sz.id}
                      type="button"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => setSelectedSize(sz)}
                      className={`p-2 rounded-xl text-center border cursor-pointer select-none transition-colors ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white shadow-md'
                          : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300 text-stone-800'
                      }`}
                    >
                      <div className="font-serif text-xs font-bold truncate">{sz.name}</div>
                      <div className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                        {formatPrice(szUnitPrice)}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 2. Custom Frame Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-800">
                  2. Select Frame Option
                </span>
                <span className="text-stone-500 font-medium">
                  {selectedFrame.price === 0 ? 'Included' : `+${formatPrice(selectedFrame.price)}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.frameOptions.map((frame) => {
                  const isSelected = selectedFrame.id === frame.id;
                  return (
                    <motion.button
                      key={frame.id}
                      type="button"
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => setSelectedFrame(frame)}
                      className={`p-2.5 rounded-xl text-left border flex items-center gap-3 cursor-pointer select-none transition-colors ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      {/* Frame color swatch indicator */}
                      <span
                        className="w-5 h-5 rounded-full border border-stone-300 shrink-0 shadow-sm"
                        style={{ backgroundColor: frame.colorHex }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {frame.name}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {frame.price === 0 ? 'Print only' : `+${formatPrice(frame.price)}`}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-700 shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center bg-white border border-stone-300 rounded-xl p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-950 font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-950 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  id="add-to-cart-btn"
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Add to Cart • {formatPrice(calculatedUnitPrice * quantity)}</span>
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                id="buy-now-btn"
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-stone-950" />
                <span>Buy Now with Instant Checkout</span>
              </button>
            </div>

            {/* Quality Specs Guarantee */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2 text-stone-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Artisan Physical Print Specifications</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-stone-500 text-[11px]">
                <li>Paper: 200 gsm acid-free museum-grade fine art matte</li>
                <li>Inks: 12-color archival pigment inks rated for 75+ years fade resistance</li>
                <li>Framing: Solid FSC-certified oak wood or anodized aluminum with shatterproof acrylic glass</li>
                <li>Packaging: Reinforced heavy-duty cardboard packaging with protective corners</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Product Reviews & Write Review Section */}
        <section className="mt-20 pt-12 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-serif text-2xl font-normal text-stone-950">
                Customer Reviews ({productReviews.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Verified feedback from collectors who ordered this exact artwork
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 rounded-xl text-xs font-semibold shadow-sm self-start sm:self-auto"
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-10 bg-white p-6 rounded-2xl border border-stone-300 shadow-md max-w-2xl">
              <h3 className="font-serif text-base font-semibold text-stone-900 mb-4">
                Review this Art Print
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clara Henderson"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewRating(num)}
                        className={`p-2 rounded-lg border flex items-center gap-1 ${
                          reviewRating >= num
                            ? 'bg-amber-50 border-amber-400 text-amber-700 font-bold'
                            : 'border-stone-200 text-stone-400'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Stunning paper finish and rich pigments"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share how this poster looks in your space, frame craftsmanship, packaging, etc."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold flex items-center gap-1.5 hover:bg-stone-800 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSubmittingReview ? 'Publishing...' : 'Submit Verified Review'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {productReviews.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              Be the first collector to review "{product.name}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productReviews.map((rev) => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-400">{rev.date}</span>
                  </div>

                  <h4 className="font-serif text-sm font-semibold text-stone-900">
                    "{rev.title}"
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    {rev.comment}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-800">{rev.author}</span>
                    <span className="text-emerald-700 font-medium">✓ Verified Purchase</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Artworks */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-stone-200">
            <h2 className="font-serif text-2xl font-normal text-stone-950 mb-6">
              Complementary Artworks from {product.collection}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
