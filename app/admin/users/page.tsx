"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, Shield, Bike, User, Users } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";

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
  const { confirm } = useConfirm();
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
    confirm({
      title: "Change Role",
      message: `Are you sure you want to change this user's role to ${newRole}?`,
      confirmText: "Change Role",
      onCancel: () => fetchUsers(),
      onConfirm: async () => {
        const res = await fetch("/api/admin/users/role", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role: newRole }),
        });
        const result = await res.json();
        if (result.success) { showToast(`Role changed to ${newRole} successfully`); fetchUsers(); }
        else showToast(result.error || "Failed", "error");
      }
    });
  };

  const handleBlockToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    confirm({
      title: newStatus === "blocked" ? "Block User" : "Unblock User",
      message: `${newStatus === "blocked" ? "Block" : "Unblock"} this user?`,
      confirmText: newStatus === "blocked" ? "Block" : "Unblock",
      onConfirm: async () => {
        const res = await fetch("/api/admin/users/status", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, status: newStatus }),
        });
        const result = await res.json();
        if (result.success) { showToast(`User ${newStatus} successfully`); fetchUsers(); }
        else showToast(result.error || "Failed", "error");
      }
    });
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
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>{toast.msg}</div>}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8392A]/10 flex items-center justify-center text-[#E8392A]">
              <Users size={20} />
            </div>
            Users Management
          </h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1.5 font-medium ml-[48px]">Showing {filtered.length} of {users.length} total users</p>
        </div>
        <button onClick={fetchUsers} className="btn-glare flex items-center justify-center gap-2 bg-white border border-[rgba(212,184,150,0.3)] hover:border-[#E8392A] hover:text-[#E8392A] text-[#4A3A2A] rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-sm transition-all h-fit w-fit">
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative flex-1 min-w-[240px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input placeholder="Search name, phone, email…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(212,184,150,0.3)] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E8392A] focus:border-transparent transition-all shadow-sm" />
        </div>
        <div className="flex flex-wrap gap-2 items-center bg-white p-1.5 rounded-xl border border-[rgba(212,184,150,0.2)] shadow-sm h-fit">
          {["all", "customer", "delivery_boy", "admin"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} 
              className={`px-4 py-2 rounded-lg text-[12px] font-bold capitalize transition-all duration-200 ${roleFilter === r ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"}`}>
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[rgba(212,184,150,0.2)] overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#E5E7EB] border-b border-[#D1D5DB]">
                {["User", "Contact", "Role", "Status", "Verified", "Trial Used", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-[11px] font-extrabold text-[#4B5563] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(212,184,150,0.1)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#9CA3AF]">
                    <div className="w-8 h-8 border-4 border-[#E8392A] border-opacity-20 border-t-[#E8392A] rounded-full animate-spin mx-auto mb-3" />
                    <span className="font-medium text-sm">Loading users…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#9CA3AF]">
                    <span className="font-medium text-sm">No users found matching your filters.</span>
                  </td>
                </tr>
              ) : filtered.map((u) => {
                const rc = ROLE_CHIP[u.role] || ROLE_CHIP.customer;
                return (
                  <tr key={u.id} className="even:bg-gray-100 hover:bg-gray-200 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8392A] to-[#B91C1C] flex items-center justify-center text-white font-extrabold text-[14px] shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-[#1A1A1A] m-0">{u.full_name}</p>
                          <p className="text-[11px] text-[#9CA3AF] font-medium m-0 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" /> {u.city || "No City"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-[13px] font-semibold text-[#4A3A2A] m-0">{u.phone}</p>
                      <p className="text-[11px] text-[#9CA3AF] m-0 mt-0.5">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CustomSelect 
                        value={u.role} 
                        onChange={(val) => handleRoleChange(u.id, val)}
                        options={[
                          { value: "customer", label: "Customer" },
                          { value: "delivery_boy", label: "Delivery Boy" },
                          { value: "admin", label: "Admin" }
                        ]}
                        style={{ minWidth: "120px" }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${u.status === "active" ? "bg-[#1B5E30]/10 text-[#1B5E30]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-[#1B5E30]" : "bg-[#EF4444]"}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-bold">
                      {u.is_phone_verified ? <span className="text-[#1B5E30] flex items-center gap-1"><span className="text-[18px]">✓</span> Yes</span> : <span className="text-[#9CA3AF]">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-bold">
                      {u.has_used_trial ? <span className="text-[#6366F1] flex items-center gap-1"><span className="text-[18px]">★</span> Yes</span> : <span className="text-[#9CA3AF]">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[12px] font-medium text-[#9CA3AF]">
                      {new Date(u.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleBlockToggle(u.id, u.status)}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${u.status === "blocked" ? "bg-[#1B5E30]/10 text-[#1B5E30] hover:bg-[#1B5E30] hover:text-white" : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white"}`}>
                        {u.status === "blocked" ? "Unblock" : "Block User"}
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
