"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { useConfirm } from "@/components/ConfirmProvider";
import Link from "next/link";
import {
  LogOut, Save, Edit2, Check, X, Phone, Mail, MapPin,
  Shield, Star, Plus, Trash2, Home, Building, Briefcase, Smartphone
} from "lucide-react";

type Address = {
  id: string;
  type: "home" | "hostel" | "office";
  house_flat_no: string | null;
  landmark: string | null;
  hostel_company_name: string | null;
  floor: string | null;
  area: string;
  city: string;
  google_map_link: string | null;
  is_default: boolean;
  created_at: string;
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={16} />,
  hostel: <Building size={16} />,
  office: <Briefcase size={16} />,
};

const TYPE_COLORS: Record<string, string> = {
  home: "#E8392A",
  hostel: "#6366F1",
  office: "#1B5E30",
};

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const isAdmin = useUserStore((s) => s.isAdmin)();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone: "", city: "Bilaspur" });
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addingAddr, setAddingAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ type: "home", area: "", house_flat_no: "", landmark: "", hostel_company_name: "", floor: "", google_map_link: "", city: "Bilaspur" });
  const { confirm } = useConfirm();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user) {
      setFormData({ full_name: user.full_name || "", phone: user.phone || "", city: user.city || "Bilaspur" });
    }
  }, [user]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      setAddresses(data || []);
      setAddrLoading(false);
    };
    fetchAddresses();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ full_name: formData.full_name, phone: formData.phone, city: formData.city })
      .eq("id", user.id);
    if (!error) {
      setUser({ ...user, ...formData });
      setEditing(false);
      showToast("Profile updated successfully!");
    } else {
      showToast("Failed to update profile.", "error");
    }
    setSaving(false);
  };

  const handleAddAddress = async () => {
    if (!user) return;
    if (!newAddr.area.trim()) { showToast("Area is required", "error"); return; }
    if (addresses.length >= 3) { showToast("Maximum 3 addresses allowed", "error"); return; }
    const { data, error } = await supabase
      .from("addresses")
      .insert([{
        user_id: user.id,
        type: newAddr.type,
        area: newAddr.area,
        house_flat_no: newAddr.house_flat_no || null,
        landmark: newAddr.landmark || null,
        hostel_company_name: newAddr.hostel_company_name || null,
        floor: newAddr.floor || null,
        google_map_link: newAddr.google_map_link || null,
        city: newAddr.city,
        is_default: addresses.length === 0,
      }])
      .select().single();
    if (!error && data) {
      setAddresses((prev) => [...prev, data as any]);
      setAddingAddr(false);
      setNewAddr({ type: "home", area: "", house_flat_no: "", landmark: "", hostel_company_name: "", floor: "", google_map_link: "", city: "Bilaspur" });
      showToast("Address added successfully!");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    confirm({
      title: "Remove Address",
      message: "Are you sure you want to remove this address?",
      confirmText: "Remove",
      onConfirm: async () => {
        const { error } = await supabase.from("addresses").delete().eq("id", id);
        if (!error) setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    });
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
  };

  return (
    <>
      {toast && (
        <div className={`fixed top-[72px] right-4 z-[200] text-white rounded-xl py-3 px-5 text-[13px] font-semibold shadow-lg animate-slide-left ${toast.type === "success" ? "bg-[#1B5E30]" : "bg-[#E8392A]"}`}>
          {toast.msg}
        </div>
      )}
      <div className="max-w-[960px] mx-auto">
        {/* Profile Hero */}
        <div className="animate-fade-up bg-gradient-to-br from-[#1A1A1A] to-[#2D1A0A] rounded-3xl p-7 mb-5 text-white relative overflow-hidden">
          <div className="absolute -right-5 -top-5 w-[120px] h-[120px] rounded-full bg-[#E8392A]/10" />
          <div className="relative flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#E8392A] to-[#B91C1C] flex items-center justify-center font-black text-[28px] border-[3px] border-white/20">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="font-black text-[20px] m-0 tracking-tight">{user?.full_name || "—"}</h1>
              <p style={{ fontSize: "12px", opacity: 0.6, margin: "4px 0" }}>{user?.email}</p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
                  background: user?.role === "admin" ? "rgba(232,57,42,0.3)" : "rgba(255,255,255,0.15)",
                  color: user?.role === "admin" ? "#FECACA" : "white",
                  borderRadius: "999px", padding: "3px 10px"
                }}>
                  {user?.role === "admin" && <Shield size={10} style={{ display: "inline", marginRight: "4px" }} />}
                  {user?.role || "customer"}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px",
                  background: user?.status === "active" ? "rgba(27,94,48,0.3)" : "rgba(232,57,42,0.3)",
                  color: user?.status === "active" ? "#86EFAC" : "#FECACA",
                  borderRadius: "999px", padding: "3px 10px"
                }}>
                  {user?.status === "active" ? <Check size={10} /> : <X size={10} />}
                  {user?.status === "active" ? "Active" : "Blocked"}
                </span>
                {user?.is_phone_verified && (
                  <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(99,102,241,0.3)", color: "#C7D2FE", borderRadius: "999px", padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Smartphone size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card-lift animate-fade-up stagger-child bg-white rounded-2xl p-5 mb-4 border border-[#D4B896]/15 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold text-[15px] text-[#1A1A1A] m-0">Profile Info</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-[12px] font-bold text-[#E8392A] bg-[#E8392A]/10 border-none rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#E8392A]/20 transition-colors"
              >
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setFormData({ full_name: user?.full_name || "", phone: user?.phone || "", city: user?.city || "Bilaspur" }); }}
                  className="text-[12px] font-bold text-[#6B7280] bg-black/5 border-none rounded-lg px-3 py-1.5 cursor-pointer flex items-center gap-1 hover:bg-black/10 transition-colors"
                ><X size={13} /> Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className={`text-[12px] font-bold text-white bg-[#E8392A] border-none rounded-lg px-3 py-1.5 cursor-pointer flex items-center gap-1 transition-colors hover:bg-[#B91C1C] ${saving ? "opacity-60" : ""}`}
                ><Save size={13} /> {saving ? "Saving…" : "Save"}</button>
              </div>
            )}
          </div>

          {[
            { key: "full_name", label: "Full Name", icon: <Star size={14} />, type: "text" },
            { key: "phone", label: "Phone", icon: <Phone size={14} />, type: "tel" },
            { key: "city", label: "City", icon: <MapPin size={14} />, type: "text" },
          ].map((field) => (
            <div key={field.key} className="mb-3.5">
              <label className="text-[11px] font-bold text-[#9CA3AF] flex items-center gap-1 mb-1.5">
                {field.icon} {field.label}
              </label>
              <input
                type={field.type}
                value={(formData as any)[field.key]}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                disabled={!editing}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[14px] text-[#1A1A1A] outline-none transition-all ${editing ? "bg-white border-emt-red/30 cursor-text font-medium focus:ring-2 focus:ring-emt-red/20 focus:border-emt-red" : "bg-[var(--emt-cream)] border-[#D4B896]/20 cursor-not-allowed font-semibold"}`}
              />
            </div>
          ))}

          {/* Email (readonly) */}
          <div>
            <label className="text-[11px] font-bold text-[#9CA3AF] flex items-center gap-1 mb-1.5">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              value={clerkUser?.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="w-full px-3.5 py-2.5 border border-[#D4B896]/15 rounded-xl bg-[var(--emt-cream)] text-[14px] text-[#6B7280] outline-none cursor-not-allowed"
            />
            <p className="text-[10px] text-[#D1D5DB] m-0 mt-1">Email cannot be changed</p>
          </div>

          {user?.has_used_trial && (
            <div className="mt-3.5 px-3.5 py-2.5 bg-[#F5A623]/10 rounded-xl border border-[#F5A623]/20">
              <p className="text-[12px] font-semibold text-[#D97706] m-0">
                You've used your free trial meal
              </p>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="card-lift animate-fade-up stagger-child bg-white rounded-2xl p-5 mb-4 border border-[#D4B896]/15 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold text-[15px] text-[#1A1A1A] m-0 flex items-center">
              <MapPin size={15} className="mr-1.5" />
              Addresses ({addresses.length}/3)
            </h2>
            {addresses.length < 3 && !addingAddr && (
              <button
                onClick={() => setAddingAddr(true)}
                className="flex items-center gap-1 text-[12px] font-bold text-[#E8392A] bg-[#E8392A]/10 border-none rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#E8392A]/20 transition-colors"
              >
                <Plus size={13} /> Add
              </button>
            )}
          </div>

          {addingAddr && (
            <div className="bg-[var(--emt-cream)] rounded-xl p-4 mb-3.5 border border-[#D4B896]/30">
              <div className="flex gap-1.5 mb-3">
                {["home", "hostel", "office"].map((t) => (
                  <button key={t} onClick={() => setNewAddr({ ...newAddr, type: t })} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border capitalize transition-colors ${newAddr.type === t ? "bg-[#E8392A]/10 text-[#E8392A] border-[#E8392A]/20" : "bg-white text-[#4A3A2A] border-[#D4B896]/30 hover:bg-gray-50"}`}>
                    {t}
                  </button>
                ))}
              </div>
              {[
                { key: "area", label: "Area *", placeholder: "e.g. Sakri Road" },
                { key: "house_flat_no", label: "House/Flat No.", placeholder: "e.g. B-42" },
                { key: "landmark", label: "Landmark", placeholder: "Near bus stand" },
                { key: "google_map_link", label: "Google Maps Link", placeholder: "https://maps.app.goo.gl/..." },
              ].map((field) => (
                <div key={field.key} className="mb-2">
                  <label className="text-[10px] font-bold text-[#9CA3AF] block mb-1">{field.label}</label>
                  <input type="text" placeholder={field.placeholder} value={(newAddr as any)[field.key]} onChange={(e) => setNewAddr({ ...newAddr, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D4B896]/30 bg-white text-[13px] outline-none transition-colors focus:border-emt-red/50 focus:ring-2 focus:ring-emt-red/10" />
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <button onClick={() => setAddingAddr(false)} className="flex-1 py-2 rounded-lg border border-[#D4B896]/30 bg-white font-bold text-[12px] cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleAddAddress} className="flex-1 py-2 rounded-lg bg-[#E8392A] text-white border-none font-bold text-[12px] cursor-pointer hover:bg-[#B91C1C] transition-colors">Save</button>
              </div>
            </div>
          )}

          {addrLoading ? (
            <div className="text-center p-5 text-[#9CA3AF]">Loading…</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-7 text-[#9CA3AF]">
              <MapPin size={28} className="text-[#E5E7EB] mx-auto mb-2" />
              <p className="text-[13px] m-0">No addresses added yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {addresses.map((addr) => (
                <div key={addr.id} className={`flex gap-3 p-3.5 bg-[var(--emt-cream)] rounded-xl transition-all border border-[#D4B896]/30 ${addr.is_default ? "border-emt-red/50 shadow-sm" : ""}`}>
                  <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `${TYPE_COLORS[addr.type]}18`, color: TYPE_COLORS[addr.type] }}>
                    {TYPE_ICONS[addr.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-extrabold text-[13px] text-[#1A1A1A] m-0 capitalize">{addr.type}</p>
                      {addr.is_default && (
                        <span className="text-[9px] font-bold bg-[#E8392A]/10 text-[#E8392A] rounded-full px-1.5 py-0.5">Default</span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#6B7280] m-0 mt-1 leading-relaxed">
                      {[addr.house_flat_no, addr.landmark, addr.area, addr.city].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!addr.is_default && (
                      <button onClick={() => handleSetDefault(addr.id)} title="Set as default" className="bg-transparent border-none cursor-pointer text-[#9CA3AF] p-1 hover:text-emt-red transition-colors">
                        <Check size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteAddress(addr.id)} title="Delete" className="bg-transparent border-none cursor-pointer text-[#D1D5DB] p-1 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <div className="animate-fade-up stagger-child">
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full p-3.5 bg-[#E8392A]/15 text-[#E8392A] border-none rounded-xl font-bold text-[14px] cursor-pointer flex items-center justify-center gap-2 hover:bg-[#E8392A]/25 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
