"use client";

import Image from "next/image";
import { Check } from "lucide-react";

export type PlanType = {
  id: string; title: string; description: string;
  category: "veg" | "non_veg"; meal_type: "lunch" | "dinner" | "both";
  duration_days: number; price: number; is_trial: boolean; image?: string;
};

type TiffinPlanCardProps = {
  plan: PlanType;
  isActive?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
};

export function TiffinPlanCard({ plan, isActive, onSelect, isLoading }: TiffinPlanCardProps) {
  const isWeekly = plan.duration_days === 7;
  const isVeg = plan.category === "veg";

  const getFallbackImage = () => {
    if (plan.image) return plan.image;
    if (plan.is_trial) return "/eazymytiffin-weekly-special-meal.png";
    if (plan.duration_days === 26) return "/eazymytiffin-monthly-meal-calendar.png";
    if (plan.duration_days === 1 && plan.meal_type !== "both") return "/eazymytiffin-light-meal-subscription.png";
    if (plan.title.toLowerCase().includes("mix")) return "/eazymytiffin-mix-meal-plan.png";
    return isVeg ? "/eazymytiffin-veg-meal-plan.png" : "/eazymytiffin-non-veg-meal-plan.png";
  };

  return (
    <div className={`p-3 sm:p-4 flex gap-3 sm:gap-4 w-full bg-white border rounded-[20px] shadow-sm transition-all ${
      isActive ? 'border-[#FC8019] shadow-[0_4px_16px_rgba(252,128,25,0.15)] ring-1 ring-[#FC8019]' : 'border-[#E8E8E8] hover:shadow-md'
    }`}>
      <div className="flex-1 min-w-0 flex flex-col justify-start pl-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className={`w-[14px] h-[14px] border-[1.5px] flex items-center justify-center rounded-[3px] ${isVeg ? 'border-[#1BA672]' : 'border-[#E23744]'}`}>
            <div className={`w-[6px] h-[6px] rounded-full ${isVeg ? 'bg-[#1BA672]' : 'bg-[#E23744]'}`} />
          </div>
          <span className="text-[11px] font-bold text-[#1C1C1C]">{isVeg ? "Veg" : "Non-Veg"}</span>
        </div>

        <h3 className="font-bold text-[17px] sm:text-[18px] text-[#3D4152] m-0 mb-1 leading-snug tracking-tight">
          {plan.title}
        </h3>

        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-[15px] sm:text-[16px] text-[#3D4152]">₹{plan.price}</span>
          <span className="text-[12px] text-[#686B78] font-medium">/{plan.duration_days === 1 ? (plan.is_trial ? 'trial' : 'day') : isWeekly ? 'wk' : 'mo'}</span>
        </div>

        <p className="text-[13px] text-[#686B78] m-0 line-clamp-2 leading-relaxed font-medium pr-4">
          {plan.description || (isVeg ? "Delicious pure vegetarian home-style meals." : "Premium non-vegetarian meals.")}
        </p>
      </div>

      <div className="w-[100px] sm:w-[140px] shrink-0 relative flex flex-col items-center pb-2">
        <div className="w-[100px] sm:w-[140px] h-[100px] sm:h-[140px] rounded-[16px] relative overflow-hidden bg-[#F2F2F2] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <Image src={getFallbackImage()} alt={plan.title} fill sizes="140px" className="object-cover" />
        </div>

        <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-[84px] sm:w-[120px] h-[32px] sm:h-[40px] bg-white rounded-[8px] sm:rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] overflow-hidden flex z-10">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-[#FC8019]/30 border-t-[#FC8019] animate-spin" />
            </div>
          ) : isActive ? (
            <div className="w-full h-full flex items-center justify-center text-[#1BA672] text-[10px] sm:text-[12px] font-extrabold uppercase tracking-wide gap-1">
              <Check size={14} /> Active
            </div>
          ) : (
            <button
              onClick={onSelect}
              className="w-full h-full flex items-center justify-center text-[#FC8019] text-[10px] sm:text-[12px] font-extrabold uppercase tracking-wide cursor-pointer hover:bg-[#FFF3E8] transition-colors bg-transparent border-none"
            >
              Subscribe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
