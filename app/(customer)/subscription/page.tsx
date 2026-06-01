"use client";

import { useState } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, ChevronRight, Pause, Play, X, Leaf, Drumstick, AlertTriangle, CalendarDays, PartyPopper, Sun, Moon
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
      if ((mt === "lunch" || mt === "both") && !canPauseLunch()) { showToast("Lunch pause cutoff is 11 AM. Too late for today.", "error"); return; }
      if (mt === "dinner" && !canPauseDinner()) { showToast("Dinner pause cutoff is 6 PM. Too late for today.", "error"); return; }
    }
    setManagingSub(true);
    try {
      const res = await fetch(`/api/subscriptions/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscriptionId: sub.id }) });
      const result = await res.json();
      if (result.success) { setActiveSubscription(result.subscription); showToast(action === "pause" ? "Plan paused successfully!" : action === "resume" ? "Plan resumed successfully!" : "Plan cancelled successfully!"); }
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
    <>
      {toast && <div className={`fixed top-[72px] right-4 z-[200] text-white rounded-xl py-3 px-5 text-[13px] font-semibold shadow-lg animate-slide-left ${toast.type === "success" ? "bg-[#1B5E30]" : "bg-[#E8392A]"}`}>{toast.msg}</div>}

      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-6">
          <div className="bg-white rounded-[20px] p-7 max-w-[360px] w-full text-center animate-fade-up">
            <AlertTriangle size={40} className="text-[#E8392A] mx-auto mb-3" />
            <h3 className="font-extrabold text-[18px] mb-2">Cancel Subscription?</h3>
            <p className="text-[#6B7280] text-[14px] mb-5">You still have <strong>{sub?.remaining_days}</strong> meal days left.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmCancel(false)} className="flex-1 py-3 rounded-xl border border-[#D4B896]/30 bg-white font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors">Keep Plan</button>
              <button onClick={() => handleManage("cancel")} className="flex-1 py-3 rounded-xl bg-[#E8392A] text-white border-none font-bold text-[13px] cursor-pointer hover:bg-[#B91C1C] transition-colors shadow-sm">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

        {/* Active Subscription */}
        {sub && (
          <div className={`animate-fade-up stagger-child rounded-[24px] p-6 mb-7 text-white relative overflow-hidden shadow-[0_12px_40px_rgba(232,57,42,0.25)] ${isPaused ? "bg-gradient-to-br from-[#92400E] to-[#D97706]" : "bg-gradient-to-br from-[#E8392A] to-[#B91C1C]"}`}>
            <div className="absolute -right-[30px] -top-[30px] w-[160px] h-[160px] rounded-full bg-white/5" />
            <div className="relative">
              <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[1px] mb-3">
                {isPaused ? "Paused" : "Active"}
              </span>
              <h2 className="font-black text-[20px] mb-1 flex items-center gap-2">
                {sub.category === "veg" ? <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1 text-[14px] uppercase tracking-[0.5px]"><Leaf size={16} className="text-[#4ade80]" /> Pure Veg</span> : <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1 text-[14px] uppercase tracking-[0.5px]"><Drumstick size={16} className="text-[#fca5a5]" /> Non-Veg</span>} <span className="opacity-80">Plan</span>
              </h2>
              <p className="opacity-85 text-[13px] mb-4">
                {sub.meal_type === "both" ? "Lunch & Dinner" : sub.meal_type === "lunch" ? "Lunch Only" : "Dinner Only"} · <strong>{sub.remaining_days}</strong> of <strong>{sub.total_days}</strong> days remaining
              </p>
              <div className="h-1.5 rounded-full bg-white/20 mb-5 overflow-hidden">
                <div className="h-full bg-white/85 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {isActive ? (
                  <button disabled={managingSub} onClick={() => handleManage("pause")} className={`btn-glare flex items-center gap-1.5 bg-white/20 text-white border border-white/30 rounded-xl px-4 py-2 text-[12px] font-bold cursor-pointer transition-all ${managingSub ? "opacity-60" : "hover:bg-white/30"}`}>
                    <Pause size={14} /> {managingSub ? "Processing…" : "Pause Plan"}
                  </button>
                ) : (
                  <button disabled={managingSub} onClick={() => handleManage("resume")} className={`btn-glare flex items-center gap-1.5 bg-white/90 text-emt-red border-none rounded-xl px-4 py-2 text-[12px] font-bold cursor-pointer transition-all ${managingSub ? "opacity-60" : "hover:bg-white"}`}>
                    <Play size={14} /> {managingSub ? "Processing…" : "Resume Plan"}
                  </button>
                )}
                <button onClick={() => setShowConfirmCancel(true)} className="flex items-center gap-1.5 bg-black/20 text-white border border-white/10 rounded-xl px-4 py-2 text-[12px] font-bold cursor-pointer transition-all hover:bg-black/30">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meal Calendar */}
        {sub && subscriptionDays.length > 0 && (
          <div className="animate-fade-up stagger-child bg-white rounded-[20px] p-5 mb-7 border border-[#D4B896]/15 shadow-sm">
            <h2 className="font-extrabold text-[16px] text-[#1A1A1A] mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-[#6366F1]" /> Meal Calendar — {calendarMonth.toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-2.5 flex-wrap mb-3.5">
              {[{ l: "Delivered", c: "bg-[#1B5E30]" }, { l: "Upcoming", c: "bg-[#E8392A]" }, { l: "Paused", c: "bg-[#D97706]" }, { l: "No meal", c: "bg-gray-200" }].map((x) => (
                <div key={x.l} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${x.c}`} />
                  <span className="text-[11px] text-[#6B7280] font-medium">{x.l}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-[#9CA3AF] py-1">{d}</div>
              ))}
              {calendarDays.map((cell, i) => {
                const isToday = cell.date === new Date().getDate() && calendarMonth.getMonth() === new Date().getMonth();
                const colorHex = cell.subDay ? MEAL_COLORS[cell.subDay.status] || "#E5E7EB" : "transparent";
                return (
                  <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-[11px] ${isToday ? 'font-extrabold text-emt-red' : 'font-medium'} transition-all ${isToday ? 'bg-emt-red/5 border-2 border-emt-red' : cell.subDay ? 'border-2' : cell.date ? 'border border-black/5 bg-black/5' : ''}`} style={cell.subDay ? { backgroundColor: `${colorHex}22`, borderColor: `${colorHex}44`, color: colorHex } : { color: isToday ? "var(--emt-red)" : "#6B7280" }}>
                    {cell.date || ""}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="animate-fade-up stagger-child">
          <div className="mb-5">
            <h1 className="font-black text-[clamp(20px,4vw,24px)] text-[#1A1A1A] tracking-tight">{sub ? "Renew or Upgrade" : "Choose a Plan"}</h1>
            <p className="text-[#6B7280] text-[13px] mt-1 mb-4">Fresh home-style meals, delivered daily</p>
            {canUseTrial && (
              <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/10 text-[#D97706] rounded-full px-3 py-1 mt-2 text-[12px] font-bold">
                <PartyPopper size={14} /> You're eligible for a FREE trial meal!
              </div>
            )}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {(displayPlans as any[]).map((plan) => {
              const isCurrentPlan = sub?.plan_id === plan.id;
              const isProcessing = processingPlanId === plan.id;
              return (
                <div key={plan.id} className={`card-lift rounded-[20px] overflow-hidden relative shadow-sm transition-all group ${isCurrentPlan ? "border-2 shadow-[0_8px_32px_rgba(232,57,42,0.15)]" : "border"}`} style={{ background: plan.category === "veg" ? "linear-gradient(135deg, #1B5E3012, #1B5E3003)" : "linear-gradient(135deg, #E8392A12, #E8392A03)", borderColor: isCurrentPlan ? (plan.category === "veg" ? "#1B5E30" : "#E8392A") : (plan.category === "veg" ? "#1B5E3025" : "#E8392A25") }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0" />
                  <div className={`absolute top-0 left-0 text-[10px] font-extrabold px-3 py-1.5 rounded-br-xl uppercase tracking-[1px] flex items-center gap-1 z-10 ${plan.category === "veg" ? "bg-[#1B5E30]/10 text-[#1B5E30]" : "bg-[#E8392A]/10 text-[#E8392A]"}`}>
                    {plan.category === "veg" ? <Leaf size={12} /> : <Drumstick size={12} />}
                    {plan.category === "veg" ? "Veg Plan" : "Non-Veg Plan"}
                  </div>
                  {plan.is_trial && <div className="absolute top-0 right-0 bg-gradient-to-br from-[#F5A623] to-[#E8392A] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-bl-xl uppercase tracking-[1px] z-10">Trial</div>}
                  <div className="pt-9 pb-5 px-5 relative z-10">
                    <div className="mb-3">
                      <h3 className="font-extrabold text-[16px] text-[#1A1A1A] mb-1">{plan.title}</h3>
                      <p className="text-[12px] text-[#6B7280] font-medium">{plan.meal_type === "both" ? "Lunch + Dinner" : plan.meal_type === "lunch" ? "Lunch Only" : "Dinner Only"}</p>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="font-black text-[28px] text-[#1A1A1A]">₹{plan.price}</span>
                      <span className="text-[12px] text-[#9CA3AF]">/ {plan.duration_days} days</span>
                    </div>
                    <ul className="list-none p-0 m-0 mb-4 flex flex-col gap-2">
                      {["Daily fresh meals", plan.category === "veg" ? "100% Vegetarian" : "Chicken & specials", "Rotating weekly menu", "Pause anytime"].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[12px] text-[#4A3A2A]">
                          <Check size={14} className="text-[#1B5E30] shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => !isCurrentPlan && handleSelectPlan(plan.id)} disabled={processingPlanId !== null} className={`w-full py-3 rounded-xl border-none font-extrabold text-[13px] flex items-center justify-center gap-2 transition-all ${isCurrentPlan ? "bg-[#1B5E30]/10 text-[#1B5E30] cursor-default" : "bg-[#E8392A]/10 text-[#E8392A] cursor-pointer hover:bg-[#E8392A]/20"} ${processingPlanId && !isProcessing ? "opacity-50" : ""}`}>
                      {isCurrentPlan ? <><Check size={16} /> Current Plan</> : isProcessing ? <><span className="inline-block w-3.5 h-3.5 border-2 border-[#E8392A] border-t-transparent rounded-full animate-spin" /> Processing…</> : <>Select Plan <ChevronRight size={16} /></>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </>
  );
}
