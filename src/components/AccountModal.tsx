import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Truck, 
  Check, 
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Lock,
  Search,
  Clock,
  AlertCircle,
  Copy,
  Calendar,
  Ban,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Edit3,
  Save,
  Building,
  Home,
  Compass,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { ShippingAddress, Order } from '../types';

export const AccountModal: React.FC = () => {
  const {
    user,
    savedAddresses,
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    addAddress,
    saveAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    orders,
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    setCurrentOrder,
    setCurrentView,
    cancelOrder,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'track' | 'wishlist' | 'addresses' | 'profile'>('orders');
  
  // Cancellation Modal state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReasonOption, setCancelReasonOption] = useState<string>('Changed my mind / No longer needed');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);
  
  // Track Order Form state
  const [trackInput, setTrackInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Auth Form states (Real database-backed auth)
  const [unauthView, setUnauthView] = useState<'auth' | 'track'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Address Management state (Add & Edit)
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [formLabel, setFormLabel] = useState('Home');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formApt, setFormApt] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formZip, setFormZip] = useState('');
  const [formCountry, setFormCountry] = useState('United States');
  const [formIsDefault, setFormIsDefault] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  const handleConfirmCustomerCancel = async () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReasonOption === 'Other' && customCancelReason.trim()
      ? customCancelReason.trim()
      : cancelReasonOption;

    try {
      setIsSubmittingCancel(true);
      const updated = await cancelOrder(cancellingOrder.id, finalReason, 'Customer');
      if (trackedOrder && (trackedOrder.id === updated.id || trackedOrder.orderNumber === updated.orderNumber)) {
        setTrackedOrder(updated);
      }
      setCancellingOrder(null);
      setCustomCancelReason('');
      showToast(`Order #${updated.orderNumber} successfully cancelled and refunded.`);
    } catch (err: any) {
      showToast(err.message || 'Could not cancel order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const userOrders = user
    ? orders.filter((o) => o.customer.email.toLowerCase() === user.email.toLowerCase() || o.shippingAddress.email.toLowerCase() === user.email.toLowerCase())
    : orders.slice(0, 2);

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleTrackSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery !== undefined ? customQuery : trackInput).trim().replace(/^#/, '');
    if (!query) {
      setTrackError('Please enter an Order ID or Order Number (e.g. LUM-8821)');
      setTrackedOrder(null);
      setTrackSearched(true);
      return;
    }

    setTrackSearched(true);
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === query.toLowerCase() ||
        o.id.toLowerCase() === query.toLowerCase() ||
        o.orderNumber.toLowerCase().replace(/[^a-z0-9]/gi, '') === query.toLowerCase().replace(/[^a-z0-9]/gi, '') ||
        o.id.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setTrackedOrder(found);
      setTrackError(null);
    } else {
      setTrackedOrder(null);
      setTrackError(`No order found matching "${query}". Please check the Order ID on your receipt.`);
    }
  };

  const copyTrackingNumber = (trackingNum: string) => {
    navigator.clipboard?.writeText(trackingNum);
    setCopiedTracking(true);
    showToast('Tracking number copied to clipboard');
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Processing':
        return 1;
      case 'Printed & Framed':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const renderTrackOrderContent = () => {
    const steps = [
      { label: 'Order Placed', desc: 'Payment verified' },
      { label: 'Processing', desc: 'Museum art preparation' },
      { label: 'Framed & Packed', desc: 'Hand-joined wood frame' },
      { label: 'Shipped', desc: trackedOrder?.shippingCarrier || 'Courier dispatch' },
      { label: 'Delivered', desc: 'Safely to your door' }
    ];

    const currentStep = trackedOrder ? getStepIndex(trackedOrder.status) : 0;

    return (
      <div className="space-y-6">
        {/* Track Order Input Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Track Order Status
            </h3>
          </div>
          <p className="text-xs text-stone-500 mb-5">
            Enter your Order ID or order number from your confirmation email / WhatsApp message to see live transit status.
          </p>

          <form onSubmit={(e) => handleTrackSearch(e)} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="track-order-input"
                type="text"
                value={trackInput}
                onChange={(e) => {
                  setTrackInput(e.target.value);
                  if (trackError) setTrackError(null);
                }}
                placeholder="e.g. LUM-8821 or order UUID..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
              />
            </div>
            <button
              id="submit-track-order-btn"
              type="submit"
              className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Track Order</span>
            </button>
          </form>

          {/* Quick Demo Search Suggestions */}
          {orders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-400 text-[11px] font-medium">Quick Track Recent:</span>
              {orders.slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setTrackInput(ord.orderNumber);
                    handleTrackSearch(undefined, ord.orderNumber);
                  }}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-stone-200 rounded-lg text-[11px] font-mono font-medium text-stone-700 transition-colors"
                >
                  #{ord.orderNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error State */}
        {trackSearched && trackError && (
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-3.5 text-xs text-rose-900 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-950">Order Not Found</p>
              <p className="text-rose-700">{trackError}</p>
              <p className="text-[11px] text-rose-600/80 pt-1">
                Tip: Try clicking one of the recent order sample buttons above or check your email receipt.
              </p>
            </div>
          </div>
        )}

        {/* Success / Result State */}
        {trackedOrder && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="font-serif text-xl font-bold text-stone-950">
                    Order #{trackedOrder.orderNumber}
                  </h3>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    trackedOrder.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-900 border border-rose-200'
                      : trackedOrder.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-900'
                      : trackedOrder.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      trackedOrder.status === 'Cancelled'
                        ? 'bg-rose-600'
                        : trackedOrder.status === 'Delivered'
                        ? 'bg-emerald-600'
                        : trackedOrder.status === 'Shipped'
                        ? 'bg-blue-600 animate-pulse'
                        : 'bg-amber-600 animate-pulse'
                    }`}></span>
                    {trackedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Placed on {new Date(trackedOrder.createdAt).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })} • {trackedOrder.items.length} {trackedOrder.items.length === 1 ? 'artwork' : 'artworks'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {trackedOrder.status !== 'Cancelled' && trackedOrder.status !== 'Delivered' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancellingOrder(trackedOrder);
                      setCancelReasonOption('Changed my mind / No longer needed');
                      setCustomCancelReason('');
                    }}
                    className="px-3.5 py-2 border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5 text-rose-600" />
                    <span>Cancel Order</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentOrder(trackedOrder);
                    setCurrentView('order-confirmation');
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>View Full Receipt</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>

            {/* If Order is Cancelled: Banner */}
            {trackedOrder.status === 'Cancelled' ? (
              <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-900">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Order Has Been Cancelled</span>
                </div>
                <p className="text-rose-800">
                  This order was cancelled on {new Date(trackedOrder.cancelledAt || trackedOrder.createdAt).toLocaleDateString()}.
                  {trackedOrder.cancelReason && (
                    <span className="block mt-1 font-medium italic">Reason: "{trackedOrder.cancelReason}"</span>
                  )}
                </p>
                <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3 text-emerald-700" />
                    100% Refund Initiated (${trackedOrder.total})
                  </span>
                  <span className="text-stone-500">Method: {trackedOrder.paymentMethod}</span>
                </div>
              </div>
            ) : null}

            {/* Shipment Progress Stepper */}
            <div className="py-2">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Shipment Progress</span>
              </h4>

              {/* Step indicator bar */}
              <div className="relative">
                <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0">
                  <div
                    className="h-full bg-stone-900 transition-all duration-700"
                    style={{
                      width: `${(currentStep / (steps.length - 1)) * 100}%`
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={idx} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors shadow-sm ${
                            isCompleted
                              ? 'bg-stone-950 text-amber-400 ring-4 ring-amber-400/20'
                              : 'bg-stone-100 text-stone-400 border border-stone-300'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="sm:text-center">
                          <p className={`text-xs font-semibold ${isCurrent ? 'text-stone-950 font-bold' : isCompleted ? 'text-stone-800' : 'text-stone-400'}`}>
                            {step.label}
                          </p>
                          <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Courier & Tracking Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div>
                <span className="text-[11px] text-stone-400 font-medium block mb-0.5">Shipping Carrier</span>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-stone-700" />
                  <span className="font-semibold text-stone-900">{trackedOrder.shippingCarrier || 'DHL Express Worldwide'}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-stone-400 font-medium block mb-0.5">Tracking Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-950">
                    {trackedOrder.trackingNumber || 'DHL-994827164US'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyTrackingNumber(trackedOrder.trackingNumber || 'DHL-994827164US')}
                    className="p-1 hover:bg-stone-200 rounded text-stone-600 transition-colors"
                    title="Copy Tracking Number"
                  >
                    {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-stone-400 font-medium block mb-0.5">Estimated Delivery</span>
                <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>{trackedOrder.estimatedDelivery || 'In 2-4 Business Days'}</span>
                </div>
              </div>
            </div>

            {/* Items Summary in this Order */}
            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Items in this Delivery ({trackedOrder.items.length})
              </h4>
              <div className="space-y-2">
                {trackedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded-md border border-stone-200 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-semibold text-stone-950">{item.name}</p>
                        <p className="text-[11px] text-stone-500">
                          {item.sizeName} • {item.frameName} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-stone-950">
                      ${item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination & Total */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-stone-200 gap-3 text-xs">
              <div className="text-stone-600">
                <span className="font-medium text-stone-900">Shipping to:</span> {trackedOrder.shippingAddress.fullName}, {trackedOrder.shippingAddress.street}, {trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.state} {trackedOrder.shippingAddress.zipCode}
              </div>
              <div className="text-right">
                <span className="text-stone-500 mr-2">Total Paid:</span>
                <span className="font-serif text-base font-bold text-stone-950">
                  ${trackedOrder.total}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'forgot') {
      if (!authEmail.trim()) {
        setAuthError('Please enter your email address to recover your account');
        return;
      }
      setResetSent(true);
      showToast('Password reset link sent to ' + authEmail.trim());
      return;
    }

    if (authMode === 'login') {
      if (!authEmail.trim() || !authPassword) {
        setAuthError('Please enter both your email address and password');
        return;
      }
      setAuthSubmitting(true);
      try {
        const res = await loginUser(authEmail.trim(), authPassword);
        if (!res.success) {
          setAuthError(res.error || 'Invalid email or password. Please verify credentials.');
        }
      } catch (err: any) {
        setAuthError(err.message || 'Login failed. Please check your connection.');
      } finally {
        setAuthSubmitting(false);
      }
      return;
    }

    if (authMode === 'register') {
      if (!authName.trim()) {
        setAuthError('Please enter your full name');
        return;
      }
      if (!authEmail.trim()) {
        setAuthError('Please enter a valid email address');
        return;
      }
      if (!authPassword || authPassword.length < 6) {
        setAuthError('Password must be at least 6 characters');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }

      setAuthSubmitting(true);
      try {
        const res = await registerUser({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          confirmPassword: authConfirmPassword,
          phone: authPhone.trim()
        });
        if (!res.success) {
          setAuthError(res.error || 'Registration failed. This email may already be in use.');
        }
      } catch (err: any) {
        setAuthError(err.message || 'Registration failed. Please check your connection.');
      } finally {
        setAuthSubmitting(false);
      }
    }
  };

  const handleQuickDemoSignIn = async () => {
    setAuthEmail('sarah.jenkins@example.com');
    setAuthPassword('Sarah123!');
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await loginUser('sarah.jenkins@example.com', 'Sarah123!');
      if (!res.success) {
        setAuthError(res.error || 'Demo sign-in failed');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleStartNewAddress = () => {
    setEditingAddress(null);
    setFormLabel('Home');
    setFormFullName(user?.name || '');
    setFormEmail(user?.email || '');
    setFormPhone(user?.phone || '');
    setFormStreet('');
    setFormApt('');
    setFormCity('');
    setFormState('');
    setFormZip('');
    setFormCountry('United States');
    setFormIsDefault((user?.addresses && user.addresses.length === 0));
    setIsAddressFormOpen(true);
  };

  const handleStartEditAddress = (addr: ShippingAddress) => {
    setEditingAddress(addr);
    setFormLabel(addr.label || 'Home');
    setFormFullName(addr.fullName || user?.name || '');
    setFormEmail(addr.email || user?.email || '');
    setFormPhone(addr.phone || user?.phone || '');
    setFormStreet(addr.street);
    setFormApt(addr.apartment || '');
    setFormCity(addr.city);
    setFormState(addr.state);
    setFormZip(addr.zipCode);
    setFormCountry(addr.country || 'United States');
    setFormIsDefault(!!addr.isDefault);
    setIsAddressFormOpen(true);
  };

  const handleCancelAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStreet.trim() || !formCity.trim() || !formZip.trim() || !formFullName.trim()) {
      showToast('Please fill out all required address fields.');
      return;
    }

    const addressPayload: ShippingAddress = {
      id: editingAddress ? editingAddress.id : `addr-${Date.now()}`,
      label: formLabel.trim() || 'Home',
      fullName: formFullName.trim(),
      email: formEmail.trim() || user?.email || '',
      phone: formPhone.trim() || user?.phone || '',
      street: formStreet.trim(),
      apartment: formApt.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      zipCode: formZip.trim(),
      country: formCountry.trim() || 'United States',
      isDefault: formIsDefault
    };

    saveAddress(addressPayload);
    setIsAddressFormOpen(false);
    setEditingAddress(null);
  };

  // If user is not logged in, display the polished Login / Register / Forgot screen OR Guest Track Order
  if (!user) {
    return (
      <div className="bg-[#faf8f5] min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Top Mode Switch: Sign In vs Track Order */}
          <div className="flex justify-center">
            <div className="bg-stone-200/80 p-1 rounded-2xl flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnauthView('auth')}
                className={`px-5 py-2 rounded-xl transition-all ${
                  unauthView === 'auth'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In / Register
              </button>
              <button
                type="button"
                onClick={() => setUnauthView('track')}
                className={`px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  unauthView === 'track'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>Track Order by ID</span>
              </button>
            </div>
          </div>

          {unauthView === 'track' ? (
            renderTrackOrderContent()
          ) : (
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
              <div className="text-center mb-6">
                <span className="font-display text-xl font-bold tracking-[0.2em] text-stone-950 block mb-1">
                  LUMINA
                </span>
                <h2 className="font-serif text-2xl font-normal text-stone-900">
                  {authMode === 'login' && 'Sign in to your Account'}
                  {authMode === 'register' && 'Create Collector Account'}
                  {authMode === 'forgot' && 'Reset Your Password'}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {authMode === 'login' && 'Access your order history, shipping addresses, and curated gallery'}
                  {authMode === 'register' && 'Create a secure collector profile to manage fine art acquisitions'}
                  {authMode === 'forgot' && 'Enter your verified account email to recover access'}
                </p>
              </div>

              {authError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">{authError}</span>
                </div>
              )}

              {authMode === 'forgot' && resetSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center space-y-3">
                  <Check className="w-6 h-6 mx-auto text-emerald-600" />
                  <p>We’ve dispatched a secure login recovery link to <strong>{authEmail}</strong>.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setResetSent(false);
                      setAuthError(null);
                    }}
                    className="font-semibold underline text-emerald-900"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                  {authMode === 'register' && (
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eleanor Vance"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="collector@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Phone Number <span className="text-stone-400 font-normal">(Optional)</span></label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  )}

                  {authMode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-stone-700">Password</label>
                        {authMode === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('forgot');
                              setAuthError(null);
                            }}
                            className="text-[11px] text-amber-700 hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder={authMode === 'register' ? 'Minimum 6 characters' : 'Enter account password'}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full p-2.5 pr-10 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3 bg-stone-950 hover:bg-stone-800 disabled:bg-stone-600 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    {authSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {authMode === 'login' && 'Sign In to Store'}
                        {authMode === 'register' && 'Register Collector Account'}
                        {authMode === 'forgot' && 'Send Reset Link'}
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Quick Demo Fill Button */}
              <div className="mt-6 pt-4 border-t border-stone-100 text-center">
                <button
                  type="button"
                  disabled={authSubmitting}
                  onClick={handleQuickDemoSignIn}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline disabled:opacity-50"
                >
                  ⚡ Quick Sign In as Demo Collector (Sarah Jenkins)
                </button>
              </div>

              <div className="mt-4 text-center text-xs text-stone-500">
                {authMode === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError(null);
                      }}
                      className="text-stone-900 font-semibold underline"
                    >
                      Create one now
                    </button>
                  </span>
                ) : (
                  <span>
                    Already a registered collector?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      className="text-stone-900 font-semibold underline"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f5] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-stone-900 text-amber-400 font-serif text-xl font-bold flex items-center justify-center shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-normal text-stone-950">
                  {user.name}
                </h1>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                  Verified Collector
                </span>
              </div>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logoutUser}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-stone-200 gap-6 text-sm font-semibold text-stone-500 mb-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders' ? 'border-stone-950 text-stone-950' : 'border-transparent hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({userOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'track' ? 'border-stone-950 text-stone-950' : 'border-transparent hover:text-stone-800'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Track Order</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'wishlist' ? 'border-stone-950 text-stone-950' : 'border-transparent hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist ({wishlist.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'addresses' ? 'border-stone-950 text-stone-950' : 'border-transparent hover:text-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses ({user.addresses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile' ? 'border-stone-950 text-stone-950' : 'border-transparent hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Quick Track Prompt Bar */}
            <div className="bg-stone-100/90 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Need real-time shipment updates for any order ID?</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Track an Order</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {userOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">No orders yet</h3>
                <p className="text-xs text-stone-500 mb-6">Explore our curated collections of museum-grade physical posters.</p>
                <button
                  type="button"
                  onClick={() => setCurrentView('shop')}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              userOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-base font-bold text-stone-950">
                          Order #{order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap justify-end">
                      <span className="text-sm font-bold font-serif text-stone-950 mr-1">
                        ${order.total}
                      </span>
                      {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelReasonOption('Changed my mind / No longer needed');
                            setCustomCancelReason('');
                          }}
                          className="px-3 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTrackInput(order.orderNumber);
                          setTrackedOrder(order);
                          setTrackSearched(true);
                          setTrackError(null);
                          setActiveTab('track');
                        }}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Track Status</span>
                      </button>
                    </div>
                  </div>

                  {/* If cancelled, show note */}
                  {order.status === 'Cancelled' && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between flex-wrap gap-2">
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancelled: {order.cancelReason || 'Order cancelled'}</span>
                      </span>
                      <span className="text-[11px] font-semibold bg-white/80 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200">
                        100% Refunded (${order.total})
                      </span>
                    </div>
                  )}

                  {/* Order items preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-stone-50 border border-stone-200/60 text-xs">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-stone-900 truncate">{item.name}</h5>
                          <p className="text-[11px] text-stone-500 truncate">{item.sizeName}</p>
                          <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Carrier: {order.shippingCarrier || 'FedEx Express'} (Tracking: {order.trackingNumber || 'Pending'})</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Track Order Form */}
        {activeTab === 'track' && renderTrackOrderContent()}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-stone-500 mb-6">Heart any poster across the catalog to save it to your curation.</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, backgroundColor: '#1c1917' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => setCurrentView('shop')}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold select-none cursor-pointer"
                >
                  Explore Collection
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="aspect-[3/4] p-3 bg-stone-100 flex items-center justify-center">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover rounded shadow"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">{p.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-stone-950">${p.discountPrice || p.price}</span>
                          <span className="text-[11px] text-stone-400">{p.category}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(p, p.sizes[0], p.frameOptions[0], 1)}
                          className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p.id)}
                          className="p-2 border border-stone-200 hover:bg-stone-100 text-rose-600 rounded-lg"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Delivery Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-stone-950">
                  Registered Shipping Addresses
                </h3>
                <p className="text-xs text-stone-500">
                  Manage and edit your saved delivery destinations for quick checkout.
                </p>
              </div>
              {!isAddressFormOpen && (
                <button
                  type="button"
                  onClick={handleStartNewAddress}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Add / Edit Address Form */}
            {isAddressFormOpen && (
              <form onSubmit={handleSaveAddress} className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-300 shadow-sm max-w-2xl space-y-4 text-xs animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    {editingAddress ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                        <Edit3 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-900 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-stone-950 uppercase tracking-wider text-xs">
                        {editingAddress ? 'Edit Saved Address' : 'Add New Shipping Destination'}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {editingAddress ? 'Modify destination information below and save updates.' : 'Save a new address to your collector profile.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelAddressForm}
                    className="text-stone-400 hover:text-stone-700 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {/* Address Label Pills */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">Address Type / Label</label>
                  <div className="flex flex-wrap gap-2">
                    {['Home', 'Creative Studio', 'Office', 'Gallery', 'Summer Villa'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormLabel(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          formLabel === tag
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-stone-700 mb-1">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="sarah.jenkins@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Phone Number (for courier SMS)</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-stone-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 742 Evergreen Terrace"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Apartment / Suite / Unit (Optional)</label>
                    <input
                      type="text"
                      placeholder="Apt 4B"
                      value={formApt}
                      onChange={(e) => setFormApt(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Portland"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">State / Province *</label>
                    <input
                      type="text"
                      required
                      placeholder="OR"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="97201"
                      value={formZip}
                      onChange={(e) => setFormZip(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="rounded text-stone-900 focus:ring-stone-900 w-4 h-4"
                    />
                    <span className="font-medium text-stone-800">Set as default shipping address</span>
                  </label>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleCancelAddressForm}
                      className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingAddress ? 'Save Changes' : 'Save Address'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Addresses list */}
            {((user.addresses && user.addresses.length > 0) || (savedAddresses && savedAddresses.length > 0)) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(user.addresses && user.addresses.length > 0 ? user.addresses : savedAddresses).map((addr, idx) => (
                  <div
                    key={addr.id || idx}
                    className={`bg-white p-5 rounded-2xl border shadow-sm relative space-y-3 transition-all ${
                      editingAddress?.id === addr.id
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                          {addr.label?.toLowerCase().includes('office') || addr.label?.toLowerCase().includes('gallery') ? (
                            <Building className="w-3.5 h-3.5" />
                          ) : (
                            <Home className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-stone-950 text-sm block leading-tight">
                            {addr.label || `Address #${idx + 1}`}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {addr.fullName}
                          </span>
                        </div>
                      </div>

                      {addr.isDefault && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-600 leading-relaxed bg-stone-50/80 p-3 rounded-xl border border-stone-100 space-y-0.5">
                      <p className="font-medium text-stone-900">
                        {addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}
                      </p>
                      <p>
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="text-stone-500">{addr.country || 'United States'}</p>
                      {addr.phone && (
                        <p className="text-[11px] text-stone-400 pt-1">
                          Phone: {addr.phone}
                        </p>
                      )}
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-stone-100 text-xs">
                      <div>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.id || idx)}
                            className="text-[11px] text-stone-500 hover:text-stone-900 underline font-medium"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditAddress(addr)}
                          className="px-2.5 py-1.5 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg flex items-center gap-1 font-semibold transition-colors border border-stone-200/80"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr.id || idx)}
                          className="px-2.5 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors"
                          title="Remove address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
                <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500">No saved addresses yet. Add one for quick checkouts.</p>
                <button
                  type="button"
                  onClick={handleStartNewAddress}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Address</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm max-w-xl space-y-4 text-xs">
            <h3 className="font-serif text-lg font-semibold text-stone-950 pb-2 border-b border-stone-100">
              Personal Information
            </h3>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-lg text-stone-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-stone-400">Primary authentication email</span>
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Phone (SMS Delivery alerts)</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                updateUserProfile({ name: editName, phone: editPhone });
              }}
              className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl font-semibold"
            >
              Update Profile
            </button>
          </div>
        )}

        {/* Customer Order Cancellation Modal */}
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-scaleUp space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-950">
                      Cancel Order #{cancellingOrder.orderNumber}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Placed on {new Date(cancellingOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Order Recap Mini Card */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-stone-700">
                  <span>Artworks in Order:</span>
                  <span className="font-semibold text-stone-950">{cancellingOrder.items.length} print(s)</span>
                </div>
                <div className="flex items-center justify-between text-stone-700">
                  <span>Original Total:</span>
                  <span className="font-mono font-bold text-stone-950">${cancellingOrder.total}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    Refund Amount:
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-900">${cancellingOrder.total} (100%)</span>
                </div>
              </div>

              {/* Cancellation Reason Selection */}
              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-stone-800">
                  Please tell us the reason for cancelling:
                </label>
                <select
                  value={cancelReasonOption}
                  onChange={(e) => setCancelReasonOption(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-medium text-stone-800"
                >
                  <option value="Changed my mind / No longer needed">Changed my mind / No longer needed</option>
                  <option value="Need to modify frame size or shipping address">Need to modify frame size or shipping address</option>
                  <option value="Found alternative artwork / duplicate order">Found alternative artwork / duplicate order</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Delivery timeframe too long">Delivery timeframe too long</option>
                  <option value="Other">Other (specify below)</option>
                </select>

                {cancelReasonOption === 'Other' && (
                  <div>
                    <textarea
                      rows={2}
                      value={customCancelReason}
                      onChange={(e) => setCustomCancelReason(e.target.value)}
                      placeholder="Please briefly explain why you are cancelling..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                Cancelling this order will stop printing at our fine art lab immediately. A full refund will be credited back to your <strong>{cancellingOrder.paymentMethod}</strong>.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Keep My Order
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={handleConfirmCustomerCancel}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
