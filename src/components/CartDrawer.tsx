import React from 'react';
import { CartItem } from '../types';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  Home,
  Heart,
  User,
  Menu,
} from 'lucide-react';
import { MpesaDarajaService } from '../services/mpesaDaraja';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onProceedToCheckout: () => void;
  onNavigateHome?: () => void;
  onOpenWishlist?: () => void;
  onOpenCategories?: () => void;
  onOpenProfile?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onNavigateHome,
  onOpenWishlist,
  onOpenCategories,
  onOpenProfile,
}) => {
  if (!isOpen) return null;

  const subTotal = items.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = subTotal > 0 ? (subTotal >= 50000 ? 0 : 1500) : 0;
  const totalAmount = subTotal + shippingFee;

  const handleQuickWhatsAppCheckout = () => {
    if (items.length === 0) return;
    const { url } = MpesaDarajaService.createWhatsAppCheckout(items, {
      name: 'Quick Inquirer',
      phone: 'Website Visitor',
      location: 'Kenya',
      notes: 'Inquiry from My Cart',
    });
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar ("<- My Cart") */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h3 className="font-bold text-base tracking-tight text-slate-900">
            My Cart
          </h3>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Your Cart is Empty</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Explore our Tier-1 solar panels, Must & Deye hybrid inverters, Lithium Valley batteries, and Doyin borehole pumps.
              </p>
              <button
                onClick={onClose}
                className="mt-2 bg-[#F58220] hover:bg-[#e07214] text-white text-xs font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            items.map((item) => {
              const currentPrice = item.product.sale_price || item.product.price;
              return (
                <div
                  key={item.product.id}
                  className="flex items-start gap-4 pb-5 border-b border-slate-200 last:border-none"
                >
                  {/* Left Rounded Product Thumbnail Box */}
                  <div className="w-28 h-24 rounded-2xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Right Product Details & Controls */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-base font-extrabold text-[#238B3D] mt-0.5 tabular-nums">
                      KES {currentPrice.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.product.category_name || 'Tier-1 Solar Hardware'}
                    </p>

                    {/* Quantity Controls (- 1 + Trash) */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-md bg-[#238B3D] hover:bg-[#1b6b2f] text-white flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 tabular-nums min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-md bg-[#238B3D] hover:bg-[#1b6b2f] text-white flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Brand Emblem, Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="px-6 pt-3 pb-4 bg-white border-t border-slate-100 space-y-4">
            {/* Centered Brand Mark */}
            <div className="flex flex-col items-center justify-center py-1">
              <img
                src="/assets/aistudio/pdf-logo__1__3934e2bd.jpg"
                alt="Shantis Designs Solar Solutions"
                className="h-8 w-auto object-contain rounded-md"
              />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mt-1">
                Shantis Solar
              </span>
            </div>

            {/* Sub Total / Shipping / Total Amount */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Sub Total</span>
                <span className="tabular-nums font-semibold text-slate-800">
                  KES {subTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 font-medium pb-2.5 border-b border-slate-200">
                <span>Shipping</span>
                <span className="tabular-nums font-semibold text-slate-800">
                  {shippingFee === 0 ? 'FREE' : `KES ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="tabular-nums text-base text-[#238B3D]">
                  KES {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Primary Checkout Button + WhatsApp Option */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#F58220] hover:bg-[#e07214] text-white py-3.5 px-5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer text-center"
              >
                Checkout
              </button>

              <button
                onClick={handleQuickWhatsAppCheckout}
                className="w-full bg-[#238B3D] hover:bg-[#1b7030] text-white py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Order via WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom 4-Icon Tab Bar (Home, Favorite, Category, Profile) */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-around text-slate-500">
          <button
            onClick={() => {
              onClose();
              onNavigateHome?.();
            }}
            className="flex flex-col items-center gap-0.5 hover:text-[#238B3D] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenWishlist?.();
            }}
            className="flex flex-col items-center gap-0.5 hover:text-[#F58220] transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span className="text-[10px] font-medium">Favorite</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenCategories?.();
            }}
            className="flex flex-col items-center gap-0.5 hover:text-[#238B3D] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[10px] font-medium">Shop</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenProfile?.();
            }}
            className="flex flex-col items-center gap-0.5 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
