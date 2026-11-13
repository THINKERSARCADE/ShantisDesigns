import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingCart, FileText, Flame, Clock, Check, Star } from 'lucide-react';

interface DealsSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  products,
  onAddToCart,
  onRequestQuote,
  onSelectProduct
}) => {
  // Only products with active sale_price
  const dealProducts = products.filter(p => p.sale_price !== null && p.sale_price < p.price);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 28,
    minutes: 42,
    seconds: 18
  });

  const [addedIds, setAddedIds] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
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

  if (dealProducts.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/70 border-y border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F58220] uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-[#F58220]" />
              <span>Limited Stock Promotional Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Special Offers & Featured Discounts
            </h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-orange-200/80 shadow-xs self-start md:self-auto">
            <Clock className="w-4 h-4 text-[#F58220] shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Offers Refresh In:</span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
              <span className="bg-slate-100 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-slate-100 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-[#F58220]">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Deals Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dealProducts.slice(0, 4).map((product) => {
            const discountAmount = product.price - (product.sale_price || product.price);
            const discountPercent = Math.round((discountAmount / product.price) * 100);
            const isAdded = addedIds.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-white rounded-2xl border border-orange-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
              >
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10 bg-[#F58220] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <span>SAVE KES {discountAmount.toLocaleString()}</span>
                  <span className="bg-black/20 px-1 rounded text-[10px]">-{discountPercent}%</span>
                </div>

                {/* Image Container */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {product.stock <= 10 && (
                    <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      Only {product.stock} Left in Stock
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{product.rating || 4.9}</span>
                      <span className="text-[11px] text-slate-400">({product.reviews_count || 30})</span>
                    </div>

                    <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">
                      {product.category_name}
                    </p>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#F58220] transition-colors line-clamp-2 mt-1">
                      {product.name}
                    </h3>

                    {product.shortDescription && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="pt-3 border-t border-slate-100 mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-[#F58220]">
                        KES {(product.sale_price!).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        KES {product.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Dual Action CTA Buttons as required */}
                    <div className="grid grid-cols-2 gap-2 mt-3.5">
                      {/* Orange Add to Cart */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          isAdded 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-[#F58220] hover:bg-[#e07214] text-white shadow-xs active:scale-95'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                        <span>{isAdded ? 'Added' : 'Add to Cart'}</span>
                      </button>

                      {/* Green Request Installation Quote */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestQuote(product);
                        }}
                        className="w-full flex items-center justify-center gap-1 py-2 px-2 bg-[#238B3D] hover:bg-[#1b7030] text-white rounded-lg font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                        title="Request Installation Quote"
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

      </div>
    </section>
  );
};
