"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { BottomNav } from "@/components/BottomNav";
import { NotificationBell } from "@/components/NotificationBell";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Leaf, Drumstick, Search, X, ChevronRight } from "lucide-react";
import Link from "next/link";

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
    <div style={{ minHeight: "100vh", background: "var(--emt-cream)" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,184,150,0.2)", padding: "0 20px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: "20px", color: "#1A1A1A" }}>EazyMy<span style={{ color: "var(--emt-red)" }}>Tiffin</span></span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isAdmin && <Link href="/admin" style={{ background: "var(--emt-red)", color: "white", fontSize: "10px", fontWeight: 800, letterSpacing: "1px", padding: "6px 14px", borderRadius: "999px", textDecoration: "none", textTransform: "uppercase" }}>Admin</Link>}
          <NotificationBell />
          <Link href="/profile"><div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, var(--emt-red), #C0392B)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}>{user?.full_name?.charAt(0)?.toUpperCase() || "U"}</div></Link>
        </div>
      </header>

      <main id="main" style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 96px" }}>
        <div className="animate-fade-up" style={{ marginBottom: "20px" }}>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(22px, 5vw, 28px)", color: "#1A1A1A", letterSpacing: "-0.02em" }}>🍽️ Food Delivery</h1>
          <p style={{ color: "#6B7280", fontSize: "13px", marginTop: "4px" }}>Order fresh meals — Lunch 12–2 PM · Dinner 7–9 PM</p>
        </div>

        {/* Search + Filters */}
        <div className="animate-fade-up stagger-child" style={{ marginBottom: "20px" }}>
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input type="text" placeholder="Search dishes…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "12px 14px 12px 40px", border: "1px solid rgba(212,184,150,0.3)", borderRadius: "12px", background: "white", fontSize: "14px", color: "#1A1A1A", outline: "none", boxSizing: "border-box" }} />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={16} /></button>}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {([["all","All"],["veg","🥗 Veg"],["non_veg","🍗 Non-Veg"]] as const).map(([v,l]) => (
              <button key={v} onClick={() => setCatFilter(v)} style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, border: "1px solid", cursor: "pointer", background: catFilter === v ? "#1A1A1A" : "white", color: catFilter === v ? "white" : "#4A3A2A", borderColor: catFilter === v ? "#1A1A1A" : "rgba(212,184,150,0.3)", transition: "all 200ms" }}>{l}</button>
            ))}
            {([["lunch","🌤️ Lunch"],["dinner","🌙 Dinner"]] as const).map(([v,l]) => (
              <button key={v} onClick={() => setMealFilter(mealFilter === v ? "all" : v)} style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, border: "1px solid", cursor: "pointer", background: mealFilter === v ? "var(--emt-red)" : "white", color: mealFilter === v ? "white" : "#4A3A2A", borderColor: mealFilter === v ? "var(--emt-red)" : "rgba(212,184,150,0.3)", transition: "all 200ms" }}>{l}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}><div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "var(--emt-red)", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} /><p style={{ color: "#9CA3AF" }}>Loading menu…</p></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "20px", border: "1px solid rgba(212,184,150,0.15)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🍽️</div>
            <h3 style={{ fontWeight: 800, color: "#1A1A1A", marginBottom: "8px" }}>No dishes found</h3>
            <p style={{ color: "#9CA3AF" }}>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {filtered.map((menu) => {
              const q = qty(menu.id);
              return (
                <div key={menu.id} className="card-lift animate-fade-up stagger-child" style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: `1px solid ${q > 0 ? "rgba(232,57,42,0.3)" : "rgba(212,184,150,0.15)"}`, boxShadow: q > 0 ? "0 8px 24px rgba(232,57,42,0.12)" : "var(--shadow-sm)", transition: "border-color 200ms" }}>
                  {menu.image_url ? (
                    <div style={{ position: "relative" }}>
                      <img src={menu.image_url} alt={menu.title} style={{ width: "100%", height: "130px", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: "10px", left: "10px", width: "22px", height: "22px", borderRadius: "5px", background: menu.category === "veg" ? "#1B5E30" : "#E8392A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {menu.category === "veg" ? <Leaf size={12} color="white" /> : <Drumstick size={12} color="white" />}
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: "100px", background: menu.category === "veg" ? "rgba(27,94,48,0.06)" : "rgba(232,57,42,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", position: "relative" }}>
                      {menu.category === "veg" ? "🥗" : "🍗"}
                      <div style={{ position: "absolute", top: "10px", left: "10px", width: "22px", height: "22px", borderRadius: "5px", background: menu.category === "veg" ? "#1B5E30" : "#E8392A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {menu.category === "veg" ? <Leaf size={12} color="white" /> : <Drumstick size={12} color="white" />}
                      </div>
                    </div>
                  )}
                  <div style={{ padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <h3 style={{ fontWeight: 800, fontSize: "13px", color: "#1A1A1A", margin: 0, lineHeight: 1.3, flex: 1 }}>{menu.title}</h3>
                      {menu.badge && <span style={{ fontSize: "9px", fontWeight: 700, background: "rgba(245,166,35,0.15)", color: "#D97706", borderRadius: "999px", padding: "3px 7px", flexShrink: 0, marginLeft: "6px" }}>{menu.badge}</span>}
                    </div>
                    {menu.description && <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 10px", lineHeight: 1.4 }}>{menu.description}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600 }}>
                        {menu.meal_type === "lunch" ? "🌤️ Lunch" : menu.meal_type === "dinner" ? "🌙 Dinner" : "🌤️🌙"}
                      </span>
                      {q === 0 ? (
                        <button onClick={() => addItem({ menu_id: menu.id, title: menu.title, price: 120, category: menu.category, image_url: menu.image_url, badge: menu.badge })} style={{ display: "flex", alignItems: "center", gap: "5px", background: "var(--emt-red)", color: "white", border: "none", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                          <Plus size={14} /> Add
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                          <button onClick={() => updateQty(menu.id, q - 1)} style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(232,57,42,0.1)", color: "var(--emt-red)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                          <span style={{ fontWeight: 800, fontSize: "14px", minWidth: "22px", textAlign: "center" }}>{q}</span>
                          <button onClick={() => addItem({ menu_id: menu.id, title: menu.title, price: 120, category: menu.category, image_url: menu.image_url, badge: menu.badge })} style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--emt-red)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart */}
      {itemCount() > 0 && (
        <div style={{ position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)", zIndex: 100, animation: "fadeUp 0.3s ease" }}>
          <button onClick={() => router.push("/food/checkout")} className="btn-glare" style={{ display: "flex", alignItems: "center", gap: "12px", background: "linear-gradient(135deg, #E8392A, #B91C1C)", color: "white", border: "none", borderRadius: "20px", padding: "14px 24px", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "0 8px 32px rgba(232,57,42,0.4)", whiteSpace: "nowrap" }}>
            <ShoppingCart size={18} />
            {itemCount()} item{itemCount() > 1 ? "s" : ""} · ₹{total()}
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
