"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, ChevronDown } from "lucide-react";

type Order = {
  id: string; user_id: string; status: string; payment_status: string;
  payment_method: string; total_amount: number; time_slot: string;
  created_at: string; notes: string | null;
  user: { full_name: string; phone: string } | null;
  assigned_delivery_boy: string | null;
};

const ORDER_STATUSES = ["pending", "preparing", "assigned", "out_for_delivery", "delivered", "cancelled"];
const STATUS_CHIP: Record<string, { bg: string; text: string }> = {
  pending: { bg: "rgba(245,158,11,0.1)", text: "#D97706" },
  preparing: { bg: "rgba(99,102,241,0.1)", text: "#6366F1" },
  assigned: { bg: "rgba(14,165,233,0.1)", text: "#0EA5E9" },
  out_for_delivery: { bg: "rgba(232,57,42,0.1)", text: "#E8392A" },
  delivered: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30" },
  cancelled: { bg: "rgba(156,163,175,0.1)", text: "#6B7280" },
};
const PAY_CHIP: Record<string, { bg: string; text: string }> = {
  pending: { bg: "rgba(245,158,11,0.1)", text: "#D97706" },
  paid: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30" },
  failed: { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const channelRef = useRef<any>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("food_orders")
      .select("*, user:users(full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(100);
    setOrders((data as any) || []);

    const { data: boys } = await supabase.from("users").select("id, full_name").eq("role", "delivery_boy").eq("status", "active");
    setDeliveryBoys(boys || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    channelRef.current = supabase.channel("admin:orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "food_orders" }, fetchOrders)
      .subscribe();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("food_orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) {
      showToast(`Status updated to "${newStatus}"`);
      // If preparing: deduct meal day (subscription logic)
      if (newStatus === "preparing") {
        await fetch("/api/admin/orders/deduct-meal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      }
      // If assigned: create delivery_assignment if not exists
      if (newStatus === "assigned") {
        const order = orders.find((o) => o.id === orderId);
        if (order?.assigned_delivery_boy) {
          await supabase.from("delivery_assignments").upsert([{
            order_id: orderId, delivery_boy_id: order.assigned_delivery_boy, status: "assigned",
          }], { onConflict: "order_id" });
        }
      }
    } else showToast("Update failed", "error");
  };

  const handleAssignDelivery = async (orderId: string, boyId: string) => {
    const { error } = await supabase.from("food_orders").update({ assigned_delivery_boy: boyId }).eq("id", orderId);
    if (!error) showToast("Delivery boy assigned!");
    else showToast("Failed", "error");
  };

  const handleVerifyCOD = async (orderId: string) => {
    const res = await fetch("/api/admin/payments/verify-cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
    const result = await res.json();
    if (result.success) showToast("COD payment verified!");
    else showToast(result.error || "Failed", "error");
  };

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) { setExpandedOrder(expandedOrder === orderId ? null : orderId); return; }
    const { data } = await supabase.from("food_order_items").select("*, menu:menus(title, category)").eq("order_id", orderId);
    setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }));
    setExpandedOrder(orderId);
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.user?.full_name?.toLowerCase().includes(q) || o.user?.phone?.includes(q) || o.id.includes(q);
    }
    return true;
  });

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>{toast.type === "success" ? "✅ " : "❌ "}{toast.msg}</div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", margin: 0 }}>Food Orders</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>{filtered.length} orders</p>
        </div>
        <button onClick={fetchOrders} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid rgba(212,184,150,0.3)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input placeholder="Search by name, phone, order ID…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
        {["all", ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", textTransform: "capitalize", border: "1px solid", background: statusFilter === s ? "#1A1A1A" : "white", color: statusFilter === s ? "white" : "#4A3A2A", borderColor: statusFilter === s ? "#1A1A1A" : "rgba(212,184,150,0.3)" }}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "16px", border: "1px solid rgba(212,184,150,0.15)", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(212,184,150,0.15)" }}>
                {["Order", "Customer", "Slot", "Amount", "Status", "Payment", "Delivery Boy", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No orders found</td></tr>
              ) : filtered.map((order) => {
                const sc = STATUS_CHIP[order.status] || STATUS_CHIP.cancelled;
                const pc = PAY_CHIP[order.payment_status] || PAY_CHIP.pending;
                return (
                  <>
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(212,184,150,0.08)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => loadOrderItems(order.id)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "12px", color: "#6366F1", display: "flex", alignItems: "center", gap: "4px" }}>
                          #{order.id.slice(0, 8).toUpperCase()} <ChevronDown size={12} style={{ transform: expandedOrder === order.id ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
                        </button>
                        <p style={{ fontSize: "10px", color: "#9CA3AF", margin: "2px 0 0" }}>{new Date(order.created_at).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{order.user?.full_name || "—"}</p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "1px 0 0" }}>{order.user?.phone || "—"}</p>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "#6B7280", textTransform: "capitalize" }}>
                        {order.time_slot === "lunch" ? "🌤️ Lunch" : "🌙 Dinner"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A" }}>₹{order.total_amount}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{ fontSize: "11px", padding: "5px 8px", borderRadius: "7px", border: `1px solid ${sc.bg}`, background: sc.bg, color: sc.text, fontWeight: 700, cursor: "pointer", outline: "none" }}>
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-block", fontWeight: 700, padding: "4px 8px", borderRadius: "999px", background: pc.bg, color: pc.text, textTransform: "uppercase", fontSize: "10px" }}>
                          {order.payment_method === "cod" ? "COD" : "PhonePe"} · {order.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <select defaultValue={order.assigned_delivery_boy || ""} onChange={(e) => handleAssignDelivery(order.id, e.target.value)}
                          style={{ fontSize: "11px", padding: "5px 8px", borderRadius: "7px", border: "1px solid rgba(212,184,150,0.3)", background: "white", cursor: "pointer", outline: "none" }}>
                          <option value="">Unassigned</option>
                          {deliveryBoys.map((b) => <option key={b.id} value={b.id}>{b.full_name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {order.payment_method === "cod" && order.payment_status === "pending" && (
                          <button onClick={() => handleVerifyCOD(order.id)} style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(27,94,48,0.1)", color: "#1B5E30", border: "none", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                            ✓ Verify COD
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedOrder === order.id && orderItems[order.id] && (
                      <tr key={order.id + "_items"} style={{ background: "#F8FAFC" }}>
                        <td colSpan={8} style={{ padding: "12px 24px 16px" }}>
                          <p style={{ fontSize: "11px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "8px" }}>Order Items</p>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {orderItems[order.id].map((item) => (
                              <div key={item.id} style={{ background: "white", borderRadius: "8px", padding: "8px 12px", border: "1px solid rgba(212,184,150,0.2)", fontSize: "12px" }}>
                                <span style={{ fontWeight: 700 }}>{item.menu?.title || "—"}</span>
                                <span style={{ color: "#9CA3AF", marginLeft: "6px" }}>x{item.quantity} · ₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                          {order.notes && <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px" }}>Note: {order.notes}</p>}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
