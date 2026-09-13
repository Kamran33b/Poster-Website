import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  Truck, 
  ArrowLeft, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ShippingAddress } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    discountAmount,
    shippingCost,
    cartTotal,
    setCurrentView,
    placeOrder,
    user,
    showToast
  } = useStore();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Customer & Shipping Form
  const defaultAddr = user?.addresses[0];
  const [fullName, setFullName] = useState(defaultAddr?.fullName || user?.name || '');
  const [email, setEmail] = useState(defaultAddr?.email || user?.email || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || user?.phone || '');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [apartment, setApartment] = useState(defaultAddr?.apartment || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || 'CA');
  const [zipCode, setZipCode] = useState(defaultAddr?.zipCode || '');
  const [country, setCountry] = useState(defaultAddr?.country || 'United States');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'Credit / Debit Card' | 'Apple Pay' | 'PayPal'>('Credit / Debit Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('382');
  const [cardName, setCardName] = useState(fullName || 'Sarah Jenkins');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-stone-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500 mb-6">Add physical posters to proceed with checkout.</p>
        <button
          type="button"
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Explore Gallery
        </button>
      </div>
    );
  }

  const effectiveShipping = shippingMethod === 'express' ? shippingCost + 12 : shippingCost;
  const effectiveTotal = parseFloat((cartTotal + (shippingMethod === 'express' ? 12 : 0)).toFixed(2));

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !street || !city || !zipCode) {
      setErrorMessage('Please fill out all required delivery fields.');
      return;
    }
    setErrorMessage(null);
    setStep('payment');
  };

  const handleProcessPaymentAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Process secure payment through backend gateway API
      const paymentRes = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          amount: effectiveTotal,
          cardLast4: '4242'
        })
      });
      const paymentData = await paymentRes.json();

      if (!paymentData.success) {
        throw new Error('Payment authorization failed. Please check details.');
      }

      // 2. Register real order in the database
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        sizeName: item.size.dimensions,
        frameName: item.frame.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: parseFloat((item.unitPrice * item.quantity).toFixed(2))
      }));

      const shippingAddressData: ShippingAddress = {
        fullName,
        email,
        phone: phone || '+1 (555) 000-0000',
        street,
        apartment,
        city,
        state,
        zipCode,
        country
      };

      const newOrder = await placeOrder({
        customer: {
          fullName,
          email,
          phone: phone || '+1 (555) 000-0000'
        },
        shippingAddress: shippingAddressData,
        items: orderItems,
        subtotal: cartSubtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        shipping: effectiveShipping,
        tax: parseFloat(((cartSubtotal - discountAmount) * 0.07).toFixed(2)),
        total: effectiveTotal,
        status: 'Processing',
        shippingCarrier: shippingMethod === 'express' ? 'FedEx Priority Art Express' : 'FedEx Ground Gallery Care',
        trackingNumber: `FX-${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        estimatedDelivery: shippingMethod === 'express' ? '2 Business Days' : '4-5 Business Days',
        paymentMethod,
        paymentStatus: 'Paid'
      });

      showToast(`Payment successful! Order #${newOrder.orderNumber} confirmed.`);
      setCurrentView('order-confirmation');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Payment processing failed. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setCurrentView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shopping</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted 256-Bit SSL Checkout</span>
          </div>
        </div>

        {/* Steps Breadcrumb */}
        <div className="flex items-center justify-center gap-4 mb-10 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-amber-700' : 'text-stone-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
              step === 'shipping' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {step === 'payment' ? '✓' : '1'}
            </span>
            <span>Delivery Details</span>
          </div>

          <ChevronRight className="w-4 h-4 text-stone-300" />

          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-amber-700 font-bold' : 'text-stone-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
              step === 'payment' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'
            }`}>
              2
            </span>
            <span>Secure Payment Gateway</span>
          </div>
        </div>

        {/* Two-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Interactive Step Forms */}
          <div className="lg:col-span-7">
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {step === 'shipping' ? (
              <form onSubmit={handleShippingSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-normal text-stone-950 mb-1">
                    Shipping & Delivery Address
                  </h2>
                  <p className="text-xs text-stone-500">
                    Where should we dispatch your custom framed art prints?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-stone-700 mb-1">Recipient Full Name *</label>
                    <input
                      id="checkout-fullname"
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Email Address *</label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      placeholder="sarah.jenkins@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Mobile Phone (for delivery SMS)</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-stone-700 mb-1">Street Address *</label>
                    <input
                      id="checkout-street"
                      type="text"
                      required
                      placeholder="742 Evergreen Terrace"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Apt / Suite / Floor (Optional)</label>
                    <input
                      type="text"
                      placeholder="Apt 4B"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">City *</label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      placeholder="Portland"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">State / Province *</label>
                    <input
                      id="checkout-state"
                      type="text"
                      required
                      placeholder="OR"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">ZIP / Postal Code *</label>
                    <input
                      id="checkout-zip"
                      type="text"
                      required
                      placeholder="97201"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Shipping Method Selection */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Select Shipping Care Option
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShippingMethod('standard')}
                      className={`p-3.5 rounded-xl text-left border flex items-start justify-between transition-all ${
                        shippingMethod === 'standard'
                          ? 'border-stone-950 bg-stone-50 ring-1 ring-stone-950'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          Standard Gallery Courier
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          3–5 Business Days • Reinforced packaging
                        </div>
                      </div>
                      <span className="text-xs font-bold text-stone-900">
                        {shippingCost === 0 ? 'FREE' : `$${shippingCost}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMethod('express')}
                      className={`p-3.5 rounded-xl text-left border flex items-start justify-between transition-all ${
                        shippingMethod === 'express'
                          ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-600'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-stone-900 flex items-center gap-1">
                          <span>Express Priority Art Care</span>
                          <Sparkles className="w-3 h-3 text-amber-600" />
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          1–2 Business Days • Priority dispatch
                        </div>
                      </div>
                      <span className="text-xs font-bold text-stone-900">
                        +$12.00
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  id="checkout-continue-payment-btn"
                  type="submit"
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleProcessPaymentAndOrder} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-stone-950 mb-1">
                      Payment Gateway Integration
                    </h2>
                    <p className="text-xs text-stone-500">
                      Encrypted gateway simulated for authorized test transactions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs font-semibold text-stone-600 hover:text-stone-950 underline"
                  >
                    Edit Shipping
                  </button>
                </div>

                {/* Payment Gateway Method Tabs */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'Credit / Debit Card', label: 'Credit Card', icon: CreditCard },
                    { id: 'Apple Pay', label: 'Apple Pay', icon: ShieldCheck },
                    { id: 'PayPal', label: 'PayPal', icon: Lock }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-stone-950 bg-stone-900 text-white shadow-md'
                            : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Card Fields */}
                {paymentMethod === 'Credit / Debit Card' ? (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3.5 text-xs">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          id="checkout-card-number"
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono tracking-wider"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">
                          TEST CARD
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Expiration (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Security CVV</label>
                        <input
                          type="text"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
                    <p className="text-xs text-stone-600">
                      You will authorize <strong>${effectiveTotal}</strong> with <strong>{paymentMethod}</strong> via secure biometric tokenization.
                    </p>
                  </div>
                )}

                {/* Recipient summary recap */}
                <div className="p-3.5 bg-stone-100/70 rounded-xl text-xs text-stone-600 space-y-1">
                  <div className="font-semibold text-stone-900">Ship to:</div>
                  <div>{fullName} • {street}, {city}, {state} {zipCode}</div>
                </div>

                {/* Final Submit Button */}
                <button
                  id="checkout-pay-btn"
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Authorizing Payment via Encrypted Gateway...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-emerald-200" />
                      <span>Authorize & Place Order • ${effectiveTotal}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5 self-start">
            <h3 className="font-serif text-lg font-semibold text-stone-950 pb-3 border-b border-stone-100">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} prints)
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-3 items-center text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-16 object-cover rounded shadow-sm shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-stone-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-stone-500">{item.size.name} • {item.frame.name}</p>
                    <span className="text-stone-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-stone-950 font-mono">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-stone-900">${cartSubtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-amber-700">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span className="font-mono font-medium">-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                <span className="font-mono font-medium text-stone-900">
                  {effectiveShipping === 0 ? 'FREE' : `$${effectiveShipping}`}
                </span>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>Sales Tax (7%)</span>
                <span className="font-mono font-medium">
                  ${(((cartSubtotal - discountAmount) * 0.07)).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-stone-950 pt-3 border-t border-stone-200">
                <span>Total Due</span>
                <span className="font-serif text-lg text-stone-950">
                  ${effectiveTotal}
                </span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                <span>Protected Fine Art Packaging</span>
              </div>
              <p>Reinforced triangular tube packaging with protective tissue barrier to prevent surface scuffing.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
