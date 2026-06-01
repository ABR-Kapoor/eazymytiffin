"use client";

import { useEffect, useState, useRef, Fragment } from "react";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, ChevronDown, ShoppingBag, Sun, Moon } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";

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
      .select("*, user:users!food_orders_user_id_fkey(full_name, phone)")
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
      showToast(`Status updated to "${newStatus}" successfully`);
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
    if (!error) showToast("Delivery boy assigned successfully!");
    else showToast("Failed", "error");
  };

  const handleVerifyCOD = async (orderId: string) => {
    const res = await fetch("/api/admin/payments/verify-cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
    const result = await res.json();
    if (result.success) showToast("COD payment verified successfully!");
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
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>{toast.msg}</div>}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#E8392A]" style={{ background: "rgba(232, 57, 42, 0.1)" }}>
              <ShoppingBag size={20} />
            </div>
            Food Orders
          </h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1.5 font-medium ml-[48px]">{filtered.length} matching orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-glare flex items-center justify-center gap-2 bg-white border border-[rgba(212,184,150,0.3)] hover:border-[#E8392A] hover:text-[#E8392A] text-[#4A3A2A] rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-sm transition-all h-fit w-fit">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative flex-1 min-w-[240px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input placeholder="Search by name, phone, order ID…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(212,184,150,0.3)] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E8392A] focus:border-transparent transition-all shadow-sm" />
        </div>
        <div className="flex flex-wrap gap-2 items-center bg-white p-1.5 rounded-xl border border-[rgba(212,184,150,0.2)] shadow-sm h-fit no-scrollbar overflow-x-auto">
          {["all", ...ORDER_STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} 
              className={`px-3 py-2 rounded-lg text-[12px] font-bold capitalize transition-all duration-200 whitespace-nowrap ${statusFilter === s ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"}`}>
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[rgba(212,184,150,0.2)] overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#E5E7EB] border-b border-[#D1D5DB]">
                {["Order", "Customer", "Slot", "Amount", "Status", "Payment", "Delivery Boy", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-[11px] font-extrabold text-[#4B5563] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(212,184,150,0.1)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#9CA3AF]">
                    <div className="w-8 h-8 border-4 border-[#E8392A] border-opacity-20 border-t-[#E8392A] rounded-full animate-spin mx-auto mb-3" />
                    <span className="font-medium text-sm">Loading orders…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#9CA3AF]">
                    <span className="font-medium text-sm">No orders found matching your criteria.</span>
                  </td>
                </tr>
              ) : filtered.map((order) => {
                const sc = STATUS_CHIP[order.status] || STATUS_CHIP.cancelled;
                const pc = PAY_CHIP[order.payment_status] || PAY_CHIP.pending;
                return (
                  <Fragment key={order.id}>
                    <tr className="even:bg-gray-100 hover:bg-gray-200 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => loadOrderItems(order.id)} className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-bold text-[12px] text-[#6366F1] hover:text-[#4F46E5] transition-colors p-0">
                          <span className="font-mono bg-[#6366F1]/10 px-1.5 py-0.5 rounded">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${expandedOrder === order.id ? "rotate-180" : ""}`} />
                        </button>
                        <p className="text-[11px] text-[#9CA3AF] font-medium m-0 mt-1">{new Date(order.created_at).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8392A] to-[#B91C1C] flex items-center justify-center text-white font-extrabold text-[14px] shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {order.user?.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-[14px] text-[#1A1A1A] m-0">{order.user?.full_name || "—"}</p>
                            <p className="text-[11px] text-[#9CA3AF] font-medium m-0 mt-0.5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" /> {order.user?.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-[#6B7280] capitalize">
                        {order.time_slot === "lunch" ? <span className="inline-flex items-center gap-1.5"><Sun size={14}/> Lunch</span> : <span className="inline-flex items-center gap-1.5"><Moon size={14}/> Dinner</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-extrabold text-[15px] text-[#1A1A1A]">₹{order.total_amount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CustomSelect 
                          value={order.status} 
                          onChange={(val) => handleStatusChange(order.id, val)}
                          options={ORDER_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, " ") }))}
                          style={{ minWidth: "120px" }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex flex-col gap-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider rounded-md px-2 py-0.5 w-fit" style={{ background: pc.bg, color: pc.text }}>
                            {order.payment_method === "cod" ? "COD" : "PhonePe"}
                          </span>
                          <span className="text-[11px] font-semibold text-[#6B7280] ml-0.5">{order.payment_status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CustomSelect 
                          value={order.assigned_delivery_boy || ""} 
                          onChange={(val) => handleAssignDelivery(order.id, val)}
                          options={[
                            { value: "", label: "Unassigned" },
                            ...deliveryBoys.map(b => ({ value: b.id, label: b.full_name }))
                          ]}
                          style={{ minWidth: "120px" }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.payment_method === "cod" && order.payment_status === "pending" && (
                          <button onClick={() => handleVerifyCOD(order.id)} className="px-4 py-1.5 rounded-lg bg-[#1B5E30]/10 text-[#1B5E30] hover:bg-[#1B5E30] hover:text-white border-none text-[11px] font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1.5">
                            ✓ Verify COD
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedOrder === order.id && orderItems[order.id] && (
                      <tr className="bg-[#F8FAFC] border-b border-[rgba(212,184,150,0.1)]">
                        <td colSpan={8} className="px-6 py-4 pb-6">
                          <p className="text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-3 m-0">Order Items</p>
                          <div className="flex flex-wrap gap-2.5">
                            {orderItems[order.id].map((item) => (
                              <div key={item.id} className="bg-white rounded-lg px-3 py-2 border border-[rgba(212,184,150,0.2)] text-[12px] shadow-sm flex items-center gap-2">
                                <span className="font-bold text-[#1A1A1A]">{item.menu?.title || "—"}</span>
                                <span className="text-[#6B7280] font-medium bg-gray-50 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                                <span className="text-[#4A3A2A] font-bold ml-1">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                          {order.notes && <p className="text-[12px] font-medium text-[#6B7280] mt-3 bg-white p-3 rounded-xl border border-gray-100 italic m-0">Note: {order.notes}</p>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
