import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HomepageConfig } from '../types';

interface HeroProps {
  onExploreProducts: () => void;
  onOpenQuote: () => void;
  onSelectCategory?: (slug: string) => void;
  config?: HomepageConfig;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProducts,
  onOpenQuote,
  onSelectCategory,
  config
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Exact 3 center slider promotions extracted from shantisdesigns.co.ke homepage
  const centerSlides = [
    {
      kicker: 'Weekend Promotions',
      headline: 'MUST Battery',
      subheadline: 'Find The Best — Get 10% off when buying online.',
      cta: 'Shop Now',
      categorySlug: 'solar-batteries',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2025-12-06-at-09.23.15-1-1-e1768565494726.png'
    },
    {
      kicker: 'Weekend Promotions',
      headline: 'Must PH1100 EU Hybrid Inverter',
      subheadline: 'Three-Phase 12KVA 48V High-Efficiency Hybrid Inverter — Get 10% off when buying online.',
      cta: 'Shop Now',
      categorySlug: 'must-inverter',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/230V-PH1100-EUThree-Phase.new_.02.png'
    },
    {
      kicker: 'Weekend Promotions',
      headline: 'Must PV3600 PRO Hybrid Inverter',
      subheadline: 'All-In-One Pure Sine Wave MPPT Solar Inverter — Get 10% off when buying online.',
      cta: 'Shop Now',
      categorySlug: 'must-inverter',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/PV36PRO-4-6-01-1-1.png'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % centerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [centerSlides.length]);

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    } else {
      onExploreProducts();
    }
  };

