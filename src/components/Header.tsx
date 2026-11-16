import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Phone,
  Menu,
  X,
  Lock,
  ChevronDown,
  MapPin,
  Heart,
  PackageSearch
} from 'lucide-react';
import { Product, Category } from '../types';

export type NavPage =
  | 'home'
  | 'shop'
  | 'product'
  | 'projects'
  | 'insights'
  | 'about'
  | 'contact'
  | 'order-tracking'
  | 'kenya-seo'
  | 'terms'
  | 'privacy';

interface HeaderProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  comparisonCount?: number;
  onOpenComparison?: () => void;
  onOpenQuote?: () => void;
  onOpenAdmin: () => void;
  onSelectCategory?: (slug: string | null) => void;
  products: Product[];
  categories?: Category[];
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist,
  onOpenQuote,
  onOpenAdmin,
  onSelectCategory,
  products,
  categories = [],
  onSelectProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [departmentsDropdownOpen, setDepartmentsDropdownOpen] = useState(false);

  const filteredProducts = searchQuery.trim()
    ? products
        .filter(p => {
          const matchesCat =
            selectedSearchCategory === 'all' ||
            p.category_name?.toLowerCase().includes(selectedSearchCategory.toLowerCase()) ||
            p.category_id?.toString() === selectedSearchCategory;
          const matchesText =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category_name &&
              p.category_name.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesCat && matchesText;
        })
        .slice(0, 6)
    : [];

  const navCategories = [
    { name: 'Solar Power backup', slug: 'solar-power-backup' },
    { name: 'Solar Panels', slug: 'solar-panels' },
    { name: 'SOLAR LIGHTS', slug: 'solar-lights' },
    { name: 'Must inverter', slug: 'must-inverter' },
    { name: 'Lithium Valley', slug: 'lithium-valley' },
    { name: 'Solar Batteries', slug: 'solar-batteries' },
    { name: 'Water Pumps', slug: 'water-pumps' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      {/* 1. TOP GREEN UTILITY BAR (matching live shantisdesigns.co.ke) */}
      <div className="bg-[#238B3D] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-1.5 min-w-0">
          {/* Left Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-white/95 min-w-0">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
              <span>Find Our Store</span>
            </button>
            <span className="text-white/40">|</span>
            <button
              onClick={() => onNavigate('about')}
              className={`hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'about' ? 'text-amber-200 font-bold underline' : ''
              }`}
            >
              About Us
            </button>
            <span className="text-white/40">|</span>
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(null);
                onNavigate('shop');
              }}
              className={`hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'shop' ? 'text-amber-200 font-bold underline' : ''
              }`}
            >
              Shop
            </button>
            <span className="text-white/40">|</span>
            <button
              onClick={() => onNavigate('projects')}
              className={`hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'projects' ? 'text-amber-200 font-bold underline' : ''
              }`}
            >
              Our Projects
            </button>
            <span className="text-white/40 hidden sm:inline">|</span>
            <button
              onClick={() => onNavigate('insights')}
              className={`hidden sm:inline hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'insights' ? 'text-amber-200 font-bold underline' : ''
              }`}
            >
              Blog
            </button>
            <span className="text-white/40 hidden sm:inline">|</span>
            <button
              onClick={() => onNavigate('kenya-seo')}
              className={`hidden sm:inline hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'kenya-seo' ? 'text-amber-200 font-bold underline' : ''
              }`}
            >
              Kenya Solar Hubs
            </button>
            <span className="text-white/40 hidden sm:inline">|</span>
            <button
              onClick={() => onNavigate('contact')}
              className={`hidden sm:inline hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'contact' ? 'text-amber-200 font-bold underline' : ''
              }`}
            >
              Contact Us
            </button>
          </div>

          {/* Right Free Delivery & Cart teaser */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-white/95 shrink-0">
            <span className="text-amber-200 font-semibold tracking-wide hidden xl:inline whitespace-nowrap">
              Free delivery in Nairobi and its environs.
            </span>
            <span className="text-white/40 hidden xl:inline">|</span>
            <button
              onClick={() => onNavigate('order-tracking')}
              className="hover:text-amber-200 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <PackageSearch className="w-3 h-3 text-amber-300 shrink-0" />
              <span>Track Order</span>
            </button>
            <span className="text-white/40">|</span>
            <button
              onClick={onOpenCart}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <ShoppingCart className="w-3 h-3 shrink-0" />
              <span>Cart ({cartCount})</span>
            </button>
            <span className="text-white/40 hidden sm:inline">|</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-amber-300 text-amber-200/95 font-semibold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
              title="Admin Portal (Login & 2FA)"
            >
              <Lock className="w-3 h-3 shrink-0" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BRAND ROW */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 xl:gap-5 min-w-0">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <img
              src="/assets/aistudio/pdf-logo__1__3934e2bd.jpg"
              alt="Shantis Designs Solar Solutions"
              className="h-9 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
            />
          </div>

          {/* 24/7 Support Callout */}
          <div className="hidden lg:flex items-center gap-2.5 pl-1 pr-3 border-r border-slate-200 shrink-0">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#238B3D] shrink-0">
              <Phone className="w-4 h-4 animate-pulse" />
            </div>
            <div className="whitespace-nowrap">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-tight">
                24/7 Support
              </p>
              <a
                href="tel:+254115521631"
                className="text-xs xl:text-sm font-extrabold text-slate-900 hover:text-[#F58220] transition-colors"
              >
                +254 115 521 631
              </a>
            </div>
          </div>

          {/* Authentic Live Category Links */}
          <nav className="hidden lg:flex items-center gap-2.5 xl:gap-4 text-[11px] xl:text-xs font-bold text-slate-700 min-w-0 overflow-hidden">
            {navCategories.slice(0, 6).map(cat => (
              <button
                key={cat.slug}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat.slug);
                  onNavigate('shop');
                }}
                className="hover:text-[#F58220] transition-colors cursor-pointer whitespace-nowrap py-1 border-b-2 border-transparent hover:border-[#F58220] truncate"
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Action CTAs: Wishlist & Cart (Quote button removed cleanly per requirement) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist Trigger */}
            <button
              onClick={onOpenWishlist}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-slate-800 bg-red-50/80 hover:bg-red-100/90 border border-red-200 rounded-lg transition-colors cursor-pointer font-bold text-xs whitespace-nowrap"
              aria-label="View Wishlist"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500 shrink-0" />
              <span className="hidden sm:inline text-slate-700 font-semibold">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-extrabold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-slate-800 bg-orange-50/80 hover:bg-orange-100/90 border border-orange-200 rounded-lg transition-colors cursor-pointer font-bold text-xs whitespace-nowrap"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#F58220] shrink-0" />
              <span className="hidden sm:inline text-slate-700 font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#F58220] text-white text-[11px] font-extrabold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. ORANGE PROMOTIONAL SEARCH & DEPARTMENT RIBBON */}
      <div className="bg-[#F58220] text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 min-w-0">
            {/* Shop by Department Dropdown */}
            <div className="relative w-full lg:w-auto shrink-0">
              <button
                onClick={() => setDepartmentsDropdownOpen(!departmentsDropdownOpen)}
                className="w-full lg:w-auto flex items-center justify-between gap-3 bg-[#e07214] hover:bg-[#c9630c] px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide uppercase transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <Menu className="w-4 h-4 text-white" />
                  <span>Shop By Department ({categories.length || 35})</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    departmentsDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Department Dropdown Menu */}
              {departmentsDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-72 max-h-96 overflow-y-auto bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 divide-y divide-slate-100"
                  onMouseLeave={() => setDepartmentsDropdownOpen(false)}
                >
                  {(categories.length > 0 ? categories : navCategories).map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.slug);
                        onNavigate('shop');
                        setDepartmentsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-orange-50 hover:text-[#F58220] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <ChevronDown className="w-3 h-3 text-slate-300 -rotate-90 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Interactive Search Input with Category Selector */}
            <div className="flex-1 w-full min-w-0 max-w-2xl relative">
              <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-xs border border-amber-300 min-w-0">
                <select
                  value={selectedSearchCategory}
                  onChange={e => setSelectedSearchCategory(e.target.value)}
                  className="bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2.5 border-r border-slate-200 focus:outline-hidden cursor-pointer shrink-0 hidden sm:block max-w-[150px]"
                >
                  <option value="all">All Categories</option>
                  {(categories.length > 0 ? categories : navCategories).map(c => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search 157+ solar panels, inverters, batteries, water pumps..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="flex-1 min-w-0 text-xs text-slate-800 placeholder:text-slate-400 px-3 py-2.5 focus:outline-hidden"
                />

                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      onNavigate('shop');
                    }
                  }}
                  className="bg-[#238B3D] hover:bg-[#1b7030] text-white px-4 py-2.5 flex items-center justify-center transition-colors cursor-pointer"
                  title="Search Shantis Store"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Live Search Suggestions Dropdown */}
              {showSearchResults && filteredProducts.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100"
                  onMouseLeave={() => setShowSearchResults(false)}
                >
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-orange-50/50 cursor-pointer transition-colors text-slate-800"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded-md border border-slate-200 bg-white shrink-0 p-1"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {product.category_name} • SKU: {product.sku}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-[#F58220]">
                        KES {(product.sale_price || product.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="p-2 bg-slate-50 text-center">
                    <button
                      onClick={() => {
                        setShowSearchResults(false);
                        onNavigate('shop');
                      }}
                      className="text-[11px] font-bold text-[#238B3D] hover:underline cursor-pointer"
                    >
                      View all matching results in Shop Catalog →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links on right of Ribbon */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-white/95 shrink-0">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-amber-200 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(null);
                  onNavigate('shop');
                }}
                className="hover:text-amber-200 transition-colors cursor-pointer"
              >
                All Products
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="hover:text-amber-200 transition-colors cursor-pointer"
              >
                Our Projects
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-amber-200 transition-colors cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="flex flex-col gap-2 text-sm font-bold text-slate-700">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'home' ? 'text-[#F58220]' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(null);
                onNavigate('shop');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'shop' ? 'text-[#F58220]' : ''
              }`}
            >
              Shop Catalog
            </button>
            <button
              onClick={() => {
                onNavigate('projects');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'projects' ? 'text-[#F58220]' : ''
              }`}
            >
              Our Projects
            </button>
            <button
              onClick={() => {
                onNavigate('kenya-seo');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'kenya-seo' ? 'text-[#F58220]' : ''
              }`}
            >
              Kenya Regional Solar Hubs
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'about' ? 'text-[#F58220]' : ''
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => {
                onNavigate('insights');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'insights' ? 'text-[#F58220]' : ''
              }`}
            >
              Blog & Guides
            </button>
            <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'contact' ? 'text-[#F58220]' : ''
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => {
                onNavigate('order-tracking');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 border-b border-slate-100 ${
                currentPage === 'order-tracking' ? 'text-[#F58220]' : ''
              }`}
            >
              Track Order
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Solar Categories
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navCategories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat.slug);
                    onNavigate('shop');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-1.5 px-2 rounded-md bg-slate-50 hover:bg-orange-50 hover:text-[#F58220] font-medium"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {onOpenQuote && (
              <button
                onClick={() => {
                  onOpenQuote();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#238B3D] text-white text-center py-2.5 rounded-lg font-bold text-xs shadow-xs"
              >
                Request Installation Quote
              </button>
            )}
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#1d2327] text-white text-center py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
