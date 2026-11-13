import React from 'react';
import { Product } from '../types';
import { X, ShoppingCart, FileText, Check, ShieldCheck, Award, Star, Layers, Trash2 } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveFromComparison: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveFromComparison,
  onAddToCart,
  onRequestQuote,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  const getPowerCapacity = (p: Product) => {
    if (p.specs && (p.specs['Power Capacity'] || p.specs['Max Power'] || p.specs['Power Output'] || p.specs['Capacity'])) {
      return p.specs['Power Capacity'] || p.specs['Max Power'] || p.specs['Power Output'] || p.specs['Capacity'];
    }
    const match = p.name.match(/(\d+\.?\d*\s*(?:W|kW|kWh|kVA|HP|Ah|Ah\s*12V))/i);
    return match ? match[1] : 'Standard Spec';
  };

  const getEfficiencyTech = (p: Product) => {
    if (p.specs && (p.specs['Cell Type'] || p.specs['Technology'] || p.specs['Efficiency'] || p.specs['Waveform'])) {
      return p.specs['Cell Type'] || p.specs['Technology'] || p.specs['Efficiency'] || p.specs['Waveform'];
    }
    if (p.category_name?.toLowerCase().includes('panel')) return 'N-Type Monocrystalline Half-Cut (22.5% Efficiency)';
    if (p.category_name?.toLowerCase().includes('inverter')) return 'Pure Sine Wave Pure Hybrid MPPT';
    if (p.category_name?.toLowerCase().includes('batter')) return 'Lithium Iron Phosphate (LiFePO4) 6,000+ Cycles';
    if (p.category_name?.toLowerCase().includes('pump')) return 'VFD Automatic Frequency Solar Drive';
    return 'EPRA Certified Commercial Grade';
  };

  const getVoltageDimensions = (p: Product) => {
    if (p.specs && (p.specs['Voltage'] || p.specs['System Voltage'] || p.specs['Dimensions'])) {
      return `${p.specs['Voltage'] || p.specs['System Voltage'] || 'Standard'} • ${p.specs['Dimensions'] || 'Compact Rack/Wallmount'}`;
    }
    return '48V Standard DC / 230V AC';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F58220] flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Technical Specification Comparison Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Side-by-side hardware comparison for up to 3 solar equipment units
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-800">No products selected for comparison.</p>
            <p className="text-xs text-slate-500">Select up to 3 products from the store catalog to compare specs.</p>
            <button
              onClick={onClose}
              className="bg-[#F58220] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-100 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-l-xl w-48">
                    Specification
                  </th>
                  {products.map(p => (
                    <th key={p.id} className="p-3 bg-slate-50 border-l border-slate-200 text-slate-900 font-extrabold text-xs relative min-w-[220px]">
                      <button
                        onClick={() => onRemoveFromComparison(p.id)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[#F58220] text-[10px] uppercase font-mono block mb-1">
                        {p.category_name}
                      </span>
                      <span className="line-clamp-2">{p.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                
                {/* 1. Image & Quick View */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Product Visual</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200 text-center">
                      <div className="h-32 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                        <img 
                          src={p.image_url} 
                          alt={p.name} 
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProduct(p);
                        }}
                        className="mt-2 text-[11px] font-bold text-[#F58220] hover:underline cursor-pointer"
                      >
                        View Full Specs & Photos →
                      </button>
                    </td>
                  ))}
                </tr>

                {/* 2. Price & Sale */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Unit Price (KES)</td>
                  {products.map(p => {
                    const price = p.sale_price || p.price;
                    return (
                      <td key={p.id} className="p-3 border-l border-slate-200">
                        <div className="font-extrabold text-sm sm:text-base text-slate-900">
                          KES {price.toLocaleString()}
                        </div>
                        {p.sale_price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            KES {p.price.toLocaleString()}
                          </span>
                        )}
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          VAT Inclusive
                        </p>
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Power Output / Capacity */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Power Capacity / Output</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200 font-semibold text-slate-900">
                      {getPowerCapacity(p)}
                    </td>
                  ))}
                </tr>

                {/* 4. Technology & Efficiency */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Technology & Efficiency</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200 text-slate-700">
                      {getEfficiencyTech(p)}
                    </td>
                  ))}
                </tr>

                {/* 5. Voltage & System Hardware */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Voltage & System Bus</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200 text-slate-700">
                      {getVoltageDimensions(p)}
                    </td>
                  ))}
                </tr>

                {/* 6. Stock Status */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">WooCommerce Stock Status</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.stock_status === 'instock'
                          ? 'bg-emerald-100 text-[#238B3D]'
                          : p.stock_status === 'onbackorder'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {p.stock_status === 'instock' ? `In Stock (${p.stock} units)` : p.stock_status}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 7. Warranty */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Manufacturer Warranty</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200 text-slate-700">
                      <div className="flex items-center gap-1.5 font-semibold text-[#238B3D]">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{p.warranty || '5-Year Warranty'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 8. Rating & Customer Feedback */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Customer Rating</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating || 4.9}</span>
                        <span className="text-[10px] text-slate-400">({p.reviews_count || 18} reviews)</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 9. SKU & Permalinks */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">SKU & Permalink</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200 text-[10px] font-mono text-slate-500">
                      <div>SKU: {p.sku}</div>
                      <a href={p.permalink} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline truncate block">
                        {p.permalink}
                      </a>
                    </td>
                  ))}
                </tr>

                {/* 10. CTAs */}
                <tr>
                  <td className="p-3 font-bold bg-slate-50 text-slate-900">Action Controls</td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border-l border-slate-200">
                      <div className="space-y-2">
                        <button
                          onClick={() => onAddToCart(p)}
                          className="w-full bg-[#F58220] hover:bg-[#e07214] text-white text-xs font-bold py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onRequestQuote(p);
                          }}
                          className="w-full bg-[#238B3D] hover:bg-[#1b7030] text-white text-xs font-bold py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Get Quote</span>
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
