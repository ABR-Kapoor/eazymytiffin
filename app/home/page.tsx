"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useOrderStore } from "@/store/orderStore";
import { useNotificationStore } from "@/store/notificationStore";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import {
  Pause, Play, ChevronRight, Truck,
  MessageCircle, Calendar, ShoppingBag, UtensilsCrossed,
  Clock, Leaf
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
    <div style={{ minHeight: "100vh", background: "var(--emt-cream)" }}>
      {/* Top navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,184,150,0.2)",
        padding: "0 20px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/home" style={{ textDecoration: "none" }}>
          <span style={{ fontWeight: 900, fontSize: "20px", color: "#1A1A1A", letterSpacing: "-0.02em" }}>
            EazyMy<span style={{ color: "var(--emt-red)" }}>Tiffin</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isAdmin && (
            <Link href="/admin" style={{
              background: "var(--emt-red)", color: "white",
              fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "1px", padding: "6px 14px", borderRadius: "999px",
              textDecoration: "none",
            }}>
              Admin
            </Link>
          )}
          <NotificationBell />
          <Link href="/profile">
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--emt-red), #C0392B)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: "13px", cursor: "pointer",
            }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </Link>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "72px", right: "16px", zIndex: 200,
          background: toast.type === "success" ? "#1B5E30" : "#E8392A",
          color: "white", borderRadius: "12px", padding: "12px 20px",
          fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "slideLeft 0.3s ease",
        }}>
          {toast.type === "success" ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}

      <main id="main" style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 96px" }}>
        {/* Greeting */}
        <div className="animate-fade-up" style={{ marginBottom: "28px" }}>
          <p style={{ color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>
            {greeting} 👋
          </p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, color: "#1A1A1A", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            {user?.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p style={{ color: "#6B7280", fontSize: "13px", marginTop: "4px" }}>📍 {user?.city || "Bilaspur"}</p>
        </div>

        {/* Active Subscription Card */}
        {sub ? (
          <div className="animate-fade-up stagger-child" style={{
            borderRadius: "24px",
            background: isPaused
              ? "linear-gradient(135deg, #B45309, #D97706)"
              : "linear-gradient(135deg, #E8392A, #B91C1C)",
            padding: "24px", marginBottom: "24px", color: "white", position: "relative", overflow: "hidden",
            boxShadow: "0 12px 40px rgba(232,57,42,0.3)",
          }}>
            <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.18)", borderRadius: "999px", padding: "4px 12px", marginBottom: "12px", backdropFilter: "blur(8px)" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isPaused ? "#FCD34D" : "#86EFAC", boxShadow: isPaused ? "none" : "0 0 8px #86EFAC" }} />
                <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {isPaused ? "Paused" : "Active Subscription"}
                </span>
              </div>
              <h2 style={{ fontWeight: 900, fontSize: "20px", marginBottom: "4px" }}>
                {sub.category === "veg" ? "🥗 Pure Veg" : "🍗 Non-Veg"} — {sub.meal_type === "both" ? "Lunch & Dinner" : sub.meal_type === "lunch" ? "Lunch" : "Dinner"}
              </h2>
              <p style={{ opacity: 0.85, fontSize: "13px", marginBottom: "16px" }}>
                <strong style={{ fontSize: "22px", fontWeight: 900 }}>{sub.remaining_days}</strong> meal days remaining of {sub.total_days}
              </p>
              <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.2)", marginBottom: "20px", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: "999px", background: "rgba(255,255,255,0.9)", width: `${progress}%`, transition: "width 1s ease" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {isActive ? (
                  <button disabled={managingSub} onClick={() => handlePauseResume("pause")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "12px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", opacity: managingSub ? 0.6 : 1 }}>
                    <Pause size={14} /> {managingSub ? "Processing…" : "Pause"}
                  </button>
                ) : (
                  <button disabled={managingSub} onClick={() => handlePauseResume("resume")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.9)", color: "#E8392A", border: "none", borderRadius: "12px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", opacity: managingSub ? 0.6 : 1 }}>
                    <Play size={14} /> {managingSub ? "Processing…" : "Resume"}
                  </button>
                )}
                <Link href="/subscription" style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
                  <Calendar size={14} /> Manage
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up stagger-child" style={{ borderRadius: "24px", background: "white", border: "2px dashed rgba(232,57,42,0.3)", padding: "28px", marginBottom: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🍱</div>
            <h2 style={{ fontWeight: 800, fontSize: "20px", color: "#1A1A1A", marginBottom: "8px" }}>No Active Tiffin Plan</h2>
            <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "20px" }}>
              {!user?.has_used_trial ? "Try your first tiffin meal for free! 🎉" : "Subscribe for fresh home-style meals daily"}
            </p>
            <Link href="/subscription" className="btn-glare" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--emt-red)", color: "white", borderRadius: "14px", padding: "12px 28px", fontWeight: 800, fontSize: "14px", textDecoration: "none", boxShadow: "0 8px 24px rgba(232,57,42,0.3)" }}>
              {!user?.has_used_trial ? "🎉 Try Free Trial" : "Browse Plans"} <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* Active Delivery Alert */}
        {activeOrder && (
          <div className="animate-fade-up stagger-child" style={{ background: "linear-gradient(135deg, #1B5E30, #2D7A3A)", borderRadius: "20px", padding: "18px", marginBottom: "24px", color: "white", boxShadow: "0 8px 32px rgba(27,94,48,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Truck size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: "14px", margin: 0 }}>🛵 Order On the Way!</p>
                <p style={{ opacity: 0.8, fontSize: "12px", margin: "2px 0 0" }}>Status: {activeOrder.status.replace(/_/g, " ")}</p>
              </div>
              <Link href="/orders" style={{ background: "rgba(255,255,255,0.2)", color: "white", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" }}>
                Track →
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="animate-fade-up stagger-child" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Days Left", value: sub?.remaining_days ?? "—", icon: <Calendar size={18} />, color: "#E8392A", bg: "rgba(232,57,42,0.08)" },
            { label: "Total Orders", value: orders.length, icon: <ShoppingBag size={18} />, color: "#1B5E30", bg: "rgba(27,94,48,0.08)" },
            { label: "In Progress", value: pendingCount, icon: <Clock size={18} />, color: "#F5A623", bg: "rgba(245,166,35,0.08)" },
          ].map((s) => (
            <div key={s.label} style={{ background: "white", borderRadius: "16px", padding: "16px 12px", textAlign: "center", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: s.color }}>{s.icon}</div>
              <p style={{ fontSize: "20px", fontWeight: 900, color: "#1A1A1A", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600, marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Menu */}
        {(todayMenu.lunch || todayMenu.dinner) && (
          <div className="animate-fade-up stagger-child" style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "18px", color: "#1A1A1A", letterSpacing: "-0.02em" }}>🍽️ Today's Menu</h2>
              <Link href="/food" style={{ color: "var(--emt-red)", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>Order Food →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: todayMenu.lunch && todayMenu.dinner ? "1fr 1fr" : "1fr", gap: "12px" }}>
              {todayMenu.lunch && (
                <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "var(--shadow-sm)" }}>
                  {todayMenu.lunch.image_url ? <img src={todayMenu.lunch.image_url} alt={todayMenu.lunch.title} style={{ width: "100%", height: "100px", objectFit: "cover" }} /> : <div style={{ height: "80px", background: "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>🍛</div>}
                  <div style={{ padding: "12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>🌤️ Lunch · 12–2 PM</span>
                    <p style={{ fontWeight: 800, fontSize: "13px", color: "#1A1A1A", margin: "4px 0 0" }}>{todayMenu.lunch.title}</p>
                  </div>
                </div>
              )}
              {todayMenu.dinner && (
                <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "var(--shadow-sm)" }}>
                  {todayMenu.dinner.image_url ? <img src={todayMenu.dinner.image_url} alt={todayMenu.dinner.title} style={{ width: "100%", height: "100px", objectFit: "cover" }} /> : <div style={{ height: "80px", background: "rgba(232,57,42,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>🍛</div>}
                  <div style={{ padding: "12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#E8392A", textTransform: "uppercase" }}>🌙 Dinner · 7–9 PM</span>
                    <p style={{ fontWeight: 800, fontSize: "13px", color: "#1A1A1A", margin: "4px 0 0" }}>{todayMenu.dinner.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="animate-fade-up stagger-child">
          <h2 style={{ fontWeight: 800, fontSize: "18px", color: "#1A1A1A", marginBottom: "14px", letterSpacing: "-0.02em" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { href: "/food", icon: <UtensilsCrossed size={24} />, label: "Order Food", sub: "Browse today's menu", color: "#E8392A", bg: "rgba(232,57,42,0.06)" },
              { href: "/orders", icon: <Truck size={24} />, label: "Track Order", sub: pendingCount > 0 ? `${pendingCount} active` : "View history", color: "#1B5E30", bg: "rgba(27,94,48,0.06)" },
              { href: "/subscription", icon: <Calendar size={24} />, label: "Tiffin Plans", sub: "Manage subscription", color: "#F5A623", bg: "rgba(245,166,35,0.06)" },
              { href: "https://wa.me/919770144899", icon: <MessageCircle size={24} />, label: "WhatsApp Us", sub: "Quick support", color: "#25D366", bg: "rgba(37,211,102,0.06)" },
            ].map((action) => (
              <a key={action.label} href={action.href} className="card-lift" style={{ display: "block", background: "white", borderRadius: "16px", padding: "16px", textDecoration: "none", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: action.bg, display: "flex", alignItems: "center", justifyContent: "center", color: action.color, marginBottom: "10px" }}>{action.icon}</div>
                <p style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", margin: 0 }}>{action.label}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0", fontWeight: 500 }}>{action.sub}</p>
              </a>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
