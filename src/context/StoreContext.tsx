import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category, CartItem, Order, Coupon, Review, UserAccount, ShippingAddress, PosterSize, FrameOption, StoreSettings } from '../types';

interface StoreContextType {
  // Navigation & View state
  currentView: 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'account' | 'order-confirmation' | 'admin';
  setCurrentView: (view: 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'account' | 'order-confirmation' | 'admin') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  shopFilterTab?: 'all' | 'new-arrivals' | 'best-sellers';
  setShopFilterTab: (tab: 'all' | 'new-arrivals' | 'best-sellers') => void;

  // Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  isLoading: boolean;
  realtimeStatus: 'connected' | 'reconnecting' | 'disconnected';
  lastRealtimeEvent: string | null;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: PosterSize, frame: FrameOption, quantity?: number) => void;
  updateCartQuantity: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  discountAmount: number;
  shippingCost: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // User & Account
  user: UserAccount | null;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  updateUserProfile: (profile: Partial<UserAccount>) => void;
  addAddress: (address: ShippingAddress) => void;
  deleteAddress: (index: number) => void;

  // Checkout & Orders
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  placeOrder: (orderData: any) => Promise<Order>;
  trackOrderNumber: string | null;
  setTrackOrderNumber: (num: string | null) => void;

  // API Refreshers & Operations
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  refreshCoupons: () => Promise<void>;

  // Admin Actions & Store Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  addProduct: (productData: any) => Promise<Product>;
  createProduct: (productData: any) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  bulkUpdatePrices: (action: 'set_all' | 'adjust_percent' | 'adjust_fixed', value: number) => Promise<Product[]>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: Order['status'], note?: string, trackingNumber?: string, carrier?: string) => Promise<Order>;
  addCategory: (cat: any) => Promise<Category>;
  createCategory: (cat: any) => Promise<Category>;
  deleteCategory: (id: string) => Promise<boolean>;
  addCoupon: (coupon: any) => Promise<Coupon>;
  createCoupon: (coupon: any) => Promise<Coupon>;
  deleteCoupon: (id: string) => Promise<boolean>;
  toggleCoupon: (code: string) => Promise<Coupon>;
  deleteReview: (id: string) => Promise<boolean>;
  submitReview: (reviewData: any) => Promise<Review>;
  updateReviewStatus: (id: string, approved: boolean) => Promise<void>;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Admin Portal Security State
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  openAdminPortal: () => void;
  logoutAdmin: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'account' | 'order-confirmation' | 'admin'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shopFilterTab, setShopFilterTab] = useState<'all' | 'new-arrivals' | 'best-sellers'>('all');

  // Core Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<string | null>(null);

  // Cart & Checkout
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [trackOrderNumber, setTrackOrderNumber] = useState<string | null>(null);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_wishlist');
      return saved ? JSON.parse(saved) : ['prod-01', 'prod-03'];
    } catch {
      return ['prod-01', 'prod-03'];
    }
  });

  // User
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('lumina_user');
      return saved ? JSON.parse(saved) : {
        id: 'usr-default',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 234-5678',
        addresses: [
          {
            fullName: 'Sarah Jenkins',
            email: 'sarah.jenkins@example.com',
            phone: '+1 (555) 234-5678',
            street: '742 Evergreen Terrace',
            city: 'Portland',
            state: 'OR',
            zipCode: '97201',
            country: 'United States',
            isDefault: true
          }
        ],
        wishlist: ['prod-01', 'prod-03']
      };
    } catch {
      return null;
    }
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  // Admin Portal Security State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lumina_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  const openAdminPortal = () => {
    if (sessionStorage.getItem('lumina_admin_authenticated') === 'true') {
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
    } else {
      setIsAdminAuthenticated(false);
      setIsAdminAuthModalOpen(true);
    }
  };

  const logoutAdmin = () => {
    try {
      sessionStorage.removeItem('lumina_admin_authenticated');
    } catch {}
    setIsAdminAuthenticated(false);
    setIsAdminAuthModalOpen(false);
    setCurrentView('home');
    showToast('Signed out from Admin Portal.');
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('lumina_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('lumina_user', JSON.stringify(user));
      }
    } catch (e) {
      console.warn(e);
    }
  }, [user]);

  // Initial Data Fetch
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [prodsRes, catsRes, ordsRes, coupsRes, revsRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/coupons').then((r) => r.json()),
        fetch('/api/reviews').then((r) => r.json())
      ]);

      if (Array.isArray(prodsRes)) setProducts(prodsRes);
      if (Array.isArray(catsRes)) setCategories(catsRes);
      if (Array.isArray(ordsRes)) setOrders(ordsRes);
      if (Array.isArray(coupsRes)) setCoupons(coupsRes);
      if (Array.isArray(revsRes)) setReviews(revsRes);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      showToast('Connecting to server...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Server-Sent Events (SSE) for Real-Time Sync
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setRealtimeStatus('connected');
        };

        eventSource.addEventListener('connected', () => {
          setRealtimeStatus('connected');
        });

        // Product events
        eventSource.addEventListener('product_created', (e: any) => {
          const newProd = JSON.parse(e.data);
          setProducts((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
          setLastRealtimeEvent(`New Poster Added: "${newProd.name}"`);
          showToast(`⚡ Real-time update: Added "${newProd.name}"`);
        });

        eventSource.addEventListener('product_updated', (e: any) => {
          const updated = JSON.parse(e.data);
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setLastRealtimeEvent(`Product Updated: "${updated.name}"`);
          showToast(`⚡ Real-time update: "${updated.name}" updated`);
        });

        eventSource.addEventListener('product_deleted', (e: any) => {
          const { id } = JSON.parse(e.data);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          setLastRealtimeEvent('Product removed from catalog');
          showToast('⚡ Real-time update: Product removed');
        });

        eventSource.addEventListener('inventory_changed', (e: any) => {
          const { products: updatedProducts } = JSON.parse(e.data);
          if (Array.isArray(updatedProducts)) {
            setProducts(updatedProducts);
          }
        });

        // Order events
        eventSource.addEventListener('order_created', (e: any) => {
          const newOrder = JSON.parse(e.data);
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          setLastRealtimeEvent(`New Order Placed: #${newOrder.orderNumber}`);
        });

        eventSource.addEventListener('order_updated', (e: any) => {
          const updatedOrder = JSON.parse(e.data);
          setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
          if (currentOrder && (currentOrder.id === updatedOrder.id || currentOrder.orderNumber === updatedOrder.orderNumber)) {
            setCurrentOrder(updatedOrder);
          }
          setLastRealtimeEvent(`Order #${updatedOrder.orderNumber} status changed to ${updatedOrder.status}`);
          showToast(`⚡ Order #${updatedOrder.orderNumber} is now: ${updatedOrder.status}`);
        });

        // Category & Coupon events
        eventSource.addEventListener('category_created', (e: any) => {
          const newCat = JSON.parse(e.data);
          setCategories((prev) => [...prev, newCat]);
          showToast(`⚡ New Category: ${newCat.name}`);
        });

        eventSource.addEventListener('coupon_created', (e: any) => {
          const newCoupon = JSON.parse(e.data);
          setCoupons((prev) => [...prev, newCoupon]);
          showToast(`⚡ Promo Code "${newCoupon.code}" Activated!`);
        });

        eventSource.addEventListener('coupon_updated', (e: any) => {
          const updated = JSON.parse(e.data);
          setCoupons((prev) => prev.map((c) => (c.code === updated.code ? updated : c)));
        });

        // Review events
        eventSource.addEventListener('review_created', (e: any) => {
          const newRev = JSON.parse(e.data);
          setReviews((prev) => [newRev, ...prev]);
          showToast(`⭐ New Review from ${newRev.author}`);
        });

        eventSource.onerror = () => {
          setRealtimeStatus('reconnecting');
          eventSource?.close();
          retryTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.error('SSE connection error:', err);
        setRealtimeStatus('reconnecting');
      }
    };

    connectSSE();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (eventSource) eventSource.close();
    };
  }, [currentOrder]);

  // Refresh functions
  const refreshProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const refreshOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const refreshReviews = async () => {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    setReviews(data);
  };

  const refreshCoupons = async () => {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    setCoupons(data);
  };

  // Cart Operations
  const addToCart = (product: Product, size: PosterSize, frame: FrameOption, quantity = 1) => {
    const basePrice = product.discountPrice || product.price;
    const unitPrice = parseFloat((basePrice * size.priceMultiplier + frame.price).toFixed(2));
    const cartId = `${product.id}-${size.id}-${frame.id}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartId,
          productId: product.id,
          name: product.name,
          image: product.images[0],
          size,
          frame,
          unitPrice,
          quantity
        }
      ];
    });

    showToast(`Added "${product.name}" (${size.name}) to cart`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = parseFloat(
    cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0).toFixed(2)
  );

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal })
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        showToast(`Coupon "${data.coupon.code}" applied!`);
        return { success: true, message: 'Coupon applied successfully!' };
      } else {
        return { success: false, message: data.error || 'Invalid coupon code' };
      }
    } catch {
      return { success: false, message: 'Failed to validate coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = parseFloat(((cartSubtotal * appliedCoupon.discountValue) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, cartSubtotal);
    }
  }

  // Free shipping for orders over $75 or if FREESHIP coupon
  const isFreeShipping = cartSubtotal >= 75 || appliedCoupon?.code === 'FREESHIP';
  const shippingCost = cart.length === 0 ? 0 : isFreeShipping ? 0 : 7.99;
  const estimatedTax = parseFloat(((cartSubtotal - discountAmount) * 0.07).toFixed(2));
  const cartTotal = parseFloat(
    Math.max(0, cartSubtotal - discountAmount + shippingCost + (cart.length > 0 ? estimatedTax : 0)).toFixed(2)
  );

  // Wishlist Operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from Wishlist' : 'Saved to Wishlist ❤️');
      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // User Operations
  const loginUser = (email: string, name?: string) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0].replace('.', ' '),
      email,
      addresses: user?.addresses || [
        {
          fullName: name || 'Gallery Collector',
          email,
          phone: '+1 (555) 432-1098',
          street: '450 North Art District Way',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90012',
          country: 'United States',
          isDefault: true
        }
      ],
      wishlist
    };
    setUser(newUser);
    showToast(`Welcome back, ${newUser.name}!`);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('lumina_user');
    showToast('Signed out successfully');
  };

  const updateUserProfile = (profile: Partial<UserAccount>) => {
    if (!user) return;
    const updated = { ...user, ...profile };
    setUser(updated);
    showToast('Profile updated successfully');
  };

  const addAddress = (address: ShippingAddress) => {
    if (!user) return;
    const updated = {
      ...user,
      addresses: address.isDefault
        ? [address, ...user.addresses.map((a) => ({ ...a, isDefault: false }))]
        : [...user.addresses, address]
    };
    setUser(updated);
    showToast('Address added to profile');
  };

  const deleteAddress = (index: number) => {
    if (!user) return;
    const updated = {
      ...user,
      addresses: user.addresses.filter((_, i) => i !== index)
    };
    setUser(updated);
    showToast('Address removed');
  };

  // Checkout Operations
  const placeOrder = async (orderData: any): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      throw new Error('Order creation failed');
    }
    const created = await res.json();
    setCurrentOrder(created);
    clearCart();
    return created;
  };

  // Admin Actions
  const addProduct = async (productData: any): Promise<Product> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to create product');
    const created = await res.json();
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  };

  const bulkUpdatePrices = async (
    action: 'set_all' | 'adjust_percent' | 'adjust_fixed',
    value: number
  ): Promise<Product[]> => {
    const res = await fetch('/api/products/bulk-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value })
    });
    if (!res.ok) throw new Error('Failed to bulk update poster prices');
    const data = await res.json();
    if (data.products) {
      setProducts(data.products);
    }
    showToast(`Updated pricing for ${data.updatedCount || 'all'} posters`);
    return data.products;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    note?: string,
    trackingNumber?: string,
    carrier?: string
  ): Promise<Order> => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, trackingNumber, carrier })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  };

  const addCategory = async (cat: any): Promise<Category> => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return res.json();
  };

  const addCoupon = async (coupon: Coupon): Promise<Coupon> => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    return res.json();
  };

  const toggleCoupon = async (code: string): Promise<Coupon> => {
    const res = await fetch(`/api/coupons/${code}/toggle`, {
      method: 'PATCH'
    });
    return res.json();
  };

  const submitReview = async (reviewData: any): Promise<Review> => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return res.json();
  };

  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'LUMINA Fine Art Posters',
    currency: '$',
    taxRate: 7.0,
    shippingFlatRate: 5.99,
    freeShippingThreshold: 75.0
  });

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Store settings updated.');
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  const deleteCoupon = async (id: string): Promise<boolean> => {
    setCoupons((prev) => prev.filter((c) => c.code !== id && (c as any).id !== id));
    return true;
  };

  const updateReviewStatus = async (id: string, approved: boolean): Promise<void> => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, verified: approved } : r));
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE'
    });
    setReviews((prev) => prev.filter((r) => r.id !== id));
    return res.ok;
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        shopFilterTab,
        setShopFilterTab,
        products,
        categories,
        orders,
        coupons,
        reviews,
        isLoading,
        realtimeStatus,
        lastRealtimeEvent,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        shippingCost,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        user,
        loginUser,
        logoutUser,
        updateUserProfile,
        addAddress,
        deleteAddress,
        currentOrder,
        setCurrentOrder,
        placeOrder,
        trackOrderNumber,
        setTrackOrderNumber,
        refreshProducts,
        refreshOrders,
        refreshReviews,
        refreshCoupons,
        settings,
        updateSettings,
        addProduct,
        createProduct: addProduct,
        updateProduct,
        bulkUpdatePrices,
        deleteProduct,
        updateOrderStatus,
        addCategory,
        createCategory: addCategory,
        deleteCategory,
        addCoupon,
        createCoupon: addCoupon,
        deleteCoupon,
        toggleCoupon,
        deleteReview,
        submitReview,
        updateReviewStatus,
        toastMessage,
        showToast,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        openAdminPortal,
        logoutAdmin
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
