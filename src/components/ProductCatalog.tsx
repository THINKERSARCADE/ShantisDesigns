import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import {
  ShoppingCart,
  Check,
  Clock,
  ArrowRight,
  Heart,
  Layers,
  Eye
} from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  onAddToCart: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickViewProduct?: (product: Product) => void;
  wishlistIds?: number[];
  onToggleWishlist?: (id: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (id: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  selectedCategorySlug,
  onSelectCategory,
  onAddToCart,
  onSelectProduct,
  onQuickViewProduct,
  wishlistIds = [],
  onToggleWishlist,
  comparisonIds = [],
  onToggleComparison
}) => {
  const [addedIds, setAddedIds] = useState<number[]>([]);

  // Countdown timer for Solar Panels promotion
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedIds(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  // Section 1: Solar Panels (5 authentic products)
  const horayPanels = products
    .filter(
      p =>
        p.category_name?.toLowerCase().includes('panel') ||
        p.name.toLowerCase().includes('horay') ||
        p.name.toLowerCase().includes('solar panel')
    )
    .slice(0, 5);

  // Section 2: Doyin Solar Water Pumps (6 authentic products)
  const doyinPumps = products
    .filter(
      p =>
        p.category_name?.toLowerCase().includes('pump') ||
        p.name.toLowerCase().includes('doyin') ||
        p.name.toLowerCase().includes('submersible')
    )
    .slice(0, 6);

  // Section 3: EcoFlow Portable Power Stations (8 authentic products)
  const ecoflowUnits = products
    .filter(
      p =>
        p.category_name?.toLowerCase().includes('backup') ||
        p.name.toLowerCase().includes('ecoflow')
    )
    .slice(0, 8);

  // Section 4: Solar Inverters (Must, Deye, Eastman, Growatt)
  const inverters = products
    .filter(
      p =>
        p.category_name?.toLowerCase().includes('inverter') ||
        p.name.toLowerCase().includes('inverter')
    )
    .slice(0, 6);

  // Map tag label to WooCommerce category slug
  const mapTagToSlug = (tag: string): string => {
    const clean = tag
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const matched = categories.find(
      c => c.name.toLowerCase() === tag.toLowerCase() || c.slug === clean
    );
    return matched ? matched.slug : clean;
  };

  // Authentic WooCommerce tags/categories from shantisdesigns.co.ke
  const authenticTags = [
    '12V & 24V Drop-In LiFePO4 Batteries',
    'AC Booster Pump',
    'AC Submersible Pump',
    'AC Well Pump',
    'All Brand Batteries',
    'Automatic Pump Control Unit',
    'Battery Mounting & Hardware',
    'Commercial & Industrial (C&I) BESS',
    'DC Stainless Steel Submersible Pump',
    'DC Submersible Pump',
    'Deye Inverters',
    'Deye Mounted Battery Systems',
    'EASTMAN BATTERIES',
    'Eastman Inverter',
    'Ecoflow Powerbackup',
    'Energy Storage Systems (ESS)',
    'GEL BATTERIES',
    'Heavy-Duty Hybrid Submersible Pump',
    'Hybrid High Flow Submersible Pump',
    'Hybrid Inverters',
    'Hybrid Submersible Pump',
    'Lithium Valley',
    'Mobile & All-In-One ESS',
    'Must Batteries',
    'Must inverter',
    'Off-Grid & Hybrid Inverters',
    'Rack-Mounted Lithium Batteries',
    'Solar Accessories',
    'Solar Batteries',
    'Solar Inverters',
    'Solar LED Flood Light',
    'SOLAR LIGHTS',
    'Solar Panels',
    'Solar Power backup',
    'Wall-Mounted Lithium Batteries',
    'Water Pumps'
  ];

  const renderCardOverlayButtons = (product: Product) => (
    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
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
          title={wishlistIds.includes(product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#f4f6f8] py-8 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* =========================================================================
            SHOWCASE 1: Solar Panels | Best Prices, Original Brands
           ========================================================================= */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#238B3D] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  EPRA CERTIFIED
                </span>
                <span className="text-xs font-bold text-[#F58220]">
                  Horay • Jinko • Longi • JA Solar • Trina • Canadian
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Solar Panels | Best Prices, Original Brands
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Countdown Timer */}
              <div className="flex items-center gap-2 text-xs font-bold bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl text-slate-800 shrink-0">
                <Clock className="w-4 h-4 text-[#F58220]" />
                <span className="text-slate-500 font-medium">Deal Ends In:</span>
                <div className="flex items-center gap-1 font-mono font-black text-[#ea580c]">
                  <span className="bg-white px-1.5 py-0.5 rounded shadow-2xs border border-amber-200">
                    {timeLeft.days}d
                  </span>
                  :
                  <span className="bg-white px-1.5 py-0.5 rounded shadow-2xs border border-amber-200">
                    {timeLeft.hours}h
                  </span>
                  :
                  <span className="bg-white px-1.5 py-0.5 rounded shadow-2xs border border-amber-200">
                    {timeLeft.minutes}m
                  </span>
                  :
                  <span className="bg-white px-1.5 py-0.5 rounded shadow-2xs border border-amber-200">
                    {timeLeft.seconds}s
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectCategory('solar-panels')}
                className="text-xs font-bold text-[#238B3D] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
              >
                <span>View All Solar Panels</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5-Card Grid for Solar Panels */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {horayPanels.map(product => {
              const isAdded = addedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="h-40 flex items-center justify-center p-2 bg-slate-50 rounded-lg overflow-hidden relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {product.sale_price && (
                        <span className="absolute top-2 left-2 bg-[#F58220] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                          SALE
                        </span>
                      )}
                      {renderCardOverlayButtons(product)}
                    </div>

                    <h3 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#F58220] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3">
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        KES {(product.sale_price || product.price).toLocaleString()}
                      </span>
                      {product.sale_price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          KES {product.regular_price?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={e => handleAddToCart(e, product)}
                      className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-[#238B3D] text-white'
                          : 'bg-slate-900 hover:bg-[#F58220] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SHOWCASE 2: Top Doyin Water Pumps | deals in East & Central Africa
           ========================================================================= */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold text-[#238B3D] uppercase tracking-wider">
                DC, AC & Hybrid Submersible Borehole Pumps
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Top Doyin Water Pumps | deals in East & Central Africa
              </h2>
            </div>
            <button
              onClick={() => onSelectCategory('water-pumps')}
              className="text-xs font-bold text-[#F58220] hover:text-[#d46a10] flex items-center gap-1 cursor-pointer"
            >
              <span>View All Water Pumps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Promotional Banner */}
            <div className="lg:col-span-3 bg-linear-to-b from-[#1b6b30] to-[#238B3D] text-white rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-amber-300 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                  BEST SELLER 2026
                </span>
                <h3 className="text-2xl font-black mt-2 leading-tight">
                  DOYIN SOLAR WATER PUMPS
                </h3>
                <p className="text-xs text-emerald-100 font-medium mt-2 leading-relaxed">
                  Engineered for Kenya's deep boreholes, high-lift irrigation & municipal agricultural water networks.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-emerald-50">
                  <p>✓ DC & AC Hybrid Operation</p>
                  <p>✓ Pure Stainless Steel Impeller</p>
                  <p>✓ MPPT Auto Pump Controller</p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={() => onSelectCategory('water-pumps')}
                  className="w-full bg-white hover:bg-amber-100 text-[#1b6b30] font-black text-xs py-2.5 rounded-lg shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Explore All Doyin Pumps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 6-Product Doyin Grid */}
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {doyinPumps.map(product => {
                const isAdded = addedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div>
                      <div className="h-36 flex items-center justify-center p-2 bg-slate-50 rounded-lg overflow-hidden relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        {renderCardOverlayButtons(product)}
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug mt-2 group-hover:text-[#238B3D] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <p className="text-sm font-black text-slate-900 mb-2">
                        KES {(product.sale_price || product.price).toLocaleString()}
                      </p>
                      <button
                        onClick={e => handleAddToCart(e, product)}
                        className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? 'bg-[#238B3D] text-white'
                            : 'bg-slate-900 hover:bg-[#238B3D] text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SHOWCASE 3: Ecoflow | Genuine Waranty
           ========================================================================= */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  PORTABLE ESS
                </span>
                <span className="text-xs font-bold text-[#238B3D]">
                  EcoFlow Authorised Kenyan Distributor
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ecoflow | Genuine Waranty
              </h2>
            </div>
            <button
              onClick={() => onSelectCategory('solar-power-backup')}
              className="text-xs font-bold text-[#F58220] hover:text-[#d46a10] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View all Solar Power Backup Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {ecoflowUnits.map(product => {
              const isAdded = addedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div>
                    <div className="h-36 flex items-center justify-center p-2 bg-slate-50 rounded-lg overflow-hidden relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {renderCardOverlayButtons(product)}
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug mt-2 group-hover:text-[#F58220] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <p className="text-sm font-black text-slate-900 mb-2">
                      KES {(product.sale_price || product.price).toLocaleString()}
                    </p>
                    <button
                      onClick={e => handleAddToCart(e, product)}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-[#238B3D] text-white'
                          : 'bg-[#F58220] hover:bg-[#e07214] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SHOWCASE 4: Solar Inverters | Upto 5 Years Warranty
           ========================================================================= */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold text-[#F58220] uppercase tracking-wider">
                Must • Deye • Eastman • Growatt • Felicity
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Solar Inverters | Upto 5 Years Warranty
              </h2>
            </div>
            <button
              onClick={() => onSelectCategory('solar-inverters')}
              className="text-xs font-bold text-[#238B3D] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
            >
              <span>View All Solar Inverters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Quality Guaranteed Banner */}
            <div className="lg:col-span-3 bg-linear-to-b from-slate-900 to-slate-800 text-white rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-[#238B3D] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                  100% PURE SINE WAVE
                </span>
                <h3 className="text-2xl font-black mt-2 leading-tight">
                  HYBRID & OFF-GRID SOLAR INVERTERS
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
                  High-surge capacity, dual MPPT trackers, and smart lithium battery integration.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-200">
                  <p>✓ Must PV1800, PH1800 & PV3600 PRO</p>
                  <p>✓ Deye Low & High-Voltage Hybrid</p>
                  <p>✓ Eastman Solar Inverters</p>
                  <p>✓ Growatt & Felicity Off-Grid</p>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={() => onSelectCategory('solar-inverters')}
                  className="w-full bg-[#F58220] hover:bg-[#e07214] text-white font-black text-xs py-2.5 rounded-lg shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>View All Inverters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 6 Inverters */}
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {inverters.map(product => {
                const isAdded = addedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div>
                      <div className="h-36 flex items-center justify-center p-2 bg-slate-50 rounded-lg overflow-hidden relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        {renderCardOverlayButtons(product)}
                      </div>
                      <h3 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug mt-2 group-hover:text-[#F58220] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <p className="text-sm font-black text-slate-900 mb-2">
                        KES {(product.sale_price || product.price).toLocaleString()}
                      </p>
                      <button
                        onClick={e => handleAddToCart(e, product)}
                        className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? 'bg-[#238B3D] text-white'
                            : 'bg-slate-900 hover:bg-[#F58220] text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            AUTHENTIC WOOCOMMERCE CATEGORY & TAG CLOUD (Opens Category Archive)
           ========================================================================= */}
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="mb-4">
            <span className="text-xs font-black uppercase text-[#238B3D] tracking-wider">
              Browse by WooCommerce Category & Tag Archive
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Popular Solar & Water Pumping Categories
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {authenticTags.map(tag => {
              const slug = mapTagToSlug(tag);
              const isSelected = selectedCategorySlug === slug;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectCategory(slug)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#238B3D] text-white border-[#238B3D] shadow-xs'
                      : 'bg-[#eaf5ed] hover:bg-[#238B3D] text-[#1b6b30] hover:text-white border-[#cde8d4]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
