"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sprout, Utensils, Flame } from "lucide-react";
import { FilterChips } from "@/components/ui/FilterChips";

type Category = "veg" | "mix" | "nonveg";
type MealFilter = "1-meal-trial" | "1-meal" | "1-day-meal" | "1-month";

const categoryMeta = {
  veg: { label: "Veg", color: "#1B5E30", icon: Sprout, image: "/eazymytiffin-veg-meal-plan.png", dotColor: "bg-[#1BA672]", borderColor: "border-[#1BA672]" },
  mix: { label: "Mix Veg", color: "#D35400", icon: Utensils, image: "/eazymytiffin-mix-meal-plan.png", dotColor: "bg-[#D35400]", borderColor: "border-[#D35400]" },
  nonveg: { label: "Non-Veg", color: "#E8392A", icon: Flame, image: "/eazymytiffin-non-veg-meal-plan.png", dotColor: "bg-[#E23744]", borderColor: "border-[#E23744]" },
};

const LABEL_MAP: Record<MealFilter, string> = {
  "1-meal-trial": "1 Meal Trial",
  "1-meal": "1 Meal",
  "1-day-meal": "1 Day Meal",
  "1-month": "1 Month",
};

const DESCRIPTIONS: Record<MealFilter, string> = {
  "1-meal-trial": "Try a single meal before you commit. Freshly prepared and delivered hot.",
  "1-meal": "Perfect for a quick, fresh meal. Choose from our daily rotating menu.",
  "1-day-meal": "Lunch & Dinner combo. Two fresh meals delivered daily at your doorstep.",
  "1-month": "Best value! Full month of daily fresh meals with the lowest per-meal price.",
};

interface PlanItem {
  planId: string;
  label: string;
  price: string;
  badge?: string;
  mealFilter: MealFilter;
}

const PLAN_DATA: Record<string, PlanItem[]> = {
  veg: [
    { planId: "veg-trial", label: "1 Meal Trial", price: "₹99", mealFilter: "1-meal-trial" },
    { planId: "veg-1-meal", label: "1 Meal", price: "₹119", mealFilter: "1-meal" },
    { planId: "veg-1-day", label: "1 Day Meal", price: "₹199", mealFilter: "1-day-meal" },
    { planId: "veg-1-month", label: "1 Month", price: "₹3,199", badge: "Popular", mealFilter: "1-month" },
  ],
  mix: [
    { planId: "mix-trial", label: "1 Meal Trial", price: "₹109", mealFilter: "1-meal-trial" },
    { planId: "mix-1-meal", label: "1 Meal", price: "₹139", mealFilter: "1-meal" },
    { planId: "mix-1-day", label: "1 Day Meal", price: "₹299", mealFilter: "1-day-meal" },
    { planId: "mix-1-month", label: "1 Month", price: "₹3,599", badge: "Popular", mealFilter: "1-month" },
  ],
  nonveg: [
    { planId: "nonveg-trial", label: "1 Meal Trial", price: "₹129", mealFilter: "1-meal-trial" },
    { planId: "nonveg-1-meal", label: "1 Meal", price: "₹159", mealFilter: "1-meal" },
    { planId: "nonveg-1-day", label: "1 Day Meal", price: "₹259", mealFilter: "1-day-meal" },
    { planId: "nonveg-1-month", label: "1 Month", price: "₹4,299", badge: "Popular", mealFilter: "1-month" },
  ],
};

export default function TiffinPlansSection({ onSubscribe }: { onSubscribe?: (planId: string) => void }) {
  const [activeMealFilter, setActiveMealFilter] = useState<MealFilter>("1-month");

  const items = (["veg", "mix", "nonveg"] as const)
    .flatMap(cat =>
      PLAN_DATA[cat]
        .filter(p => p.mealFilter === activeMealFilter)
        .map(p => ({ ...p, category: cat, meta: categoryMeta[cat] }))
    );

  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-black text-[22px] text-[#1C1C1C] tracking-tight">Tiffin Plans</h3>
          <p className="text-[13px] text-[#686B78] font-medium mt-0.5">Fresh home-cooked meals delivered daily. Flexible plans for every need.</p>
        </div>
        
        <FilterChips
          options={[
            { value: "1-meal-trial", label: "1 Meal Trial" },
            { value: "1-meal", label: "1 Meal" },
            { value: "1-day-meal", label: "1 Day Meal" },
            { value: "1-month", label: "1 Month" },
          ]}
          activeValue={activeMealFilter}
          onChange={(v) => setActiveMealFilter(v as MealFilter)}
        />
      </div>

      {/* Cards Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[20px] border border-[#E8E8E8]">
          <p className="text-[#686B78] font-semibold">No plans match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item, i) => (
            <div
              key={`${item.category}-${i}`}
              className="p-3 sm:p-4 flex gap-3 sm:gap-4 w-full bg-white border border-[#E8E8E8] rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex-1 min-w-0 flex flex-col justify-start pl-2 sm:pl-3 pt-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-[14px] h-[14px] border-[1.5px] flex items-center justify-center rounded-[3px] ${item.category === "veg" ? "border-[#1BA672]" : "border-[#E23744]"}`}>
                    <div className={`w-[6px] h-[6px] rounded-full ${item.category === "veg" ? "bg-[#1BA672]" : "bg-[#E23744]"}`} />
                  </div>
                  <span className="text-[11px] font-bold text-[#1C1C1C]">{item.meta.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold text-[#D9652B] ml-1">{item.badge}</span>
                  )}
                </div>

                <h4 className="font-bold text-[17px] sm:text-[18px] text-[#3D4152] m-0 mb-1 leading-snug tracking-tight">
                  {item.label}
                </h4>

                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[15px] sm:text-[16px] text-[#3D4152]">{item.price}</span>
                  {item.mealFilter === "1-month" && (
                    <span className="text-[13px] text-[#686B78] font-medium">/mo</span>
                  )}
                </div>

                <p className="text-[13px] sm:text-[14px] text-[#686B78] m-0 line-clamp-2 leading-relaxed font-medium pr-4">
                  {DESCRIPTIONS[item.mealFilter]}
                </p>

              </div>

              <div className="w-[100px] sm:w-[140px] shrink-0 relative flex flex-col items-center pb-2">
                <div className="w-[100px] sm:w-[140px] h-[100px] sm:h-[140px] rounded-[16px] relative overflow-hidden bg-[#F2F2F2] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <Image
                    src={item.meta.image}
                    alt={`${item.meta.label} ${item.label}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-[84px] sm:w-[120px] h-[32px] sm:h-[40px] bg-white rounded-[8px] sm:rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] overflow-hidden flex z-10">
                  {onSubscribe ? (
                    <button
                      onClick={() => onSubscribe(item.planId)}
                      className="w-full h-full flex items-center justify-center text-[10px] sm:text-[13px] font-extrabold uppercase tracking-wide cursor-pointer"
                      style={{ color: item.meta.color }}
                    >
                      Subscribe
                    </button>
                  ) : (
                    <Link
                      href="/subscription"
                      className="w-full h-full flex items-center justify-center text-[10px] sm:text-[13px] font-extrabold uppercase tracking-wide"
                      style={{ color: item.meta.color }}
                    >
                      Subscribe
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
