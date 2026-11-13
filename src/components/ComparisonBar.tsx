import React from 'react';
import { Product } from '../types';
import { Layers, X, ArrowRight, Trash2 } from 'lucide-react';

interface ComparisonBarProps {
  comparisonProducts: Product[];
  onRemoveFromComparison: (productId: number) => void;
  onClearComparison: () => void;
  onOpenComparisonModal: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  comparisonProducts,
  onRemoveFromComparison,
  onClearComparison,
  onOpenComparisonModal
}) => {
  if (comparisonProducts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-3xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 backdrop-blur-md">
        
        {/* Left Count & Label */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#F58220] text-white flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Compare Solar Hardware
              </span>
              <span className="bg-slate-800 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-700">
                {comparisonProducts.length} / 3 selected
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Select up to 3 products to compare power capacity, efficiency, dimensions & prices side-by-side.
            </p>
          </div>
        </div>

        {/* Selected Product Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {comparisonProducts.map(product => (
            <div 
              key={product.id}
              className="relative group shrink-0 bg-slate-800 border border-slate-700 rounded-lg p-1"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-10 h-10 object-cover rounded bg-white"
              />
              <button
                onClick={() => onRemoveFromComparison(product.id)}
                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors shadow-xs"
                title="Remove product"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClearComparison}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors hidden md:block cursor-pointer"
          >
            Clear
          </button>
          
          <button
            onClick={onOpenComparisonModal}
            className="bg-[#238B3D] hover:bg-[#1b7030] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-102"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
