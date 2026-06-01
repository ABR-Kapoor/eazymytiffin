"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useOrderStore } from "@/store/orderStore";
import { useNotificationStore } from "@/store/notificationStore";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "@/components/NotificationBell";
import Link from "next/link";
import {
  Pause, Play, ChevronRight, Truck,
  Clock, Leaf, ArrowRight, MapPin, Drumstick, PartyPopper, Bike, Sun, Moon, Utensils, MessageCircle, Calendar, ShoppingBag, UtensilsCrossed
} from "lucide-react";

interface TodayMenu {
  lunch: { title: string; badge: string | null; image_url: string | null } | null;
  dinner: { title: string; badge: string | null; image_url: string | null } | null;
}

export default function HomePage() {
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.isAdmin)();
  const isLoading = useUserStore((s) => s.isLoading);
  const sub = useSubscriptionStore((s) => s.activeSubscription);
  const isActive = useSubscriptionStore((s) => s.isActive)();
  const isPaused = useSubscriptionStore((s) => s.isPaused)();
  const getRemainingProgress = useSubscriptionStore((s) => s.getRemainingProgress);
  const { orders, getPendingOrders, getActiveOrder } = useOrderStore();
  const [todayMenu, setTodayMenu] = useState<TodayMenu>({ lunch: null, dinner: null });
  const [managingSub, setManagingSub] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const activeOrder = getActiveOrder();
  const pendingCount = getPendingOrders().length;
  const progress = getRemainingProgress();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    const fetchMenu = async () => {
      const weekday = new Date().getDay();
      const { data } = await supabase
        .from("weekly_menu_cycles")
        .select("weekday, menu:menus(title, description, badge, image_url, meal_type, category, is_active)")
        .eq("weekday", weekday);
      if (data) {
        const menuData: any[] = data;
        const lunch = menuData.find((m) => m.menu?.meal_type === "lunch" && m.menu?.is_active)?.menu || null;
        const dinner = menuData.find((m) => m.menu?.meal_type === "dinner" && m.menu?.is_active)?.menu || null;
        setTodayMenu({ lunch, dinner });
      }
    };
    fetchMenu();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePauseResume = async (action: "pause" | "resume") => {
    if (!sub) return;
    setManagingSub(true);
    try {
      const res = await fetch(`/api/subscriptions/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: sub.id }),
      });
      const result = await res.json();
      if (result.success) showToast(`Subscription ${action}d successfully!`);
      else showToast(result.error || "Something went wrong.", "error");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setManagingSub(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--emt-cream)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "var(--emt-red)", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF", fontWeight: 500, fontSize: "14px" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "72px", right: "16px", zIndex: 200,
          background: toast.type === "success" ? "#1B5E30" : "#E8392A",
          color: "white", borderRadius: "12px", padding: "12px 20px",
          fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "slideLeft 0.3s ease",
        }}>
          {toast.msg}
        </div>
      )}
        {/* Greeting */}
        <div className="animate-fade-up mb-8">
          <p className="text-[#9CA3AF] text-[13px] font-semibold mb-1">
            {greeting}
          </p>
          <h1 className="text-[clamp(24px,5vw,32px)] font-bold text-[#1A1A1A] tracking-tight leading-[1.15] m-0">
            {user?.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-[#6B7280] text-[13px] mt-1.5 flex items-center gap-1 font-medium">
            <MapPin size={14} className="text-[#E8392A]" /> {user?.city || "Bilaspur"}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            {/* Active Subscription Card */}
            {sub ? (
          <div className="animate-fade-up stagger-child card-lift relative overflow-hidden rounded-[32px] p-8 mb-8 text-white shadow-lg" style={{
            background: isPaused
              ? "linear-gradient(135deg, rgba(180,83,9,0.96), rgba(217,119,6,0.86))"
              : "linear-gradient(135deg, rgba(232,57,42,0.96), rgba(185,28,28,0.86))",
            border: isPaused ? "1px solid rgba(245,158,11,0.28)" : "1px solid rgba(248,113,113,0.25)",
            boxShadow: isPaused ? "0 12px 40px rgba(217,119,6,0.22)" : "0 12px 40px rgba(232,57,42,0.22)",
          }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/65 to-transparent opacity-50 pointer-events-none rounded-bl-full" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 mb-4 border border-white/20">
                <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-[#FCD34D]" : "bg-[#86EFAC] shadow-[0_0_8px_#86EFAC]"}`} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">
                  {isPaused ? "Paused" : "Active Subscription"}
                </span>
              </div>
              <h2 className="font-black text-2xl mb-2 flex flex-wrap items-center gap-2">
                {sub.category === "veg" ? (
                  <span className="inline-flex items-center gap-1 bg-white/20 rounded-lg px-2 py-0.5 text-xs uppercase tracking-wide border border-white/10 text-white"><Leaf size={14} className="text-[#4ade80]" /> Pure Veg</span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-white/20 rounded-lg px-2 py-0.5 text-xs uppercase tracking-wide border border-white/10 text-white"><Drumstick size={14} className="text-[#fca5a5]" /> Non-Veg</span>
                )}
                <span className="opacity-80 text-[18px]">— {sub.meal_type === "both" ? "Lunch & Dinner" : sub.meal_type === "lunch" ? "Lunch" : "Dinner"}</span>
              </h2>
              <p className="opacity-90 text-[14px] font-medium mb-6">
                <strong className="text-3xl font-bold">{sub.remaining_days}</strong> meals remaining of {sub.total_days}
              </p>
              <div className="h-2 rounded-full bg-white/20 mb-6 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex flex-wrap gap-3">
                {isActive ? (
                  <button disabled={managingSub} onClick={() => handlePauseResume("pause")} className="btn-glare flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-60">
                    <Pause size={14} /> {managingSub ? "Processing…" : "Pause"}
                  </button>
                ) : (
                  <button disabled={managingSub} onClick={() => handlePauseResume("resume")} className="btn-glare flex items-center gap-1.5 bg-white text-[#E8392A] border-none rounded-xl px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-60 hover:scale-105 shadow-md">
                    <Play size={14} /> {managingSub ? "Processing…" : "Resume"}
                  </button>
                )}
                <Link href="/subscription" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-5 py-2.5 text-xs font-bold no-underline transition-all hover:scale-105">
                  <Calendar size={14} /> Manage
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up stagger-child bg-white rounded-[32px] p-10 mb-8 text-center border border-[rgba(212,184,150,0.3)] shadow-sm relative overflow-hidden group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8392A]/5 to-transparent pointer-events-none" />
            <div className="mb-4 text-[#E8392A]/60 flex justify-center group-hover/card:scale-110 transition-transform duration-500">
              <div className="w-20 h-20 bg-[#E8392A]/10 rounded-full flex items-center justify-center">
                <UtensilsCrossed size={40} className="text-[#E8392A]" />
              </div>
            </div>
            <h2 className="font-bold text-2xl text-[#1A1A1A] mb-2 tracking-tight relative z-10">No Active Tiffin Plan</h2>
            <p className="text-[#6B7280] text-[15px] font-medium mb-8 max-w-xs mx-auto relative z-10">
              {!user?.has_used_trial ? "Try your first home-style tiffin meal completely free!" : "Subscribe today for fresh, home-style meals delivered daily."}
            </p>
            <Link href="/subscription" className="btn-glare inline-flex items-center gap-1.5 bg-[#E8392A] hover:bg-[#B91C1C] text-white rounded-xl px-5 py-2.5 font-bold text-[13px] no-underline shadow-md shadow-[#E8392A]/30 hover:shadow-[#E8392A]/50 hover:-translate-y-0.5 transition-all relative z-10">
              {!user?.has_used_trial ? <><PartyPopper size={16} /> Try Free Trial</> : "Browse Plans"} <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Active Delivery Alert */}
        {activeOrder && (
          <div className="animate-fade-up stagger-child card-lift rounded-[24px] p-5 mb-8 text-white relative overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #1B5E30, #2D7A3A)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none blur-sm" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Truck size={24} className="text-white drop-shadow-md animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-[15px] m-0 flex items-center gap-1.5"><Bike size={16} className="text-[#86EFAC]" /> Order On the Way!</p>
                <p className="opacity-90 text-[12px] font-medium mt-0.5 m-0">Status: <span className="capitalize font-bold text-[#86EFAC]">{activeOrder.status.replace(/_/g, " ")}</span></p>
              </div>
              <Link href="/orders" className="bg-white text-[#1B5E30] rounded-xl px-4 py-2 text-[13px] font-extrabold no-underline shadow-md hover:bg-[#F0FDF4] hover:scale-105 transition-all flex items-center gap-1.5 border border-transparent">
                Track <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="animate-fade-up stagger-child grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Days Left", value: sub?.remaining_days ?? "—", icon: <Calendar size={18} />, color: "#E8392A", bg: "rgba(232,57,42,0.08)" },
            { label: "Total Orders", value: orders.length, icon: <ShoppingBag size={18} />, color: "#1B5E30", bg: "rgba(27,94,48,0.08)" },
            { label: "In Progress", value: pendingCount, icon: <Clock size={18} />, color: "#F5A623", bg: "rgba(245,166,35,0.08)" },
          ].map((s) => (
            <div key={s.label} className="card-lift rounded-2xl p-4 text-center shadow-sm relative overflow-hidden group" style={{ background: `linear-gradient(135deg, ${s.color}12, ${s.color}03)`, border: `1px solid ${s.color}25` }}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mx-auto mb-3" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <p className="text-xl font-bold text-[#1A1A1A] leading-none m-0">{s.value}</p>
              <p className="text-[11px] text-[#9CA3AF] font-bold mt-1.5 m-0 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Menu */}
        {(todayMenu.lunch || todayMenu.dinner) && (
          <div className="animate-fade-up stagger-child mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-[18px] text-[#1A1A1A] tracking-tight flex items-center gap-1.5 m-0"><Utensils size={18} className="text-[#1A1A1A]" /> Today's Menu</h2>
              <Link href="/food" className="text-[#E8392A] text-[13px] font-bold no-underline flex items-center gap-1 hover:text-[#B91C1C] transition-colors">Order Food <ArrowRight size={13} /></Link>
            </div>
            <div className={`grid gap-4 ${todayMenu.lunch && todayMenu.dinner ? "grid-cols-2" : "grid-cols-1"}`}>
              {todayMenu.lunch && (
                <div className="rounded-2xl overflow-hidden shadow-sm relative group" style={{ background: `linear-gradient(135deg, #F5A62312, #F5A62303)`, border: `1px solid #F5A62325` }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500 z-10" />
                  {todayMenu.lunch.image_url ? (
                    <div className="overflow-hidden h-[100px]">
                      <img src={todayMenu.lunch.image_url} alt={todayMenu.lunch.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-[90px] bg-[#F5A623]/10 flex items-center justify-center group-hover:bg-[#F5A623]/20 transition-colors"><UtensilsCrossed size={36} className="text-[#F5A623]" /></div>
                  )}
                  <div className="p-3.5">
                    <span className="text-[10px] font-extrabold text-[#D97706] uppercase tracking-widest flex items-center gap-1 mb-1"><Sun size={12} /> Lunch · 12–2 PM</span>
                    <p className="font-extrabold text-[13px] text-[#1A1A1A] m-0 line-clamp-2 leading-tight">{todayMenu.lunch.title}</p>
                  </div>
                </div>
              )}
              {todayMenu.dinner && (
                <div className="rounded-2xl overflow-hidden shadow-sm relative group" style={{ background: `linear-gradient(135deg, #E8392A12, #E8392A03)`, border: `1px solid #E8392A25` }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500 z-10" />
                  {todayMenu.dinner.image_url ? (
                    <div className="overflow-hidden h-[100px]">
                      <img src={todayMenu.dinner.image_url} alt={todayMenu.dinner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-[90px] bg-[#E8392A]/10 flex items-center justify-center group-hover:bg-[#E8392A]/20 transition-colors"><UtensilsCrossed size={36} className="text-[#E8392A]" /></div>
                  )}
                  <div className="p-3.5">
                    <span className="text-[10px] font-extrabold text-[#E8392A] uppercase tracking-widest flex items-center gap-1 mb-1"><Moon size={12} /> Dinner · 7–9 PM</span>
                    <p className="font-extrabold text-[13px] text-[#1A1A1A] m-0 line-clamp-2 leading-tight">{todayMenu.dinner.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Quick Actions */}
      <div className="md:w-[320px] shrink-0 animate-fade-up stagger-child">
        <div className="sticky top-[84px]">
          <h2 className="font-bold text-[18px] text-[#1A1A1A] mb-4 tracking-tight">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            {[
              { href: "/food", icon: <UtensilsCrossed size={20} />, label: "Order Food", sub: "Browse today's menu", color: "#E8392A", bg: "rgba(232,57,42,0.08)", border: "rgba(232,57,42,0.2)" },
              { href: "/orders", icon: <Truck size={20} />, label: "Track Order", sub: pendingCount > 0 ? `${pendingCount} active` : "View history", color: "#1B5E30", bg: "rgba(27,94,48,0.08)", border: "rgba(27,94,48,0.2)" },
              { href: "/subscription", icon: <Calendar size={20} />, label: "Tiffin Plans", sub: "Manage subscription", color: "#F5A623", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.2)" },
            ].map((action) => (
              <a key={action.label} href={action.href} className="card-lift flex items-center p-4 rounded-2xl no-underline shadow-sm relative overflow-hidden group" style={{ background: `linear-gradient(135deg, ${action.color}12, ${action.color}03)`, border: `1px solid ${action.color}25` }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 mr-4 relative z-10" style={{ background: action.bg, color: action.color }}>{action.icon}</div>
                <div className="flex-1 relative z-10">
                  <p className="font-bold text-[15px] text-[#1A1A1A] m-0 leading-tight">{action.label}</p>
                  <p className="text-[12px] text-[#9CA3AF] font-bold mt-0.5 m-0">{action.sub}</p>
                </div>
                <ChevronRight size={18} className="text-[#9CA3AF] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all relative z-10" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
