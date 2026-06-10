"use client";

import { memo } from "react";
import Image from "next/image";
import { Plus, Minus, Star } from "lucide-react";

export type MenuType = {
  id: string; title: string; description: string | null;
  image_url: string | null; badge: string | null;
  category: "veg" | "non_veg"; meal_type?: "lunch" | "dinner" | "both"; is_active: boolean;
};

type FoodCardProps = {
  menu: MenuType;
  quantity: number;
  onAdd: () => void;
  onUpdateQty: (qty: number) => void;
  layout?: "horizontal" | "vertical";
  price?: number; // fallback price
};

export const FoodCard = memo(function FoodCard({ menu, quantity, onAdd, onUpdateQty, layout = "horizontal", price = 120 }: FoodCardProps) {
  const isVeg = menu.category === "veg";

  if (layout === "vertical") {
    // 6.7 Horizontal Food Card (Item Card) - usually scrollable in a horizontal list, but the card itself is tall/vertical
    return (
      <div className="w-[160px] shrink-0 bg-white border border-[#E8E8E8] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden relative">
        <div className="w-full h-[120px] relative bg-[#F2F2F2]">
          {menu.image_url ? (
            <Image src={menu.image_url} alt={menu.title} fill className="object-cover" />
          ) : (
            <Image 
              src={isVeg 
                ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop" 
                : "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=300&auto=format&fit=crop"} 
              alt={menu.title} 
              fill 
              className="object-cover" 
            />
          )}
          {menu.badge && (
            <div className="absolute top-0 left-0 bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded-br-[12px]">
              {menu.badge}
            </div>
          )}
          {/* Add Button */}
          <div className="absolute bottom-2 right-2 z-10">
            {quantity === 0 ? (
              <button 
                onClick={onAdd}
                className="w-[32px] h-[32px] bg-white border-[1.5px] border-[#1BA672] rounded-[8px] flex items-center justify-center shadow-sm hover:bg-[#F0FFF4] transition-colors"
              >
                <Plus size={18} className="text-[#1BA672]" />
              </button>
            ) : (
              <div className="bg-white border-[1.5px] border-[#1BA672] rounded-[8px] flex items-center justify-between shadow-sm overflow-hidden h-[32px] w-[72px]">
                <button onClick={() => onUpdateQty(quantity - 1)} className="flex-1 flex items-center justify-center h-full hover:bg-slate-50">
                  <Minus size={14} className="text-[#1BA672]" />
                </button>
                <span className="font-bold text-[13px] text-[#1BA672]">{quantity}</span>
                <button onClick={() => onUpdateQty(quantity + 1)} className="flex-1 flex items-center justify-center h-full hover:bg-slate-50">
                  <Plus size={14} className="text-[#1BA672]" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-[14px] h-[14px] border flex items-center justify-center shrink-0 ${isVeg ? 'border-[#1BA672]' : 'border-[#E23744]'}`}>
              <div className={`w-[8px] h-[8px] rounded-full ${isVeg ? 'bg-[#1BA672]' : 'bg-[#E23744]'}`} />
            </div>
            <h3 className="font-semibold text-[14px] text-[#1C1C1C] truncate leading-tight">{menu.title}</h3>
          </div>
          <div className="flex items-center gap-1 mt-auto pt-1">
            <span className="text-[#686B78] text-[13px] line-through font-normal">₹{price + 40}</span>
            <span className="text-[#1C1C1C] text-[15px] font-bold">₹{price}</span>
          </div>
        </div>
      </div>
    );
  }

  // Horizontal boxed layout (as per user screenshot)
  return (
    <div className="p-3 sm:p-4 flex gap-3 sm:gap-4 w-full bg-white relative border border-[#e8e8e8] rounded-[20px] shadow-sm mb-4 transition-shadow hover:shadow-md">
      <div className="flex-1 min-w-0 flex flex-col justify-start">
        {/* Top line: Veg icon + Bestseller tag */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-[14px] h-[14px] border flex items-center justify-center rounded-[3px] ${isVeg ? 'border-[#1BA672]' : 'border-[#E23744]'}`}>
            <div className={`w-[6px] h-[6px] rounded-full ${isVeg ? 'bg-[#1BA672]' : 'bg-[#E23744]'}`} />
          </div>
          <div className="flex items-center text-[#D9652B] font-bold text-[13px]">
            <Star size={12} fill="#D9652B" className="mr-0.5" /> Bestseller
          </div>
        </div>
        
        <h3 className="font-bold text-[17px] sm:text-[18px] text-[#3D4152] m-0 mb-1 leading-snug tracking-tight">{menu.title}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <p className="font-bold text-[15px] sm:text-[16px] text-[#3D4152] m-0">
            ₹{price} 
          </p>
          {price && <span className="text-[13px] text-[#686B78] font-medium line-through">₹{price + 40}</span>}
        </div>

        {/* Rating Line */}
        <div className="flex items-center gap-0.5 mb-2">
          {[1, 2, 3, 4].map((i) => (
            <Star key={i} size={13} fill="#FACC15" className="text-[#FACC15]" />
          ))}
          <Star size={13} fill="#FACC15" className="text-[#FACC15]" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }} />
          <span className="text-[#FACC15] font-bold text-[13px] ml-1">4.5</span>
          <span className="text-[#686B78] text-[13px] ml-0.5">(12)</span>
        </div>
        
        {menu.description && (
          <p className="text-[13px] sm:text-[14px] text-[#686B78] m-0 line-clamp-2 leading-relaxed font-medium pr-4 mb-3">
            {menu.description}
          </p>
        )}
      </div>

      <div className="w-[100px] sm:w-[140px] shrink-0 relative flex flex-col items-center pb-2">
        <div className="w-[100px] sm:w-[140px] h-[100px] sm:h-[140px] rounded-[16px] relative overflow-hidden bg-[#F2F2F2] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {menu.image_url ? (
            <Image src={menu.image_url} alt={menu.title} fill className="object-cover" />
          ) : (
            <Image 
              src={isVeg 
                ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop" 
                : "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=300&auto=format&fit=crop"} 
              alt={menu.title} 
              fill 
              className="object-cover" 
            />
          )}
        </div>
        
        {/* Swiggy-style Add Button under image */}
        <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-[84px] sm:w-[120px] h-[32px] sm:h-[40px] bg-white rounded-[8px] sm:rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] overflow-hidden flex z-10">
          {quantity === 0 ? (
            <button 
              onClick={onAdd} 
              className="w-full h-full flex items-center justify-center text-[#1BA672] text-[13px] sm:text-[16px] font-extrabold cursor-pointer hover:bg-[#f3fbf7] transition-colors uppercase tracking-wide border-none bg-transparent"
            >
              ADD
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-between px-1.5 sm:px-2 bg-white">
              <button onClick={() => onUpdateQty(quantity - 1)} className="text-[#1BA672] hover:bg-slate-50 rounded-md w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-transparent border-none cursor-pointer p-0 transition-colors">
                <Minus className="w-[16px] sm:w-[20px] h-[16px] sm:h-[20px]" strokeWidth={3} />
              </button>
              <span className="font-extrabold text-[13px] sm:text-[15px] text-[#1BA672] w-5 sm:w-6 text-center">{quantity}</span>
              <button onClick={() => onUpdateQty(quantity + 1)} className="text-[#1BA672] hover:bg-green-50 rounded-md w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-transparent border-none cursor-pointer p-0 transition-colors">
                <Plus className="w-[16px] sm:w-[20px] h-[16px] sm:h-[20px]" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
