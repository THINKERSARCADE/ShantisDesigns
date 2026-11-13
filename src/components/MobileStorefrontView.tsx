import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Home,
  LayoutGrid,
  User,
  Minus,
  Plus,
  Trash2,
  Smartphone,
  X,
} from 'lucide-react';
import { Product, Category, CartItem } from '../types';
import { NavPage } from './Header';

interface MobileStorefrontViewProps {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlistIds: number[];
  onToggleWishlist: (productId: number) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  onUpdateCartQuantity: (productId: number, delta: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string | null) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCheckout: () => void;
  onOpenAdmin: () => void;
  currentPage: NavPage;
  onNavigatePage: (page: NavPage) => void;
}

export const MobileStorefrontView: React.FC<MobileStorefrontViewProps> = ({
  products,
  categories,
  cart,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onSelectProduct,
  onSelectCategory,
  onOpenWishlist,
  onOpenCheckout,
  onOpenAdmin,
  currentPage,
  onNavigatePage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePill, setActivePill] = useState<string>('newest');
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState<Product | null>(null);
  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);
  const [showThreeScreenShowcase, setShowThreeScreenShowcase] = useState(false);

  const filterPills = [
    { id: 'all', label: 'All', slug: null },
    { id: 'newest', label: 'Newest', slug: null },
    { id: 'solar-panels', label: 'Panels', slug: 'solar-panels' },
    { id: 'solar-hybrid-inverters', label: 'Inverters', slug: 'solar-hybrid-inverters' },
    { id: 'solar-batteries', label: 'Batteries', slug: 'solar-batteries' },
    { id: 'solar-water-pumps', label: 'Pumps', slug: 'solar-water-pumps' },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activePill !== 'all' && activePill !== 'newest') {
      list = list.filter((p) => {
        const cat = categories.find((c) => c.id === p.category_id);
        return (
          cat?.slug === activePill ||
          p.category_name?.toLowerCase().includes(activePill.replace('solar-', '').replace('-', ' '))
        );
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category_name || '').toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    return list.length > 0 ? list : products;
  }, [products, categories, activePill, searchQuery]);

  const previewProduct = selectedPreviewProduct || filteredProducts[0] || products[0];
  const leftTopProduct = filteredProducts[0] || products[0];
  const leftBottomProduct = filteredProducts[1] || products[1] || leftTopProduct;
  const rightTallProduct = filteredProducts[2] || products[2] || leftTopProduct;

  const totalCartCount = cart.reduce((s, item) => s + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (s, item) => s + (item.product.sale_price ?? item.product.price) * item.quantity,
    0
  );
  const shippingFee = cart.length > 0 ? 1500 : 0;
  const cartTotal = cartSubtotal + shippingFee;

  const tierLabels = [
    { label: '1x', mult: 1 },
    { label: '2x', mult: 2 },
    { label: '4x', mult: 4 },
    { label: '6x', mult: 6 },
    { label: '10x', mult: 10 },
  ];

  return (
    <>
      {/* 1. PERSISTENT 4-ICON MOBILE BOTTOM NAVIGATION BAR (Home | Favorite | Category | Profile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-between text-slate-600 shadow-lg"
      >
        <button
          onClick={() => onNavigatePage('home')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            currentPage === 'home' ? 'text-[#238B3D] font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px]">Home</span>
        </button>
        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#F58220] cursor-pointer"
        >
          <Heart className="w-5 h-5 stroke-[1.75]" />
          {wishlistIds.length > 0 && (
            <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F58220] text-white text-[8px] font-bold flex items-center justify-center">
              {wishlistIds.length}
            </span>
          )}
          <span className="text-[10px]">Favorite</span>
        </button>
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            currentPage === 'shop' ? 'text-[#238B3D] font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutGrid className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px]">Category</span>
        </button>
        <button
          onClick={() => setShowThreeScreenShowcase(true)}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#238B3D] cursor-pointer"
        >
          <Smartphone className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px]">App View</span>
        </button>
        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <User className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>

      {/* 2. 3-SCREEN INTERACTIVE MOBILE SHOWCASE MODAL (Home | Product Detail | Cart) */}
      {showThreeScreenShowcase && previewProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 lg:p-8"
          onClick={() => setShowThreeScreenShowcase(false)}
        >
          <div
            className="max-w-[1220px] w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between text-white px-2">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-[#F58220]" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold">
                    Shantis Designs Solar Solutions — Mobile View (Home, Product Details & My Cart)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Interactive 3-screen mobile layout synced with your live SQLite catalog & shopping cart
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowThreeScreenShowcase(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close Preview</span>
              </button>
            </div>

            {/* 3 Mobile Frames Grid (Home | Product Detail | Cart) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* FRAME 1: HOME */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 pl-2">Home</p>
                <div className="bg-white text-slate-900 rounded-[36px] border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[740px]">
                  {/* Status Bar */}
                  <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-2 bg-slate-900 rounded-xs"></span>
                      <span className="inline-block w-4 h-2.5 border border-slate-900 rounded-xs p-0.5">
                        <span className="block w-full h-full bg-slate-900"></span>
                      </span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="px-5 py-2 flex items-center justify-between">
                    <img
                      src="/assets/aistudio/pdf-logo__1__3934e2bd.jpg"
                      alt="Shantis Designs Solar"
                      className="h-7 w-auto object-contain rounded"
                    />
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4 text-slate-800" />
                      <div className="w-4 flex flex-col gap-1 items-end">
                        <span className="w-4 h-[1.5px] bg-slate-800"></span>
                        <span className="w-3 h-[1.5px] bg-slate-800"></span>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto px-4 space-y-3.5 pb-4 no-scrollbar">
                    {/* Search + Filter */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search solar hardware..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg bg-[#238B3D] text-white flex items-center justify-center shrink-0"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Hero Card */}
                    <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-900">
                      <img
                        src="https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/runda-residence.jpg"
                        alt="Shantis Designs Solar Solutions"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 flex flex-col justify-end">
                        <h3 className="font-extrabold text-xl leading-tight text-white">
                          Shantis Solar
                          <br />
                          Solutions Kenya
                        </h3>
                        <p className="text-[10px] text-white/90 mt-1">
                          EPRA Licensed Tier-1 Panels, Inverters & Lithium Batteries.
                        </p>
                        <div className="mt-2.5">
                          <span className="inline-block px-4 py-1 rounded-full bg-[#F58220] text-white text-[10px] font-bold">
                            Shop Now
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {filterPills.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setActivePill(p.id)}
                          className={`px-3.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                            activePill === p.id
                              ? 'bg-[#238B3D] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Newest Asymmetric Grid */}
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-base text-slate-900">Newest</h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-2.5">
                          {[leftTopProduct, leftBottomProduct].map((prod, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedPreviewProduct(prod)}
                              className="bg-slate-50 rounded-xl p-2.5 aspect-square flex flex-col justify-between cursor-pointer border border-slate-200"
                            >
                              <div className="flex-1 flex items-center justify-center">
                                <img
                                  src={prod.image_url || prod.image}
                                  alt={prod.name}
                                  className="max-h-16 object-contain"
                                />
                              </div>
                              <p className="text-[9px] font-bold text-slate-800 truncate">
                                {prod.name}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div
                          onClick={() => setSelectedPreviewProduct(rightTallProduct)}
                          className="bg-slate-50 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border border-slate-200"
                        >
                          <div className="flex-1 flex items-center justify-center py-3">
                            <img
                              src={rightTallProduct.image_url || rightTallProduct.image}
                              alt={rightTallProduct.name}
                              className="max-h-32 object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-800 truncate">
                              {rightTallProduct.name}
                            </p>
                            <p className="text-[10px] font-black text-[#238B3D]">
                              KES {(rightTallProduct.sale_price ?? rightTallProduct.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Tab Bar */}
                  <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-slate-500">
                    <div className="flex flex-col items-center text-[#238B3D]">
                      <Home className="w-4 h-4" />
                      <span className="text-[9px] font-semibold mt-0.5">Home</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Heart className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Favorite</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Category</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <User className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Profile</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FRAME 2: PRODUCT DETAIL */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 pl-2">Product Detail</p>
                <div className="bg-white text-slate-900 rounded-[36px] border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[740px]">
                  {/* Status Bar */}
                  <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-2 bg-slate-900 rounded-xs"></span>
                      <span className="inline-block w-4 h-2.5 border border-slate-900 rounded-xs p-0.5">
                        <span className="block w-full h-full bg-slate-900"></span>
                      </span>
                    </div>
                  </div>

                  {/* Brand & Cart Badge Row */}
                  <div className="px-5 py-1.5 flex items-center justify-between">
                    <img
                      src="/assets/aistudio/pdf-logo__1__3934e2bd.jpg"
                      alt="Shantis Designs Solar"
                      className="h-7 w-auto object-contain rounded"
                    />
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ShoppingCart className="w-4 h-4 text-slate-800" />
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#F58220] text-white text-[8px] font-bold flex items-center justify-center">
                          {totalCartCount || 1}
                        </span>
                      </div>
                      <div className="w-4 flex flex-col gap-1 items-end">
                        <span className="w-4 h-[1.5px] bg-slate-800"></span>
                        <span className="w-3 h-[1.5px] bg-slate-800"></span>
                      </div>
                    </div>
                  </div>

                  {/* Back + Title */}
                  <div className="px-5 py-1.5 flex items-center justify-between">
                    <ArrowLeft className="w-4 h-4 text-slate-800" />
                    <span className="text-xs font-bold text-slate-900">Product Details</span>
                    <span className="w-4" />
                  </div>

                  {/* Main Body */}
                  <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-3 no-scrollbar">
                    {/* Stage with Callout Lines & Stacked Thumbnails */}
                    <div className="relative bg-slate-50 rounded-2xl p-4 h-80 flex items-center border border-slate-200">
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(previewProduct.id)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs cursor-pointer"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            wishlistIds.includes(previewProduct.id)
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-slate-700'
                          }`}
                        />
                      </button>

                      {/* Left Product Image */}
                      <div className="w-1/2 flex items-center justify-center pr-2">
                        <img
                          src={previewProduct.image_url || previewProduct.image}
                          alt={previewProduct.name}
                          className="max-h-56 w-auto object-contain drop-shadow-sm"
                        />
                      </div>

                      {/* Right 4 Horizontal Technical Callout Lines */}
                      <div className="w-1/2 flex flex-col justify-center gap-4 pl-1 pr-12">
                        {[
                          'TIER-1 GRADE A SOLAR CELL',
                          'HIGH CONVERSION EFFICIENCY',
                          'IP65 WEATHERPROOF FRAME',
                          'EPRA & KEBS CERTIFIED',
                        ].map((spec, i) => (
                          <div key={i} className="space-y-0.5">
                            <p className="text-[7px] font-bold uppercase tracking-wider text-slate-700 leading-tight">
                              {spec}
                            </p>
                            <div className="h-[1px] w-full bg-slate-300" />
                          </div>
                        ))}
                      </div>

                      {/* Bottom-Right 2 Stacked Preview Thumbnails */}
                      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                        {[0, 1].map((thumbIdx) => (
                          <div
                            key={thumbIdx}
                            className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs"
                          >
                            <img
                              src={previewProduct.image_url || previewProduct.image}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Title & Price */}
                    <div className="space-y-0.5 pt-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 line-clamp-1">
                        {previewProduct.name}
                      </h4>
                      <p className="text-xl font-black text-[#238B3D]">
                        KES{' '}
                        {(
                          (previewProduct.sale_price ?? previewProduct.price) *
                          tierLabels[selectedTierIdx].mult
                        ).toLocaleString()}
                      </p>
                    </div>

                    {/* Bundle Tier Row */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {tierLabels.map((tier, idx) => (
                          <button
                            key={tier.label}
                            type="button"
                            onClick={() => setSelectedTierIdx(idx)}
                            className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                              selectedTierIdx === idx
                                ? 'bg-[#238B3D] text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {tier.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowThreeScreenShowcase(false);
                          onSelectProduct(previewProduct);
                        }}
                        className="text-[11px] font-semibold text-[#F58220] underline cursor-pointer"
                      >
                        Spec Guide
                      </button>
                    </div>

                    {/* Full-Width Add To Cart Button */}
                    <button
                      type="button"
                      onClick={() => onAddToCart(previewProduct, tierLabels[selectedTierIdx].mult)}
                      className="w-full py-3 rounded-xl bg-[#F58220] hover:bg-[#e07214] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                    >
                      <span>Add To Cart</span>
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Tab Bar */}
                  <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-slate-500">
                    <div className="flex flex-col items-center">
                      <Home className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Home</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Heart className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Favorite</span>
                    </div>
                    <div className="flex flex-col items-center text-[#238B3D]">
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-[9px] font-semibold mt-0.5">Category</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <User className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Profile</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FRAME 3: MY CART */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 pl-2">Cart</p>
                <div className="bg-white text-slate-900 rounded-[36px] border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[740px]">
                  {/* Status Bar */}
                  <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-900">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-2 bg-slate-900 rounded-xs"></span>
                      <span className="inline-block w-4 h-2.5 border border-slate-900 rounded-xs p-0.5">
                        <span className="block w-full h-full bg-slate-900"></span>
                      </span>
                    </div>
                  </div>

                  {/* Back + My Cart Header */}
                  <div className="px-5 py-2 flex items-center justify-between">
                    <ArrowLeft className="w-4 h-4 text-slate-800" />
                    <span className="text-xs font-bold text-slate-900">My Cart</span>
                    <span className="w-4" />
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-3 no-scrollbar">
                    {(cart.length > 0
                      ? cart
                      : [{ product: previewProduct, quantity: 1 }]
                    ).map((item) => {
                      const unitPrice = item.product.sale_price ?? item.product.price;
                      return (
                        <div key={item.product.id} className="flex items-start gap-3">
                          <div className="w-28 h-24 rounded-2xl bg-slate-50 p-2 flex items-center justify-center shrink-0 border border-slate-200">
                            <img
                              src={item.product.image_url || item.product.image}
                              alt={item.product.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm font-black text-[#238B3D]">
                              KES {unitPrice.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {item.product.category_name || 'Tier-1 Solar Hardware'}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  cart.length > 0
                                    ? onUpdateCartQuantity(item.product.id, -1)
                                    : null
                                }
                                className="w-5 h-5 rounded-md bg-[#238B3D] text-white flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 px-1">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  cart.length > 0
                                    ? onUpdateCartQuantity(item.product.id, 1)
                                    : onAddToCart(item.product, 1)
                                }
                                className="w-5 h-5 rounded-md bg-[#238B3D] text-white flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              {cart.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => onRemoveFromCart(item.product.id)}
                                  className="ml-auto text-slate-400 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Center Brand Emblem + Subtotal / Shipping / Total + Checkout Button */}
                  <div className="px-5 pb-4 pt-2 space-y-3">
                    <div className="flex flex-col items-center justify-center py-1">
                      <img
                        src="/assets/aistudio/pdf-logo__1__3934e2bd.jpg"
                        alt="Shantis Designs Solar Solutions"
                        className="h-8 w-auto object-contain rounded"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Sub Total</span>
                        <span className="font-semibold text-slate-900">
                          KES{' '}
                          {(
                            cartSubtotal ||
                            (previewProduct.sale_price ?? previewProduct.price)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-200">
                        <span>Shipping</span>
                        <span className="font-semibold text-slate-900">
                          KES {(shippingFee || 1500).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-extrabold pt-1 text-sm">
                        <span>Total Amount</span>
                        <span>
                          KES{' '}
                          {(
                            cartTotal ||
                            (previewProduct.sale_price ?? previewProduct.price) + 1500
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowThreeScreenShowcase(false);
                        if (cart.length === 0) {
                          onAddToCart(previewProduct, 1);
                        }
                        onOpenCheckout();
                      }}
                      className="w-full py-3 rounded-xl bg-[#238B3D] hover:bg-[#1b6b2f] text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                    >
                      Checkout
                    </button>
                  </div>

                  {/* Bottom Tab Bar */}
                  <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-slate-500">
                    <div className="flex flex-col items-center">
                      <Home className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Home</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Heart className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Favorite</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-[9px] mt-0.5">Category</span>
                    </div>
                    <div className="flex flex-col items-center text-[#238B3D]">
                      <User className="w-4 h-4" />
                      <span className="text-[9px] font-semibold mt-0.5">Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
