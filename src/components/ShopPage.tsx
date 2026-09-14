import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    shopFilterTab,
    setShopFilterTab,
    formatPrice
  } = useStore();

  // Local Shop filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const ITEMS_PER_PAGE = 8;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Quick tab filter
      if (shopFilterTab === 'best-sellers' && !p.isBestSeller) return false;
      if (shopFilterTab === 'new-arrivals' && !p.isNewArrival) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchCol = p.collection.toLowerCase().includes(query);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchCat && !matchCol && !matchTags) return false;
      }

      // Price filter
      const effectivePrice = p.discountPrice || p.price;
      if (effectivePrice < priceRange[0] || effectivePrice > priceRange[1]) {
        return false;
      }

      // Size filter
      if (selectedSizeFilter !== 'all') {
        const hasSize = p.sizes.some((s) => s.id === selectedSizeFilter || s.dimensions.includes(selectedSizeFilter));
        if (!hasSize) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return 0; // featured default
    });
  }, [products, selectedCategory, shopFilterTab, searchTerm, priceRange, selectedSizeFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setPriceRange([0, 10000]);
    setSelectedSizeFilter('all');
    setSortBy('featured');
    setShopFilterTab('all');
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <div className="text-xs text-stone-500 font-medium mb-1">
            Home / Shop / <span className="text-stone-900 font-semibold">{selectedCategory}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-950">
                {selectedCategory === 'All' ? 'All Fine Art Prints' : selectedCategory}
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Showing {filteredProducts.length} physical museum-grade posters
              </p>
            </div>

            {/* Quick Collections Tabs */}
            <div className="flex items-center gap-1.5 bg-stone-200/60 p-1 rounded-xl self-start">
              <button
                type="button"
                onClick={() => {
                  setShopFilterTab('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  shopFilterTab === 'all'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setShopFilterTab('best-sellers');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  shopFilterTab === 'best-sellers'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Best Sellers
              </button>
              <button
                type="button"
                onClick={() => {
                  setShopFilterTab('new-arrivals');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  shopFilterTab === 'new-arrivals'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                New Arrivals
              </button>
            </div>
          </div>
        </div>

        {/* Top Control Bar: Search, Mobile Filter Toggle, and Sort Selector */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="shop-search-input"
              type="text"
              placeholder="Search by title, tag, or art style..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:bg-white focus:border-stone-400 text-stone-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-between md:justify-end">
            {/* Mobile Filter Button */}
            <button
              id="mobile-filter-btn"
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  id="shop-sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-semibold bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-stone-400 cursor-pointer pr-8"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="bestseller">Best Sellers First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Drops</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className={`lg:block ${isMobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm`}>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-1.5 font-serif text-base font-semibold text-stone-900">
                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                <span>Refine Prints</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Art Category
              </h4>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === 'All'
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>All Artworks</span>
                  <span className={selectedCategory === 'All' ? 'text-stone-300' : 'text-stone-400'}>
                    {products.length}
                  </span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.name).length;
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-stone-900 text-white font-semibold'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="truncate mr-2">{cat.name}</span>
                      <span className={isSelected ? 'text-stone-300' : 'text-stone-400'}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-400">Price Ceiling</span>
                <span className="font-bold text-stone-900 font-mono">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </span>
              </div>
              <input
                id="price-range-slider"
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={priceRange[1]}
                onChange={(e) => {
                  setPriceRange([priceRange[0], Number(e.target.value)]);
                  setCurrentPage(1);
                }}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>{formatPrice(1000)}</span>
                <span>{formatPrice(5000)}</span>
                <span>{formatPrice(10000)}</span>
              </div>
            </div>

            {/* Poster Size Filter */}
            <div className="space-y-2 pt-3 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Poster Size
              </h4>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Dimensions' },
                  { id: '30 × 40', label: 'Small (30 × 40 cm / 12×16″)' },
                  { id: '50 × 70', label: 'Medium (50 × 70 cm / 20×28″)' },
                  { id: '70 × 100', label: 'Gallery (70 × 100 cm / 28×40″)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSizeFilter(s.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 rounded-lg text-left transition-colors font-medium ${
                      selectedSizeFilter === s.id
                        ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Details Note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Museum Quality Guarantee</span>
              </div>
              <p className="text-amber-800/90 leading-relaxed">
                All posters are printed on heavyweight 200 gsm acid-free archival matte paper.
              </p>
            </div>
          </aside>

          {/* Products Grid & Pagination */}
          <main className="lg:col-span-3 space-y-8">
            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">
                  No posters found
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                  Try adjusting your search terms, clearing category filters, or raising the price ceiling.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  id="pagination-prev-btn"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      id={`pagination-page-${pageNum}`}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                        currentPage === pageNum
                          ? 'bg-stone-950 text-white shadow-md'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  id="pagination-next-btn"
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};
