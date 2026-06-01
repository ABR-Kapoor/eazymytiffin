"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Truck } from "lucide-react";

type Assignment = {
  id: string; order_id: string; delivery_boy_id: string; status: string; eta: string | null; proof_image: string | null; created_at: string;
  delivery_boy: { full_name: string; phone: string } | null;
  order: { total_amount: number; time_slot: string; user: { full_name: string; phone: string } | null; address: { area: string; city: string; google_map_link: string | null } | null } | null;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  assigned: { bg: "rgba(14,165,233,0.1)", text: "#0EA5E9" },
  on_the_way: { bg: "rgba(232,57,42,0.1)", text: "#E8392A" },
  arriving: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B" },
  delivered: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30" },
  failed: { bg: "rgba(156,163,175,0.1)", text: "#6B7280" },
};

export default function AdminDeliveriesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const channelRef = useRef<any>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const q = supabase
      .from("delivery_assignments")
      .select(`id, order_id, delivery_boy_id, status, eta, proof_image, created_at,
        delivery_boy:users!delivery_assignments_delivery_boy_id_fkey(full_name, phone),
        order:food_orders(total_amount, time_slot,
          user:users(full_name, phone),
          address:addresses(area, city, google_map_link)
        )`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter === "active") {
      q.not("status", "in", '("delivered","failed")');
    }

    const { data } = await q;
    setAssignments((data as any) || []);

    const { data: boys } = await supabase.from("users").select("id, full_name").eq("role", "delivery_boy").eq("status", "active");
    setDeliveryBoys(boys || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    channelRef.current = supabase.channel("admin:deliveries")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments" }, fetchData)
      .subscribe();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [statusFilter]);

  const handleAssign = async (orderId: string, deliveryBoyId: string) => {
    const { error } = await supabase.from("delivery_assignments").upsert([{
      order_id: orderId, delivery_boy_id: deliveryBoyId, status: "assigned",
    }], { onConflict: "order_id" });
    await supabase.from("food_orders").update({ status: "assigned", assigned_delivery_boy: deliveryBoyId }).eq("id", orderId);
    if (!error) showToast("Delivery boy assigned!");
    else showToast("Assignment failed", "error");
  };

  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => !["delivered", "failed"].includes(a.status)).length,
    delivered: assignments.filter((a) => a.status === "delivered").length,
    delayed: assignments.filter((a) => a.eta === "Delayed").length,
  };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600 }}>{toast.type === "success" ? "✅ " : "❌ "}{toast.msg}</div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", margin: 0 }}>Delivery Management</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>Monitor and assign deliveries</p>
        </div>
        <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid rgba(212,184,150,0.3)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total", value: stats.total, color: "#1A1A1A" },
          { label: "Active", value: stats.active, color: "#0EA5E9" },
          { label: "Delivered", value: stats.delivered, color: "#1B5E30" },
          { label: "Delayed", value: stats.delayed, color: "#E8392A" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(212,184,150,0.15)", textAlign: "center" }}>
            <p style={{ fontWeight: 900, fontSize: "28px", color: s.color, margin: "0 0 4px" }}>{s.value}</p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["active", "all"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: "7px 16px", borderRadius: "9px", fontSize: "12px", fontWeight: 700, cursor: "pointer", textTransform: "capitalize", border: "1px solid", background: statusFilter === f ? "#1A1A1A" : "white", color: statusFilter === f ? "white" : "#4A3A2A", borderColor: statusFilter === f ? "#1A1A1A" : "rgba(212,184,150,0.3)" }}>
            {f === "active" ? "Active Only" : "All Today"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF" }}>Loading deliveries…</p>
        </div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: "16px" }}>
          <Truck size={40} style={{ color: "#E5E7EB", margin: "0 auto 12px" }} />
          <p style={{ fontWeight: 700, color: "#1A1A1A" }}>No deliveries found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          {assignments.map((a) => {
            const sc = STATUS_COLORS[a.status] || STATUS_COLORS.failed;
            return (
              <div key={a.id} style={{ background: "white", borderRadius: "16px", border: `1px solid ${sc.bg}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(212,184,150,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>
                      🛵 {a.delivery_boy?.full_name || "Unassigned"}
                    </p>
                    <p style={{ fontSize: "10px", color: "#9CA3AF", margin: "2px 0 0" }}>{a.delivery_boy?.phone || "—"}</p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: sc.bg, color: sc.text, textTransform: "capitalize", whiteSpace: "nowrap" }}>
                    {a.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: "0 0 2px" }}>{a.order?.user?.full_name || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 8px" }}>
                    {a.order?.address?.area}, {a.order?.address?.city}
                    {a.order?.address?.google_map_link && (
                      <a href={a.order.address.google_map_link} target="_blank" rel="noreferrer" style={{ marginLeft: "6px", color: "#0EA5E9", fontWeight: 700, textDecoration: "none" }}>
                        📍 Map
                      </a>
                    )}
                  </p>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280" }}>
                      {a.order?.time_slot === "lunch" ? "🌤️ Lunch" : "🌙 Dinner"} · ₹{a.order?.total_amount}
                    </span>
                    {a.eta && <span style={{ fontSize: "11px", fontWeight: 700, color: a.eta === "Delayed" ? "#E8392A" : "#D97706" }}>⏱ {a.eta}</span>}
                    {a.proof_image && (
                      <a href={a.proof_image} target="_blank" rel="noreferrer" style={{ fontSize: "11px", fontWeight: 700, color: "#0EA5E9", textDecoration: "none" }}>📸 Proof</a>
                    )}
                  </div>

                  {/* Reassign */}
                  {a.status !== "delivered" && (
                    <div style={{ marginTop: "10px" }}>
                      <select defaultValue={a.delivery_boy_id || ""} onChange={(e) => handleAssign(a.order_id, e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "12px", outline: "none", fontWeight: 600 }}>
                        <option value="">— Reassign —</option>
                        {deliveryBoys.map((b) => <option key={b.id} value={b.id}>{b.full_name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
