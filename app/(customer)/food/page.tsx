"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf, Drumstick, Search, X, ChevronRight,
  UtensilsCrossed, Sun, Moon, Truck
} from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { useThemeStore } from "@/store/themeStore";
import { useOrderStore } from "@/store/orderStore";

type Menu = {
  id: string; title: string; description: string | null;
  image_url: string | null; badge: string | null;
  category: "veg" | "non_veg"; meal_type: "lunch" | "dinner" | "both"; is_active: boolean;
};

export default function FoodPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.isAdmin)();
  const { items, addItem, updateQty, itemCount, total } = useCartStore();
  const { isVegTheme: isVegOnly, setVegTheme: setIsVegOnly } = useThemeStore();
  const { getActiveOrder } = useOrderStore();
  const activeOrder = getActiveOrder();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filtered, setFiltered] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "veg" | "non_veg" | "lunch" | "dinner">("all");
  useEffect(() => {
    const fetch_ = async () => {
      const { data } = await supabase.from("menus").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setMenus(data || []);
      setFiltered(data || []);
      setLoading(false);
    };
    fetch_();
  }, []);

  useEffect(() => {
    let r = menus;
    if (search) r = r.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    if (activeTab === "veg" || activeTab === "non_veg") r = r.filter((m) => m.category === activeTab);
    if (activeTab === "lunch" || activeTab === "dinner") r = r.filter((m) => m.meal_type === activeTab || m.meal_type === "both");
    setFiltered(r);
  }, [search, activeTab, menus]);

  const qty = (id: string) => items.find((i) => i.menu_id === id)?.quantity || 0;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-4">
      {/* Hero Section */}
      <div className="relative bg-[#FC8019] pt-6 pb-10 px-4 rounded-b-[32px] shadow-sm transition-all duration-500 overflow-hidden -mx-4 lg:mx-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-60 invert pointer-events-none" />

        <div className="relative z-10 mb-5 mt-2">
          <h2 className="text-white text-[26px] font-black drop-shadow-sm leading-tight tracking-tight">
            Explore Our Menu
          </h2>
          <p className="text-white/95 text-[14px] font-bold mt-1 tracking-wide">
            Fresh meals delivered to your doorstep
          </p>
        </div>

        <div className="relative z-10 flex items-center bg-white rounded-[16px] px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <input
            type="text"
            placeholder="Search for dishes..."
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
          <Search size={20} className="text-[#FC8019] ml-2 mr-1 shrink-0" />
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

      <div className="mt-6 relative z-20">
        {/* Weekly Menu Alert */}
        {activeOrder && (
          <div className="mb-4 bg-white border border-[#FC8019]/20 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative overflow-hidden flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <Truck size={24} className="text-[#FC8019] animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px] text-[#1C1C1C] m-0">
                Order Arriving in 15 mins
              </p>
              <p className="text-[13px] text-[#FC8019] font-bold m-0 mt-0.5 capitalize">
                {activeOrder.status.replace(/_/g, " ")} • Track Order
              </p>
            </div>
            <Link href="/orders" className="absolute inset-0 z-10" />
          </div>
        )}

      </div>

      {/* Sticky Filters Row */}
      <div className="sticky top-[56px] z-20 py-3 mb-2 -mx-4 px-4 bg-[#f8f9fa] border-b border-slate-100 flex flex-col gap-3">
        <FilterChips
          options={[
            { value: "all", label: "All" },
            { value: "veg", label: <span className="flex items-center gap-1"><Leaf size={12} /> Veg</span> },
            { value: "non_veg", label: <span className="flex items-center gap-1"><Drumstick size={12} /> Non-Veg</span> },
            { value: "lunch", label: <span className="flex items-center gap-1"><Sun size={12} /> Lunch</span> },
            { value: "dinner", label: <span className="flex items-center gap-1"><Moon size={12} /> Dinner</span> }
          ]}
          activeValue={activeTab}
          onChange={(v) => setActiveTab(v as any)}
        />
      </div>

      <div className="px-0 sm:px-4">
        {loading ? (
          <div className="text-center py-16"><div className="w-10 h-10 rounded-full border-4 border-[#FC8019]/20 border-t-[#FC8019] animate-spin mx-auto mb-4" /><p className="text-[#93959F]">Loading menu…</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[20px] border border-[#E8E8E8]">
            <div className="flex justify-center mb-3 text-[#93959F]"><UtensilsCrossed size={48} /></div>
            <h3 className="font-extrabold text-[#1A1A1A] mb-2">No dishes found</h3>
            <p className="text-[#9CA3AF]">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((menu) => (
              <FoodCard
                key={menu.id}
                menu={menu}
                quantity={qty(menu.id)}
                price={120}
                onAdd={() => addItem({ menu_id: menu.id, title: menu.title, price: 120, category: menu.category, image_url: menu.image_url, badge: menu.badge })}
                onUpdateQty={(val) => updateQty(menu.id, val)}
                layout="horizontal"
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {itemCount() > 0 && (
        <div className="fixed bottom-[72px] left-0 right-0 px-4 z-[100] pointer-events-none transition-transform translate-y-0">
          <div className="max-w-[960px] mx-auto pointer-events-auto">
            <button onClick={() => router.push("/food/checkout")} className="w-full flex items-center justify-between bg-[#1BA672] text-white rounded-2xl px-4 sm:px-5 py-3 sm:py-4 cursor-pointer shadow-[0_8px_24px_rgba(27,166,114,0.4)] border-none hover:bg-[#14835A] transition-colors">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-black text-[13px] sm:text-[15px] text-left m-0 tracking-wide uppercase truncate">
                  {itemCount()} item{itemCount() > 1 ? "s" : ""} added
                </p>
                <p className="text-[11px] sm:text-[12px] text-white/90 font-bold m-0 text-left truncate">
                  ₹{total()} • Extra charges may apply
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 font-black text-[13px] sm:text-[15px] uppercase tracking-wide shrink-0">
                View Cart <ChevronRight size={18} className="sm:mt-[-1px]" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
