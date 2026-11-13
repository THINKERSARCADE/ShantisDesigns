import React, { useRef } from 'react';
import { Category, Product } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoriesGridProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (slug: string) => void;
  selectedCategorySlug: string | null;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  products,
  onSelectCategory,
  selectedCategorySlug
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Exact 6 primary category cards with the exact live images from shantisdesigns.co.ke
  const primaryCategoryCards = [
    {
      id: 54,
      slug: 'solar-power-backup',
      title: 'Solar Power backup',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/WhatsApp-Image-2026-01-06-at-20.46.50.jpeg',
      permalink: 'https://shantisdesigns.co.ke/product-category/solar-power-backup/'
    },
    {
      id: 34,
      slug: 'solar-panels',
      title: 'Solar Panels',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/JA-Solar-565W-Bifacial-Solar-Panel-JAM72D40-565-MB.webp',
      permalink: 'https://shantisdesigns.co.ke/product-category/solar-panels/'
    },
    {
      id: 81,
      slug: 'solar-lights',
      title: 'SOLAR LIGHTS',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/22.jpg',
      permalink: 'https://shantisdesigns.co.ke/product-category/solar-lights/'
    },
    {
      id: 71,
      slug: 'must-inverter',
      title: 'Must inverter',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/PV36PRO-4-6-01-1.jpg',
      permalink: 'https://shantisdesigns.co.ke/product-category/solar-inverters/must-inverter/'
    },
    {
      id: 168,
      slug: 'lithium-valley',
      title: 'Lithium Valley',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-18-at-18.33.16.jpeg',
      permalink: 'https://shantisdesigns.co.ke/product-category/solar-batteries/wall-mounted-lithium-batteries/'
    },
    {
      id: 41,
      slug: 'solar-batteries',
      title: 'Solar Batteries',
      image: 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/Eastman-200Ah-Gel-Battery-12v-Maintenance-Free.jpg',
      permalink: 'https://shantisdesigns.co.ke/product-category/solar-batteries/'
    }
  ];

  // Combine the 6 primary cards with any additional categories from the store for horizontal scrolling
  const extraCategories = categories
    .filter(c => !primaryCategoryCards.some(pc => pc.slug === c.slug))
    .slice(0, 12)
    .map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.name,
      image: c.image_url || c.imageUrl || 'https://shantisdesigns.co.ke/wp-content/uploads/2025/12/JA-Solar-565W-Bifacial-Solar-Panel-JAM72D40-565-MB.webp',
      permalink: `https://shantisdesigns.co.ke/product-category/${c.slug}/`
    }));

  const allDisplayCategories = [...primaryCategoryCards, ...extraCategories];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 bg-[#f4f6f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* EXACT ORANGE HEADER RIBBON FROM SCREENSHOT: "SHANTIS DESIGNS SOLAR CATEGORIES" with < > controls */}
        <div className="bg-linear-to-r from-[#F58220] to-[#e07214] rounded-xl px-5 py-3 shadow-md flex items-center justify-between mb-5 border border-slate-900/20">
          <h2 className="text-white text-base sm:text-xl md:text-2xl font-black uppercase tracking-wide drop-shadow-2xs">
            SHANTIS DESIGNS SOLAR CATEGORIES
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 rounded-full bg-white text-slate-700 hover:text-[#F58220] shadow-sm flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Scroll Categories Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="w-8 h-8 rounded-full bg-white text-slate-700 hover:text-[#F58220] shadow-sm flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Scroll Categories Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 VISIBLE AUTHENTIC CARDS + HORIZONTAL CAROUSEL FOR ALL CATEGORIES */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {allDisplayCategories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            const matchingCount = products.filter(p => 
              p.category_id === cat.id || 
              p.category_name?.toLowerCase() === cat.title.toLowerCase() ||
              p.tags?.some(t => t.toLowerCase() === cat.title.toLowerCase())
            ).length;

            return (
              <a
                key={cat.slug}
                href={`/product-category/${cat.slug}/`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory(cat.slug);
                }}
                title={`${cat.title} (${matchingCount} products) — ${cat.permalink}`}
                className={`w-[calc(50%-7px)] sm:w-[calc(33.333%-10px)] lg:w-[calc(16.666%-14px)] shrink-0 bg-white rounded-none sm:rounded-xs overflow-hidden shadow-xs border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-lg hover:-translate-y-0.5 ${
                  isSelected 
                    ? 'border-[#238B3D] ring-2 ring-[#238B3D]/30' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Product/Equipment Image Canvas with clean white background */}
                <div className="h-44 sm:h-48 p-3 flex items-center justify-center bg-white relative overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Solid Green Bottom Label Bar (exact match: #2e8b43 / #238B3D) */}
                <div className="bg-[#2e8b43] group-hover:bg-[#238B3D] text-white text-center py-3 px-2 transition-colors">
                  <h3 className="text-xs sm:text-[13px] font-black tracking-tight leading-tight text-slate-950 group-hover:text-white transition-colors">
                    {cat.title}
                  </h3>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
};
