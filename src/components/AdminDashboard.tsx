import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Tag, 
  FolderTree, 
  Star, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  Upload, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Search,
  RefreshCw,
  Sparkles,
  Layers,
  Truck,
  LogOut,
  Smartphone,
  KeyRound,
  Lock,
  Ban,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { Product, Order, OrderStatus, Category, Coupon, Review, StoreSettings } from '../types';

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rate: 1.0, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rate: 0.92, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rate: 0.79, flag: '🇬🇧' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', rate: 1.36, flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', rate: 1.52, flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', rate: 155.0, flag: '🇯🇵' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rate: 83.5, flag: '🇮🇳' },
  { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc (CHF)', rate: 0.89, flag: '🇨🇭' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', rate: 1.35, flag: '🇸🇬' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)', rate: 3.67, flag: '🇦🇪' }
];

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    coupons,
    reviews,
    settings,
    createProduct,
    updateProduct,
    bulkUpdatePrices,
    deleteProduct,
    updateOrderStatus,
    cancelOrder,
    createCategory,
    deleteCategory,
    createCoupon,
    deleteCoupon,
    updateReviewStatus,
    deleteReview,
    updateSettings,
    setCurrentView,
    showToast,
    logoutAdmin,
    formatPrice
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'categories' | 'coupons' | 'reviews' | 'settings'>('overview');

  // Admin Order Cancellation State
  const [adminCancellingOrder, setAdminCancellingOrder] = useState<Order | null>(null);
  const [adminCancelReasonOption, setAdminCancelReasonOption] = useState<string>('Customer requested cancellation');
  const [adminCustomReason, setAdminCustomReason] = useState<string>('');
  const [isAdminCancelling, setIsAdminCancelling] = useState<boolean>(false);

  const handleConfirmAdminCancel = async () => {
    if (!adminCancellingOrder) return;
    const finalReason = adminCancelReasonOption === 'Other' && adminCustomReason.trim()
      ? adminCustomReason.trim()
      : adminCancelReasonOption;

    try {
      setIsAdminCancelling(true);
      const updated = await cancelOrder(adminCancellingOrder.id, finalReason, 'Admin');
      if (viewingOrder && viewingOrder.id === updated.id) {
        setViewingOrder(updated);
      }
      setAdminCancellingOrder(null);
      setAdminCustomReason('');
      showToast(`Order #${updated.orderNumber} successfully cancelled. Stock restocked & payment marked Refunded.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order.');
    } finally {
      setIsAdminCancelling(false);
    }
  };

  // Product Form Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || 'Bauhaus & Geometry');
  const [prodCollection, setProdCollection] = useState('Modern Studio Edition');
  const [prodPrice, setProdPrice] = useState('38');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodStock, setProdStock] = useState('45');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImageUrl2, setProdImageUrl2] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(true);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsNewArrival, setProdIsNewArrival] = useState(true);

  // Category modal
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Coupon modal
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState('20');
  const [newCouponMin, setNewCouponMin] = useState('40');
  const [newCouponLimit, setNewCouponLimit] = useState('100');

  // Order Details Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingTracking, setEditingTracking] = useState('');

  // Bulk Price Update Modal State
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceAction, setBulkPriceAction] = useState<'set_all' | 'adjust_percent' | 'adjust_fixed'>('set_all');
  const [bulkPriceValue, setBulkPriceValue] = useState<string>('35');
  const [isSubmittingBulkPrice, setIsSubmittingBulkPrice] = useState(false);

  // Search in tables
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Quick Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const lowStockProducts = products.filter((p) => p.stock < 15);

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory(categories[0]?.name || 'Bauhaus & Geometry');
    setProdCollection('Curator Archive');
    setProdPrice('36');
    setProdDiscountPrice('');
    setProdStock('50');
    setProdDescription('Archival 200 gsm fine art paper physical poster. Rich mineral pigments with non-reflective matte finish.');
    setProdImageUrl('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80');
    setProdImageUrl2('');
    setProdIsFeatured(true);
    setProdIsBestSeller(false);
    setProdIsNewArrival(true);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdCollection(prod.collection);
    setProdPrice(prod.price.toString());
    setProdDiscountPrice(prod.discountPrice ? prod.discountPrice.toString() : '');
    setProdStock(prod.stock.toString());
    setProdDescription(prod.description);
    setProdImageUrl(prod.images[0] || '');
    setProdImageUrl2(prod.images[1] || '');
    setProdIsFeatured(prod.isFeatured);
    setProdIsBestSeller(prod.isBestSeller);
    setProdIsNewArrival(prod.isNewArrival);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = [prodImageUrl];
    if (prodImageUrl2.trim()) imagesArray.push(prodImageUrl2.trim());

    const sizes = [
      { id: 's-30x40', name: 'Small', dimensions: '30 × 40 cm (12 × 16″)', priceMultiplier: 1.0, inStock: true },
      { id: 's-50x70', name: 'Medium (Standard)', dimensions: '50 × 70 cm (20 × 28″)', priceMultiplier: 1.45, inStock: true },
      { id: 's-70x100', name: 'Large Exhibition', dimensions: '70 × 100 cm (28 × 40″)', priceMultiplier: 1.95, inStock: true }
    ];

    const frameOptions = [
      { id: 'f-none', name: 'Print Only (Unframed)', material: 'Archival 200gsm Matte Paper', price: 0, colorHex: '#e5e5e5', borderStyle: 'border-transparent' },
      { id: 'f-oak', name: 'Solid Oak Wood Frame', material: 'Natural Scandinavian Oak with Acrylic Glass', price: 34, colorHex: '#a07855', borderStyle: 'border-[#a07855]' },
      { id: 'f-black', name: 'Matte Black Aluminum', material: 'Brushed Aluminum with Acrylic Glass', price: 28, colorHex: '#18181b', borderStyle: 'border-stone-900' },
      { id: 'f-white', name: 'Clean White Wood Frame', material: 'Lacquered White Pine with Acrylic Glass', price: 28, colorHex: '#f5f5f5', borderStyle: 'border-stone-200' },
      { id: 'f-brass', name: 'Brushed Brass Metal', material: 'Electroplated Anodized Brass', price: 42, colorHex: '#c5a059', borderStyle: 'border-amber-600' }
    ];

    if (editingProductId) {
      await updateProduct(editingProductId, {
        name: prodName,
        category: prodCategory,
        collection: prodCollection,
        price: parseFloat(prodPrice),
        discountPrice: prodDiscountPrice ? parseFloat(prodDiscountPrice) : undefined,
        stock: parseInt(prodStock, 10),
        description: prodDescription,
        images: imagesArray,
        isFeatured: prodIsFeatured,
        isBestSeller: prodIsBestSeller,
        isNewArrival: prodIsNewArrival,
        sizes,
        frameOptions
      });
      showToast(`Poster "${prodName}" updated successfully.`);
    } else {
      await createProduct({
        name: prodName,
        category: prodCategory,
        collection: prodCollection,
        price: parseFloat(prodPrice),
        discountPrice: prodDiscountPrice ? parseFloat(prodDiscountPrice) : undefined,
        stock: parseInt(prodStock, 10),
        description: prodDescription,
        images: imagesArray,
        isFeatured: prodIsFeatured,
        isBestSeller: prodIsBestSeller,
        isNewArrival: prodIsNewArrival,
        rating: 5.0,
        reviewCount: 0,
        sizes,
        frameOptions,
        tags: [prodCategory.toLowerCase(), 'art-print', 'wall-decor']
      });
      showToast(`New poster "${prodName}" published to store.`);
    }

    setShowProductModal(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await createCategory({
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc || 'Curated physical art prints.',
      image: newCatImage || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
      productCount: 0
    });
    setNewCatName('');
    setNewCatDesc('');
    setNewCatImage('');
    showToast(`Category "${newCatName}" created.`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    await createCoupon({
      code: newCouponCode.toUpperCase(),
      discountType: newCouponType,
      discountValue: parseFloat(newCouponValue),
      minOrderAmount: parseFloat(newCouponMin),
      usageLimit: parseInt(newCouponLimit, 10),
      usageCount: 0,
      active: true,
      expiryDate: '2026-12-31'
    });
    setNewCouponCode('');
    showToast(`Coupon code "${newCouponCode.toUpperCase()}" active!`);
  };

  return (
    <div className="bg-[#f7f5f0] min-h-screen">
      
      {/* Top Admin Bar */}
      <header className="bg-stone-900 text-white px-4 sm:px-8 py-4 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            id="admin-exit-btn"
            type="button"
            onClick={() => setCurrentView('home')}
            className="p-2 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>

          <div className="h-4 w-px bg-stone-700" />

          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base tracking-wide text-white">
              LUMINA
            </span>
            <span className="text-[11px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded uppercase tracking-wider">
              Admin CMS
            </span>
          </div>
        </div>

        {/* Real-Time Live Status Pill & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 font-medium bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-Time SSE Sync Active</span>
          </div>

          <button
            id="admin-logout-btn"
            type="button"
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg text-xs font-semibold border border-stone-700 transition-colors"
            title="Lock Admin Portal and Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Lock & Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Layout with Sidebar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Admin Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Store Control Center
            </div>

            {[
              { id: 'overview', label: 'Overview & Stats', icon: BarChart3 },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
              { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
              { id: 'coupons', label: `Coupons & Discounts (${coupons.length})`, icon: Tag },
              { id: 'reviews', label: `Customer Reviews (${reviews.length})`, icon: Star },
              { id: 'settings', label: 'Store Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-nav-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Admin Content Area */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span className="font-semibold uppercase tracking-wider">Total Store Sales</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-4">
                      <span className="font-serif text-3xl font-bold text-stone-950">
                        {formatPrice(totalRevenue)}
                      </span>
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        +18.4% compared to last period
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span className="font-semibold uppercase tracking-wider">Total Physical Orders</span>
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-4">
                      <span className="font-serif text-3xl font-bold text-stone-950">
                        {totalOrdersCount}
                      </span>
                      <p className="text-[11px] text-stone-500 mt-1">
                        All orders persisted in local database
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span className="font-semibold uppercase tracking-wider">Active Art Catalog</span>
                      <Package className="w-4 h-4 text-stone-900" />
                    </div>
                    <div className="mt-4">
                      <span className="font-serif text-3xl font-bold text-stone-950">
                        {products.length}
                      </span>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Across {categories.length} art categories
                      </p>
                    </div>
                  </div>
                </div>

                {/* Low Stock Alert if any */}
                {lowStockProducts.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <h4 className="font-bold text-amber-900">Low Stock Inventory Notice</h4>
                      <p className="text-amber-800/90 mt-0.5">
                        {lowStockProducts.length} poster(s) have fewer than 15 physical sheets remaining in lab stock: {lowStockProducts.map((p) => p.name).join(', ')}.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recent Orders in Store */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold text-stone-950">
                      Recent Collector Orders
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
                    >
                      View All Orders
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-stone-400 font-semibold border-b border-stone-100">
                        <tr>
                          <th className="pb-3">Order #</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Artworks</th>
                          <th className="pb-3">Total</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-50">
                            <td className="py-3 font-mono font-bold text-stone-900">
                              #{ord.orderNumber}
                            </td>
                            <td className="py-3 text-stone-700">
                              <div>{ord.customer.fullName}</div>
                              <div className="text-[10px] text-stone-400">{ord.customer.email}</div>
                            </td>
                            <td className="py-3 text-stone-600">
                              {ord.items.length} print(s)
                            </td>
                            <td className="py-3 font-bold text-stone-900 font-mono">
                              {formatPrice(ord.total)}
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold uppercase">
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingOrder(ord);
                                  setEditingTracking(ord.trackingNumber || '');
                                }}
                                className="text-amber-800 hover:text-amber-950 font-semibold"
                              >
                                View / Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS MANAGEMENT TAB */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-stone-950">
                      Physical Posters Catalog ({products.length})
                    </h3>
                    <p className="text-xs text-stone-500">
                      Add, update prices, stock, frame sets, or spotlight products
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {/* Manual Currency Selector for Posters */}
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-300">
                      <span className="text-[10px] uppercase font-bold text-stone-600 pl-1">Currency:</span>
                      <select
                        id="admin-poster-currency-quick-select"
                        value={settings.currency || 'USD'}
                        onChange={(e) => {
                          const selected = CURRENCY_OPTIONS.find((c) => c.code === e.target.value);
                          if (selected) {
                            updateSettings({
                              currency: selected.code,
                              currencySymbol: selected.symbol,
                              currencyRate: selected.rate
                            });
                          } else {
                            updateSettings({ currency: e.target.value });
                          }
                        }}
                        className="bg-white text-stone-900 border border-stone-300 rounded-lg px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                      >
                        {CURRENCY_OPTIONS.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      id="admin-bulk-price-btn"
                      type="button"
                      onClick={() => setShowBulkPriceModal(true)}
                      className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4 text-amber-700" />
                      <span>Bulk Set Prices</span>
                    </button>

                    <button
                      id="admin-add-product-btn"
                      type="button"
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Add New Poster</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search catalog by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-stone-400 font-semibold border-b border-stone-100 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="pb-3">Artwork</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Stock</th>
                        <th className="pb-3">Badges</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products
                        .filter((p) =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-stone-50">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="w-10 h-14 object-cover rounded shadow-xs shrink-0 border border-stone-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="font-serif font-bold text-stone-950 text-sm">{prod.name}</div>
                                  <div className="text-[10px] text-stone-400 font-mono">SKU: {prod.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-stone-700">{prod.category}</td>
                            <td className="py-3">
                              <div className="font-bold text-stone-900 font-mono">{formatPrice(prod.price)}</div>
                              {prod.discountPrice && (
                                <div className="text-[10px] text-amber-700 font-mono">Sale: {formatPrice(prod.discountPrice)}</div>
                              )}
                            </td>
                            <td className="py-3">
                              <span className={`font-mono font-semibold ${prod.stock < 15 ? 'text-rose-600' : 'text-stone-800'}`}>
                                {prod.stock} sheets
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {prod.isBestSeller && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                    Best Seller
                                  </span>
                                )}
                                {prod.isNewArrival && (
                                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                                    New
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 hover:bg-stone-200 rounded text-stone-600 hover:text-stone-950"
                                title="Edit poster"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(prod.id)}
                                className="p-1.5 hover:bg-rose-100 rounded text-stone-400 hover:text-rose-600"
                                title="Delete poster"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. ORDERS MANAGEMENT TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-stone-950">
                      Collector Orders ({orders.length})
                    </h3>
                    <p className="text-xs text-stone-500">
                      Manage lab fulfillment, mark dispatched, and update FedEx tracking numbers
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-stone-400 font-semibold border-b border-stone-100 text-[10px] uppercase">
                      <tr>
                        <th className="pb-3">Order Number</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Customer & Address</th>
                        <th className="pb-3">Items</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Fulfillment Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50">
                          <td className="py-3 font-mono font-bold text-stone-950">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 text-stone-500 text-[11px]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-stone-700">
                            <div className="font-semibold">{order.customer.fullName}</div>
                            <div className="text-[11px] text-stone-400">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                          </td>
                          <td className="py-3 text-stone-600">
                            {order.items.length} print(s)
                          </td>
                          <td className="py-3 font-bold font-mono text-stone-950">
                            {formatPrice(order.total)}
                          </td>
                          <td className="py-3">
                            {order.status === 'Cancelled' ? (
                              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                <Ban className="w-3 h-3 text-rose-600" />
                                Cancelled
                              </span>
                            ) : (
                              <select
                                value={order.status}
                                onChange={(e) => {
                                  const next = e.target.value as OrderStatus;
                                  if (next === 'Cancelled') {
                                    setAdminCancellingOrder(order);
                                    setAdminCancelReasonOption('Customer requested cancellation');
                                    setAdminCustomReason('');
                                  } else {
                                    updateOrderStatus(order.id, next);
                                  }
                                }}
                                className="text-[11px] font-semibold bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:border-stone-900 cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing (Lab)</option>
                                <option value="Printed & Framed">Printed & Framed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancel & Restock...</option>
                              </select>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminCancellingOrder(order);
                                    setAdminCancelReasonOption('Customer requested cancellation');
                                    setAdminCustomReason('');
                                  }}
                                  className="px-2.5 py-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                  title="Cancel & Restock Order"
                                >
                                  <Ban className="w-3 h-3 text-rose-600" />
                                  <span>Cancel</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingOrder(order);
                                  setEditingTracking(order.trackingNumber || '');
                                }}
                                className="px-3 py-1 bg-stone-900 text-white rounded-lg text-[11px] font-semibold hover:bg-stone-800"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                <h3 className="font-serif text-lg font-semibold text-stone-950 pb-2 border-b border-stone-100">
                  Art Collections & Categories
                </h3>

                {/* Add Category Form */}
                <form onSubmit={handleCreateCategory} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider">Create Art Category</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Modernist Typography"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newCatImage}
                        onChange={(e) => setNewCatImage(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-stone-600 mb-1">Curation Description</label>
                    <input
                      type="text"
                      placeholder="Brief collection statement..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Add Category
                  </button>
                </form>

                {/* Categories List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 rounded-xl border border-stone-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-stone-900 text-sm">{cat.name}</h4>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{cat.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. COUPONS TAB */}
            {activeTab === 'coupons' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                <h3 className="font-serif text-lg font-semibold text-stone-950 pb-2 border-b border-stone-100">
                  Promotional Coupons & Collector Codes
                </h3>

                {/* Create Coupon Form */}
                <form onSubmit={handleCreateCoupon} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider">Generate Promo Code</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="SPRING20"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg uppercase tracking-wider font-mono focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Discount Type</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Value ({newCouponType === 'percentage' ? '%' : '₹'})</label>
                      <input
                        type="number"
                        required
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Min Order Amount (₹)</label>
                      <input
                        type="number"
                        value={newCouponMin}
                        onChange={(e) => setNewCouponMin(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Activate Coupon
                  </button>
                </form>

                {/* Coupons Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-stone-400 font-semibold border-b border-stone-100 uppercase text-[10px]">
                      <tr>
                        <th className="pb-3">Code</th>
                        <th className="pb-3">Discount</th>
                        <th className="pb-3">Min Order</th>
                        <th className="pb-3">Redeemed</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 font-mono font-bold text-stone-950">{c.code}</td>
                          <td className="py-3 font-medium">
                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                          </td>
                          <td className="py-3 text-stone-600">₹{c.minOrderAmount}</td>
                          <td className="py-3 text-stone-600">{c.usageCount} times</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                              Active
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => deleteCoupon(c.id)}
                              className="text-stone-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                <h3 className="font-serif text-lg font-semibold text-stone-950 pb-2 border-b border-stone-100">
                  Moderated Customer Reviews ({reviews.length})
                </h3>

                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-stone-200 flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{rev.author}</span>
                          <span className="text-stone-400">• on "{rev.productName}"</span>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <h5 className="font-semibold text-stone-800">"{rev.title}"</h5>
                        <p className="text-stone-600 italic">"{rev.comment}"</p>
                        <span className="text-[10px] text-stone-400 block">{rev.date}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteReview(rev.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 shrink-0"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6 max-w-2xl text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-stone-950">
                      Store Operations & Poster Currency Configuration
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Manage poster currency, tax rates, shipping policies, and admin security settings
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase">
                    Active: {settings.currency || 'INR'} ({settings.currencySymbol || '₹'})
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Store Brand Name</label>
                    <input
                      type="text"
                      defaultValue={settings.storeName}
                      onChange={(e) => updateSettings({ storeName: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-serif font-bold text-stone-900"
                    />
                  </div>

                  {/* Manual Poster Currency Selector Card */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-amber-700" />
                        <span>Manual Poster Currency Selector</span>
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        Exchange Rate Multiplier: {settings.currencyRate || 1.0}x
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Select Currency</label>
                        <select
                          id="admin-setting-currency-select"
                          value={settings.currency || 'INR'}
                          onChange={(e) => {
                            const selected = CURRENCY_OPTIONS.find((c) => c.code === e.target.value);
                            if (selected) {
                              updateSettings({
                                currency: selected.code,
                                currencySymbol: selected.symbol,
                                currencyRate: selected.rate
                              });
                            } else {
                              updateSettings({ currency: e.target.value });
                            }
                          }}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-bold font-mono focus:outline-none focus:border-stone-900"
                        >
                          {CURRENCY_OPTIONS.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code} — {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Currency Symbol</label>
                        <input
                          type="text"
                          value={settings.currencySymbol || '₹'}
                          onChange={(e) => updateSettings({ currencySymbol: e.target.value })}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-center focus:outline-none focus:border-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Price Rate Multiplier</label>
                        <input
                          type="number"
                          step="0.01"
                          value={settings.currencyRate || 1.0}
                          onChange={(e) => updateSettings({ currencyRate: parseFloat(e.target.value) || 1.0 })}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono text-center focus:outline-none focus:border-stone-900"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1.5 font-medium">Quick Currency Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {CURRENCY_OPTIONS.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => updateSettings({
                              currency: c.code,
                              currencySymbol: c.symbol,
                              currencyRate: c.rate
                            })}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                              settings.currency === c.code
                                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                                : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                            }`}
                          >
                            <span>{c.flag}</span>
                            <span>{c.code} ({c.symbol})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="p-3 bg-white rounded-xl border border-stone-200/90 text-[11px] text-stone-600 space-y-1">
                      <div className="font-semibold text-stone-900 flex justify-between">
                        <span>Poster Live Pricing Preview:</span>
                        <span className="font-mono text-emerald-800">{settings.currency || 'INR'} Active</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Base Poster (28.00 index):</span>
                        <span className="font-bold text-stone-950">
                          {formatPrice(28)}
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Solid Oak Frame (+34.00 index):</span>
                        <span className="font-bold text-stone-950">
                          {formatPrice(34)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Standard Tax Rate (%)</label>
                      <input
                        type="number"
                        defaultValue={settings.taxRate}
                        onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) })}
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Standard Shipping ({settings.currencySymbol || '₹'})</label>
                      <input
                        type="number"
                        defaultValue={settings.shippingFlatRate}
                        onChange={(e) => updateSettings({ shippingFlatRate: parseFloat(e.target.value) })}
                        className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Free Shipping Threshold ({settings.currencySymbol || '₹'})</label>
                    <input
                      type="number"
                      defaultValue={settings.freeShippingThreshold}
                      onChange={(e) => updateSettings({ freeShippingThreshold: parseFloat(e.target.value) })}
                      className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Store currency and settings saved successfully.')}
                    className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Save Store Settings
                  </button>

                  {/* Admin Security & OTP Recovery Phone Section */}
                  <div className="pt-6 border-t border-stone-200 mt-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <h4 className="font-semibold text-stone-900 text-sm">
                        Admin Portal Security & Mobile OTP
                      </h4>
                    </div>
                    <p className="text-xs text-stone-500">
                      The admin portal is locked with password authentication. In case you forget your password, you can use your registered mobile or WhatsApp number to instantly receive a 6-digit OTP code without requiring any email.
                    </p>
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-stone-500 block">Registered Recovery Mobile / WhatsApp:</span>
                        <span className="font-mono font-bold text-stone-900 text-sm">+1 555-234-5678</span>
                      </div>
                      <button
                        type="button"
                        onClick={logoutAdmin}
                        className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Lock & Test Password Menu</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
              <h3 className="font-serif text-xl font-normal text-stone-950">
                {editingProductId ? 'Edit Physical Poster' : 'Add New Physical Poster'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Poster Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bauhaus Geometric Balance No. 4"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Curated Collection</label>
                  <input
                    type="text"
                    placeholder="e.g. Dessau Archive 1926"
                    value={prodCollection}
                    onChange={(e) => setProdCollection(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Discount Price (Optional ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 29.00"
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Lab Physical Paper Stock (Units)</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Primary Poster Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                  {prodImageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={prodImageUrl}
                        alt="Preview"
                        className="w-12 h-16 object-cover rounded border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] text-stone-500">Live preview thumbnail</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Secondary / Angle Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={prodImageUrl2}
                    onChange={(e) => setProdImageUrl2(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Artwork Description</label>
                  <textarea
                    rows={3}
                    required
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="accent-stone-900"
                    />
                    <span className="font-medium text-stone-800">Feature on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsBestSeller}
                      onChange={(e) => setProdIsBestSeller(e.target.checked)}
                      className="accent-stone-900"
                    />
                    <span className="font-medium text-stone-800">Best Seller Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsNewArrival}
                      onChange={(e) => setProdIsNewArrival(e.target.checked)}
                      className="accent-stone-900"
                    />
                    <span className="font-medium text-stone-800">New Arrival Badge</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-product-submit"
                  type="submit"
                  className="px-6 py-2 bg-stone-950 hover:bg-stone-800 text-white font-semibold rounded-xl"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-xl font-normal text-stone-950">
                  Order #{viewingOrder.orderNumber}
                </h3>
                <span className="text-xs text-stone-400">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            {/* Customer & Shipping & Payment */}
            <div className="p-3.5 bg-stone-50 rounded-xl text-xs space-y-2 border border-stone-200">
              <div className="flex items-center justify-between">
                <div className="font-bold text-stone-900">{viewingOrder.customer.fullName} ({viewingOrder.customer.email})</div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {viewingOrder.paymentStatus || 'Paid'}
                </span>
              </div>
              <div className="text-stone-600">{viewingOrder.shippingAddress.street} {viewingOrder.shippingAddress.apartment || ''} • {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} {viewingOrder.shippingAddress.zipCode}</div>
              
              <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
                <span className="text-stone-500">
                  Payment Method: <strong className="text-stone-900">{viewingOrder.paymentMethod}</strong>
                  {viewingOrder.upiId && <span className="text-stone-600 font-mono ml-1">({viewingOrder.upiId})</span>}
                </span>
                {viewingOrder.upiTransactionRef && (
                  <span className="font-mono text-stone-500 text-[10px]">Ref: {viewingOrder.upiTransactionRef}</span>
                )}
              </div>
            </div>

            {/* Prints in order */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {viewingOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-stone-100/60 rounded-lg text-xs">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-10 h-14 object-cover rounded border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-900 truncate">{it.name}</div>
                    <div className="text-[11px] text-stone-500">{it.sizeName} • {it.frameName}</div>
                    <div className="text-[11px] text-stone-400">Qty: {it.quantity}</div>
                  </div>
                  <div className="font-mono font-bold text-stone-900">{formatPrice(it.totalPrice)}</div>
                </div>
              ))}
            </div>

            {/* Status & Tracking Number Editor OR Cancelled Info */}
            {viewingOrder.status === 'Cancelled' ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Order Cancelled & Restocked</span>
                </div>
                <p className="text-rose-900">
                  Cancelled by <span className="font-semibold">{viewingOrder.cancelledBy || 'Admin'}</span> on {new Date(viewingOrder.cancelledAt || viewingOrder.createdAt).toLocaleDateString()}.
                </p>
                {viewingOrder.cancelReason && (
                  <p className="text-stone-700 italic bg-white/70 p-2 rounded-lg border border-rose-100">
                    Reason: "{viewingOrder.cancelReason}"
                  </p>
                )}
                <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-emerald-800 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Payment Refunded ({formatPrice(viewingOrder.total)})
                  </span>
                  <span className="text-stone-500">Method: {viewingOrder.paymentMethod}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-stone-100 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Update Fulfillment Status</label>
                  <select
                    value={viewingOrder.status}
                    onChange={(e) => {
                      const nextStatus = e.target.value as OrderStatus;
                      if (nextStatus === 'Cancelled') {
                        setAdminCancellingOrder(viewingOrder);
                        setAdminCancelReasonOption('Customer requested cancellation');
                        setAdminCustomReason('');
                      } else {
                        updateOrderStatus(viewingOrder.id, nextStatus);
                        setViewingOrder({ ...viewingOrder, status: nextStatus });
                      }
                    }}
                    className="w-full p-2.5 border border-stone-300 rounded-lg font-semibold bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing (Lab Color Calibration)</option>
                    <option value="Printed & Framed">Printed & Framed</option>
                    <option value="Shipped">Shipped (Dispatched to Courier)</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Courier Tracking Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingTracking}
                      onChange={(e) => setEditingTracking(e.target.value)}
                      placeholder="FX-49382910482"
                      className="flex-1 p-2 border border-stone-300 rounded-lg font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateOrderStatus(viewingOrder.id, viewingOrder.status, editingTracking);
                        showToast('Tracking number updated.');
                      }}
                      className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold"
                    >
                      Save Tracking
                    </button>
                  </div>
                </div>

                {viewingOrder.status !== 'Delivered' && (
                  <div className="pt-2 border-t border-stone-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminCancellingOrder(viewingOrder);
                        setAdminCancelReasonOption('Customer requested cancellation');
                        setAdminCustomReason('');
                      }}
                      className="px-4 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-4 h-4 text-rose-600" />
                      <span>Cancel & Restock Order (Refund)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Price Update Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-950">
                    Bulk Update All Poster Prices
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Apply a new price or adjustment across all {products.length} catalog items simultaneously
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkPriceModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const numericVal = parseFloat(bulkPriceValue);
                if (isNaN(numericVal) || numericVal <= 0) {
                  showToast('Please provide a valid positive number');
                  return;
                }
                setIsSubmittingBulkPrice(true);
                try {
                  await bulkUpdatePrices(bulkPriceAction, numericVal);
                  setShowBulkPriceModal(false);
                } catch {
                  showToast('Failed to update prices');
                } finally {
                  setIsSubmittingBulkPrice(false);
                }
              }}
              className="space-y-5 text-xs"
            >
              {/* Method choice */}
              <div>
                <label className="block font-medium text-stone-800 mb-2">
                  Select Pricing Adjustment Strategy:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      bulkPriceAction === 'set_all'
                        ? 'border-stone-900 bg-stone-50 text-stone-950 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      checked={bulkPriceAction === 'set_all'}
                      onChange={() => setBulkPriceAction('set_all')}
                      className="accent-stone-900"
                    />
                    <div>
                      <div className="font-medium">Set All Posters to Exact Fixed Base Price</div>
                      <div className="text-[10px] text-stone-500">
                        Every single poster's base price will immediately be updated to this amount (e.g., ₹2,500)
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      bulkPriceAction === 'adjust_percent'
                        ? 'border-stone-900 bg-stone-50 text-stone-950 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      checked={bulkPriceAction === 'adjust_percent'}
                      onChange={() => setBulkPriceAction('adjust_percent')}
                      className="accent-stone-900"
                    />
                    <div>
                      <div className="font-medium">Adjust by Percentage (%)</div>
                      <div className="text-[10px] text-stone-500">
                        Increase or discount all poster prices by a percentage (e.g., 10 for +10%, or -15 for -15%)
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      bulkPriceAction === 'adjust_fixed'
                        ? 'border-stone-900 bg-stone-50 text-stone-950 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      checked={bulkPriceAction === 'adjust_fixed'}
                      onChange={() => setBulkPriceAction('adjust_fixed')}
                      className="accent-stone-900"
                    />
                    <div>
                      <div className="font-medium">Adjust by Fixed Rupee Amount (₹)</div>
                      <div className="text-[10px] text-stone-500">
                        Add or subtract a fixed rupee amount across every poster (e.g., 500 for +₹500)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Value Input */}
              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  {bulkPriceAction === 'set_all' && 'New Base Price For All Posters (₹ INR) *'}
                  {bulkPriceAction === 'adjust_percent' && 'Percentage Change (% e.g., 10 for +10% or -10 for discount) *'}
                  {bulkPriceAction === 'adjust_fixed' && 'Rupee Amount Change (₹ e.g., 500 or -500) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-stone-400">
                    {bulkPriceAction === 'adjust_percent' ? '%' : '₹'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(e.target.value)}
                    placeholder={bulkPriceAction === 'set_all' ? '2500' : '10'}
                    className="w-full pl-8 pr-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-mono text-sm font-bold text-stone-900"
                  />
                </div>
                {bulkPriceAction === 'set_all' && (
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    Example: Setting to <span className="font-mono font-semibold text-stone-800">₹2,500</span> will set all {products.length} posters in the store to ₹2,500 base price.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkPriceModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBulkPrice}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingBulkPrice ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating {products.length} posters...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Apply to All {products.length} Posters</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Order Cancellation & Restock Modal */}
      {adminCancellingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-scaleUp space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-950">
                    Cancel & Restock Order #{adminCancellingOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Collector: {adminCancellingOrder.customer.fullName} ({adminCancellingOrder.customer.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminCancellingOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Inventory Restock Notice */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
              <div className="font-semibold text-stone-900 flex items-center justify-between">
                <span>Items to Restock:</span>
                <span className="font-mono text-stone-950">{adminCancellingOrder.items.length} artwork items</span>
              </div>
              <div className="space-y-1 pt-1 border-t border-stone-200/80">
                {adminCancellingOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-stone-600 text-[11px]">
                    <span className="truncate max-w-[240px]">{it.name} ({it.sizeName})</span>
                    <span className="font-medium text-emerald-800">+{it.quantity} inventory returned</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-600">Total Refund:</span>
                <span className="font-mono font-bold text-stone-950">${adminCancellingOrder.total} ({adminCancellingOrder.paymentMethod})</span>
              </div>
            </div>

            {/* Cancellation Reason Selection */}
            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-stone-800">
                Admin Cancellation Reason:
              </label>
              <select
                value={adminCancelReasonOption}
                onChange={(e) => setAdminCancelReasonOption(e.target.value)}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-medium text-stone-800"
              >
                <option value="Customer requested cancellation via support">Customer requested cancellation via support</option>
                <option value="Item out of stock / Print lab paper unavailable">Item out of stock / Print lab paper unavailable</option>
                <option value="Suspected fraudulent order / failed verification">Suspected fraudulent order / failed verification</option>
                <option value="Pricing or discount calculation error">Pricing or discount calculation error</option>
                <option value="Undeliverable shipping destination">Undeliverable shipping destination</option>
                <option value="Other">Other (specify below)</option>
              </select>

              {adminCancelReasonOption === 'Other' && (
                <div>
                  <textarea
                    rows={2}
                    value={adminCustomReason}
                    onChange={(e) => setAdminCustomReason(e.target.value)}
                    placeholder="Enter reason for audit logs and customer notification..."
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isAdminCancelling}
                onClick={() => setAdminCancellingOrder(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={isAdminCancelling}
                onClick={handleConfirmAdminCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>{isAdminCancelling ? 'Processing...' : 'Confirm Cancel & Restock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
