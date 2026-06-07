"use client";

import { useState, useRef, useEffect } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useUserStore } from "@/store/userStore";
import { useOrderStore } from "@/store/orderStore";
import { useThemeStore } from "@/store/themeStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pause, Play, CheckCircle2, ChevronRight, Star, Leaf, Drumstick,
  Truck, Search, X
} from "lucide-react";
import TiffinPlansSection from "@/components/ui/TiffinPlansSection";
import { ActiveOrderAlert } from "@/components/ui/ActiveOrderAlert";

const DEFAULT_PLANS = [
  // VEG MEALS
  { id: "veg-trial", title: "1 Meal Trial", description: "VEG MEALS", category: "veg", meal_type: "lunch", duration_days: 1, price: 99, is_trial: true },
  { id: "veg-1-meal", title: "1 Meal", description: "VEG MEALS", category: "veg", meal_type: "lunch", duration_days: 1, price: 119, is_trial: false },
  { id: "veg-1-day", title: "1 Day Meal", description: "VEG MEALS", category: "veg", meal_type: "both", duration_days: 1, price: 199, is_trial: false },
  { id: "veg-1-month", title: "1 Month", description: "VEG MEALS", category: "veg", meal_type: "both", duration_days: 26, price: 3199, is_trial: false },

  // MIX MEALS
  { id: "mix-trial", title: "1 Meal Trial", description: "MIX MEALS", category: "non_veg", meal_type: "lunch", duration_days: 1, price: 109, is_trial: true },
  { id: "mix-1-meal", title: "1 Meal", description: "MIX MEALS", category: "non_veg", meal_type: "lunch", duration_days: 1, price: 139, is_trial: false },
  { id: "mix-1-day", title: "1 Day Meal", description: "MIX MEALS", category: "non_veg", meal_type: "both", duration_days: 1, price: 299, is_trial: false },
  { id: "mix-1-month", title: "1 Month", description: "MIX MEALS", category: "non_veg", meal_type: "both", duration_days: 26, price: 3599, is_trial: false },

  // NON-VEG MEALS
  { id: "nonveg-trial", title: "1 Meal Trial", description: "NON-VEG MEALS", category: "non_veg", meal_type: "lunch", duration_days: 1, price: 129, is_trial: true },
  { id: "nonveg-1-meal", title: "1 Meal", description: "NON-VEG MEALS", category: "non_veg", meal_type: "lunch", duration_days: 1, price: 159, is_trial: false },
  { id: "nonveg-1-day", title: "1 Day Meal", description: "NON-VEG MEALS", category: "non_veg", meal_type: "both", duration_days: 1, price: 259, is_trial: false },
  { id: "nonveg-1-month", title: "1 Month", description: "NON-VEG MEALS", category: "non_veg", meal_type: "both", duration_days: 26, price: 4299, is_trial: false },
];

const categoryMeta: Record<string, any> = {
  veg: { label: "Veg", color: "#1B5E30", image: "/eazymytiffin-veg-meal-plan.png", dotColor: "bg-[#1BA672]" },
  mix: { label: "Mix Veg", color: "#D35400", image: "/eazymytiffin-mix-meal-plan.png", dotColor: "bg-[#D35400]" },
  nonveg: { label: "Non-Veg", color: "#E8392A", image: "/eazymytiffin-non-veg-meal-plan.png", dotColor: "bg-[#E23744]" },
};

const DESCRIPTIONS: Record<string, string> = {
  "1-meal-trial": "Try before you subscribe",
  "1-meal": "Single meal, fresh & hot",
  "1-day-meal": "Lunch + Dinner combo",
  "1-month": "Whole month of fresh meals",
};