  return (
    <section className="bg-[#f4f6f8] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Authentic 3-Column / 5-Card Promotional Hero Grid from shantisdesigns.co.ke */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* LEFT COLUMN (2 Stacked Cards: Doyin Water Pumps + Shantis Solar Panels) */}
          <div className="lg:col-span-3 flex flex-col gap-4 justify-between">
            
            {/* Card 1: DOYIN WATER PUMPS (Green Card) */}
            <a
              href="/product-category/water-pumps/"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('water-pumps');
              }}
              className="flex-1 bg-linear-to-br from-[#1b6b30] to-[#238B3D] text-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
            >
              <div className="relative z-10 space-y-1.5 min-w-0 flex-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-300">
                  DOYIN WATER PUMPS
                </span>
                <h3 className="text-base xl:text-xl font-black leading-tight">
                  High Quality
                </h3>
                <p className="text-xs text-emerald-100 font-semibold">Discount</p>
                <div className="pt-1">
                  <span className="text-xs text-white/70 line-through block">Kes 61,350</span>
                  <span className="text-lg xl:text-2xl font-black text-amber-300 whitespace-nowrap">
                    Kes 46,000
                  </span>
                </div>
              </div>
              <div className="w-20 h-20 xl:w-28 xl:h-28 shrink-0 flex items-center justify-center relative z-10">
                <img
                  src="https://shantisdesigns.co.ke/wp-content/uploads/2025/12/4SD10-Submersible-Deep-Well-Borehole-Pump-50Hz-450x450.avif"
                  alt="Doyin Water Pumps"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-md"
                />
              </div>
            </a>

            {/* Card 2: SHANTIS DESIGNS SOLAR PANELS */}
            <a
              href="/product-category/solar-panels/"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('solar-panels');
              }}
              className="flex-1 bg-linear-to-br from-[#1e3a8a] to-[#0284c7] text-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
            >
              <div className="relative z-10 space-y-1.5 min-w-0 flex-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-sky-200">
                  Shantis Designs
                </span>
                <h3 className="text-base xl:text-xl font-black leading-tight uppercase">
                  SOLAR PANELS
                </h3>
                <div className="pt-2">
                  <span className="inline-block bg-[#F58220] text-white text-[11px] font-black px-2.5 py-1 rounded shadow-2xs mb-1">
                    Buy Now
                  </span>
                  <p className="text-lg xl:text-xl font-black text-amber-300 whitespace-nowrap">
                    Kes 1,210
                  </p>
                </div>
              </div>
              <div className="w-20 h-20 xl:w-28 xl:h-28 shrink-0 flex items-center justify-center relative z-10">
                <img
                  src="https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png"
                  alt="Shantis Designs Solar Panels"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-md"
                />
              </div>
            </a>

          </div>

          {/* CENTER COLUMN (Interactive Slider: MUST Battery / Must PH1100 EU / Must PV3600 PRO) */}
          <div className="lg:col-span-6 bg-linear-to-r from-[#ea580c] via-[#F58220] to-[#f97316] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden min-h-[340px]">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1 relative z-10">
              <div className="sm:col-span-7 space-y-3">
                <span className="inline-block bg-white/20 backdrop-blur-xs text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-white/30">
                  {centerSlides[activeSlide].kicker}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                  {centerSlides[activeSlide].headline}
                </h2>
                <p className="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed">
                  {centerSlides[activeSlide].subheadline}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={`/product-category/${centerSlides[activeSlide].categorySlug}/`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(centerSlides[activeSlide].categorySlug);
                    }}
                    className="inline-flex items-center gap-2 bg-[#238B3D] hover:bg-[#1b7030] text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <span>{centerSlides[activeSlide].cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={onOpenQuote}
                    className="bg-white/20 hover:bg-white/30 border border-white/40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Free Sizing Quote
                  </button>
                </div>
              </div>

              <div className="sm:col-span-5 flex items-center justify-center h-52 sm:h-64">
                <img
                  src={centerSlides[activeSlide].image}
                  alt={centerSlides[activeSlide].headline}
                  className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-500"
                />
              </div>
            </div>

            {/* Slider Controls */}
            <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/20 mt-4">
              <div className="flex items-center gap-2">
                {centerSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + centerSlides.length) % centerSlides.length)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % centerSlides.length)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-300/25 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* RIGHT COLUMN (2 Stacked Cards: Lithium Valley + ECOFLOW Power Backup) */}
          <div className="lg:col-span-3 flex flex-col gap-4 justify-between">
            
            {/* Card 4: LITHIUM VALLEY */}
            <a
              href="/product-category/lithium-valley/"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('lithium-valley');
              }}
              className="flex-1 bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-slate-700/60"
            >
              <div className="relative z-10 space-y-1.5 min-w-0 flex-1">
                <span className="inline-block bg-[#238B3D] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  Lithium Valley
                </span>
                <h3 className="text-sm xl:text-lg font-black text-white leading-tight">
                  Starting from
                </h3>
                <p className="text-lg xl:text-2xl font-black text-amber-400 whitespace-nowrap">
                  Kes 25,000.00
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 group-hover:underline">
                  <span>Shop Lithium</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="w-20 h-20 xl:w-28 xl:h-28 shrink-0 flex items-center justify-center relative z-10">
                <img
                  src="https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-18-at-18.33.16.jpeg"
                  alt="Lithium Valley"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform rounded-lg"
                />
              </div>
            </a>

            {/* Card 5: ECOFLOW POWER BACKUP */}
            <a
              href="/product-category/solar-power-backup/"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('solar-power-backup');
              }}
              className="flex-1 bg-linear-to-br from-emerald-950 to-emerald-800 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-emerald-700/50"
            >
              <div className="relative z-10 space-y-1.5 min-w-0 flex-1">
                <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  ECOFLOW
                </span>
                <h3 className="text-sm xl:text-lg font-black text-white leading-tight">
                  Power Backup
                </h3>
                <p className="text-[11px] text-emerald-200 font-semibold">Discount</p>
                <div>
                  <span className="text-xs text-white/60 line-through block">Kes 36,350</span>
                  <span className="text-lg xl:text-2xl font-black text-amber-300 whitespace-nowrap">
                    Kes 27,250
                  </span>
                </div>
              </div>
              <div className="w-20 h-20 xl:w-28 xl:h-28 shrink-0 flex items-center justify-center relative z-10">
                <img
                  src="https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-06-at-20.46.50.jpeg"
                  alt="EcoFlow Power Backup"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform rounded-lg"
                />
              </div>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
};
