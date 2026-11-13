import React from 'react';
import {
  Heart,
  Home,
  ShoppingBag,
  User,
} from 'lucide-react';
import { Product, Category, CartItem } from '../types';
import { NavPage } from './Header';

interface MobileStorefrontViewProps {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlistIds: number[];
  onToggleWishlist: (productId: number) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  onUpdateCartQuantity: (productId: number, delta: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string | null) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCheckout: () => void;
  onOpenAdmin: () => void;
  currentPage: NavPage;
  onNavigatePage: (page: NavPage) => void;
}

export const MobileStorefrontView: React.FC<MobileStorefrontViewProps> = ({
  wishlistIds,
  onSelectCategory,
  onOpenWishlist,
  onOpenAdmin,
  currentPage,
  onNavigatePage,
}) => {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around text-slate-600 shadow-lg"
    >
      <button
        onClick={() => onNavigatePage('home')}
        className={`flex flex-col items-center gap-0.5 cursor-pointer ${
          currentPage === 'home' ? 'text-[#238B3D] font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5 stroke-[1.75]" />
        <span className="text-[10px]">Home</span>
      </button>
      <button
        onClick={onOpenWishlist}
        className="relative flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#F58220] cursor-pointer"
      >
        <Heart className="w-5 h-5 stroke-[1.75]" />
        {wishlistIds.length > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F58220] text-white text-[8px] font-bold flex items-center justify-center">
            {wishlistIds.length}
          </span>
        )}
        <span className="text-[10px]">Favorite</span>
      </button>
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex flex-col items-center gap-0.5 cursor-pointer ${
          currentPage === 'shop' ? 'text-[#238B3D] font-bold' : 'text-slate-500'
        }`}
      >
        <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
        <span className="text-[10px]">Shop</span>
      </button>
      <button
        onClick={onOpenAdmin}
        className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
      >
        <User className="w-5 h-5 stroke-[1.75]" />
        <span className="text-[10px]">Profile</span>
      </button>
    </nav>
  );
};
