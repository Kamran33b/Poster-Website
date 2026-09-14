import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  QrCode,
  Smartphone,
  Copy,
  CheckCircle2,
  Zap,
  MapPin,
  Home,
  Building,
  Compass,
  Plus,
  Trash2,
  Edit3,
  BookmarkCheck,
  CheckCircle
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
    savedAddresses,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    showToast,
    formatPrice,
    settings
  } = useStore();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Available saved addresses list
  const availableAddresses = (savedAddresses && savedAddresses.length > 0)
    ? savedAddresses
    : (user?.addresses && user.addresses.length > 0 ? user.addresses : []);

  const defaultAddr = availableAddresses.find((a) => a.isDefault) || availableAddresses[0];

  // Selected saved address ID or 'new'
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr ? (defaultAddr.id || `${defaultAddr.street}-${defaultAddr.zipCode}`) : 'new'
  );
  const [isEditingFields, setIsEditingFields] = useState<boolean>(false);
  const [saveToAddressBook, setSaveToAddressBook] = useState<boolean>(true);
  const [newAddressLabel, setNewAddressLabel] = useState<string>('Home');

  // Customer & Shipping Form fields
  const [fullName, setFullName] = useState(defaultAddr?.fullName || user?.name || '');
  const [email, setEmail] = useState(defaultAddr?.email || user?.email || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || user?.phone || '');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [apartment, setApartment] = useState(defaultAddr?.apartment || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || 'OR');
  const [zipCode, setZipCode] = useState(defaultAddr?.zipCode || '');
  const [country, setCountry] = useState(defaultAddr?.country || 'United States');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'Credit / Debit Card' | 'UPI' | 'Apple Pay' | 'PayPal'>('Credit / Debit Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('382');
  const [cardName, setCardName] = useState(fullName || 'Sarah Jenkins');
  
  // UPI Specific State
  const [upiSubOption, setUpiSubOption] = useState<'qr' | 'id'>('qr');
  const [upiId, setUpiId] = useState('sarah.art@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('Google Pay');
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync address form when user chooses a saved address
  const handleSelectAddress = (addr: ShippingAddress) => {
    const addrId = addr.id || `${addr.street}-${addr.zipCode}`;
    setSelectedAddressId(addrId);
    setFullName(addr.fullName || user?.name || '');
    setEmail(addr.email || user?.email || '');
    setPhone(addr.phone || user?.phone || '');
    setStreet(addr.street);
    setApartment(addr.apartment || '');
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country || 'United States');
    setNewAddressLabel(addr.label || 'Home');
    setIsEditingFields(false);
    showToast(`Loaded address: "${addr.label || addr.street}"`);
  };

  // Start editing a specific saved address
  const handleStartEditSavedAddress = (addr: ShippingAddress) => {
    const addrId = addr.id || `${addr.street}-${addr.zipCode}`;
    setSelectedAddressId(addrId);
    setFullName(addr.fullName || user?.name || '');
    setEmail(addr.email || user?.email || '');
    setPhone(addr.phone || user?.phone || '');
    setStreet(addr.street);
    setApartment(addr.apartment || '');
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country || 'United States');
    setNewAddressLabel(addr.label || 'Home');
    setIsEditingFields(true);
    showToast(`Editing address: "${addr.label || addr.street}"`);
  };

  // Save changes to current address immediately to address book
  const handleSaveAddressUpdatesToBook = () => {
    if (!fullName.trim() || !street.trim() || !city.trim() || !zipCode.trim()) {
      setErrorMessage('Please fill out the recipient name, street, city, and ZIP code before saving.');
      return;
    }

    const targetId = selectedAddressId !== 'new' ? selectedAddressId : `addr-${Date.now()}`;
    const matchedAddr = availableAddresses.find(a => a.id === targetId || `${a.street}-${a.zipCode}` === targetId);

    saveAddress({
      id: targetId,
      label: newAddressLabel.trim() || matchedAddr?.label || 'Saved Address',
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      street: street.trim(),
      apartment: apartment.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim() || 'United States',
      isDefault: matchedAddr?.isDefault || false
    });

    showToast('Saved changes to your address book.');
  };

  // Handle switching to a fresh new address entry
  const handleAddNewAddressOption = () => {
    setSelectedAddressId('new');
    setFullName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setStreet('');
    setApartment('');
    setCity('');
    setState('CA');
    setZipCode('');
    setCountry('United States');
    setNewAddressLabel('Home');
    setIsEditingFields(true);
  };

  const getAddressIcon = (label?: string) => {
    const l = (label || '').toLowerCase();
    if (l.includes('home') || l.includes('residence')) return Home;
    if (l.includes('studio') || l.includes('creative') || l.includes('design')) return Compass;
    if (l.includes('office') || l.includes('work') || l.includes('gallery') || l.includes('corp')) return Building;
    return MapPin;
  };

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
    if (!fullName.trim() || !email.trim() || !street.trim() || !city.trim() || !zipCode.trim()) {
      setErrorMessage('Please fill out all required delivery fields.');
      return;
    }

    // Save to address book if requested
    if ((selectedAddressId === 'new' || isEditingFields) && saveToAddressBook) {
      saveAddress({
        id: selectedAddressId !== 'new' ? selectedAddressId : `addr-${Date.now()}`,
        label: newAddressLabel.trim() || 'Custom Address',
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        street: street.trim(),
        apartment: apartment.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim() || 'United States',
        isDefault: availableAddresses.length === 0
      });
    }

    setErrorMessage(null);
    setStep('payment');
  };

  const handleProcessPaymentAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'UPI' && upiSubOption === 'id' && !upiId.trim()) {
      setErrorMessage('Please enter a valid UPI ID (e.g. yourname@bank).');
      return;
    }

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
          cardLast4: paymentMethod === 'Credit / Debit Card' ? cardNumber.slice(-4) : undefined,
          upiId: paymentMethod === 'UPI' ? (upiSubOption === 'qr' ? 'lumina.posters@okhdfcbank' : upiId) : undefined,
          upiApp: paymentMethod === 'UPI' ? selectedUpiApp : undefined
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
        upiId: paymentMethod === 'UPI' ? (upiSubOption === 'qr' ? 'lumina.posters@okhdfcbank' : upiId) : undefined,
        upiTransactionRef: paymentData.upiRefNumber || paymentData.transactionId,
        paymentStatus: 'Paid'
      });

      showToast(`Payment verified via ${paymentMethod === 'UPI' ? 'UPI' : paymentMethod}! Order #${newOrder.orderNumber} confirmed.`);
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
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-serif text-xl font-normal text-stone-950">
                      Shipping & Delivery Address
                    </h2>
                    {availableAddresses.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Saved Address Book</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    Choose an existing saved address from your account or enter a new delivery destination.
                  </p>
                </div>

                {/* Saved Addresses Selector Grid */}
                {availableAddresses.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                        <span>Select Saved Address ({availableAddresses.length})</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddNewAddressOption}
                        className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                          selectedAddressId === 'new'
                            ? 'text-amber-800 underline'
                            : 'text-stone-600 hover:text-stone-950'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableAddresses.map((addr, idx) => {
                        const addrId = addr.id || `${addr.street}-${addr.zipCode}`;
                        const isSelected = selectedAddressId === addrId;
                        const Icon = getAddressIcon(addr.label);

                        return (
                          <div
                            key={addrId || idx}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectAddress(addr)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleSelectAddress(addr);
                              }
                            }}
                            className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-stone-900 bg-stone-50/90 ring-2 ring-stone-900 shadow-sm'
                                : 'border-stone-200 hover:border-stone-400 bg-white'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                    isSelected ? 'bg-stone-900 text-amber-400' : 'bg-stone-100 text-stone-600'
                                  }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-semibold text-xs text-stone-900">
                                    {addr.label || `Address #${idx + 1}`}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {addr.isDefault && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                                      Default
                                    </span>
                                  )}
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                                  }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                </div>
                              </div>

                              <div className="text-[11px] text-stone-600 space-y-0.5">
                                <p className="font-medium text-stone-950">{addr.fullName}</p>
                                <p className="truncate text-stone-600">
                                  {addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}
                                </p>
                                <p className="text-stone-500">
                                  {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                                {addr.phone && (
                                  <p className="text-[10px] text-stone-400 mt-1">
                                    📞 {addr.phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
                              {isSelected ? (
                                <span className="font-semibold text-amber-800 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-amber-600" />
                                  <span>Selected for delivery</span>
                                </span>
                              ) : (
                                <span className="text-stone-500 group-hover:text-stone-900 font-medium">
                                  Click to use address
                                </span>
                              )}

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditSavedAddress(addr);
                                  }}
                                  title="Edit address"
                                  className="px-2 py-1 text-stone-600 hover:text-stone-950 hover:bg-stone-200/70 rounded-md transition-colors flex items-center gap-1 font-semibold"
                                >
                                  <Edit3 className="w-3 h-3 text-amber-700" />
                                  <span>Edit</span>
                                </button>
                                {availableAddresses.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteAddress(addr.id || idx);
                                    }}
                                    title="Delete address"
                                    className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add New Address Card */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={handleAddNewAddressOption}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleAddNewAddressOption();
                          }
                        }}
                        className={`p-3.5 rounded-xl border border-dashed text-left transition-all flex flex-col items-center justify-center min-h-[140px] text-center cursor-pointer ${
                          selectedAddressId === 'new'
                            ? 'border-amber-600 bg-amber-50/40 text-amber-900 ring-2 ring-amber-600'
                            : 'border-stone-300 hover:border-stone-400 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 mb-2">
                          <Plus className="w-4 h-4" />
                        </div>
                        <p className="font-semibold text-xs text-stone-900">Enter New Address</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">Ship to another location</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Address Status Banner */}
                {selectedAddressId !== 'new' && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-stone-950">Delivering to:</span>{' '}
                        <span className="text-stone-600">
                          {fullName} • {street}, {city}, {state} {zipCode}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingFields(!isEditingFields)}
                      className="text-xs font-semibold text-stone-900 hover:text-amber-800 underline shrink-0 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingFields ? 'Hide Details' : 'Edit Details'}</span>
                    </button>
                  </div>
                )}

                {/* Form Fields: Shown if entering new address or user clicked Edit */}
                {(selectedAddressId === 'new' || isEditingFields || availableAddresses.length === 0) && (
                  <div className="space-y-4 pt-2 border-t border-stone-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        {selectedAddressId === 'new' ? 'Enter Delivery Information' : 'Edit Selected Delivery Information'}
                      </h3>
                      <span className="text-[11px] text-stone-400">All fields required unless marked optional</span>
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
                        <label className="block font-medium text-stone-700 mb-1">Email Address (for tracking & receipt) *</label>
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

                    {/* Save / Update in address book section */}
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveToAddressBook}
                            onChange={(e) => setSaveToAddressBook(e.target.checked)}
                            className="rounded text-stone-900 focus:ring-stone-900 w-4 h-4"
                          />
                          <span className="font-semibold text-stone-900">
                            {selectedAddressId !== 'new'
                              ? 'Sync changes to saved address book'
                              : 'Save this address for future checkouts'}
                          </span>
                        </label>

                        {/* Quick Save Changes Button */}
                        {selectedAddressId !== 'new' && (
                          <button
                            type="button"
                            onClick={handleSaveAddressUpdatesToBook}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold flex items-center gap-1.5 self-start sm:self-auto text-xs transition-colors shadow-sm"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Save Changes to Address</span>
                          </button>
                        )}
                      </div>

                      {saveToAddressBook && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/60">
                          <span className="text-stone-500 text-[11px] font-medium">Address Label:</span>
                          {['Home', 'Creative Studio', 'Office', 'Gallery', 'Summer Villa'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setNewAddressLabel(tag)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                                newAddressLabel === tag
                                  ? 'bg-stone-900 text-white border-stone-900'
                                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                        {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
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
                        +{formatPrice(12)}
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

                {/* Selected Shipping Destination Summary */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-stone-900">Destination:</span>{' '}
                      <span className="text-stone-600">
                        {fullName} • {street}{apartment ? `, ${apartment}` : ''}, {city}, {state} {zipCode}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-[11px] font-semibold text-amber-800 hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Gateway Method Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'Credit / Debit Card', label: 'Credit Card', icon: CreditCard },
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode, badge: 'Popular' },
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
                        className={`relative p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-stone-950 bg-stone-900 text-white shadow-md'
                            : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
                        }`}
                      >
                        {m.badge && !isSelected && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-amber-500 text-stone-950 text-[9px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                            {m.badge}
                          </span>
                        )}
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Card Fields */}
                {paymentMethod === 'Credit / Debit Card' && (
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
                )}

                {/* UPI Payment Gateway Interface */}
                {paymentMethod === 'UPI' && (
                  <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 text-xs">
                    {/* UPI Header & Sub-options */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                          <span>Unified Payments Interface (UPI 2.0)</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            Instant & Zero Fee
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Pay directly from any UPI app via dynamic QR or Virtual Payment Address (VPA)
                        </p>
                      </div>

                      <div className="inline-flex p-1 bg-stone-200/80 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setUpiSubOption('qr')}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                            upiSubOption === 'qr'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Scan QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubOption('id')}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                            upiSubOption === 'id'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>UPI ID / VPA</span>
                        </button>
                      </div>
                    </div>

                    {/* QR Code Mode */}
                    {upiSubOption === 'qr' ? (
                      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-5">
                        {/* Styled QR Visual */}
                        <div className="relative p-3 bg-white border-2 border-stone-900 rounded-2xl shadow-sm flex flex-col items-center shrink-0">
                          {/* Outer QR graphic with corners */}
                          <div className="w-36 h-36 bg-stone-950 p-2 rounded-xl flex items-center justify-center relative overflow-hidden">
                            {/* SVG QR Code Pattern */}
                            <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                              {/* Position detection squares (top-left, top-right, bottom-left) */}
                              <rect x="5" y="5" width="28" height="28" fill="white" />
                              <rect x="9" y="9" width="20" height="20" fill="#09090b" />
                              <rect x="13" y="13" width="12" height="12" fill="white" />

                              <rect x="67" y="5" width="28" height="28" fill="white" />
                              <rect x="71" y="9" width="20" height="20" fill="#09090b" />
                              <rect x="75" y="13" width="12" height="12" fill="white" />

                              <rect x="5" y="67" width="28" height="28" fill="white" />
                              <rect x="9" y="71" width="20" height="20" fill="#09090b" />
                              <rect x="13" y="75" width="12" height="12" fill="white" />

                              {/* Data pixels */}
                              <rect x="38" y="8" width="6" height="6" fill="white" />
                              <rect x="48" y="8" width="6" height="6" fill="white" />
                              <rect x="38" y="18" width="6" height="6" fill="white" />
                              <rect x="52" y="22" width="6" height="6" fill="white" />
                              <rect x="8" y="38" width="6" height="6" fill="white" />
                              <rect x="18" y="44" width="6" height="6" fill="white" />
                              <rect x="28" y="38" width="6" height="6" fill="white" />
                              <rect x="38" y="38" width="6" height="6" fill="white" />
                              <rect x="48" y="48" width="6" height="6" fill="white" />
                              <rect x="58" y="38" width="6" height="6" fill="white" />
                              <rect x="68" y="44" width="6" height="6" fill="white" />
                              <rect x="78" y="38" width="6" height="6" fill="white" />
                              <rect x="88" y="44" width="6" height="6" fill="white" />
                              <rect x="38" y="58" width="6" height="6" fill="white" />
                              <rect x="48" y="68" width="6" height="6" fill="white" />
                              <rect x="58" y="58" width="6" height="6" fill="white" />
                              <rect x="68" y="68" width="6" height="6" fill="white" />
                              <rect x="78" y="58" width="6" height="6" fill="white" />
                              <rect x="88" y="68" width="6" height="6" fill="white" />
                              <rect x="38" y="78" width="6" height="6" fill="white" />
                              <rect x="48" y="88" width="6" height="6" fill="white" />
                              <rect x="58" y="78" width="6" height="6" fill="white" />
                              <rect x="68" y="84" width="6" height="6" fill="white" />
                              <rect x="78" y="78" width="6" height="6" fill="white" />
                              <rect x="88" y="84" width="6" height="6" fill="white" />
                            </svg>

                            {/* Center badge */}
                            <div className="absolute inset-0 m-auto w-9 h-9 bg-stone-900 border-2 border-white rounded-lg flex items-center justify-center text-[10px] font-black tracking-tighter text-amber-400">
                              UPI
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-stone-900 mt-1.5">
                            Amount: {formatPrice(effectiveTotal)}
                          </span>
                        </div>

                        {/* QR Instructions */}
                        <div className="flex-1 space-y-2.5 text-left">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Scan with any UPI Application</span>
                          </div>

                          <ol className="text-[11px] text-stone-600 space-y-1 list-decimal list-inside leading-relaxed">
                            <li>Open Google Pay, PhonePe, Paytm, BHIM, CRED, or Bank App.</li>
                            <li>Select <strong>Scan QR</strong> and point camera at the box.</li>
                            <li>Authorize payment and click the button below to confirm.</li>
                          </ol>

                          {/* Merchant VPA & Copy Action */}
                          <div className="pt-2 flex items-center gap-2">
                            <div className="flex-1 p-2 bg-stone-100 rounded-lg border border-stone-200 font-mono text-[11px] text-stone-800 truncate">
                              lumina.posters@okhdfcbank
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('lumina.posters@okhdfcbank');
                                setIsCopiedUpi(true);
                                setTimeout(() => setIsCopiedUpi(false), 2000);
                                showToast('UPI ID copied to clipboard!');
                              }}
                              className="px-2.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                            >
                              {isCopiedUpi ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy ID</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* UPI ID / VPA Mode */
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200">
                        <div>
                          <label className="block font-medium text-stone-700 mb-1">
                            Virtual Payment Address (UPI ID) *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono text-xs font-semibold text-stone-900"
                            />
                            {upiId.includes('@') && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified VPA
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 mt-1">
                            A payment request notification will be sent to your UPI app.
                          </p>
                        </div>

                        {/* Quick Handle Suffix Chips */}
                        <div>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                            Quick Bank Handles:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl', '@ibl', '@upi'].map((handle) => (
                              <button
                                key={handle}
                                type="button"
                                onClick={() => {
                                  const prefix = upiId.split('@')[0] || 'sarah.art';
                                  setUpiId(`${prefix}${handle}`);
                                }}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-[10px] font-semibold rounded-md transition-colors"
                              >
                                {handle}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Fast Fill Sample IDs for Demo Testing */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                          <span>Quick Test ID:</span>
                          <button
                            type="button"
                            onClick={() => setUpiId('collector.art@okhdfcbank')}
                            className="font-mono text-amber-800 hover:underline font-semibold"
                          >
                            collector.art@okhdfcbank
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Supported UPI Apps Bar */}
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                        Select Preferred UPI App:
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                        {[
                          { name: 'Google Pay', short: 'GPay' },
                          { name: 'PhonePe', short: 'PhonePe' },
                          { name: 'Paytm', short: 'Paytm' },
                          { name: 'BHIM UPI', short: 'BHIM' },
                          { name: 'CRED UPI', short: 'CRED' },
                          { name: 'Amazon Pay', short: 'Amazon' }
                        ].map((app) => {
                          const isAppActive = selectedUpiApp === app.name;
                          return (
                            <button
                              key={app.name}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.name)}
                              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                isAppActive
                                  ? 'border-stone-900 bg-stone-900 text-white font-bold shadow-xs'
                                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 font-medium'
                              }`}
                            >
                              <div className="text-[11px] truncate">{app.short}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* NPCI Security note */}
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Protected by NPCI 256-bit bank encryption • Instant confirmation & zero surcharge.
                      </span>
                    </div>
                  </div>
                )}

                {/* Apple Pay & PayPal placeholders */}
                {(paymentMethod === 'Apple Pay' || paymentMethod === 'PayPal') && (
                  <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
                    <p className="text-xs text-stone-600">
                      You will authorize <strong>{formatPrice(effectiveTotal)}</strong> with <strong>{paymentMethod}</strong> via secure biometric tokenization.
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
                      <span>
                        {paymentMethod === 'UPI' 
                          ? `Authorize & Pay with UPI • ${formatPrice(effectiveTotal)}`
                          : `Authorize & Place Order • ${formatPrice(effectiveTotal)}`}
                      </span>
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
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-stone-900">{formatPrice(cartSubtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-amber-700">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span className="font-mono font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                <span className="font-mono font-medium text-stone-900">
                  {effectiveShipping === 0 ? 'FREE' : formatPrice(effectiveShipping)}
                </span>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>Sales Tax ({settings.taxRate || 18}%)</span>
                <span className="font-mono font-medium">
                  {formatPrice((cartSubtotal - discountAmount) * ((settings.taxRate || 18) / 100))}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-stone-950 pt-3 border-t border-stone-200">
                <span>Total Due</span>
                <span className="font-serif text-lg text-stone-950">
                  {formatPrice(effectiveTotal)}
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
