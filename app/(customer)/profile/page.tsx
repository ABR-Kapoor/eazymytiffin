"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { useConfirm } from "@/components/ConfirmProvider";
import Link from "next/link";
import {
  PartyPopper, LogOut, Save, Edit2, Check, X, Phone, Mail, MapPin,
  Shield, Star, Plus, Trash2, Home, Building, Briefcase, Smartphone,
  ChevronRight, User, Pencil
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

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  home: { label: "Home", icon: <Home size={16} />, color: "#0D9488", bg: "bg-[#0D9488]/10" },
  hostel: { label: "Hostel", icon: <Building size={16} />, color: "#6366F1", bg: "bg-[#6366F1]/10" },
  office: { label: "Office", icon: <Briefcase size={16} />, color: "#1BA672", bg: "bg-[#1BA672]/10" },
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
        <div className={`fixed top-[72px] right-4 z-[200] text-white rounded-xl py-3 px-5 text-[13px] font-semibold shadow-lg animate-slide-left ${toast.type === "success" ? "bg-[#1BA672]" : "bg-[#E23744]"}`}>
          {toast.msg}
        </div>
      )}
      <div className="max-w-[960px] mx-auto">
        {/* Profile Hero */}
        <div className="relative bg-[#0D9488] pt-6 pb-10 px-4 sm:px-6 rounded-b-[32px] shadow-sm transition-all duration-500 overflow-hidden -mx-4 lg:mx-0 mb-6">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-60 invert pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4 sm:gap-5">
            <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-[28px] sm:text-[32px] text-white border-2 border-white/30 shadow-lg">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-[20px] sm:text-[24px] text-white m-0 tracking-tight drop-shadow-sm truncate">
                {user?.full_name || "—"}
              </h1>
              <p className="text-[13px] text-white/85 m-0 mt-0.5 font-medium truncate">{user?.email}</p>
              <div className="flex gap-2 flex-wrap mt-2">
                <span className="text-[10px] font-extrabold uppercase bg-[#1C1C1C]/80 text-white rounded-full px-3 py-1">
                  {user?.role || "Customer"}
                </span>
                <span className={`text-[10px] font-extrabold uppercase rounded-full px-3 py-1 flex items-center gap-1 ${user?.status === "active" ? "bg-emerald-800 text-white" : "bg-red-800 text-white"}`}>
                  <div className={`w-[6px] h-[6px] rounded-full ${user?.status === "active" ? "bg-white" : "bg-white"}`} />
                  {user?.status === "active" ? "Active" : "Blocked"}
                </span>
                {user?.is_phone_verified && (
                  <span className="text-[10px] font-extrabold uppercase bg-blue-400/20 text-blue-100 rounded-full px-3 py-1 flex items-center gap-1">
                    <Smartphone size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-[20px] p-5 sm:p-6 mb-5 border border-[#E8E8E8] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-extrabold text-[16px] text-[#1C1C1C] m-0">Account Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-[12px] font-bold text-[#0D9488] bg-[#0D9488]/10 rounded-full px-3.5 py-1.5 border-none cursor-pointer hover:bg-[#0D9488]/20 transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setFormData({ full_name: user?.full_name || "", phone: user?.phone || "", city: user?.city || "Bilaspur" }); }}
                  className="text-[12px] font-bold text-[#686B78] bg-slate-100 rounded-full px-3.5 py-1.5 border-none cursor-pointer hover:bg-slate-200 transition-colors"
                >Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className={`flex items-center gap-1 text-[12px] font-bold text-white bg-[#0D9488] rounded-full px-3.5 py-1.5 border-none cursor-pointer hover:bg-[#0F766E] transition-colors shadow-sm ${saving ? "opacity-60" : ""}`}
                >{saving ? "Saving…" : "Save"}</button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {[
              { key: "full_name", label: "Full Name", icon: User },
              { key: "phone", label: "Phone Number", icon: Phone },
              { key: "city", label: "City", icon: MapPin },
            ].map((field) => (
              <div key={field.key} className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl">
                <field.icon size={18} className="text-[#686B78] shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold text-[#93959F] uppercase tracking-wider block">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    disabled={!editing}
                    className={`w-full bg-transparent border-none p-0 text-[14px] font-semibold text-[#1C1C1C] outline-none mt-0.5 ${!editing ? "cursor-default" : ""}`}
                  />
                </div>
              </div>
            ))}

            {/* Email (readonly) */}
            <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl">
              <Mail size={18} className="text-[#686B78] shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-[#93959F] uppercase tracking-wider block">Email Address</label>
                <p className="text-[14px] font-semibold text-[#686B78] m-0 mt-0.5">
                  {clerkUser?.primaryEmailAddress?.emailAddress || "—"}
                </p>
              </div>
            </div>
          </div>

          {user?.has_used_trial && (
            <div className="mt-5 flex items-center gap-2.5 px-4 py-3 bg-[#1BA672]/5 rounded-xl border border-[#1BA672]/10">
              <div className="w-8 h-8 rounded-full bg-[#1BA672]/10 flex items-center justify-center">
                <PartyPopper size={16} className="text-[#1BA672]" />
              </div>
              <p className="text-[13px] font-bold text-[#1BA672] m-0">Free trial redeemed</p>
            </div>
          )}
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-[20px] p-5 sm:p-6 mb-6 border border-[#E8E8E8] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-extrabold text-[16px] text-[#1C1C1C] m-0">
              Saved Addresses
            </h2>
            <span className="text-[12px] font-medium text-[#93959F]">{addresses.length}/3</span>
          </div>

          {addingAddr && (
            <div className="bg-[#F8F9FA] rounded-xl p-4 mb-4 border border-[#E8E8E8]">
              <div className="flex gap-2 mb-4">
                {["home", "hostel", "office"].map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setNewAddr({ ...newAddr, type: t })}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer border transition-all ${
                        newAddr.type === t
                          ? "text-white border-none shadow-sm"
                          : "bg-white text-[#686B78] border-[#E8E8E8] hover:bg-[#F8F9FA]"
                      }`}
                      style={newAddr.type === t ? { background: cfg.color } : {}}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        {cfg.icon} {cfg.label}
                      </span>
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
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={(newAddr as any)[field.key]}
                      onChange={(e) => setNewAddr({ ...newAddr, [field.key]: e.target.value })}
                      className="w-full bg-white rounded-xl border border-[#E8E8E8] px-4 py-2.5 text-[13px] text-[#1C1C1C] outline-none transition-colors focus:border-[#0D9488] placeholder-[#93959F] font-medium"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setAddingAddr(false)} className="flex-1 py-2.5 rounded-xl border border-[#E8E8E8] bg-white font-bold text-[13px] text-[#686B78] cursor-pointer hover:bg-[#F8F9FA] transition-colors">Cancel</button>
                <button onClick={handleAddAddress} className="flex-1 py-2.5 rounded-xl bg-[#0D9488] text-white border-none font-bold text-[13px] cursor-pointer hover:bg-[#0F766E] transition-colors shadow-sm">Save Address</button>
              </div>
            </div>
          )}

          {addresses.length < 3 && !addingAddr && (
            <button
              onClick={() => setAddingAddr(true)}
              className="w-full mb-4 py-3 rounded-xl border-2 border-dashed border-[#E8E8E8] bg-transparent font-bold text-[13px] text-[#0D9488] cursor-pointer hover:bg-[#F0FDFA] hover:border-[#0D9488]/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Address
            </button>
          )}

          {addrLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full border-3 border-[#0D9488]/20 border-t-[#0D9488] animate-spin mx-auto mb-3" />
              <p className="text-[13px] text-[#93959F] font-medium">Loading addresses…</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-3">
                <MapPin size={24} className="text-[#D4D4D8]" />
              </div>
              <p className="text-[14px] text-[#686B78] m-0 font-medium">No addresses added yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => {
                const cfg = TYPE_CONFIG[addr.type];
                return (
                  <div key={addr.id} className="flex items-center gap-3 sm:gap-4 p-4 bg-[#F8F9FA] rounded-xl border border-[#E8E8E8] transition-all hover:border-[#0D9488]/20">
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`} style={{ color: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-[14px] text-[#1C1C1C] m-0 capitalize">{cfg.label}</p>
                        {addr.is_default && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wide bg-[#0D9488]/10 text-[#0D9488] rounded-full px-2 py-0.5">Default</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#686B78] m-0 leading-relaxed truncate">
                        {[addr.house_flat_no, addr.landmark, addr.area, addr.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          title="Set as default"
                          className="text-[10px] font-bold text-[#1BA672] bg-[#1BA672]/10 rounded-full px-2.5 py-1 border-none cursor-pointer hover:bg-[#1BA672]/20 transition-colors uppercase tracking-wide"
                        >
                          Default
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(addr.id)} title="Remove" className="w-8 h-8 rounded-full bg-white border border-[#E8E8E8] flex items-center justify-center cursor-pointer hover:border-red-200 hover:bg-red-50 transition-all group">
                        <Trash2 size={14} className="text-[#93959F] group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <div className="mb-8">
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full py-3.5 bg-white border border-[#E8E8E8] rounded-xl font-bold text-[14px] text-[#E23744] cursor-pointer flex items-center justify-center gap-2 hover:bg-[#FFF5F5] hover:border-[#E23744]/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
