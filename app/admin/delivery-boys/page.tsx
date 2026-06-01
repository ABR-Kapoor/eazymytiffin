"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bike, UserPlus, UserMinus } from "lucide-react";

type DeliveryBoy = {
  id: string; full_name: string; phone: string; email: string; city: string;
  status: string; created_at: string;
  _deliveryCount?: number;
};

export default function AdminDeliveryBoysPage() {
  const [boys, setBoys] = useState<DeliveryBoy[]>([]);
  const [customers, setCustomers] = useState<{ id: string; full_name: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [promoteUserId, setPromoteUserId] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const { data: boyData } = await supabase.from("users").select("*").eq("role", "delivery_boy").order("created_at", { ascending: false });
    const { data: custData } = await supabase.from("users").select("id, full_name, phone").eq("role", "customer").eq("status", "active");
    setBoys((boyData as DeliveryBoy[]) || []);
    setCustomers(custData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePromote = async () => {
    if (!promoteUserId) return;
    const res = await fetch("/api/admin/users/role", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: promoteUserId, role: "delivery_boy" }) });
    const result = await res.json();
    if (result.success) { showToast("User promoted to Delivery Boy!"); setPromoteUserId(""); fetchData(); }
    else showToast(result.error || "Failed", "error");
  };

  const handleDemote = async (userId: string) => {
    if (!confirm("Remove delivery boy role? They'll become a customer.")) return;
    const res = await fetch("/api/admin/users/role", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role: "customer" }) });
    const result = await res.json();
    if (result.success) { showToast("Role removed."); fetchData(); }
    else showToast(result.error || "Failed", "error");
  };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600 }}>{toast.type === "success" ? "✅ " : "❌ "}{toast.msg}</div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", margin: 0 }}>Delivery Boys</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>{boys.length} active</p>
        </div>
      </div>

      {/* Promote customer to delivery boy */}
      <div style={{ background: "white", borderRadius: "16px", padding: "18px 20px", border: "1px solid rgba(212,184,150,0.15)", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "6px" }}>
            <UserPlus size={12} style={{ display: "inline", marginRight: "4px" }} /> Promote customer to Delivery Boy
          </label>
          <select value={promoteUserId} onChange={(e) => setPromoteUserId(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none" }}>
            <option value="">— Select customer —</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
          </select>
        </div>
        <button onClick={handlePromote} disabled={!promoteUserId}
          style={{ padding: "9px 20px", background: "#0EA5E9", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: !promoteUserId ? "not-allowed" : "pointer", opacity: !promoteUserId ? 0.5 : 1, whiteSpace: "nowrap" }}>
          Assign Role
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#9CA3AF", padding: "40px 0" }}>Loading…</p>
      ) : boys.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", padding: "60px", textAlign: "center" }}>
          <Bike size={40} style={{ color: "#E5E7EB", margin: "0 auto 12px" }} />
          <p style={{ fontWeight: 700, color: "#1A1A1A" }}>No delivery boys yet</p>
          <p style={{ color: "#9CA3AF", fontSize: "13px" }}>Promote a customer using the panel above</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {boys.map((b) => (
            <div key={b.id} style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid rgba(14,165,233,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #0EA5E9, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "18px", flexShrink: 0 }}>
                  {b.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", margin: 0 }}>{b.full_name}</p>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0" }}>{b.phone}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(14,165,233,0.1)", color: "#0EA5E9", borderRadius: "999px", padding: "3px 10px" }}>🛵 Delivery Boy</span>
                <span style={{ fontSize: "11px", fontWeight: 700, background: b.status === "active" ? "rgba(27,94,48,0.1)" : "rgba(239,68,68,0.1)", color: b.status === "active" ? "#1B5E30" : "#EF4444", borderRadius: "999px", padding: "3px 10px" }}>
                  {b.status}
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 10px" }}>{b.city} · Joined {new Date(b.created_at).toLocaleDateString("en-IN")}</p>
              <a href={`tel:${b.phone}`} style={{ display: "block", textAlign: "center", padding: "8px", borderRadius: "9px", background: "rgba(14,165,233,0.08)", color: "#0EA5E9", fontWeight: 700, fontSize: "12px", textDecoration: "none", marginBottom: "8px" }}>
                📞 Call
              </a>
              <button onClick={() => handleDemote(b.id)}
                style={{ width: "100%", padding: "8px", borderRadius: "9px", background: "rgba(239,68,68,0.06)", color: "#EF4444", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <UserMinus size={13} /> Remove Role
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
