import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  SlidersHorizontal, 
  Menu, 
  X, 
  Sparkles, 
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Tag,
  Lock
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    wishlist,
    setIsCartOpen,
    categories,
    selectedCategory,
    setSelectedCategory,
    setShopFilterTab,
    products,
    setSelectedProductId,
    realtimeStatus,
    user,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    openAdminPortal,
    logoutAdmin
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = localSearch.trim()
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(localSearch.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(localSearch.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentView('product-detail');
    setIsSearchOpen(false);
    setLocalSearch('');
    setIsMobileMenuOpen(false);
  };

  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentView('shop');
    setIsCategoryMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200 transition-all">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-stone-200">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          Autumn Collector Drop: Use code <strong className="text-amber-300 tracking-wider">POSTER15</strong> for 15% off
        </span>
        <span className="hidden md:inline text-stone-500">•</span>
        <span className="hidden md:inline text-stone-400">Archival 200gsm Museum Paper & Custom Hand-Joined Frames</span>
        <span className="hidden lg:inline text-stone-500">•</span>
        <span className="hidden lg:inline-flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Real-Time Sync {realtimeStatus === 'connected' ? 'Active' : 'Connecting'}
        </span>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-4">
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-stone-900"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            type="button"
            onClick={() => {
              setCurrentView('home');
              setSelectedCategory('All');
            }}
            className="text-left flex flex-col group cursor-pointer focus:outline-none"
          >
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-[0.25em] text-stone-950 group-hover:text-stone-700 transition-colors">
              LUMINA
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-[0.35em] text-stone-500 -mt-1">
              Fine Art Posters
            </span>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-stone-700 tracking-wide">
          <button
            id="nav-home"
            type="button"
            onClick={() => {
              setCurrentView('home');
              setSelectedCategory('All');
            }}
            className={`transition-colors hover:text-stone-950 pb-1 border-b-2 ${
              currentView === 'home' ? 'border-stone-950 text-stone-950 font-semibold' : 'border-transparent'
            }`}
          >
            Home
          </button>

          <button
            id="nav-shop"
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setCurrentView('shop');
            }}
            className={`transition-colors hover:text-stone-950 pb-1 border-b-2 ${
              currentView === 'shop' && !['cat-bauhaus'].includes(selectedCategory)
                ? 'border-stone-950 text-stone-950 font-semibold'
                : 'border-transparent'
            }`}
          >
            Shop
          </button>

          {/* Categories Dropdown */}
          <div className="relative group">
            <button
              id="nav-categories-dropdown"
              type="button"
              onMouseEnter={() => setIsCategoryMenuOpen(true)}
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-1 transition-colors hover:text-stone-950 py-2"
            >
              <span>Categories</span>
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>

            {/* Dropdown Panel */}
            <div
              onMouseLeave={() => setIsCategoryMenuOpen(false)}
              className={`absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 transition-all duration-150 z-50 ${
                isCategoryMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible pointer-events-none -translate-y-2'
              }`}
            >
              <div className="px-4 py-2 border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-wider">
                Browse Collections
              </div>
              <button
                id="cat-select-all"
                type="button"
                onClick={() => handleSelectCategory('All')}
                className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-medium flex items-center justify-between"
              >
                <span>All Art Prints</span>
                <span className="text-xs text-stone-400">{products.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  id={`cat-select-${cat.slug}`}
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.name)}
                  className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-950 flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-stone-400">
                    {products.filter((p) => p.category === cat.name).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            id="nav-new-arrivals"
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setCurrentView('shop');
            }}
            className="transition-colors hover:text-stone-950 flex items-center gap-1.5"
          >
            <span>New Arrivals</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Drop
            </span>
          </button>

          <button
            id="nav-best-sellers"
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setCurrentView('shop');
            }}
            className="transition-colors hover:text-stone-950"
          >
            Best Sellers
          </button>
        </nav>

        {/* Right: Actions (Search, Wishlist, Account, Cart, Admin Switch) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Search Trigger & Input */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-white border border-stone-300 rounded-full px-3 py-1.5 shadow-sm w-48 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  id="header-search-input"
                  type="text"
                  placeholder="Search posters, styles..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-stone-800 placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setLocalSearch('');
                  }}
                  className="text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="search-toggle-btn"
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-stone-700 hover:text-stone-950 rounded-full hover:bg-stone-200/50 transition-colors"
                aria-label="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Instant Search Dropdown Results */}
            {isSearchOpen && localSearch.trim() && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white rounded-xl shadow-2xl border border-stone-200 p-3 z-50">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 px-2 pb-2 mb-1 border-b border-stone-100">
                  Matching Posters ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-500">
                    No artworks found matching "{localSearch}".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors text-left group"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-stone-900 truncate group-hover:text-amber-700 transition-colors">
                            {prod.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate">{prod.category}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-stone-950">
                              ${prod.discountPrice || prod.price}
                            </span>
                            {prod.discountPrice && (
                              <span className="text-[10px] text-stone-400 line-through">
                                ${prod.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-stone-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('shop');
                      setIsSearchOpen(false);
                    }}
                    className="text-xs font-medium text-stone-600 hover:text-stone-950 underline"
                  >
                    View all catalog results
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            id="wishlist-btn"
            type="button"
            onClick={() => setCurrentView('account')}
            className="p-2 text-stone-700 hover:text-stone-950 rounded-full hover:bg-stone-200/50 transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute 0 top-1 right-1 w-4 h-4 bg-amber-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Customer Account Button */}
          <button
            id="account-btn"
            type="button"
            onClick={() => setCurrentView('account')}
            className="p-2 text-stone-700 hover:text-stone-950 rounded-full hover:bg-stone-200/50 transition-colors flex items-center gap-1.5"
            aria-label="Account Profile"
          >
            <User className="w-5 h-5" />
            {user && (
              <span className="hidden md:inline text-xs font-medium text-stone-800 max-w-[80px] truncate">
                {user.name.split(' ')[0]}
              </span>
            )}
          </button>

          {/* Shopping Cart Button */}
          <button
            id="cart-drawer-toggle"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="p-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors relative shadow-sm flex items-center justify-center"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-amber-500 text-stone-950 text-[11px] font-black rounded-full flex items-center justify-center border-2 border-[#faf8f5]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Switcher Button */}
          <div className="border-l border-stone-300 pl-2 sm:pl-3">
            <button
              id="admin-dashboard-toggle"
              type="button"
              onClick={() => {
                if (currentView === 'admin') {
                  setCurrentView('home');
                } else {
                  openAdminPortal();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-sm ${
                currentView === 'admin'
                  ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-400/50'
                  : 'bg-stone-200/90 text-stone-800 hover:bg-stone-900 hover:text-white'
              }`}
              title="Admin Portal - Password authentication required"
            >
              {currentView === 'admin' ? (
                <SlidersHorizontal className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-stone-600 group-hover:text-white" />
              )}
              <span className="hidden sm:inline">
                {currentView === 'admin' ? 'Exit Admin' : 'Admin Portal'}
              </span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-5 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-medium text-stone-900 py-1"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setCurrentView('shop');
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-medium text-stone-900 py-1"
            >
              Shop All Artworks
            </button>
            <div className="pl-3 border-l-2 border-stone-200 space-y-2 py-1">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Collections</div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.name)}
                  className="block text-left text-sm text-stone-600 hover:text-stone-950 py-0.5"
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentView('account');
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-medium text-stone-900 py-1 flex items-center justify-between"
            >
              <span>My Account & Orders</span>
              <User className="w-4 h-4 text-stone-400" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('account');
                setIsMobileMenuOpen(false);
              }}
              className="text-left font-medium text-stone-900 py-1 flex items-center justify-between"
            >
              <span>Saved Wishlist ({wishlist.length})</span>
              <Heart className="w-4 h-4 text-stone-400" />
            </button>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAdminPortal();
                }}
                className="w-full py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Open Admin Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
