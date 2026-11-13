import React from 'react';
import { Product } from '../types';
import { X, ShoppingCart, Trash2, Heart, ArrowRight } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onExploreShop: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
  onExploreShop
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-red-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">My Wishlist</h3>
              <p className="text-xs text-slate-500">{wishlistProducts.length} saved products</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Your wishlist is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Save solar panels, inverters, and lithium batteries for quick access and price tracking.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreShop();
                }}
                className="inline-flex items-center gap-1.5 bg-[#F58220] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:bg-[#e07214] transition-colors cursor-pointer"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            wishlistProducts.map(product => {
              const currentPrice = product.sale_price || product.price;

              return (
                <div 
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs hover:border-slate-300 transition-all group"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-100 bg-slate-50 shrink-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                      className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-[#F58220] transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</p>
                    <p className="text-xs font-extrabold text-[#F58220] mt-0.5">
                      KES {currentPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(product);
                      }}
                      className="bg-[#238B3D] hover:bg-[#1b7030] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTAs */}
        {wishlistProducts.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
            <button
              onClick={() => {
                wishlistProducts.forEach(p => onAddToCart(p));
                onClose();
              }}
              className="w-full bg-[#F58220] hover:bg-[#e07214] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All to Shopping Cart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
