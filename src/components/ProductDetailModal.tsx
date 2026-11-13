import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
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
  Sparkles
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onRequestQuote: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  wishlistIds: number[];
  onToggleWishlist: (productId: number) => void;
  comparisonIds: number[];
  onToggleComparison: (productId: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  onClose,
  onAddToCart,
  onRequestQuote,
  onSelectProduct,
  wishlistIds,
  onToggleWishlist,
  comparisonIds,
  onToggleComparison
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  // Image Zoom Magnifier State
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const currentPrice = product.sale_price || product.price;
  const isWishlisted = wishlistIds.includes(product.id);
  const isCompared = comparisonIds.includes(product.id);

  // Compute Related Products from same category or brand
  const relatedProducts = allProducts.filter(p => 
    p.id !== product.id && 
    (p.category_id === product.category_id || p.category_name === product.category_name)
  ).slice(0, 4);

  const handleAdd = () => {
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

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello Shantis Designs Solar Solutions, I am inquiring about:\n\n*${product.name}*\nPrice: KES ${currentPrice.toLocaleString()}\nSKU: ${product.sku}\nPermalink: ${product.permalink || product.url}\n\nCan you advise on technical compatibility & delivery?`
    );
    window.open(`https://wa.me/254115521631?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar with Close & Wishlist & Compare Buttons */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-[#238B3D] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
              EPRA CLASS T3 CERTIFIED
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">SKU: {product.sku}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Toggle Button */}
            <button
              onClick={() => onToggleComparison(product.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCompared
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Add to spec comparison matrix"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare Tray' : 'Compare Spec'}</span>
            </button>

            {/* Wishlist Heart Toggle */}
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Main Product Specs & Purchase Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 5 COLS: Image Canvas with Interactive Magnifying Lens */}
            <div className="md:col-span-5 space-y-4">
              <div 
                className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm relative cursor-crosshair group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
              >
                {/* Standard Base Image */}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />

                {/* Magnifying Glass Zoom Overlay on Hover */}
                {isHovered && (
                  <div
                    className="absolute inset-0 pointer-events-none bg-white border-2 border-[#F58220] rounded-2xl shadow-2xl"
                    style={{
                      backgroundImage: `url(${product.image_url})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '280%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                )}

                {/* Hover Helper Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3 h-3 text-amber-400" />
                  <span>{isHovered ? 'Hardware Zoom Active' : 'Hover image to inspect specs'}</span>
                </div>

                {product.sale_price && (
                  <span className="absolute top-3 left-3 bg-[#F58220] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
                    SAVE KES {(product.price - product.sale_price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 text-[#238B3D] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#238B3D] shrink-0" />
                  <span>EPRA Class T3 & NCA Engineering Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F58220] shrink-0" />
                  <span>{product.warranty || '25-Year Performance / 5-Year Unit Warranty'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Free Nairobi CBD & Express Dispatch across 47 Counties</span>
                </div>
              </div>

              {/* Direct WhatsApp Engineer Inquiry */}
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat with Solar Engineer on WhatsApp</span>
              </button>
            </div>

            {/* RIGHT 7 COLS: Product Info & Pricing & CTAs */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-extrabold text-[#F58220] uppercase tracking-wider">
                    {product.category_name}
                  </span>
                  <span className="font-mono">WooCommerce ID: #{product.id}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{product.rating || 4.9}</span>
                  <span className="text-xs text-slate-400">({product.reviews_count || 24} Customer Reviews)</span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    KES {currentPrice.toLocaleString()}
                  </span>
                  {product.sale_price && (
                    <span className="text-base text-slate-400 line-through">
                      KES {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-slate-500 font-medium">VAT Inclusive • Official Kenyan Dealer Warranty</span>
                  <span className={`font-bold ${product.stock_status === 'instock' ? 'text-[#238B3D]' : 'text-amber-700'}`}>
                    ● {product.stock_status === 'instock' ? `In Stock (${product.stock} units)` : product.stock_status}
                  </span>
                </div>
              </div>

              {/* SHORT DESCRIPTION (Requirement 4) */}
              {product.shortDescription && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F58220]" />
                    <span>Quick Highlights</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {/* FULL PRODUCT OVERVIEW / DESCRIPTION */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Product Overview & Technical Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-2">
                  {product.description}
                </p>
              </div>

              {/* Technical Specifications Table */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Hardware Specifications
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex py-2 px-3 odd:bg-slate-50 even:bg-white">
                        <span className="font-bold text-slate-600 w-1/2">{key}</span>
                        <span className="text-slate-900 font-semibold w-1/2">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker & Action CTAs */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Quantity:</span>
                    <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3.5 text-xs font-black text-slate-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Total: <strong className="text-slate-900">KES {(currentPrice * quantity).toLocaleString()}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAdd}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      added
                        ? 'bg-[#238B3D] text-white'
                        : 'bg-[#F58220] hover:bg-[#e07214] text-white active:scale-98'
                    }`}
                  >
                    {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    <span>{added ? 'Added to Cart' : 'Add to Cart'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onRequestQuote(product);
                    }}
                    className="w-full py-3.5 px-4 bg-[#238B3D] hover:bg-[#1b7030] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Get Solar Quote</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* RELATED PRODUCTS SECTION (Requirement 4) */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-[#F58220] tracking-wider">
                    Recommended Equipment
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Related Products in {product.category_name}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Handpicked compatible systems</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map(rel => {
                  const relPrice = rel.sale_price || rel.price;
                  const relWishlisted = wishlistIds.includes(rel.id);

                  return (
                    <div
                      key={rel.id}
                      onClick={() => onSelectProduct(rel)}
                      className="bg-slate-50 hover:bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(rel.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 transition-colors shadow-2xs"
                        title="Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${relWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      <div>
                        <div className="h-32 flex items-center justify-center p-2 bg-white rounded-lg overflow-hidden relative mb-2">
                          <img
                            src={rel.image_url}
                            alt={rel.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#F58220] transition-colors">
                          {rel.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 mt-2 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          KES {relPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-[#238B3D] group-hover:underline">
                          View →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
