"use client";

import { useState, useEffect } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { useConfirm } from "@/components/ConfirmProvider";
import Link from "next/link";
import {
  Package, Clock, CheckCircle2, Truck, ChefHat,
  Phone, X, RefreshCw, AlertTriangle, Bike, Utensils, ClipboardList, CreditCard, ArrowRight,
  Search
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
  out_for_delivery: { bg: "rgba(252,128,25,0.1)", text: "#FC8019", label: "Out for Delivery" },
  delivered: { bg: "rgba(27,166,114,0.1)", text: "#1BA672", label: "Delivered" },
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
    <div className="bg-[#f8f9fa] min-h-screen pb-4">
      {toast && (
        <div className={`fixed top-[72px] right-4 z-[200] text-white rounded-xl py-3 px-5 text-[13px] font-semibold shadow-lg animate-slide-left ${toast.type === "success" ? "bg-[#1BA672]" : "bg-[#FC8019]"}`}>
          {toast.msg}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-[#2563EB] pt-6 pb-10 px-4 rounded-b-[32px] shadow-sm transition-all duration-500 overflow-hidden -mx-4 lg:mx-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-60 invert pointer-events-none" />

        <div className="relative z-10 mb-5 mt-2">
          <h2 className="text-white text-[26px] font-black drop-shadow-sm leading-tight tracking-tight">
            Your Orders
          </h2>
          <p className="text-white/95 text-[14px] font-bold mt-1 tracking-wide">
            Track all your food & subscription orders
          </p>
        </div>

        {/* Quick Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white/15 backdrop-blur-md rounded-[16px] p-2 sm:p-3 text-center border border-white/10">
            <p className="text-white font-black text-[18px] sm:text-[20px] m-0">{orders.length}</p>
            <p className="text-[10px] text-white/80 font-semibold m-0 mt-0.5">Total Orders</p>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-[16px] p-2 sm:p-3 text-center border border-white/10">
            <p className="text-white font-black text-[18px] sm:text-[20px] m-0">{activeOrder ? 1 : 0}</p>
            <p className="text-[10px] text-white/80 font-semibold m-0 mt-0.5">Active</p>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-[16px] p-2 sm:p-3 text-center border border-white/10">
            <p className="text-white font-black text-[18px] sm:text-[20px] m-0">{subscriptions.length}</p>
            <p className="text-[10px] text-white/80 font-semibold m-0 mt-0.5">Subscriptions</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {/* Active Delivery Tracking Card */}
        {activeOrder && (
          <div className="animate-fade-up mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-[13px] sm:text-[14px] text-slate-800 m-0 flex items-center gap-1.5 truncate">
                  <Bike size={16} className="text-[#FC8019] shrink-0" /> Order #{activeOrder.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-[11px] sm:text-[12px] text-slate-500 m-0 mt-0.5 truncate">Status: <span className="text-[#FC8019] font-bold capitalize">{activeOrder.status.replace(/_/g, " ")}</span></p>
              </div>
              {activeDelivery?.eta && (
                <div className="text-right shrink-0">
                  <p className="text-[9px] sm:text-[10px] text-slate-500 m-0 uppercase font-bold">ETA</p>
                  <p className="font-extrabold text-[14px] sm:text-[16px] text-[#1BA672] m-0">{activeDelivery.eta}</p>
                </div>
              )}
            </div>

            {/* Status timeline */}
            <div className="p-5 pl-6">
              <div className="flex flex-col gap-5 relative">
                <div className="absolute top-2 bottom-6 left-[15px] w-0.5 bg-slate-100 z-0" />
                {ORDER_STATUS_STEPS.map((step, i) => {
                  const currentIdx = STATUS_ORDER_MAP[activeOrder.status];
                  const stepIdx = STATUS_ORDER_MAP[step.key] ?? i;
                  const done = stepIdx <= currentIdx;
                  const active = stepIdx === currentIdx;
                  return (
                    <div key={step.key} className="flex items-start gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white transition-all shadow-sm ${active ? "border-[#FC8019] text-[#FC8019]" : done ? "border-[#1BA672] text-[#1BA672]" : "border-slate-200 text-slate-300"}`}>
                        {done && !active ? <CheckCircle2 size={16} /> : step.icon}
                      </div>
                      <div className="pt-1.5 flex-1">
                        <p className={`font-bold text-[14px] m-0 transition-opacity ${active ? "text-[#1A1A1A]" : done ? "text-slate-700" : "text-slate-400"}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery boy info */}
            {activeDelivery?.delivery_boy_id && deliveryUsers[activeDelivery.delivery_boy_id] && (
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Bike size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-slate-800 m-0">
                      {deliveryUsers[activeDelivery.delivery_boy_id].full_name}
                    </p>
                    <p className="text-[12px] text-slate-500 m-0">Delivery Partner</p>
                  </div>
                </div>
                <a
                  href={`tel:${deliveryUsers[activeDelivery.delivery_boy_id].phone}`}
                  className="w-10 h-10 rounded-full bg-green-50 text-[#1BA672] flex items-center justify-center no-underline border border-green-100"
                >
                  <Phone size={18} />
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
              className={`flex-1 py-2.5 px-2 rounded-xl border-none font-bold text-[12px] sm:text-[13px] cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden ${tab === t.key ? "bg-[#2563EB]/10 text-[#2563EB]" : "bg-transparent text-[#6B7280] hover:bg-gray-50"}`}
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
              <div className="text-center py-16 px-5 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                <Package size={48} className="text-[#E5E7EB] mx-auto mb-4" />
                <h3 className="font-extrabold text-[18px] text-[#1A1A1A] mb-2">No Orders Yet</h3>
                <p className="text-[#9CA3AF] mb-5">Order fresh meals from our menu</p>
                <Link href="/food" className="inline-flex items-center gap-1.5 bg-[#FC8019] text-white rounded-xl px-5 py-2.5 no-underline font-bold text-[13px] hover:bg-[#E06A10] transition-colors shadow-sm">
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
                      className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3 gap-2">
                        <div className="flex gap-2 sm:gap-3 items-center min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Utensils size={16} className="sm:hidden text-slate-400" />
                            <Utensils size={20} className="hidden sm:block text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-[13px] sm:text-[14px] text-[#1A1A1A] m-0 truncate">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-[#9CA3AF] m-0 mt-0.5 truncate">
                              {new Date(order.created_at).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm whitespace-nowrap uppercase tracking-wider border" style={{ background: status.bg, color: status.text, borderColor: status.text + '30' }}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <div className="flex gap-2 sm:gap-4 items-center min-w-0">
                          <div>
                            <p className="font-black text-[15px] sm:text-[16px] text-slate-800 m-0">₹{order.total_amount}</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-[11px] text-[#9CA3AF] m-0 font-semibold mt-1">
                              {order.payment_method.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          {isPending ? (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancelling === order.id}
                              className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#FC8019] bg-transparent border border-[#FC8019]/30 rounded-lg px-2 sm:px-3 py-1.5 cursor-pointer transition-colors hover:bg-[#FC8019]/5 ${cancelling === order.id ? "opacity-50" : ""}`}
                            >
                              <X size={12} className="sm:hidden" />
                              <X size={13} className="hidden sm:block" />
                              {cancelling === order.id ? "Cancelling…" : "Cancel"}
                            </button>
                          ) : (
                            <Link href="/food" className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#FC8019] bg-[#FFF3E8] border-none rounded-[8px] px-2 sm:px-3 py-1.5 cursor-pointer transition-colors hover:bg-[#FDEEDC] no-underline">
                              <RefreshCw size={11} className="sm:hidden" />
                              <RefreshCw size={12} className="hidden sm:block" /> Reorder
                            </Link>
                          )}
                        </div>
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
                <h3 className="font-extrabold text-[14px] sm:text-[15px] text-[#1A1A1A] mb-3 flex items-center gap-1.5"><ClipboardList size={15} className="sm:hidden" /><ClipboardList size={16} className="hidden sm:block" /> Subscriptions</h3>
                {subscriptions.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl mb-5 border border-[#D4B896]/15 shadow-sm">
                    <p className="text-[#9CA3AF]">No subscriptions yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 mb-6">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="card-lift bg-white rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 border border-[#D4B896]/15 shadow-sm">
                        <div className="flex justify-between items-center gap-2">
                          <div className="min-w-0">
                            <p className="font-extrabold text-[13px] sm:text-[14px] text-[#1A1A1A] m-0 truncate">
                              {sub.plan?.title || (sub.category === "veg" ? "Veg Plan" : "Non-Veg Plan")}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-[#9CA3AF] m-0 mt-1 truncate">
                              {sub.remaining_days}/{sub.total_days} days · Started {new Date(sub.starts_at).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-full capitalize ${sub.status === "active" ? "bg-[#1BA672]/10 text-[#1BA672]" : sub.status === "paused" ? "bg-[#F5A623]/10 text-[#D97706]" : "bg-gray-100 text-gray-500"}`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="font-extrabold text-[14px] sm:text-[15px] text-[#1A1A1A] mb-3 flex items-center gap-1.5"><CreditCard size={15} className="sm:hidden" /><CreditCard size={16} className="hidden sm:block" /> Payment History</h3>
                {payments.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-[#D4B896]/15 shadow-sm">
                    <p className="text-[#9CA3AF]">No payment records yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {payments.map((pay) => (
                      <div key={pay.id} className="card-lift bg-white rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 flex justify-between items-center border border-[#D4B896]/15 shadow-sm gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-[12px] sm:text-[13px] text-[#1A1A1A] m-0 truncate">
                            {pay.payment_method?.toUpperCase() || "PAYMENT"}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-[#9CA3AF] m-0 mt-1 truncate">
                            {new Date(pay.created_at).toLocaleDateString("en-IN")}
                            {pay.transaction_id && ` · TXN: ${pay.transaction_id.slice(0, 12)}…`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-[15px] sm:text-[16px] text-[#1A1A1A] m-0">₹{pay.amount}</p>
                          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${pay.payment_status === "paid" ? "bg-[#1BA672]/10 text-[#1BA672]" : "bg-[#FC8019]/10 text-[#FC8019]"}`}>
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
      </div>
    </div>
  );
}
