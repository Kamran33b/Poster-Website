import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { ShippingAddress } from '../types';

export const AccountModal: React.FC = () => {
  const {
    user,
    loginUser,
    logoutUser,
    updateUserProfile,
    addAddress,
    deleteAddress,
    orders,
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    setCurrentOrder,
    setCurrentView,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');
  
  // Auth Form states (if not logged in)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authEmail, setAuthEmail] = useState('sarah.jenkins@example.com');
  const [authName, setAuthName] = useState('Sarah Jenkins');
  const [authPassword, setAuthPassword] = useState('••••••••');
  const [resetSent, setResetSent] = useState(false);

  // New address state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newApt, setNewApt] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  const userOrders = user
    ? orders.filter((o) => o.customer.email.toLowerCase() === user.email.toLowerCase() || o.shippingAddress.email.toLowerCase() === user.email.toLowerCase())
    : orders.slice(0, 2);

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'forgot') {
      setResetSent(true);
      showToast('Password reset link sent to ' + authEmail);
      return;
    }
    loginUser(authEmail, authName);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newZip) return;
    addAddress({
      fullName: user?.name || 'Collector',
      email: user?.email || '',
      phone: user?.phone || '',
      street: newStreet,
      apartment: newApt,
      city: newCity,
      state: newState,
      zipCode: newZip,
      country: 'United States',
      isDefault: false
    });
    setShowAddressForm(false);
    setNewStreet('');
    setNewApt('');
    setNewCity('');
    setNewState('');
    setNewZip('');
  };

  // If user is not logged in, display the polished Login / Register / Forgot screen
  if (!user) {
    return (
      <div className="bg-[#faf8f5] min-h-screen py-16 px-4 sm:px-6">
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
              Access order tracking, saved wall galleries, and shipping profiles
            </p>
          </div>

          {authMode === 'forgot' && resetSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center space-y-3">
              <Check className="w-6 h-6 mx-auto text-emerald-600" />
              <p>We’ve dispatched a secure login recovery link to <strong>{authEmail}</strong>.</p>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setResetSent(false);
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
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-stone-700">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-[11px] text-amber-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                {authMode === 'login' && 'Sign In to Store'}
                {authMode === 'register' && 'Register Collector Account'}
                {authMode === 'forgot' && 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* Quick Demo Fill Button */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={() => loginUser('sarah.jenkins@example.com', 'Sarah Jenkins')}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline"
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
                  onClick={() => setAuthMode('register')}
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
                  onClick={() => setAuthMode('login')}
                  className="text-stone-900 font-semibold underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
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
                          order.status === 'Delivered'
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

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-serif text-stone-950">
                        ${order.total}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentOrder(order);
                          setCurrentView('order-confirmation');
                        }}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Track Delivery</span>
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </div>

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

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-stone-500 mb-6">Heart any poster across the catalog to save it to your curation.</p>
                <button
                  type="button"
                  onClick={() => setCurrentView('shop')}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  Explore Collection
                </button>
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
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-stone-950">
                Registered Shipping Addresses
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddressForm ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="bg-white p-6 rounded-2xl border border-stone-300 shadow-sm max-w-xl space-y-3 text-xs">
                <h4 className="font-bold text-stone-900 uppercase tracking-wider">New Shipping Destination</h4>
                <div>
                  <label className="block text-stone-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 Museum Way"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Apartment / Suite</label>
                  <input
                    type="text"
                    placeholder="Apt 2A"
                    value={newApt}
                    onChange={(e) => setNewApt(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-stone-600 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">ZIP</label>
                    <input
                      type="text"
                      required
                      value={newZip}
                      onChange={(e) => setNewZip(e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* Addresses list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 text-sm">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {addr.street} {addr.apartment || ''}<br />
                    {addr.city}, {addr.state} {addr.zipCode}<br />
                    {addr.country}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteAddress(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

      </div>
    </div>
  );
};
