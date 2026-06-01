"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Leaf, Drumstick, Search, X, ChevronRight, Utensils, UtensilsCrossed, Sun, Moon } from "lucide-react";

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
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filtered, setFiltered] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | "veg" | "non_veg">("all");
  const [mealFilter, setMealFilter] = useState<"all" | "lunch" | "dinner">("all");

  useEffect(() => {
    const fetch_ = async () => {
      const { data } = await supabase.from("menus").select("*").eq("is_active", true).order("created_at", { ascending: false });
      console.log("[debug] fetched menus:", data);
      setMenus(data || []);
      setFiltered(data || []);
      setLoading(false);
    };
    fetch_();
  }, []);

  useEffect(() => {
    let r = menus;
    if (search) r = r.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== "all") r = r.filter((m) => m.category === catFilter);
    if (mealFilter !== "all") r = r.filter((m) => m.meal_type === mealFilter || m.meal_type === "both");
    setFiltered(r);
  }, [search, catFilter, mealFilter, menus]);

  const qty = (id: string) => items.find((i) => i.menu_id === id)?.quantity || 0;

  return (
    <>
      {/* Toast would go here if needed */}
        <div className="animate-fade-up mb-5">
          <h1 className="font-black text-[clamp(18px,4vw,22px)] text-[#1A1A1A] tracking-tight flex items-center gap-2"><Utensils size={28} className="text-[#1A1A1A]" /> Food Delivery</h1>
          <p className="text-[#6B7280] text-[13px] mt-1">Order fresh meals — Lunch 12–2 PM · Dinner 7–9 PM</p>
        </div>

        {/* Search + Filters */}
        <div className="animate-fade-up stagger-child mb-5">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input type="text" placeholder="Search dishes…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-3 pr-3.5 pl-10 border border-[#D4B896]/30 rounded-xl bg-white text-[14px] text-[#1A1A1A] outline-none focus:ring-2 focus:ring-emt-red/20 focus:border-emt-red transition-all" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#9CA3AF] hover:text-[#4A3A2A]"><X size={16} /></button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {([["all","All"],["veg",<span className="flex items-center gap-1"><Leaf size={12} /> Veg</span>],["non_veg",<span className="flex items-center gap-1"><Drumstick size={12} /> Non-Veg</span>]] as const).map(([v,l]) => (
              <button key={v as string} onClick={() => setCatFilter(v as any)} className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border cursor-pointer transition-colors ${catFilter === v ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4A3A2A] border-[#D4B896]/30 hover:bg-gray-50"}`}>{l}</button>
            ))}
            {([["lunch",<span className="flex items-center gap-1"><Sun size={12} /> Lunch</span>],["dinner",<span className="flex items-center gap-1"><Moon size={12} /> Dinner</span>]] as const).map(([v,l]) => (
              <button key={v as string} onClick={() => setMealFilter(mealFilter === v ? "all" : (v as any))} className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border cursor-pointer transition-colors ${mealFilter === v ? "bg-[#E8392A]/10 text-[#E8392A] border-[#E8392A]/20" : "bg-white text-[#4A3A2A] border-[#D4B896]/30 hover:bg-gray-50"}`}>{l}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="w-10 h-10 rounded-full border-4 border-emt-red/20 border-t-emt-red animate-spin mx-auto mb-4" /><p className="text-[#9CA3AF]">Loading menu…</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[20px] border border-[#D4B896]/15">
            <div className="flex justify-center mb-3 text-emt-red/60"><UtensilsCrossed size={48} /></div>
            <h3 className="font-extrabold text-[#1A1A1A] mb-2">No dishes found</h3>
            <p className="text-[#9CA3AF]">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {filtered.map((menu) => {
              const q = qty(menu.id);
              return (
                <div key={menu.id} className={`card-lift group animate-fade-up stagger-child bg-white rounded-[20px] overflow-hidden transition-all ${q > 0 ? "border border-emt-red/30 shadow-[0_8px_24px_rgba(232,57,42,0.12)]" : "border border-[#D4B896]/15 shadow-sm"}`}>
                  {menu.image_url ? (
                    <div className="relative overflow-hidden">
                      <img src={menu.image_url} alt={menu.title} className="w-full h-[130px] object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className={`absolute top-2.5 left-2.5 w-5.5 h-5.5 rounded bg-white flex items-center justify-center shadow-sm ${menu.category === "veg" ? "text-[#1B5E30]" : "text-[#E8392A]"}`}>
                        {menu.category === "veg" ? <Leaf size={14} /> : <Drumstick size={14} />}
                      </div>
                    </div>
                  ) : (
                    <div className={`h-[130px] flex items-center justify-center relative ${menu.category === "veg" ? "bg-[#1B5E30]/5 text-[#1B5E30]" : "bg-[#E8392A]/5 text-[#E8392A]"}`}>
                      {menu.category === "veg" ? <Leaf size={44} /> : <Drumstick size={44} />}
                      <div className={`absolute top-2.5 left-2.5 w-5.5 h-5.5 rounded bg-white flex items-center justify-center shadow-sm ${menu.category === "veg" ? "text-[#1B5E30]" : "text-[#E8392A]"}`}>
                        {menu.category === "veg" ? <Leaf size={14} /> : <Drumstick size={14} />}
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-extrabold text-[13px] text-[#1A1A1A] m-0 leading-tight flex-1">{menu.title}</h3>
                      {menu.badge && <span className="text-[9px] font-bold bg-[#F5A623]/15 text-[#D97706] rounded-full px-2 py-0.5 shrink-0">{menu.badge}</span>}
                    </div>
                    {menu.description && <p className="text-[11px] text-[#9CA3AF] m-0 mb-3 leading-snug">{menu.description}</p>}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-[#9CA3AF] font-semibold flex items-center gap-1">
                        {menu.meal_type === "lunch" ? <><Sun size={12} /> Lunch</> : menu.meal_type === "dinner" ? <><Moon size={12} /> Dinner</> : <><Sun size={12}/><Moon size={12}/></>}
                      </span>
                      {q === 0 ? (
                        <button onClick={() => addItem({ menu_id: menu.id, title: menu.title, price: 120, category: menu.category, image_url: menu.image_url, badge: menu.badge })} className="btn-glare flex items-center gap-1.5 bg-emt-red text-white border-none rounded-[10px] px-3.5 py-2 text-[12px] font-bold cursor-pointer transition-colors hover:bg-[#B91C1C]">
                          <Plus size={14} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => updateQty(menu.id, q - 1)} className="w-7 h-7 rounded-lg bg-emt-red/10 text-emt-red border-none cursor-pointer flex items-center justify-center hover:bg-emt-red/20 transition-colors"><Minus size={14} /></button>
                          <span className="font-extrabold text-[14px] min-w-[22px] text-center">{q}</span>
                          <button onClick={() => addItem({ menu_id: menu.id, title: menu.title, price: 120, category: menu.category, image_url: menu.image_url, badge: menu.badge })} className="w-7 h-7 rounded-lg bg-emt-red text-white border-none cursor-pointer flex items-center justify-center hover:bg-[#B91C1C] transition-colors"><Plus size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Floating Cart */}
      {itemCount() > 0 && (
        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-[100] animate-fade-up">
          <button onClick={() => router.push("/food/checkout")} className="btn-glare flex items-center gap-3 bg-gradient-to-br from-[#E8392A] to-[#B91C1C] text-white border-none rounded-[20px] px-6 py-3.5 font-extrabold text-[14px] cursor-pointer shadow-[0_8px_32px_rgba(232,57,42,0.4)] whitespace-nowrap hover:scale-105 transition-transform">
            <ShoppingCart size={18} />
            {itemCount()} item{itemCount() > 1 ? "s" : ""} · ₹{total()}
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
