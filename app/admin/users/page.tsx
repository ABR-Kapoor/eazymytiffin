"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, Shield, Bike, User, Users, Pencil, Plus, Trash2, Home, Building, Briefcase, MapPin, X } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/lib/useToast";

type Address = {
  id: string; user_id: string; type: "home" | "hostel" | "office";
  house_flat_no: string | null; landmark: string | null;
  hostel_company_name: string | null; floor: string | null;
  area: string; city: string; google_map_link: string | null;
  is_default: boolean; created_at: string;
};

const ADDR_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  home: { label: "Home", icon: <Home size={14} />, color: "#0D9488", bg: "bg-[#0D9488]/10" },
  hostel: { label: "Hostel", icon: <Building size={14} />, color: "#6366F1", bg: "bg-[#6366F1]/10" },
  office: { label: "Office", icon: <Briefcase size={14} />, color: "#1BA672", bg: "bg-[#1BA672]/10" },
};

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
  const [addrUser, setAddrUser] = useState<AppUser | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState<Partial<Address>>({ type: "home", area: "", house_flat_no: "", landmark: "", city: "Bilaspur" });
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [savingAddr, setSavingAddr] = useState(false);
  const { toast, showToast } = useToast();

  const fetchAddresses = async (userId: string) => {
    setAddrLoading(true);
    const { data } = await supabase.from("addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false });
    setAddresses(data || []);
    setAddrLoading(false);
  };

  const openAddrModal = (u: AppUser) => {
    setAddrUser(u);
    setEditingAddrId(null);
    setAddrForm({ type: "home", area: "", house_flat_no: "", landmark: "", city: "Bilaspur" });
    fetchAddresses(u.id);
  };

  const closeAddrModal = () => {
    setAddrUser(null);
    setAddresses([]);
    setEditingAddrId(null);
    setAddrForm({ type: "home", area: "", house_flat_no: "", landmark: "", city: "Bilaspur" });
  };

  const startEditAddr = (addr: Address) => {
    setEditingAddrId(addr.id);
    setAddrForm({
      type: addr.type, area: addr.area,
      house_flat_no: addr.house_flat_no || "",
      landmark: addr.landmark || "",
      hostel_company_name: addr.hostel_company_name || "",
      floor: addr.floor || "",
      google_map_link: addr.google_map_link || "",
      city: addr.city,
    });
  };

  const cancelAddrEdit = () => {
    setEditingAddrId(null);
    setAddrForm({ type: "home", area: "", house_flat_no: "", landmark: "", city: "Bilaspur" });
  };

  const handleSaveAddr = async () => {
    if (!addrUser) return;
    if (!addrForm.area?.trim()) { showToast("Area is required", "error"); return; }
    setSavingAddr(true);

    if (editingAddrId) {
      const { error } = await supabase.from("addresses").update({
        type: addrForm.type, area: addrForm.area,
        house_flat_no: addrForm.house_flat_no || null,
        landmark: addrForm.landmark || null,
        hostel_company_name: addrForm.hostel_company_name || null,
        floor: addrForm.floor || null,
        google_map_link: addrForm.google_map_link || null,
        city: addrForm.city,
      }).eq("id", editingAddrId);
      if (!error) {
        setAddresses((prev) => prev.map((a) => a.id === editingAddrId ? { ...a, ...addrForm } as Address : a));
        cancelAddrEdit();
        showToast("Address updated");
      } else showToast("Failed to update", "error");
      setSavingAddr(false);
      return;
    }

    if (addresses.length >= 3) { showToast("Max 3 addresses", "error"); setSavingAddr(false); return; }
    const { data, error } = await supabase.from("addresses").insert([{
      user_id: addrUser.id, type: addrForm.type, area: addrForm.area,
      house_flat_no: addrForm.house_flat_no || null, landmark: addrForm.landmark || null,
      hostel_company_name: addrForm.hostel_company_name || null, floor: addrForm.floor || null,
      google_map_link: addrForm.google_map_link || null, city: addrForm.city || "Bilaspur",
      is_default: addresses.length === 0,
    }]).select().single();
    if (!error && data) {
      setAddresses((prev) => [...prev, data as any]);
      setAddrForm({ type: "home", area: "", house_flat_no: "", landmark: "", city: "Bilaspur" });
      showToast("Address added");
    } else showToast("Failed to add", "error");
    setSavingAddr(false);
  };

  const handleDeleteAddr = async (id: string) => {
    confirm({
      title: "Remove Address",
      message: "Are you sure you want to remove this address?",
      confirmText: "Remove",
      onConfirm: async () => {
        const { error } = await supabase.from("addresses").delete().eq("id", id);
        if (!error) { setAddresses((prev) => prev.filter((a) => a.id !== id)); showToast("Address removed"); }
        else showToast("Failed to remove", "error");
      }
    });
  };

  const handleSetDefaultAddr = async (id: string) => {
    if (!addrUser) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", addrUser.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    showToast("Default address updated");
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
                      <div className="flex items-center gap-2">
                        <button onClick={() => openAddrModal(u)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488] hover:text-white transition-all shadow-sm">
                          Addresses
                        </button>
                        <button onClick={() => handleBlockToggle(u.id, u.status)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${u.status === "blocked" ? "bg-[#1B5E30]/10 text-[#1B5E30] hover:bg-[#1B5E30] hover:text-white" : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white"}`}>
                          {u.status === "blocked" ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Address Management Modal */}
      {addrUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={closeAddrModal}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100 rounded-t-2xl">
              <div>
                <h3 className="font-extrabold text-[16px] text-[#1A1A1A] m-0">Manage Addresses</h3>
                <p className="text-[12px] text-[#9CA3AF] font-medium m-0 mt-0.5">{addrUser.full_name}</p>
              </div>
              <button onClick={closeAddrModal} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-none cursor-pointer hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {/* Address Form */}
              <div className="bg-[#F8F9FA] rounded-xl p-4 mb-4 border border-[#E8E8E8]">
                <div className="flex gap-2 mb-4">
                  {["home", "hostel", "office"].map((t) => {
                    const cfg = ADDR_TYPE_CONFIG[t];
                    return (
                      <button key={t} onClick={() => setAddrForm({ ...addrForm, type: t as "home" | "hostel" | "office" })}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold cursor-pointer border transition-all ${
                          addrForm.type === t
                            ? "text-white border-none shadow-sm"
                            : "bg-white text-[#686B78] border-[#E8E8E8] hover:bg-[#F8F9FA]"
                        }`}
                        style={addrForm.type === t ? { background: cfg.color } : {}}>
                        <span className="flex items-center justify-center gap-1.5">{cfg.icon} {cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {[
                    { key: "area", label: "Area / Street *", placeholder: "e.g. Sakri Road" },
                    { key: "house_flat_no", label: "House / Flat No.", placeholder: "e.g. B-42" },
                    { key: "landmark", label: "Landmark", placeholder: "Near bus stand" },
                    { key: "google_map_link", label: "Google Maps Link", placeholder: "https://maps.app.goo.gl/..." },
                  ].map((field) => (
                    <div key={field.key}>
                      <input type="text" placeholder={field.placeholder}
                        value={(addrForm as any)[field.key] || ""}
                        onChange={(e) => setAddrForm({ ...addrForm, [field.key]: e.target.value })}
                        className="w-full bg-white rounded-xl border border-[#E8E8E8] px-4 py-2.5 text-[13px] text-[#1C1C1C] outline-none transition-colors focus:border-[#0D9488] placeholder-[#93959F] font-medium" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  {editingAddrId ? (
                    <>
                      <button onClick={cancelAddrEdit} className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] bg-white font-bold text-[13px] text-[#686B78] cursor-pointer hover:bg-[#F8F9FA] transition-colors">Cancel</button>
                      <button onClick={handleSaveAddr} disabled={savingAddr} className="flex-1 py-2.5 rounded-xl bg-[#0D9488] text-white border-none font-bold text-[13px] cursor-pointer hover:bg-[#0F766E] transition-colors shadow-sm disabled:opacity-60">
                        {savingAddr ? "Saving..." : "Update"}
                      </button>
                    </>
                  ) : (
                    <button onClick={handleSaveAddr} disabled={savingAddr || addresses.length >= 3}
                      className="w-full py-2.5 rounded-xl bg-[#0D9488] text-white border-none font-bold text-[13px] cursor-pointer hover:bg-[#0F766E] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                      <Plus size={14} /> Add Address
                    </button>
                  )}
                </div>
              </div>

              {/* Addresses List */}
              {addrLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 rounded-full border-3 border-[#0D9488]/20 border-t-[#0D9488] animate-spin mx-auto mb-3" />
                  <p className="text-[13px] text-[#93959F] font-medium">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-3">
                    <MapPin size={20} className="text-[#D4D4D8]" />
                  </div>
                  <p className="text-[14px] text-[#686B78] m-0 font-medium">No addresses</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {addresses.map((addr) => {
                    const cfg = ADDR_TYPE_CONFIG[addr.type];
                    return (
                      <div key={addr.id} className="flex items-center gap-3 p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E8E8E8]">
                        <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`} style={{ color: cfg.color }}>{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-[13px] text-[#1C1C1C] m-0 capitalize">{cfg.label}</p>
                            {addr.is_default && <span className="text-[8px] font-extrabold uppercase bg-[#0D9488]/10 text-[#0D9488] rounded-full px-2 py-0.5">Default</span>}
                          </div>
                          <p className="text-[11px] text-[#686B78] m-0 truncate">{[addr.house_flat_no, addr.landmark, addr.area, addr.city].filter(Boolean).join(", ")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!addr.is_default && (
                            <button onClick={() => handleSetDefaultAddr(addr.id)}
                              className="text-[9px] font-bold text-[#1BA672] bg-[#1BA672]/10 rounded-full px-2 py-1 border-none cursor-pointer hover:bg-[#1BA672]/20 transition-colors uppercase tracking-wide">
                              Default
                            </button>
                          )}
                          <button onClick={() => startEditAddr(addr)} title="Edit" className="w-7 h-7 rounded-full bg-white border border-[#E8E8E8] flex items-center justify-center cursor-pointer hover:border-[#0D9488]/30 hover:bg-[#F0FDFA] transition-all">
                            <Pencil size={12} className="text-[#93959F]" />
                          </button>
                          <button onClick={() => handleDeleteAddr(addr.id)} title="Remove" className="w-7 h-7 rounded-full bg-white border border-[#E8E8E8] flex items-center justify-center cursor-pointer hover:border-red-200 hover:bg-red-50 transition-all">
                            <Trash2 size={12} className="text-[#93959F]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
