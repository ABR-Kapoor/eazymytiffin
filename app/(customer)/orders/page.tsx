"use client";

import { useState, useEffect } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { useConfirm } from "@/components/ConfirmProvider";
import Link from "next/link";
import {
  Package, Clock, CheckCircle2, Truck, ChefHat,
  Phone, X, RefreshCw, AlertTriangle, Bike, Utensils, ClipboardList, CreditCard, ArrowRight
} from "lucide-react";

const ORDER_STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: <Clock size={16} /> },
  { key: "preparing", label: "Preparing", icon: <ChefHat size={16} /> },
  { key: "assigned", label: "Assigned", icon: <Truck size={16} /> },
  { key: "out_for_delivery", label: "On the Way", icon: <Truck size={16} /> },
  { key: "delivered", label: "Delivered", icon: <CheckCircle2 size={16} /> },
];

const STATUS_ORDER_MAP: Record<string, number> = {
  pending: 0, preparing: 1, assigned: 2, out_for_delivery: 3, delivered: 4, cancelled: -1,
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "rgba(245,166,35,0.1)", text: "#D97706", label: "Pending" },
  preparing: { bg: "rgba(99,102,241,0.1)", text: "#6366F1", label: "Preparing" },
  assigned: { bg: "rgba(14,165,233,0.1)", text: "#0EA5E9", label: "Assigned" },
  out_for_delivery: { bg: "rgba(232,57,42,0.1)", text: "#E8392A", label: "Out for Delivery" },
  delivered: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30", label: "Delivered" },
  cancelled: { bg: "rgba(156,163,175,0.1)", text: "#6B7280", label: "Cancelled" },
};

