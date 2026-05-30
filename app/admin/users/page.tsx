"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, Shield, Bike, User } from "lucide-react";

type AppUser = {
  id: string; full_name: string; email: string; phone: string;
  role: string; status: string; city: string; has_used_trial: boolean;
  is_phone_verified: boolean; created_at: string;
};

const ROLE_CHIP: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  admin: { bg: "rgba(232,57,42,0.1)", text: "#E8392A", icon: <Shield size={11} /> },
  delivery_boy: { bg: "rgba(14,165,233,0.1)", text: "#0EA5E9", icon: <Bike size={11} /> },
  customer: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30", icon: <User size={11} /> },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch("/api/admin/users/role", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    const result = await res.json();
    if (result.success) { showToast(`Role changed to ${newRole}`); fetchUsers(); }
    else showToast(result.error || "Failed", "error");
  };

  const handleBlockToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    if (!confirm(`${newStatus === "blocked" ? "Block" : "Unblock"} this user?`)) return;
    const res = await fetch("/api/admin/users/status", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: newStatus }),
    });
    const result = await res.json();
    if (result.success) { showToast(`User ${newStatus}`); fetchUsers(); }
    else showToast(result.error || "Failed", "error");
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.full_name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>{toast.type === "success" ? "✅ " : "❌ "}{toast.msg}</div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", margin: 0 }}>Users</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>{filtered.length} of {users.length}</p>
        </div>
        <button onClick={fetchUsers} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid rgba(212,184,150,0.3)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input placeholder="Search name, phone, email…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
        {["all", "customer", "delivery_boy", "admin"].map((r) => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", textTransform: "capitalize", border: "1px solid", background: roleFilter === r ? "#1A1A1A" : "white", color: roleFilter === r ? "white" : "#4A3A2A", borderColor: roleFilter === r ? "#1A1A1A" : "rgba(212,184,150,0.3)" }}>
            {r.replace("_", " ")}
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "16px", border: "1px solid rgba(212,184,150,0.15)", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(212,184,150,0.15)" }}>
                {["User", "Contact", "Role", "Status", "Verified", "Trial Used", "Joined", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Loading…</td></tr>
              ) : filtered.map((u) => {
                const rc = ROLE_CHIP[u.role] || ROLE_CHIP.customer;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(212,184,150,0.08)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #E8392A, #B91C1C)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "12px", flexShrink: 0 }}>
                          {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{u.full_name}</p>
                          <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>{u.city}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <p style={{ fontSize: "12px", color: "#4A3A2A", margin: 0 }}>{u.phone}</p>
                      <p style={{ fontSize: "10px", color: "#9CA3AF", margin: "1px 0 0" }}>{u.email}</p>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ fontSize: "11px", padding: "5px 8px", borderRadius: "7px", border: `1px solid ${rc.bg}`, background: rc.bg, color: rc.text, fontWeight: 700, cursor: "pointer", outline: "none" }}>
                        <option value="customer">Customer</option>
                        <option value="delivery_boy">Delivery Boy</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: u.status === "active" ? "rgba(27,94,48,0.1)" : "rgba(239,68,68,0.1)", color: u.status === "active" ? "#1B5E30" : "#EF4444" }}>{u.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "18px" }}>{u.is_phone_verified ? "✅" : "❌"}</td>
                    <td style={{ padding: "12px 14px", fontSize: "18px" }}>{u.has_used_trial ? "✅" : "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: "11px", color: "#9CA3AF" }}>
                      {new Date(u.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={() => handleBlockToggle(u.id, u.status)}
                        style={{ padding: "5px 12px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700, background: u.status === "blocked" ? "rgba(27,94,48,0.1)" : "rgba(239,68,68,0.1)", color: u.status === "blocked" ? "#1B5E30" : "#EF4444" }}>
                        {u.status === "blocked" ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
