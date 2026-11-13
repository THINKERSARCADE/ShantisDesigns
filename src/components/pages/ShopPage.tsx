import React, { useState, useEffect } from 'react';
import { Product, Category, StockStatus } from '../../types';
import {
  Search,
  Grid,
  List,
  ShoppingCart,
  FileText,
  Check,
  Star,
  SlidersHorizontal,
  Heart,
  Layers,
  Eye,
  FolderOpen,
  X
} from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategorySlug?: string | null;
  onSelectCategory?: (slug: string | null) => void;
  onAddToCart: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickViewProduct?: (product: Product) => void;
  wishlistIds?: number[];
  onToggleWishlist?: (id: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (id: number) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  selectedCategorySlug = null,
  onSelectCategory,
  onAddToCart,
  onRequestQuote,
  onSelectProduct,
  onQuickViewProduct,
  wishlistIds = [],
  onToggleWishlist,
  comparisonIds = [],
  onToggleComparison
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState<StockStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  // Find active category from slug
  const activeCategory = selectedCategorySlug
    ? categories.find(
        c =>
          c.slug.toLowerCase() === selectedCategorySlug.toLowerCase() ||
          c.name.toLowerCase() === selectedCategorySlug.replace(/-/g, ' ').toLowerCase()
      )
    : null;

  // Helper to check if a product belongs to a category or slug/tag
  const productMatchesSlug = (p: Product, slug: string): boolean => {
    const cleanSlug = slug.toLowerCase();
    const cat = categories.find(c => c.slug.toLowerCase() === cleanSlug);
    if (cat && p.category_id === cat.id) return true;
    if (cat && p.category_name?.toLowerCase() === cat.name.toLowerCase()) return true;
    if (cat && p.categories?.some(cName => cName.toLowerCase() === cat.name.toLowerCase())) return true;
    const slugWords = cleanSlug.replace(/-/g, ' ');
    if (p.category_name?.toLowerCase().includes(slugWords)) return true;
    if (p.categories?.some(cName => cName.toLowerCase().includes(slugWords))) return true;
    if (p.tags?.some(t => t.toLowerCase().includes(slugWords) || t.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug)) return true;
    if (p.name.toLowerCase().includes(slugWords)) return true;
    return false;
  };

  // Filtering
  const filtered = products.filter(p => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      !selectedCategorySlug || productMatchesSlug(p, selectedCategorySlug);

    const matchesStock =
      selectedStockStatus === 'all' || p.stock_status === selectedStockStatus;

    return matchesSearch && matchesCat && matchesStock;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const priceA = a.sale_price || a.price;
    const priceB = b.sale_price || b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedIds(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  const handleCategoryChange = (slug: string | null) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
  };

  const archiveTitle = activeCategory
    ? activeCategory.name
    : selectedCategorySlug
    ? selectedCategorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Solar Equipment Shop';

  const archivePermalink = selectedCategorySlug
    ? `https://shantisdesigns.co.ke/product-category/${selectedCategorySlug}/`
    : 'https://shantisdesigns.co.ke/shop/';

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Category Archive Banner */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
            <button
              onClick={() => handleCategoryChange(null)}
              className="hover:text-[#F58220] cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => handleCategoryChange(null)}
              className={`hover:text-[#F58220] cursor-pointer ${
                !selectedCategorySlug ? 'font-bold text-slate-900' : ''
              }`}
            >
              Shop
            </button>
            {selectedCategorySlug && (
              <>
                <span>/</span>
                <span className="font-bold text-[#238B3D]">{archiveTitle}</span>
              </>
            )}
          </div>

          {/* Active Category Hero Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {activeCategory?.image_url && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-200 bg-slate-50 p-2 shrink-0 flex items-center justify-center">
                  <img
                    src={activeCategory.image_url}
                    alt={activeCategory.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#238B3D]/10 text-[#238B3D] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    {selectedCategorySlug ? 'Official Category Archive' : 'Full Product Catalog'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {sorted.length} Products Available
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {archiveTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  {activeCategory?.description ||
                    'Browse our verified inventory of Tier-1 Horay N-Type & JA Solar panels, Must & Deye hybrid inverters, Lithium Valley LiFePO4 batteries, EcoFlow power backups, and Doyin submersible water pumps — with same-day dispatch across Nairobi, Meru, Mombasa, Kisumu, Nakuru, Isiolo & Machakos.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedCategorySlug && (
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Show All Categories ({products.length})</span>
                </button>
              )}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#F58220]" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar + Product Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filter */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1 space-y-6`}>
            {/* Search Box */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Search Shop
              </h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="SKU, inverter, panel, pump..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Categories Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Product Categories ({categories.length})
                </h4>
                {selectedCategorySlug !== null && (
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className="text-[11px] text-[#F58220] font-bold hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1 text-xs max-h-96 overflow-y-auto pr-1">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategorySlug === null
                      ? 'bg-orange-50 text-[#F58220] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-400">{products.length}</span>
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => productMatchesSlug(p, cat.slug)).length;
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 text-[#F58220] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="text-[10px] text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* WooCommerce Stock Status Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                WooCommerce Stock Status
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stockFilter"
                    checked={selectedStockStatus === 'all'}
                    onChange={() => setSelectedStockStatus('all')}
                    className="text-[#F58220] focus:ring-[#F58220]"
                  />
                  <span>All Items ({products.length})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stockFilter"
                    checked={selectedStockStatus === 'instock'}
                    onChange={() => setSelectedStockStatus('instock')}
                    className="text-[#238B3D] focus:ring-[#238B3D]"
                  />
                  <span className="text-emerald-700 font-semibold">
                    In Stock ({products.filter(p => p.stock_status === 'instock').length})
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stockFilter"
                    checked={selectedStockStatus === 'onbackorder'}
                    onChange={() => setSelectedStockStatus('onbackorder')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-amber-700 font-semibold">
                    Available on Backorder ({products.filter(p => p.stock_status === 'onbackorder').length})
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stockFilter"
                    checked={selectedStockStatus === 'outofstock'}
                    onChange={() => setSelectedStockStatus('outofstock')}
                    className="text-red-500 focus:ring-red-400"
                  />
                  <span className="text-red-600">
                    Out of Stock ({products.filter(p => p.stock_status === 'outofstock').length})
                  </span>
                </label>
              </div>
            </div>

            {/* EPRA Guarantee Box */}
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 block">
                Official Kenya Warranty
              </span>
              <p className="leading-relaxed">
                All solar panels carry 25-year performance warranties. Inverters, lithium batteries, and Doyin pumps include full manufacturer technical support and service in Nairobi.
              </p>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-3 space-y-4">
            {/* Control Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{sorted.length}</strong> solar products
                {selectedCategorySlug ? ` in "${archiveTitle}"` : ''}
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden"
                  >
                    <option value="default">Default Ranking</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Average Rating</option>
                  </select>
                </div>

                <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white shadow-2xs text-[#F58220]' : 'text-slate-500'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-white shadow-2xs text-[#F58220]' : 'text-slate-500'
                    }`}
                    title="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products List/Grid */}
            {sorted.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                <p className="text-sm font-bold text-slate-800">
                  No solar equipment matched your current filters.
                </p>
                <p className="text-xs text-slate-500">
                  Try clearing the search query or viewing all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    handleCategoryChange(null);
                    setSelectedStockStatus('all');
                  }}
                  className="bg-[#F58220] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'space-y-4'
                }
              >
                {sorted.map(product => {
                  const currentPrice = product.sale_price || product.price;
                  const isAdded = addedIds.includes(product.id);
                  const isOutOfStock = product.stock_status === 'outofstock';
                  const isBackorder = product.stock_status === 'onbackorder';

                  return (
                    <div
                      key={product.id}
                      onClick={() => onSelectProduct(product)}
                      className={`group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex overflow-hidden cursor-pointer ${
                        viewMode === 'grid' ? 'flex-col justify-between' : 'flex-col sm:flex-row'
                      }`}
                    >
                      {/* Image */}
                      <div
                        className={`relative bg-white p-3 overflow-hidden shrink-0 flex items-center justify-center border-b border-slate-100 ${
                          viewMode === 'grid' ? 'aspect-4/3' : 'sm:w-48 aspect-4/3 sm:aspect-square'
                        }`}
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />

                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                          {product.sale_price && (
                            <span className="bg-[#F58220] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                              SALE
                            </span>
                          )}
                        </div>

                        {/* Top-Right Quick Action Buttons: QuickView, Wishlist & Compare */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                          {onQuickViewProduct && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onQuickViewProduct(product);
                              }}
                              className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-[#F58220] transition-colors shadow-xs cursor-pointer"
                              title="Quick View Modal"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onToggleComparison && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onToggleComparison(product.id);
                              }}
                              className={`p-1.5 rounded-full transition-all shadow-xs cursor-pointer ${
                                comparisonIds.includes(product.id)
                                  ? 'bg-amber-400 text-slate-950 font-bold'
                                  : 'bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900'
                              }`}
                              title="Compare specifications"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onToggleWishlist && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onToggleWishlist(product.id);
                              }}
                              className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 transition-colors shadow-xs cursor-pointer"
                              title={
                                wishlistIds.includes(product.id)
                                  ? 'Remove from Wishlist'
                                  : 'Save to Wishlist'
                              }
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  wishlistIds.includes(product.id)
                                    ? 'fill-red-500 text-red-500'
                                    : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* WooCommerce Stock Status Badge */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-semibold">
                          {isOutOfStock ? (
                            <span className="bg-red-600/90 text-white px-2 py-0.5 rounded shadow-xs">
                              Out of stock
                            </span>
                          ) : isBackorder ? (
                            <span className="bg-amber-600/90 text-white px-2 py-0.5 rounded shadow-xs">
                              On backorder
                            </span>
                          ) : (
                            <span className="bg-emerald-700/90 text-white px-2 py-0.5 rounded shadow-xs">
                              In stock ({product.stock})
                            </span>
                          )}
                          <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-[9px] font-mono">
                            {product.sku}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-[11px] font-semibold text-[#238B3D] uppercase tracking-wider">
                              {product.category_name}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-slate-800">
                                {product.rating || 4.9}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#F58220] transition-colors line-clamp-2">
                            {product.name}
                          </h3>

                          {product.shortDescription && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {product.shortDescription}
                            </p>
                          )}

                          {/* Permalink Snippet */}
                          <p className="text-[10px] text-slate-400 font-mono mt-1.5 truncate">
                            {product.permalink || `https://shantisdesigns.co.ke/product/${product.slug}/`}
                          </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 border-t border-slate-100 mt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-extrabold text-slate-900">
                              KES {currentPrice.toLocaleString()}
                            </span>
                            {product.sale_price && product.regular_price && (
                              <span className="text-xs text-slate-400 line-through">
                                KES {product.regular_price.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Dual Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <button
                              onClick={e => handleAddToCart(e, product)}
                              disabled={isOutOfStock}
                              className={`w-full flex items-center justify-center gap-1 py-2 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#F58220] hover:bg-[#e07214] text-white shadow-xs active:scale-95'
                              }`}
                            >
                              {isAdded ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <ShoppingCart className="w-3.5 h-3.5" />
                              )}
                              <span className="truncate">
                                {isOutOfStock ? 'Sold Out' : isAdded ? 'Added' : 'Add to Cart'}
                              </span>
                            </button>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onRequestQuote(product);
                              }}
                              className="w-full flex items-center justify-center gap-1 py-2 px-2 bg-[#238B3D] hover:bg-[#1b7030] text-white rounded-lg font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Get Quote</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