export default function OrdersPage() {
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.isAdmin)();
  const { orders, activeDelivery, isLoading, getActiveOrder } = useOrderStore();
  const [tab, setTab] = useState<"orders" | "subs">("orders");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const { confirm } = useConfirm();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deliveryUsers, setDeliveryUsers] = useState<Record<string, any>>({});

  const activeOrder = getActiveOrder();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (tab === "subs" && user && subscriptions.length === 0) {
      const fetchHistory = async () => {
        setSubsLoading(true);
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("*, plan:subscription_plans(title, category, meal_type)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const { data: pays } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setSubscriptions(subs || []);
        setPayments(pays || []);
        setSubsLoading(false);
      };
      fetchHistory();
    }
  }, [tab, user]);

  useEffect(() => {
    const fetchDeliveryBoy = async () => {
      if (!activeDelivery?.delivery_boy_id) return;
      const { data } = await supabase
        .from("users")
        .select("full_name, phone")
        .eq("id", activeDelivery.delivery_boy_id)
        .single();
      if (data) {
        setDeliveryUsers({ [activeDelivery.delivery_boy_id]: data });
      }
    };
    fetchDeliveryBoy();
  }, [activeDelivery]);

  const handleCancelOrder = async (orderId: string) => {
    confirm({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order?",
      confirmText: "Cancel Order",
      onConfirm: async () => {
        setCancelling(orderId);
        try {
          const res = await fetch(`/api/food-orders/${orderId}/cancel`, { method: "POST" });
          const result = await res.json();
          if (result.success) showToast("Order cancelled successfully!");
          else showToast(result.error || "Cannot cancel this order.", "error");
        } catch {
          showToast("Network error.", "error");
        } finally {
          setCancelling(null);
        }
      }
    });
  };

  return (
    <>
      {toast && (
        <div className={`fixed top-[72px] right-4 z-[200] text-white rounded-xl py-3 px-5 text-[13px] font-semibold shadow-lg animate-slide-left ${toast.type === "success" ? "bg-[#1B5E30]" : "bg-[#E8392A]"}`}>
          {toast.msg}
        </div>
      )}
        <div className="animate-fade-up mb-6">
          <h1 className="font-black text-[clamp(18px,4vw,22px)] text-[#1A1A1A] tracking-tight flex items-center gap-2">
            <Package size={28} /> Orders & History
          </h1>
        </div>

        {/* Active Delivery Tracking Card */}
        {activeOrder && (
          <div className="animate-fade-up stagger-child bg-gradient-to-br from-[#1B5E30] to-[#2D7A3A] rounded-[20px] p-5 mb-6 text-white shadow-[0_8px_32px_rgba(27,94,48,0.25)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[1px] bg-white/20 rounded-full px-2.5 py-1 inline-flex items-center gap-1.5 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80]" /> Live Tracking
                </span>
                <h2 className="font-black text-[18px] mt-2 mb-0">
                  {STATUS_COLORS[activeOrder.status]?.label || "Processing"}
                </h2>
              </div>
              {activeDelivery?.eta && (
                <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-3.5 py-2.5">
                  <p className="text-[10px] opacity-80 m-0">ETA</p>
                  <p className="font-black text-[20px] m-0 mt-0.5">{activeDelivery.eta}</p>
                </div>
              )}
            </div>

            {/* Status timeline */}
            <div className="flex items-center gap-0 mb-4 relative z-10">
              {ORDER_STATUS_STEPS.map((step, i) => {
                const currentIdx = STATUS_ORDER_MAP[activeOrder.status];
                const stepIdx = STATUS_ORDER_MAP[step.key] ?? i;
                const done = stepIdx <= currentIdx;
                const active = stepIdx === currentIdx;
                return (
                  <div key={step.key} className={`flex items-center ${i < ORDER_STATUS_STEPS.length - 1 ? "flex-1" : "flex-none"}`}>
                    <div className="text-center shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] mx-auto transition-all ${done ? "bg-white/90 text-[#1B5E30]" : "bg-white/20 text-white/60"} ${active ? "border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" : "border-none"}`}>
                        {done && !active ? <CheckCircle2 size={16} /> : step.icon}
                      </div>
                      <p className={`text-[8px] font-bold mt-1 max-w-[40px] transition-opacity ${done ? "opacity-100" : "opacity-50"}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < ORDER_STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-3.5 transition-colors ${done ? "bg-white/70" : "bg-white/20"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Delivery boy info */}
            {activeDelivery?.delivery_boy_id && deliveryUsers[activeDelivery.delivery_boy_id] && (
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 relative z-10">
                <div className="w-11 h-11 rounded-full bg-white/30 flex items-center justify-center font-extrabold text-[18px]">
                  <Bike size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[14px] m-0">
                    {deliveryUsers[activeDelivery.delivery_boy_id].full_name}
                  </p>
                  <p className="text-[11px] opacity-80 m-0 mt-0.5">Your delivery partner</p>
                </div>
                <a
                  href={`tel:${deliveryUsers[activeDelivery.delivery_boy_id].phone}`}
                  className="bg-white/20 text-white rounded-xl px-3.5 py-2 no-underline text-[12px] font-bold flex items-center gap-1.5 hover:bg-white/30 transition-colors"
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="animate-fade-up stagger-child flex gap-1 bg-white rounded-2xl p-1 mb-5 border border-[#D4B896]/15 shadow-sm">
          {[
            { key: "orders", label: "Food Orders", icon: <Utensils size={14} className="shrink-0" /> },
            { key: "subs", label: "Subscriptions", icon: <ClipboardList size={14} className="shrink-0" /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2.5 px-2 rounded-xl border-none font-bold text-[12px] sm:text-[13px] cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden ${tab === t.key ? "bg-[#E8392A]/10 text-[#E8392A]" : "bg-transparent text-[#6B7280] hover:bg-gray-50"}`}
            >
              {t.icon} <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Food Orders Tab */}
        {tab === "orders" && (
          <div className="tab-active">
            {isLoading ? (
              <div className="text-center py-16">
                <RefreshCw size={24} className="text-[#9CA3AF] animate-spin mx-auto mb-3" />
                <p className="text-[#9CA3AF]">Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 px-5 bg-white rounded-[20px] border border-[#D4B896]/15">
                <Package size={48} className="text-[#E5E7EB] mx-auto mb-4" />
                <h3 className="font-extrabold text-[18px] text-[#1A1A1A] mb-2">No Orders Yet</h3>
                <p className="text-[#9CA3AF] mb-5">Order fresh meals from our menu</p>
                <Link href="/food" className="inline-flex items-center gap-1.5 bg-[#E8392A] text-white rounded-xl px-5 py-2.5 no-underline font-bold text-[13px] hover:bg-[#B91C1C] transition-colors btn-glare shadow-sm">
                  Browse Food <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => {
                  const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  const isPending = order.status === "pending";
                  return (
                    <div
                      key={order.id}
                      className="card-lift animate-fade-up stagger-child bg-white rounded-2xl p-4 border border-[#D4B896]/15 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-extrabold text-[14px] text-[#1A1A1A] m-0">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-[11px] text-[#9CA3AF] m-0 mt-1">
                            {new Date(order.created_at).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: status.bg, color: status.text }}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] m-0 font-semibold">TOTAL</p>
                            <p className="font-black text-[18px] text-emt-red m-0 mt-0.5">₹{order.total_amount}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#9CA3AF] m-0 font-semibold">PAYMENT</p>
                            <p className="font-bold text-[12px] text-[#4A3A2A] m-0 mt-1 uppercase">
                              {order.payment_method}
                            </p>
                          </div>
                        </div>

                        {isPending && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelling === order.id}
                            className={`flex items-center gap-1 text-[11px] font-bold text-[#E8392A] bg-[#E8392A]/10 border-none rounded-lg px-3 py-1.5 cursor-pointer transition-colors hover:bg-[#E8392A]/20 ${cancelling === order.id ? "opacity-50" : ""}`}
                          >
                            <X size={13} />
                            {cancelling === order.id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Subscription History Tab */}
        {tab === "subs" && (
          <div className="tab-active">
            {subsLoading ? (
              <div className="text-center py-16">
                <RefreshCw size={24} className="text-[#9CA3AF] animate-spin mx-auto mb-3" />
              </div>
            ) : (
              <>
                {/* Subscriptions */}
                <h3 className="font-extrabold text-[15px] text-[#1A1A1A] mb-3 flex items-center gap-1.5"><ClipboardList size={16} /> Subscriptions</h3>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl mb-5 border border-[#D4B896]/15 shadow-sm">
                    <p className="text-[#9CA3AF]">No subscriptions yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 mb-6">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="card-lift bg-white rounded-2xl px-4 py-3.5 border border-[#D4B896]/15 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-extrabold text-[14px] text-[#1A1A1A] m-0">
                              {sub.plan?.title || (sub.category === "veg" ? "Veg Plan" : "Non-Veg Plan")}
                            </p>
                            <p className="text-[11px] text-[#9CA3AF] m-0 mt-1">
                              {sub.remaining_days}/{sub.total_days} days · Started {new Date(sub.starts_at).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${sub.status === "active" ? "bg-[#1B5E30]/10 text-[#1B5E30]" : sub.status === "paused" ? "bg-[#F5A623]/10 text-[#D97706]" : "bg-gray-100 text-gray-500"}`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payments */}
                <h3 className="font-extrabold text-[15px] text-[#1A1A1A] mb-3 flex items-center gap-1.5"><CreditCard size={16} /> Payment History</h3>
                {payments.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-[#D4B896]/15 shadow-sm">
                    <p className="text-[#9CA3AF]">No payment records yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {payments.map((pay) => (
                      <div key={pay.id} className="card-lift bg-white rounded-2xl px-4 py-3.5 flex justify-between items-center border border-[#D4B896]/15 shadow-sm">
                        <div>
                          <p className="font-bold text-[13px] text-[#1A1A1A] m-0">
                            {pay.payment_method?.toUpperCase() || "PAYMENT"}
                          </p>
                          <p className="text-[11px] text-[#9CA3AF] m-0 mt-1">
                            {new Date(pay.created_at).toLocaleDateString("en-IN")}
                            {pay.transaction_id && ` · TXN: ${pay.transaction_id.slice(0, 12)}…`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[16px] text-[#1A1A1A] m-0">₹{pay.amount}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pay.payment_status === "paid" ? "bg-[#1B5E30]/10 text-[#1B5E30]" : "bg-[#E8392A]/10 text-[#E8392A]"}`}>
                            {pay.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
    </>
  );
}
