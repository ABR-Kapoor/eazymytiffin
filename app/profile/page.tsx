"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import {
  LogOut, Save, Edit2, Check, X, Phone, Mail, MapPin,
  Shield, Star, Plus, Trash2, Home, Building, Briefcase
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
      showToast("Address added!");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Remove this address?")) return;
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (!error) setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
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

      <main id="main" style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px 96px" }}>
        {/* Profile Hero */}
        <div className="animate-fade-up" style={{
          background: "linear-gradient(135deg, #1A1A1A, #2D1A0A)",
          borderRadius: "24px", padding: "28px",
          marginBottom: "20px", color: "white", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(232,57,42,0.1)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--emt-red), #B91C1C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "28px", border: "3px solid rgba(255,255,255,0.2)"
            }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: "20px", margin: 0, letterSpacing: "-0.02em" }}>{user?.full_name || "—"}</h1>
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
                  fontSize: "10px", fontWeight: 800,
                  background: user?.status === "active" ? "rgba(27,94,48,0.3)" : "rgba(232,57,42,0.3)",
                  color: user?.status === "active" ? "#86EFAC" : "#FECACA",
                  borderRadius: "999px", padding: "3px 10px"
                }}>
                  {user?.status === "active" ? "✓ Active" : "✗ Blocked"}
                </span>
                {user?.is_phone_verified && (
                  <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(99,102,241,0.3)", color: "#C7D2FE", borderRadius: "999px", padding: "3px 10px" }}>
                    📱 Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="animate-fade-up stagger-child" style={{
          background: "white", borderRadius: "20px", padding: "20px",
          marginBottom: "16px", border: "1px solid rgba(212,184,150,0.15)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}>Profile Info</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "12px", fontWeight: 700, color: "var(--emt-red)",
                  background: "rgba(232,57,42,0.08)", border: "none",
                  borderRadius: "8px", padding: "6px 12px", cursor: "pointer"
                }}
              >
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { setEditing(false); setFormData({ full_name: user?.full_name || "", phone: user?.phone || "", city: user?.city || "Bilaspur" }); }}
                  style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                ><X size={13} /> Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  style={{ fontSize: "12px", fontWeight: 700, color: "white", background: "var(--emt-red)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", opacity: saving ? 0.6 : 1 }}
                ><Save size={13} /> {saving ? "Saving…" : "Save"}</button>
              </div>
            )}
          </div>

          {[
            { key: "full_name", label: "Full Name", icon: <Star size={14} />, type: "text" },
            { key: "phone", label: "Phone", icon: <Phone size={14} />, type: "tel" },
            { key: "city", label: "City", icon: <MapPin size={14} />, type: "text" },
          ].map((field) => (
            <div key={field.key} style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                {field.icon} {field.label}
              </label>
              <input
                type={field.type}
                value={(formData as any)[field.key]}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                disabled={!editing}
                style={{
                  width: "100%", padding: "10px 14px",
                  border: `1px solid ${editing ? "rgba(232,57,42,0.3)" : "rgba(212,184,150,0.2)"}`,
                  borderRadius: "10px",
                  background: editing ? "white" : "var(--emt-cream)",
                  fontSize: "14px", color: "#1A1A1A",
                  outline: "none", boxSizing: "border-box",
                  cursor: editing ? "text" : "not-allowed",
                  fontWeight: editing ? 500 : 600,
                }}
              />
            </div>
          ))}

          {/* Email (readonly) */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              value={clerkUser?.primaryEmailAddress?.emailAddress || ""}
              disabled
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid rgba(212,184,150,0.15)",
                borderRadius: "10px", background: "var(--emt-cream)",
                fontSize: "14px", color: "#6B7280", outline: "none",
                boxSizing: "border-box", cursor: "not-allowed",
              }}
            />
            <p style={{ fontSize: "10px", color: "#D1D5DB", margin: "4px 0 0" }}>Email cannot be changed</p>
          </div>

          {user?.has_used_trial && (
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(245,166,35,0.08)", borderRadius: "10px", border: "1px solid rgba(245,166,35,0.2)" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#D97706", margin: 0 }}>
                ✅ You've used your free trial meal
              </p>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="animate-fade-up stagger-child" style={{
          background: "white", borderRadius: "20px", padding: "20px",
          marginBottom: "16px", border: "1px solid rgba(212,184,150,0.15)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}>
              <MapPin size={15} style={{ display: "inline", marginRight: "6px" }} />
              Addresses ({addresses.length}/3)
            </h2>
            {addresses.length < 3 && !addingAddr && (
              <button
                onClick={() => setAddingAddr(true)}
                style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "var(--emt-red)", background: "rgba(232,57,42,0.08)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}
              >
                <Plus size={13} /> Add
              </button>
            )}
          </div>

          {addingAddr && (
            <div style={{ background: "var(--emt-cream)", borderRadius: "14px", padding: "16px", marginBottom: "14px", border: "1px solid rgba(212,184,150,0.2)" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                {["home", "hostel", "office"].map((t) => (
                  <button key={t} onClick={() => setNewAddr({ ...newAddr, type: t })} style={{ flex: 1, padding: "7px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer", border: "1px solid", textTransform: "capitalize", background: newAddr.type === t ? "var(--emt-red)" : "white", color: newAddr.type === t ? "white" : "#4A3A2A", borderColor: newAddr.type === t ? "var(--emt-red)" : "rgba(212,184,150,0.3)" }}>
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
                <div key={field.key} style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "3px" }}>{field.label}</label>
                  <input type="text" placeholder={field.placeholder} value={(newAddr as any)[field.key]} onChange={(e) => setNewAddr({ ...newAddr, [field.key]: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => setAddingAddr(false)} style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleAddAddress} style={{ flex: 1, padding: "9px", borderRadius: "9px", background: "var(--emt-red)", color: "white", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Save</button>
              </div>
            </div>
          )}

          {addrLoading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF" }}>Loading…</div>
          ) : addresses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px", color: "#9CA3AF" }}>
              <MapPin size={28} style={{ color: "#E5E7EB", marginBottom: "8px" }} />
              <p style={{ fontSize: "13px" }}>No addresses added yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {addresses.map((addr) => (
                <div key={addr.id} style={{
                  display: "flex", gap: "12px", padding: "14px",
                  background: "var(--emt-cream)", borderRadius: "12px",
                  border: addr.is_default ? "1px solid rgba(232,57,42,0.3)" : "1px solid transparent",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                    background: `${TYPE_COLORS[addr.type]}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: TYPE_COLORS[addr.type],
                  }}>
                    {TYPE_ICONS[addr.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <p style={{ fontWeight: 800, fontSize: "13px", color: "#1A1A1A", margin: 0, textTransform: "capitalize" }}>{addr.type}</p>
                      {addr.is_default && (
                        <span style={{ fontSize: "9px", fontWeight: 700, background: "rgba(232,57,42,0.1)", color: "var(--emt-red)", borderRadius: "999px", padding: "2px 6px" }}>Default</span>
                      )}
                    </div>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: "3px 0 0", lineHeight: 1.4 }}>
                      {[addr.house_flat_no, addr.landmark, addr.area, addr.city].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {!addr.is_default && (
                      <button onClick={() => handleSetDefault(addr.id)} title="Set as default" style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "4px" }}>
                        <Check size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteAddress(addr.id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", padding: "4px" }}>
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
            style={{
              width: "100%", padding: "14px",
              background: "rgba(232,57,42,0.08)", color: "#E8392A",
              border: "1px solid rgba(232,57,42,0.2)", borderRadius: "14px",
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "all 200ms",
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
