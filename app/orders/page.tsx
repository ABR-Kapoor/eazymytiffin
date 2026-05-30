"use client";

import { useState, useEffect } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import {
  Package, Clock, CheckCircle2, Truck, ChefHat,
  Phone, X, RefreshCw, AlertTriangle
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
    if (!confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      const res = await fetch(`/api/food-orders/${orderId}/cancel`, { method: "POST" });
      const result = await res.json();
      if (result.success) showToast("Order cancelled.");
      else showToast(result.error || "Cannot cancel this order.", "error");
    } catch {
      showToast("Network error.", "error");
    } finally {
      setCancelling(null);
    }
  };

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
        <div className="animate-fade-up" style={{ marginBottom: "24px" }}>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(22px, 5vw, 28px)", color: "#1A1A1A", letterSpacing: "-0.02em" }}>
            📦 Orders & History
          </h1>
        </div>

        {/* Active Delivery Tracking Card */}
        {activeOrder && (
          <div className="animate-fade-up stagger-child" style={{
            background: "linear-gradient(135deg, #1B5E30, #2D7A3A)",
            borderRadius: "20px", padding: "20px",
            marginBottom: "24px", color: "white",
            boxShadow: "0 8px 32px rgba(27,94,48,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", background: "rgba(255,255,255,0.2)", borderRadius: "999px", padding: "3px 10px" }}>
                  🟢 Live Tracking
                </span>
                <h2 style={{ fontWeight: 900, fontSize: "18px", margin: "8px 0 0" }}>
                  {STATUS_COLORS[activeOrder.status]?.label || "Processing"}
                </h2>
              </div>
              {activeDelivery?.eta && (
                <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "10px 14px" }}>
                  <p style={{ fontSize: "10px", opacity: 0.8, margin: 0 }}>ETA</p>
                  <p style={{ fontWeight: 900, fontSize: "20px", margin: "2px 0 0" }}>{activeDelivery.eta}</p>
                </div>
              )}
            </div>

            {/* Status timeline */}
            <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "16px" }}>
              {ORDER_STATUS_STEPS.map((step, i) => {
                const currentIdx = STATUS_ORDER_MAP[activeOrder.status];
                const stepIdx = STATUS_ORDER_MAP[step.key] ?? i;
                const done = stepIdx <= currentIdx;
                const active = stepIdx === currentIdx;
                return (
                  <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < ORDER_STATUS_STEPS.length - 1 ? "1" : "0" }}>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: done ? "#1B5E30" : "rgba(255,255,255,0.6)",
                        border: active ? "2px solid white" : "none",
                        margin: "0 auto",
                        boxShadow: active ? "0 0 12px rgba(255,255,255,0.5)" : "none",
                        fontSize: "14px",
                      }}>
                        {done && !active ? <CheckCircle2 size={16} /> : step.icon}
                      </div>
                      <p style={{ fontSize: "8px", fontWeight: 700, opacity: done ? 1 : 0.5, marginTop: "4px", maxWidth: "40px" }}>
                        {step.label}
                      </p>
                    </div>
                    {i < ORDER_STATUS_STEPS.length - 1 && (
                      <div style={{ flex: 1, height: "2px", background: done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", margin: "0 4px 14px" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Delivery boy info */}
            {activeDelivery?.delivery_boy_id && deliveryUsers[activeDelivery.delivery_boy_id] && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "18px" }}>
                  🛵
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                    {deliveryUsers[activeDelivery.delivery_boy_id].full_name}
                  </p>
                  <p style={{ fontSize: "11px", opacity: 0.8, margin: "2px 0 0" }}>Your delivery partner</p>
                </div>
                <a
                  href={`tel:${deliveryUsers[activeDelivery.delivery_boy_id].phone}`}
                  style={{
                    background: "rgba(255,255,255,0.2)", color: "white",
                    borderRadius: "10px", padding: "8px 14px",
                    textDecoration: "none", fontSize: "12px", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="animate-fade-up stagger-child" style={{ display: "flex", gap: "4px", background: "white", borderRadius: "14px", padding: "4px", marginBottom: "20px", border: "1px solid rgba(212,184,150,0.15)" }}>
          {[
            { key: "orders", label: "🍱 Food Orders" },
            { key: "subs", label: "📋 Subscription History" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "none",
                background: tab === t.key ? "var(--emt-red)" : "transparent",
                color: tab === t.key ? "white" : "#6B7280",
                fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 200ms",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Food Orders Tab */}
        {tab === "orders" && (
          <div className="tab-active">
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <RefreshCw size={24} style={{ color: "#9CA3AF", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ color: "#9CA3AF" }}>Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "20px", border: "1px solid rgba(212,184,150,0.15)" }}>
                <Package size={48} style={{ color: "#E5E7EB", margin: "0 auto 16px" }} />
                <h3 style={{ fontWeight: 800, fontSize: "18px", color: "#1A1A1A", marginBottom: "8px" }}>No Orders Yet</h3>
                <p style={{ color: "#9CA3AF", marginBottom: "20px" }}>Order fresh meals from our menu</p>
                <Link href="/food" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--emt-red)", color: "white", borderRadius: "12px", padding: "10px 20px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}>
                  Browse Food →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {orders.map((order) => {
                  const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  const isPending = order.status === "pending";
                  return (
                    <div
                      key={order.id}
                      className="animate-fade-up stagger-child"
                      style={{
                        background: "white", borderRadius: "16px",
                        padding: "16px", border: "1px solid rgba(212,184,150,0.15)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <h3 style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", margin: 0 }}>
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "3px 0 0" }}>
                            {new Date(order.created_at).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px",
                          background: status.bg, color: status.text,
                        }}>
                          {status.label}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <div>
                            <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0, fontWeight: 600 }}>TOTAL</p>
                            <p style={{ fontWeight: 900, fontSize: "18px", color: "#E8392A", margin: "2px 0 0" }}>₹{order.total_amount}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0, fontWeight: 600 }}>PAYMENT</p>
                            <p style={{ fontWeight: 700, fontSize: "12px", color: "#4A3A2A", margin: "4px 0 0", textTransform: "uppercase" }}>
                              {order.payment_method}
                            </p>
                          </div>
                        </div>

                        {isPending && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelling === order.id}
                            style={{
                              display: "flex", alignItems: "center", gap: "4px",
                              fontSize: "11px", fontWeight: 700, color: "#E8392A",
                              background: "rgba(232,57,42,0.08)", border: "none",
                              borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
                              opacity: cancelling === order.id ? 0.5 : 1,
                            }}
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
              <div style={{ textAlign: "center", padding: "60px" }}>
                <RefreshCw size={24} style={{ color: "#9CA3AF", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              </div>
            ) : (
              <>
                {/* Subscriptions */}
                <h3 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", marginBottom: "12px" }}>📋 Subscriptions</h3>
                {subscriptions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "16px", marginBottom: "20px", border: "1px solid rgba(212,184,150,0.15)" }}>
                    <p style={{ color: "#9CA3AF" }}>No subscriptions yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {subscriptions.map((sub) => (
                      <div key={sub.id} style={{ background: "white", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(212,184,150,0.15)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", margin: 0 }}>
                              {sub.plan?.title || (sub.category === "veg" ? "Veg Plan" : "Non-Veg Plan")}
                            </p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "3px 0 0" }}>
                              {sub.remaining_days}/{sub.total_days} days · Started {new Date(sub.starts_at).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px",
                            background: sub.status === "active" ? "rgba(27,94,48,0.1)" : sub.status === "paused" ? "rgba(245,166,35,0.1)" : "rgba(156,163,175,0.1)",
                            color: sub.status === "active" ? "#1B5E30" : sub.status === "paused" ? "#D97706" : "#6B7280",
                            textTransform: "capitalize",
                          }}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payments */}
                <h3 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", marginBottom: "12px" }}>💳 Payment History</h3>
                {payments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "16px", border: "1px solid rgba(212,184,150,0.15)" }}>
                    <p style={{ color: "#9CA3AF" }}>No payment records yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {payments.map((pay) => (
                      <div key={pay.id} style={{
                        background: "white", borderRadius: "14px", padding: "14px 16px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        border: "1px solid rgba(212,184,150,0.15)"
                      }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>
                            {pay.payment_method?.toUpperCase() || "PAYMENT"}
                          </p>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "3px 0 0" }}>
                            {new Date(pay.created_at).toLocaleDateString("en-IN")}
                            {pay.transaction_id && ` · TXN: ${pay.transaction_id.slice(0, 12)}…`}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: 900, fontSize: "16px", color: "#1A1A1A", margin: 0 }}>₹{pay.amount}</p>
                          <span style={{
                            fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
                            background: pay.payment_status === "paid" ? "rgba(27,94,48,0.1)" : "rgba(232,57,42,0.1)",
                            color: pay.payment_status === "paid" ? "#1B5E30" : "#E8392A",
                          }}>
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
      </main>

      <BottomNav />
    </div>
  );
}
