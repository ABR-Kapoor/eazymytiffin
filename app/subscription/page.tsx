"use client";

import { useState } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useUserStore } from "@/store/userStore";
import { BottomNav } from "@/components/BottomNav";
import { NotificationBell } from "@/components/NotificationBell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, ChevronRight, Pause, Play, X, Leaf, Drumstick, AlertTriangle
} from "lucide-react";

const MEAL_COLORS: Record<string, string> = {
  upcoming: "#E8392A",
  delivered: "#1B5E30",
  paused: "#D97706",
  cancelled: "#9CA3AF",
};

const DEFAULT_PLANS = [
  { id: "veg-weekly", title: "Veg Weekly", description: "Pure vegetarian", category: "veg", meal_type: "both", duration_days: 7, price: 560, is_trial: false },
  { id: "nonveg-weekly", title: "Non-Veg Weekly", description: "Premium non-veg", category: "non_veg", meal_type: "both", duration_days: 7, price: 700, is_trial: false },
  { id: "veg-monthly", title: "Veg Monthly", description: "Pure vegetarian", category: "veg", meal_type: "both", duration_days: 26, price: 2490, is_trial: false },
  { id: "nonveg-monthly", title: "Non-Veg Monthly", description: "Premium non-veg", category: "non_veg", meal_type: "both", duration_days: 26, price: 3490, is_trial: false },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.isAdmin)();
  const canUseTrial = useUserStore((s) => s.canUseTrial)();
  const { activeSubscription: sub, plans, subscriptionDays, isLoading, setActiveSubscription, canPauseLunch, canPauseDinner } = useSubscriptionStore();

  const isActive = sub?.status === "active";
  const isPaused = sub?.status === "paused";

  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [managingSub, setManagingSub] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [calendarMonth] = useState(new Date());

  const progress = sub ? Math.round((sub.remaining_days / sub.total_days) * 100) : 0;

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

  const handleManage = async (action: "pause" | "resume" | "cancel") => {
    if (!sub) return;
    if (action === "cancel") setShowConfirmCancel(false);
    if (action === "pause") {
      const mt = sub.meal_type;
      if ((mt === "lunch" || mt === "both") && !canPauseLunch()) { showToast("⏰ Lunch pause cutoff is 11 AM. Too late for today.", "error"); return; }
      if (mt === "dinner" && !canPauseDinner()) { showToast("⏰ Dinner pause cutoff is 6 PM. Too late for today.", "error"); return; }
    }
    setManagingSub(true);
    try {
      const res = await fetch(`/api/subscriptions/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscriptionId: sub.id }) });
      const result = await res.json();
      if (result.success) { setActiveSubscription(result.subscription); showToast(action === "pause" ? "Plan paused!" : action === "resume" ? "Plan resumed!" : "Plan cancelled."); }
      else showToast(result.error || "Operation failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setManagingSub(false); }
  };

  const calendarDays = (() => {
    const y = calendarMonth.getFullYear(), m = calendarMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: { date: number | null; subDay: (typeof subscriptionDays)[0] | null }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ date: null, subDay: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: d, subDay: subscriptionDays.find((sd) => sd.meal_date === dateStr) || null });
    }
    return cells;
  })();

  const displayPlans = plans.length > 0 ? plans : DEFAULT_PLANS;

  return (
    <div style={{ minHeight: "100vh", background: "var(--emt-cream)" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,184,150,0.2)", padding: "0 20px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: "20px", color: "#1A1A1A" }}>EazyMy<span style={{ color: "var(--emt-red)" }}>Tiffin</span></span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isAdmin && <Link href="/admin" style={{ background: "var(--emt-red)", color: "white", fontSize: "10px", fontWeight: 800, letterSpacing: "1px", padding: "6px 14px", borderRadius: "999px", textDecoration: "none", textTransform: "uppercase" }}>Admin</Link>}
          <NotificationBell />
          <Link href="/profile"><div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, var(--emt-red), #C0392B)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}>{user?.full_name?.charAt(0)?.toUpperCase() || "U"}</div></Link>
        </div>
      </header>

      {toast && <div style={{ position: "fixed", top: "72px", right: "16px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "slideLeft 0.3s ease" }}>{toast.type === "success" ? "✅ " : "❌ "}{toast.msg}</div>}

      {showConfirmCancel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "360px", width: "100%", textAlign: "center", animation: "fadeUp 0.25s ease" }}>
            <AlertTriangle size={40} style={{ color: "#E8392A", margin: "0 auto 12px" }} />
            <h3 style={{ fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>Cancel Subscription?</h3>
            <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "20px" }}>You still have <strong>{sub?.remaining_days}</strong> meal days left.</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowConfirmCancel(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Keep Plan</button>
              <button onClick={() => handleManage("cancel")} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      <main id="main" style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 96px" }}>
        <div className="animate-fade-up" style={{ marginBottom: "28px" }}>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(24px,5vw,30px)", color: "#1A1A1A", letterSpacing: "-0.02em" }}>Tiffin Plans</h1>
          <p style={{ color: "#6B7280", fontSize: "13px", marginTop: "4px" }}>Fresh home-style meals, delivered daily</p>
        </div>

        {/* Active Subscription */}
        {sub && (
          <div className="animate-fade-up stagger-child" style={{ background: isPaused ? "linear-gradient(135deg, #92400E, #D97706)" : "linear-gradient(135deg, #E8392A, #B91C1C)", borderRadius: "24px", padding: "24px", marginBottom: "28px", color: "white", position: "relative", overflow: "hidden", boxShadow: "0 12px 40px rgba(232,57,42,0.25)" }}>
            <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "relative" }}>
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", borderRadius: "999px", padding: "4px 12px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", backdropFilter: "blur(8px)" }}>
                {isPaused ? "⏸️ Paused" : "✨ Active"}
              </span>
              <h2 style={{ fontWeight: 900, fontSize: "20px", marginBottom: "4px" }}>{sub.category === "veg" ? "🥗 Pure Veg" : "🍗 Non-Veg"} Plan</h2>
              <p style={{ opacity: 0.85, fontSize: "13px", marginBottom: "16px" }}>
                {sub.meal_type === "both" ? "Lunch & Dinner" : sub.meal_type === "lunch" ? "Lunch Only" : "Dinner Only"} · <strong>{sub.remaining_days}</strong> of <strong>{sub.total_days}</strong> days remaining
              </p>
              <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.2)", marginBottom: "20px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "rgba(255,255,255,0.85)", borderRadius: "999px", transition: "width 1s ease" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {isActive ? (
                  <button disabled={managingSub} onClick={() => handleManage("pause")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "12px", padding: "9px 18px", fontSize: "12px", fontWeight: 700, cursor: "pointer", opacity: managingSub ? 0.6 : 1 }}>
                    <Pause size={14} /> {managingSub ? "Processing…" : "Pause Plan"}
                  </button>
                ) : (
                  <button disabled={managingSub} onClick={() => handleManage("resume")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.9)", color: "#E8392A", border: "none", borderRadius: "12px", padding: "9px 18px", fontSize: "12px", fontWeight: 700, cursor: "pointer", opacity: managingSub ? 0.6 : 1 }}>
                    <Play size={14} /> {managingSub ? "Processing…" : "Resume Plan"}
                  </button>
                )}
                <button onClick={() => setShowConfirmCancel(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "9px 18px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meal Calendar */}
        {sub && subscriptionDays.length > 0 && (
          <div className="animate-fade-up stagger-child" style={{ background: "white", borderRadius: "20px", padding: "20px", marginBottom: "28px", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontWeight: 800, fontSize: "16px", color: "#1A1A1A", marginBottom: "16px" }}>
              📅 Meal Calendar — {calendarMonth.toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
              {[{ l: "Delivered", c: "#1B5E30" }, { l: "Upcoming", c: "#E8392A" }, { l: "Paused", c: "#D97706" }, { l: "No meal", c: "#E5E7EB" }].map((x) => (
                <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: x.c }} />
                  <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>{x.l}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, color: "#9CA3AF", padding: "4px 0" }}>{d}</div>
              ))}
              {calendarDays.map((cell, i) => {
                const isToday = cell.date === new Date().getDate() && calendarMonth.getMonth() === new Date().getMonth();
                const color = cell.subDay ? MEAL_COLORS[cell.subDay.status] || "#E5E7EB" : "transparent";
                return (
                  <div key={i} style={{ aspectRatio: "1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: isToday ? 800 : 500, background: cell.date ? (cell.subDay ? `${color}22` : isToday ? "rgba(232,57,42,0.05)" : "transparent") : "transparent", border: isToday ? "2px solid var(--emt-red)" : cell.subDay ? `2px solid ${color}44` : "none", color: cell.subDay ? color : isToday ? "var(--emt-red)" : "#6B7280" }}>
                    {cell.date || ""}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="animate-fade-up stagger-child">
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontWeight: 800, fontSize: "20px", color: "#1A1A1A", letterSpacing: "-0.02em" }}>{sub ? "Renew or Upgrade" : "Choose a Plan"}</h2>
            {canUseTrial && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,166,35,0.1)", color: "#D97706", borderRadius: "999px", padding: "4px 12px", marginTop: "8px", fontSize: "12px", fontWeight: 700 }}>
                🎉 You're eligible for a FREE trial meal!
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {(displayPlans as any[]).map((plan) => {
              const isCurrentPlan = sub?.plan_id === plan.id;
              const isProcessing = processingPlanId === plan.id;
              return (
                <div key={plan.id} className="card-lift" style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: isCurrentPlan ? "2px solid var(--emt-red)" : "1px solid rgba(212,184,150,0.15)", boxShadow: isCurrentPlan ? "0 8px 32px rgba(232,57,42,0.15)" : "var(--shadow-sm)", position: "relative" }}>
                  {plan.is_trial && <div style={{ position: "absolute", top: 0, right: 0, background: "linear-gradient(135deg, #F5A623, #E8392A)", color: "white", fontSize: "9px", fontWeight: 800, padding: "5px 12px", borderRadius: "0 20px 0 12px", textTransform: "uppercase", letterSpacing: "1px" }}>Trial</div>}
                  <div style={{ height: "8px", background: plan.category === "veg" ? "linear-gradient(90deg, #1B5E30, #2D7A3A)" : "linear-gradient(90deg, #E8392A, #B91C1C)" }} />
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: plan.category === "veg" ? "rgba(27,94,48,0.1)" : "rgba(232,57,42,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: plan.category === "veg" ? "#1B5E30" : "#E8392A" }}>
                        {plan.category === "veg" ? <Leaf size={20} /> : <Drumstick size={20} />}
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}>{plan.title}</h3>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>{plan.meal_type === "both" ? "Lunch + Dinner" : plan.meal_type === "lunch" ? "Lunch Only" : "Dinner Only"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" }}>
                      <span style={{ fontWeight: 900, fontSize: "28px", color: "#1A1A1A" }}>₹{plan.price}</span>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>/ {plan.duration_days} days</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: "7px" }}>
                      {["Daily fresh meals", plan.category === "veg" ? "100% Vegetarian" : "Chicken & specials", "Rotating weekly menu", "Pause anytime"].map((f) => (
                        <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#4A3A2A" }}>
                          <Check size={14} style={{ color: "#1B5E30", flexShrink: 0 }} /> {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => !isCurrentPlan && handleSelectPlan(plan.id)} disabled={processingPlanId !== null} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", fontWeight: 800, fontSize: "13px", cursor: isCurrentPlan ? "default" : "pointer", background: isCurrentPlan ? "rgba(27,94,48,0.1)" : "var(--emt-red)", color: isCurrentPlan ? "#1B5E30" : "white", transition: "all 200ms", opacity: processingPlanId && !isProcessing ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      {isCurrentPlan ? <><Check size={16} /> Current Plan</> : isProcessing ? <><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Processing…</> : <>Select Plan <ChevronRight size={16} /></>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
