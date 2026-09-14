import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  Truck,
  Check
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    shippingCost,
    cartTotal,
    setCurrentView,
    formatPrice,
    settings
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplying(true);
    setCouponFeedback(null);
    const res = await applyCoupon(couponCodeInput);
    setCouponFeedback(res);
    setIsApplying(false);
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
  };

  const freeShippingThreshold = settings.freeShippingThreshold || 2999;
  const progressToFreeShipping = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, parseFloat((freeShippingThreshold - cartSubtotal).toFixed(2)));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-drawer-backdrop"
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] shadow-2xl flex flex-col border-l border-stone-200">
          
          {/* Header */}
          <div className="p-5 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="font-serif text-lg font-semibold text-stone-950">
                Your Art Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              id="close-cart-btn"
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-200/80 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-amber-900 font-medium">
                  <span>Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more for free museum shipping</span>
                  <Truck className="w-4 h-4 text-amber-700" />
                </div>
                <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>You unlocked free climate-neutral museum shipping!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Discover curated architectural prints, botanicals, and Japanese woodblock masterpieces.
                </p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, backgroundColor: '#1c1917' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('shop');
                  }}
                  className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold select-none cursor-pointer"
                >
                  Explore Poster Gallery
                </motion.button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex gap-3.5 items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-22 object-cover rounded shadow-sm shrink-0 border border-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {item.size.dimensions.split('(')[0]}
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Frame: {item.frame.name}
                    </p>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartId, -1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-950"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartId, 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-950"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-950 font-mono">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-stone-200 space-y-4">
              
              {/* Promo code field */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-700" />
                      <span className="font-semibold text-amber-900">
                        Coupon <strong>{appliedCoupon.code}</strong> applied!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-amber-800 hover:text-amber-950 underline font-semibold text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      id="cart-coupon-input"
                      type="text"
                      placeholder="Coupon (e.g. POSTER15)"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg uppercase tracking-wider focus:outline-none focus:border-stone-900"
                    />
                    <button
                      id="cart-coupon-apply-btn"
                      type="submit"
                      disabled={isApplying}
                      className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponFeedback && !couponFeedback.success && (
                  <p className="text-[11px] text-rose-600 mt-1">{couponFeedback.message}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900 font-mono">{formatPrice(cartSubtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-amber-700">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-medium font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-stone-900 font-mono">
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Estimated Tax ({settings.taxRate || 18}%)</span>
                  <span className="font-mono">
                    {formatPrice((cartSubtotal - discountAmount) * ((settings.taxRate || 18) / 100))}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="text-base font-serif font-bold text-stone-950">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-checkout-btn"
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
