"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore, selectCartItems, selectCartItemCount, selectCartTotal } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import {
  Leaf, Drumstick, ChevronRight,
  UtensilsCrossed, Sun, Moon
} from "lucide-react";
import { FoodCard } from "@/components/ui/FoodCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { PageHero } from "@/components/ui/PageHero";
import { ActiveOrderAlert } from "@/components/ui/ActiveOrderAlert";
import { useThemeStore } from "@/store/themeStore";
import { useOrderStore, selectActiveOrder } from "@/store/orderStore";

type Menu = {
  id: string; title: string; description: string | null;
  image_url: string | null; badge: string | null;
  category: "veg" | "non_veg"; meal_type: "lunch" | "dinner" | "both"; is_active: boolean;
};

export default function FoodPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.user?.role === "admin");
  const items = useCartStore(selectCartItems);
  const itemCount = useCartStore(selectCartItemCount);
  const total = useCartStore(selectCartTotal);
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const { isVegTheme: isVegOnly, setVegTheme: setIsVegOnly } = useThemeStore();
  const activeOrder = useOrderStore(selectActiveOrder);
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

  const qty = useCallback((id: string) => items.find((i) => i.menu_id === id)?.quantity || 0, [items]);
  const handleTabChange = useCallback((v: any) => { setActiveTab(v); if (v === "veg") setIsVegOnly(true); else if (v === "non_veg") setIsVegOnly(false); }, [setIsVegOnly]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-4">
      <PageHero
        themeColor="#FC8019"
        title={
          <>
            <span className="block text-white" style={{ WebkitTextStroke: "1px #222" }}>Eazy</span>
            Food
          </>
        }
        subtitle="Order delicious meals instantly"
        heroImages={[
          { src: "/eazymytiffin-veg-menu-preview.png", bg: "#FACC15" },
          { src: "/eazymytiffin-non-veg-menu-preview.png", bg: "#FB923C" },
          { src: "/eazymytiffin-mix-menu-preview.png", bg: "#F87171" },
        ]}
        search={search}
        setSearch={setSearch}
      />

      {activeOrder && (
        <div className="mt-6 relative z-20">
          <ActiveOrderAlert />
        </div>
      )}

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
          onChange={handleTabChange}
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
                onAdd={() => addItem({ menu_id: menu.id, title: menu.title, price: 120, category: menu.category, image_url: menu.image_url, badge: menu.badge, source: "food" })}
                onUpdateQty={(val) => updateQty(menu.id, val)}
                layout="horizontal"
              />
            ))}
          </div>
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-[84px] left-0 right-0 px-4 z-[100] pointer-events-none transition-transform translate-y-0">
          <div className="max-w-[960px] mx-auto pointer-events-auto">
            <button onClick={() => router.push("/food/checkout")} className="w-full flex items-center justify-between bg-[#1BA672] text-white rounded-2xl px-4 sm:px-5 py-3 sm:py-4 cursor-pointer shadow-[0_8px_24px_rgba(27,166,114,0.4)] border-none hover:bg-[#14835A] transition-colors">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-black text-[13px] sm:text-[15px] text-left m-0 tracking-wide truncate">
                  {itemCount} item{itemCount > 1 ? "s" : ""} added
                </p>
                <p className="text-[11px] sm:text-[12px] text-white/90 font-bold m-0 text-left truncate">
                  ₹{total} • No extra hidden charges
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 font-black text-[13px] sm:text-[15px] tracking-wide shrink-0">
                View Cart <ChevronRight size={18} className="sm:mt-[-1px]" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
