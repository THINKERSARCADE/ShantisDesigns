import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import {
  ShoppingCart,
  FileText,
  ShieldCheck,
  Truck,
  Award,
  MessageCircle,
  Check,
  Star,
  Plus,
  Minus,
  Heart,
  Layers,
  ZoomIn,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Tag,
  FolderOpen,
  Eye,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface ProductSinglePageProps {
  product: Product;
  allProducts: Product[];
  categories: Category[];
  onBackToShop: () => void;
  onSelectCategory: (slug: string) => void;
  onSelectTag?: (tag: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickViewProduct?: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onRequestQuote: (product: Product) => void;
  wishlistIds: number[];
  onToggleWishlist: (productId: number) => void;
  comparisonIds: number[];
  onToggleComparison: (productId: number) => void;
}

export const ProductSinglePage: React.FC<ProductSinglePageProps> = ({
  product,
  allProducts,
  categories,
  onBackToShop,
  onSelectCategory,
  onSelectTag,
  onSelectProduct,
  onQuickViewProduct,
  onAddToCart,
  onRequestQuote,
  wishlistIds,
  onToggleWishlist,
  comparisonIds,
  onToggleComparison,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);

  // Image Zoom Magnifier State
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setActiveTab('description');
    setSelectedTierIdx(0);
  }, [product.id]);

  const currentPrice = product.sale_price || product.price;
  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = comparisonIds.includes(product.id);
  const isOutOfStock = product.stock_status === 'outofstock';

  const matchedCategory = categories.find(
    (c) =>
      c.id === product.category_id ||
      c.name.toLowerCase() === product.category_name?.toLowerCase()
  );
  const categorySlug = matchedCategory?.slug || 'solar-panels';
  const canonicalUrl =
    product.permalink || `https://shantisdesigns.co.ke/product/${product.slug}/`;

  // Extract 4 technical callouts for the annotated Product Details stage (matching Screenshot 2)
  const specEntries = Object.entries(product.specs || {});
  const calloutLabels = [
    specEntries[0] ? `${specEntries[0][0]}: ${specEntries[0][1]}` : 'TIER-1 CERTIFIED SOLAR GRADE',
    specEntries[1] ? `${specEntries[1][0]}: ${specEntries[1][1]}` : 'HIGH CONVERSION EFFICIENCY',
    specEntries[2] ? `${specEntries[2][0]}: ${specEntries[2][1]}` : 'HEAVY-DUTY WEATHERPROOF BUILD',
    product.warranty || 'OFFICIAL KENYA MANUFACTURER WARRANTY',
  ];

  // Option / bundle tiers matching the S M L XL 2XL selector bar in Screenshot 2
  const optionTiers = [
    { label: '1x', qty: 1 },
    { label: '2x', qty: 2 },
    { label: '4x', qty: 4 },
    { label: '6x', qty: 6 },
    { label: '10x', qty: 10 },
  ];

  // Related Products from the same category
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category_id === product.category_id || p.category_name === product.category_name)
    )
    .slice(0, 4);

  const currentIndex = allProducts.findIndex((p) => p.id === product.id);
  const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
  const nextProduct =
    currentIndex >= 0 && currentIndex < allProducts.length - 1
      ? allProducts[currentIndex + 1]
      : null;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleWhatsAppOrder = () => {
    StorageService.addLead({
      product_id: product.id,
      product_name: `${quantity}x ${product.name}`,
      phone_number: '+254115521631',
      total_value: currentPrice * quantity,
      status: 'new',
      notes: `Single Product Page WhatsApp Inquiry (SKU: ${product.sku})`,
      source: 'product_quote',
    });
    const text = encodeURIComponent(
      `Hello Shantis Designs Solar Solutions, I want to order / inquire about:\n\n*${product.name}*\nQuantity: ${quantity}\nUnit Price: KES ${currentPrice.toLocaleString()}\nSKU: ${product.sku}\nProduct Link: ${canonicalUrl}\n\nPlease confirm availability and delivery.`
    );
    window.open(`https://wa.me/254115521631?text=${text}`, '_blank');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar ("<- Product Details") */}
        <div className="flex items-center justify-between py-2 border-b border-slate-200">
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-2 text-slate-900 hover:text-[#F58220] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Shop</span>
          </button>

          <div className="text-center">
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Product Details
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {prevProduct && (
              <button
                onClick={() => onSelectProduct(prevProduct)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#F58220] text-slate-700 font-semibold transition-colors cursor-pointer"
                title={prevProduct.name}
              >
                ← Prev
              </button>
            )}
            {nextProduct && (
              <button
                onClick={() => onSelectProduct(nextProduct)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#F58220] text-slate-700 font-semibold transition-colors cursor-pointer"
                title={nextProduct.name}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT / TOP: Annotated Product Showcase Card */}
            <div className="lg:col-span-6 space-y-4">
              <div
                className="relative rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 min-h-[390px] sm:min-h-[450px] p-5 sm:p-7 flex items-center justify-between cursor-crosshair group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
              >
                {/* Top-Right Wishlist Heart Circle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white hover:bg-slate-50 shadow-sm flex items-center justify-center text-slate-700 hover:text-red-500 transition-colors cursor-pointer"
                  aria-label="Save to Favorites"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-700'
                    }`}
                  />
                </button>

                {/* Sale Badge */}
                {product.sale_price &&
                  product.regular_price &&
                  product.regular_price > product.sale_price && (
                    <span className="absolute top-4 left-4 bg-[#F58220] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg z-20">
                      -
                      {Math.round(
                        ((product.regular_price - product.sale_price) / product.regular_price) *
                          100
                      )}
                      % OFF
                    </span>
                  )}

                {/* Product Hardware Image (Left/Center) */}
                <div className="w-[54%] sm:w-[56%] h-64 sm:h-80 flex items-center justify-center relative z-10">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Right Side: 4 Technical Specification Pointer Lines */}
                <div className="w-[44%] sm:w-[42%] flex flex-col justify-center space-y-5 z-10 pr-1">
                  {calloutLabels.map((label, idx) => (
                    <div key={idx} className="relative">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-300 leading-tight">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom-Right Stacked Preview Thumbnails */}
                <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200 p-1.5 shadow-xs flex items-center justify-center">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {relatedProducts[0] && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(relatedProducts[0]);
                      }}
                      title={relatedProducts[0].name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white hover:border-[#F58220] border border-slate-200 p-1.5 shadow-xs flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={relatedProducts[0].image_url}
                        alt={relatedProducts[0].name}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  )}
                </div>

                {/* Magnifying Glass Zoom Overlay on Desktop Hover */}
                {isHovered && (
                  <div
                    className="hidden lg:block absolute inset-0 pointer-events-none bg-white border-2 border-[#238B3D] rounded-3xl shadow-2xl z-30"
                    style={{
                      backgroundImage: `url(${product.image_url})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '250%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="inline-flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-[#238B3D]" />
                  <span>Hover image on desktop to inspect solar hardware in 2.5x resolution</span>
                </span>
                <span className="font-mono">SKU: {product.sku}</span>
              </div>
            </div>

            {/* RIGHT / BOTTOM: Title, Price, System Option Selector & Add To Cart */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
                  <button
                    onClick={() => onSelectCategory(categorySlug)}
                    className="font-bold text-[#238B3D] hover:underline cursor-pointer"
                  >
                    {product.category_name}
                  </button>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {product.rating || 4.9} ({product.reviews_count || 18} reviews)
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-700">
                    {isOutOfStock ? 'Out of stock' : `In stock (${product.stock} units)`}
                  </span>
                </div>

                {/* Bold Uppercase Title & Large Price */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold uppercase tracking-tight text-slate-900 leading-snug">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#238B3D] tabular-nums">
                    KES {currentPrice.toLocaleString()}
                  </span>
                  {product.sale_price &&
                    product.regular_price &&
                    product.regular_price > product.sale_price && (
                      <span className="text-sm text-slate-400 line-through font-semibold tabular-nums">
                        KES {product.regular_price.toLocaleString()}
                      </span>
                    )}
                </div>
              </div>

              {/* Quantity / Bundle Selector Row */}
              <div className="flex items-center justify-between gap-3 py-2 border-y border-slate-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  {optionTiers.map((tier, idx) => {
                    const isSelected = selectedTierIdx === idx && quantity === tier.qty;
                    return (
                      <button
                        key={tier.label}
                        type="button"
                        onClick={() => {
                          setSelectedTierIdx(idx);
                          setQuantity(tier.qty);
                        }}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#238B3D] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className="text-xs font-semibold text-[#F58220] hover:underline cursor-pointer shrink-0"
                >
                  Spec Guide
                </button>
              </div>

              {/* Custom Quantity Stepper & Compare Button */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-slate-200/60 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 hover:bg-slate-200/60 text-slate-700 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onToggleComparison(product.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCompared
                      ? 'bg-amber-400 border-amber-500 text-slate-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{isCompared ? 'Comparing Specs' : 'Compare Specs'}</span>
                </button>
              </div>

              {/* Full-Width Rounded Primary "Add To Cart" Button */}
              <div className="space-y-2.5">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : added
                      ? 'bg-[#238B3D] text-white'
                      : 'bg-[#F58220] hover:bg-[#e07214] text-white'
                  }`}
                >
                  <span>
                    {isOutOfStock
                      ? 'Out of Stock'
                      : added
                      ? 'Added to Cart!'
                      : `Add To Cart • KES ${(currentPrice * quantity).toLocaleString()}`}
                  </span>
                  {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full py-3 px-4 bg-[#238B3D] hover:bg-[#1b7030] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onRequestQuote(product)}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Turnkey Installation Quote</span>
                  </button>
                </div>
              </div>

              {/* Short Description */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Short Description</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>
              </div>

              {/* Delivery & EPRA Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-700 pt-1">
                <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/70">
                  <ShieldCheck className="w-4 h-4 text-[#238B3D] shrink-0" />
                  <span>EPRA Class T3 Certified</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/70">
                  <Award className="w-4 h-4 text-[#F58220] shrink-0" />
                  <span className="truncate">{product.warranty || 'Official Warranty'}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/70">
                  <Truck className="w-4 h-4 text-[#238B3D] shrink-0" />
                  <span>47 Counties Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Tabs: Description, Technical Specs, Reviews */}
          <div className="mt-10 pt-8 border-t border-stone-200">
            <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3 mb-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'description'
                    ? 'bg-[#747E6B] text-white'
                    : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                }`}
              >
                Full Product Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-[#747E6B] text-white'
                    : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                }`}
              >
                Technical Specifications ({product.specs ? Object.keys(product.specs).length : 0})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#747E6B] text-white'
                    : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                }`}
              >
                Warranty & Customer Reviews ({product.reviews_count || 18})
              </button>
            </div>

            {activeTab === 'description' && (
              <div className="space-y-4 max-w-4xl">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {product.name} — Genuine {product.category_name} in Kenya
                </h2>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                  {product.description}
                </div>
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                      Key Engineering & Hardware Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/80"
                        >
                          <span className="font-semibold text-slate-600">{key}:</span>
                          <span className="font-bold text-slate-900">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-stone-200/80 bg-emerald-50/40 p-4 rounded-2xl">
                  <h3 className="text-xs sm:text-sm font-bold text-[#238B3D] mb-1.5">
                    Nationwide Solar Delivery & EPRA-Licensed Installation Across Kenya
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Order genuine <strong>{product.name}</strong> at the best price in Kenya from
                    Shantis Designs Solar Solutions (Royal King Building, Luthuli Street, Nairobi).
                    We provide same-day dispatch and professional EPRA Class T3 solar installation
                    across <strong>Nairobi, Meru, Mombasa, Kisumu, Nakuru, Isiolo, Machakos</strong>
                    , Kiambu, Eldoret, Nyeri, and all 47 counties in Kenya.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Technical Specifications Table
                </h2>
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 text-xs sm:text-sm">
                  <div className="flex py-3 px-4 bg-[#FAF8F5]">
                    <span className="font-semibold text-slate-600 w-1/2">Product Name</span>
                    <span className="font-bold text-slate-900 w-1/2">{product.name}</span>
                  </div>
                  <div className="flex py-3 px-4 bg-white">
                    <span className="font-semibold text-slate-600 w-1/2">SKU</span>
                    <span className="font-mono font-bold text-slate-900 w-1/2">{product.sku}</span>
                  </div>
                  <div className="flex py-3 px-4 bg-[#FAF8F5]">
                    <span className="font-semibold text-slate-600 w-1/2">Category</span>
                    <span className="font-semibold text-[#238B3D] w-1/2">
                      {product.category_name}
                    </span>
                  </div>
                  {product.specs &&
                    Object.entries(product.specs).map(([key, val], idx) => (
                      <div
                        key={key}
                        className={`flex py-3 px-4 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]'
                        }`}
                      >
                        <span className="font-semibold text-slate-600 w-1/2">{key}</span>
                        <span className="font-semibold text-slate-900 w-1/2">{val}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-[#238B3D] font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Official Shantis Designs Warranty & Support</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Every unit purchased from Shantis Designs Solar Solutions (Royal King Building,
                    Luthuli Street & Dev Towers, Biashara Street, Nairobi) is backed by our licensed
                    EPRA Class T3 engineering team and official manufacturer warranty.
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 font-medium">
                    <li>✓ Serial number registered at checkout for warranty claims</li>
                    <li>✓ Technical sizing & installation support across all 47 counties</li>
                    <li>✓ Genuine Tier-1 components with zero counterfeit tolerance</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Verified Buyer Feedback
                    </span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 italic">
                    "We had a ranch project in Timau and they delivered quality work with the best
                    market batteries, inverters and panels. You are the best one may need."
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    — Teen Network Magazine Show (Verified Google Review)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase text-[#F58220] tracking-wider">
                  Compatible Solar Equipment
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  Related Products in {product.category_name}
                </h2>
              </div>
              <button
                onClick={() => onSelectCategory(categorySlug)}
                className="text-xs font-bold text-[#238B3D] hover:text-[#F58220] transition-colors cursor-pointer"
              >
                View all in {product.category_name} →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => {
                const relPrice = rel.sale_price || rel.price;
                const relWishlisted = wishlistIds.includes(rel.id);
                const relCompared = comparisonIds.includes(rel.id);

                return (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition-all group cursor-pointer relative"
                  >
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                      {onQuickViewProduct && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickViewProduct(rel);
                          }}
                          className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-[#F58220] shadow-xs"
                          title="Quick View Modal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComparison(rel.id);
                        }}
                        className={`p-1.5 rounded-full shadow-xs ${
                          relCompared
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/90 hover:bg-white text-slate-600'
                        }`}
                        title="Compare"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(rel.id);
                        }}
                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 shadow-xs"
                        title="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            relWishlisted ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <div className="h-44 flex items-center justify-center p-3 bg-[#FAF8F5] rounded-xl overflow-hidden mb-3">
                        <img
                          src={rel.image_url}
                          alt={rel.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-[#238B3D]">
                        {rel.category_name}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#F58220] transition-colors">
                        {rel.name}
                      </h3>
                      {rel.shortDescription && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {rel.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        KES {relPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-[#F58220] group-hover:underline">
                        View Product →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