export default function SubscriptionPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const { activeSubscription: sub, plans, subscriptionDays, isLoading, setActiveSubscription } = useSubscriptionStore();
  const { getActiveOrder } = useOrderStore();
  const activeOrder = getActiveOrder();
  const carouselRef = useRef<HTMLDivElement>(null);

  const { isVegTheme: isVegOnly, setVegTheme: setIsVegOnly } = useThemeStore();
  const activeDiet = isVegOnly ? "veg" : "non_veg";
  const [activeSchedule, setActiveSchedule] = useState("all");
  const [activeMealFilter, setActiveMealFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const displayPlans = plans.length > 0 ? plans : DEFAULT_PLANS;

  const filteredPlans = displayPlans.filter(p => {
    if (activeDiet === "veg" && p.category !== "veg") return false;
    if (activeDiet === "non_veg" && p.category !== "non_veg") return false;
    if (activeSchedule === "lunch" && p.meal_type !== "lunch" && p.meal_type !== "both") return false;
    if (activeSchedule === "dinner" && p.meal_type !== "dinner" && p.meal_type !== "both") return false;
    if (activeMealFilter !== "all") {
      if (activeMealFilter === "1-meal-trial" && !p.is_trial) return false;
      if (activeMealFilter === "1-meal" && (p.duration_days !== 1 || p.meal_type === "both" || p.is_trial)) return false;
      if (activeMealFilter === "1-day-meal" && (p.duration_days !== 1 || p.meal_type !== "both" || p.is_trial)) return false;
      if (activeMealFilter === "1-month" && p.duration_days < 26) return false;
    }
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !(p.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) { router.push("/sign-in?redirect_url=/subscription"); return; }
    setProcessingPlanId(planId);
    try {
      const res = await fetch("/api/payments/phonepe/initiate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result = await res.json();
      if (result.success && result.redirectUrl) window.location.href = result.redirectUrl;
      else { showToast(result.message || "Failed to initiate payment.", "error"); setProcessingPlanId(null); }
    } catch { showToast("Network error.", "error"); setProcessingPlanId(null); }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-[80px] right-4 z-[200] text-white rounded-xl py-3 px-5 text-[13px] font-semibold shadow-lg animate-slide-left ${toast.type === "success" ? "bg-[#1B5E30]" : "bg-[#E8392A]"}`}>
          {toast.msg}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-[#7C3AED] pt-6 pb-10 px-4 rounded-b-[32px] shadow-sm transition-all duration-500 overflow-hidden -mx-4 lg:mx-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-60 invert pointer-events-none" />

        <div className="relative z-10 mb-5 mt-2">
          <h2 className="text-white text-[26px] font-black drop-shadow-sm leading-tight tracking-tight">
            Home-style Tiffin
          </h2>
          <p className="text-white/95 text-[14px] font-bold mt-1 tracking-wide">
            Daily meals delivered fresh to your door
          </p>
        </div>

        <div className="relative z-10 flex items-center bg-white rounded-[16px] px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <input
            type="text"
            placeholder="Search tiffin plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1C1C1C] placeholder-[#93959F] font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="mr-3 text-[#93959F]">
              <X size={16} />
            </button>
          )}
          <div className="w-[1px] h-5 bg-slate-200 mx-2" />
          <Search size={20} className="text-[#7C3AED] ml-2 mr-1 shrink-0" />
        </div>

        {/* Veg/Non-Veg Toggle */}
        <div className="relative z-10 flex justify-center mt-5">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-1 flex items-center gap-1 shadow-sm border border-white/10">
            <button
              onClick={() => setIsVegOnly(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] tracking-wide transition-all ${
                isVegOnly ? "bg-white text-slate-800 shadow-md font-bold" : "text-white font-semibold"
              }`}
            >
              <div className="w-3.5 h-3.5 border-[1.5px] border-green-600 flex items-center justify-center rounded-[3px] bg-white">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              </div>
              Veg Only
            </button>
            <button
              onClick={() => setIsVegOnly(false)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] tracking-wide transition-all ${
                !isVegOnly ? "bg-white text-slate-800 shadow-md font-bold" : "text-white font-semibold"
              }`}
            >
              <div className="w-3.5 h-3.5 border-[1.5px] border-red-600 flex items-center justify-center rounded-[3px] bg-white">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
              Non-Veg
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 relative z-20 space-y-5">

        {/* Active Order Alert */}
        <ActiveOrderAlert />

        {/* Feature Banners */}
        <div ref={carouselRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar scroll-smooth">
          {[
            {
              id: "veg-plan",
              title: "Veg Plan",
              subtitle: "Pure vegetarian",
              tag: "From ₹560/week",
              href: "#",
              color: "bg-gradient-to-br from-[#1BA672] to-[#10704B]",
              img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=250&auto=format&fit=crop",
            },
            {
              id: "nonveg-plan",
              title: "Non-Veg Plan",
              subtitle: "Premium quality",
              tag: "From ₹700/week",
              href: "#",
              color: "bg-gradient-to-br from-[#E23744] to-[#B91C1C]",
              img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=250&auto=format&fit=crop",
            },
            {
              id: "trial",
              title: "Free Trial",
              subtitle: "Try before you buy",
              tag: "1 Day Free",
              href: "#",
              color: "bg-gradient-to-br from-[#9333EA] to-[#6B21A8]",
              img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=250&auto=format&fit=crop",
            },
          ].map((banner) => (
            <div
              key={banner.id}
              className={`${banner.color} rounded-[28px] p-5 flex relative overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.12)] shrink-0 w-[calc(100dvw-32px)] sm:w-[340px] h-[160px] snap-center group cursor-pointer`}
            >
              <div className="relative z-10 w-[65%] sm:w-[60%] flex flex-col justify-center">
                <h3 className="font-black text-[20px] sm:text-[22px] text-white leading-tight mb-1 drop-shadow-md">
                  {banner.title}
                </h3>
                <p className="text-[11px] sm:text-[12px] font-extrabold text-white/90 tracking-widest mb-3">
                  {banner.subtitle}
                </p>
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30 self-start">
                  <span className="text-white font-bold text-[11px]">{banner.tag}</span>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-[45%] sm:w-[150px] z-0 rounded-l-[40px] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 z-10 mix-blend-multiply" />
                <img
                  src={banner.img}
                  alt={banner.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Active Sub Alert */}
        {sub && (
          <div className="bg-white rounded-[16px] p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#E8E8E8]">
            <div className="flex justify-between items-center mb-3 gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-[13px] sm:text-[14px] text-[#1C1C1C] truncate">Active Subscription</h3>
                <p className="text-[11px] sm:text-[12px] text-[#686B78] mt-0.5">{sub.remaining_days} days remaining</p>
              </div>
              <span className="shrink-0 bg-[#1BA672]/10 text-[#1BA672] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-1 rounded-[4px] uppercase tracking-wider">
                {sub.status}
              </span>
            </div>
            <Link href="/profile" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-[8px] bg-[#FC8019]/10 text-[#FC8019] font-bold text-[12px] sm:text-[13px] no-underline">
              Manage Delivery <ChevronRight size={13} className="sm:hidden" /><ChevronRight size={14} className="hidden sm:block" />
            </Link>
          </div>
        )}

        {/* Subscribe & Save Plans Grid */}
        <TiffinPlansSection onSubscribe={handleSelectPlan} />

      </div>
    </div>
  );
}
