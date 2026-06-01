"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, MapPin, Clock, CreditCard, ChevronRight, Check } from "lucide-react";

type Address = { id: string; type: "home" | "hostel" | "office"; house_flat_no: string | null; landmark: string | null; area: string; city: string; hostel_company_name: string | null; is_default: boolean; };

const ADDR_ICONS: Record<string, string> = { home: "🏠", hostel: "🏢", office: "💼" };

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const { items, removeItem, updateQty, subtotal, clearCart, timeSlot, setTimeSlot, addressId, setAddressId, paymentMethod, setPaymentMethod } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addingAddr, setAddingAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ type: "home", area: "", house_flat_no: "", landmark: "", city: "Bilaspur" });
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { if (items.length === 0) router.push("/food"); }, [items]);

  useEffect(() => {
    const fetch_ = async () => {
      if (!user) return;
      const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
      setAddresses(data || []);
      if (data && data.length > 0 && !addressId) setAddressId(data.find((a) => a.is_default)?.id || data[0].id);
    };
    fetch_();
  }, [user]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAddAddress = async () => {
    if (!user || !newAddr.area.trim()) { showToast("Area is required"); return; }
    if (addresses.length >= 3) { showToast("Max 3 addresses allowed"); return; }
    const { data } = await supabase.from("addresses").insert([{ user_id: user.id, type: newAddr.type, area: newAddr.area, house_flat_no: newAddr.house_flat_no || null, landmark: newAddr.landmark || null, city: newAddr.city, is_default: addresses.length === 0 }]).select().single();
    if (data) { setAddresses((p) => [...p, data as any]); setAddressId(data.id); setAddingAddr(false); }
  };

  const handlePlaceOrder = async () => {
    if (!user) { router.push("/sign-in"); return; }
    if (!addressId) { showToast("Please select a delivery address"); return; }
    if (!timeSlot) { showToast("Please select a time slot"); return; }
    if (!paymentMethod) { showToast("Please select a payment method"); return; }
    setPlacing(true);
    try {
      const res = await fetch("/api/food-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addressId, timeSlot, paymentMethod, items: items.map((i) => ({ menu_id: i.menu_id, quantity: i.quantity, price: i.price })), subtotal: subtotal(), notes: "" }) });
      const result = await res.json();
      if (result.success) { if (paymentMethod === "phonepe" && result.redirectUrl) { clearCart(); window.location.href = result.redirectUrl; } else { clearCart(); router.push("/orders"); } }
      else showToast(result.error || "Failed to place order.");
    } catch { showToast("Network error."); } finally { setPlacing(false); }
  };

  const grand = subtotal();

  return (
    <div style={{ minHeight: "100vh", background: "var(--emt-cream)" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,184,150,0.2)", padding: "0 20px", height: "60px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: "#1A1A1A" }}><ArrowLeft size={20} /></button>
        <span style={{ fontWeight: 800, fontSize: "18px", color: "#1A1A1A" }}>Checkout</span>
      </header>
      {toast && <div style={{ position: "fixed", top: "72px", right: "16px", zIndex: 200, background: "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, animation: "slideLeft 0.3s ease" }}>❌ {toast}</div>}

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px 120px" }}>
        {/* Cart Items */}
        <section style={{ marginBottom: "20px" }}>
          <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", marginBottom: "12px" }}>Your Order</h2>
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(212,184,150,0.15)" }}>
            {items.map((item, i) => (
              <div key={item.menu_id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: i < items.length - 1 ? "1px solid rgba(212,184,150,0.1)" : "none" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--emt-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{item.category === "veg" ? "🥗" : "🍗"}</div>
                <div style={{ flex: 1 }}><p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{item.title}</p><p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>₹{item.price} each</p></div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button onClick={() => updateQty(item.menu_id, item.quantity - 1)} style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(232,57,42,0.1)", color: "var(--emt-red)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                  <span style={{ fontWeight: 800, fontSize: "13px", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.menu_id, item.quantity + 1)} style={{ width: "26px", height: "26px", borderRadius: "8px", background: "var(--emt-red)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                </div>
                <p style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", minWidth: "48px", textAlign: "right" }}>₹{item.price * item.quantity}</p>
                <button onClick={() => removeItem(item.menu_id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB" }}><Trash2 size={15} /></button>
              </div>
            ))}
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(212,184,150,0.1)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "14px" }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: "18px", color: "#E8392A" }}>₹{grand}</span>
            </div>
          </div>
        </section>

        {/* Time Slot */}
        <section style={{ marginBottom: "20px" }}>
          <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", marginBottom: "12px" }}><Clock size={14} style={{ display: "inline", marginRight: "6px" }} />Delivery Slot</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {([["lunch","🌤️ Lunch","12 PM – 2 PM"],["dinner","🌙 Dinner","7 PM – 9 PM"]] as const).map(([v,l,t]) => (
              <button key={v} onClick={() => setTimeSlot(v)} style={{ padding: "14px", borderRadius: "14px", cursor: "pointer", textAlign: "left", border: `2px solid ${timeSlot === v ? "var(--emt-red)" : "rgba(212,184,150,0.2)"}`, background: timeSlot === v ? "rgba(232,57,42,0.04)" : "white", transition: "all 200ms" }}>
                <p style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", margin: 0 }}>{l}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "3px 0 0" }}>{t}</p>
                {timeSlot === v && <Check size={14} style={{ color: "var(--emt-red)", marginTop: "6px" }} />}
              </button>
            ))}
          </div>
        </section>

        {/* Address */}
        <section style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}><MapPin size={14} style={{ display: "inline", marginRight: "6px" }} />Delivery Address</h2>
            {addresses.length < 3 && <button onClick={() => setAddingAddr(true)} style={{ fontSize: "12px", fontWeight: 700, color: "var(--emt-red)", background: "none", border: "none", cursor: "pointer" }}>+ Add Address</button>}
          </div>
          {addingAddr && (
            <div style={{ background: "white", borderRadius: "14px", padding: "16px", marginBottom: "12px", border: "1px solid rgba(212,184,150,0.2)" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                {["home","hostel","office"].map((t) => (
                  <button key={t} onClick={() => setNewAddr({ ...newAddr, type: t })} style={{ flex: 1, padding: "7px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer", border: "1px solid", textTransform: "capitalize", background: newAddr.type === t ? "var(--emt-red)" : "white", color: newAddr.type === t ? "white" : "#4A3A2A", borderColor: newAddr.type === t ? "var(--emt-red)" : "rgba(212,184,150,0.3)" }}>{t}</button>
                ))}
              </div>
              {[{k:"area",l:"Area *",p:"e.g. Sakri Road"},{k:"house_flat_no",l:"House/Flat No.",p:"e.g. B-42"},{k:"landmark",l:"Landmark",p:"Near bus stand"}].map((f) => (
                <div key={f.k} style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "3px" }}>{f.l}</label>
                  <input type="text" placeholder={f.p} value={(newAddr as any)[f.k]} onChange={(e) => setNewAddr({ ...newAddr, [f.k]: e.target.value })} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid rgba(212,184,150,0.3)", background: "var(--emt-cream)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => setAddingAddr(false)} style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleAddAddress} style={{ flex: 1, padding: "9px", borderRadius: "9px", background: "var(--emt-red)", color: "white", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Save</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {addresses.length === 0 && !addingAddr ? (
              <button onClick={() => setAddingAddr(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px", borderRadius: "14px", border: "2px dashed rgba(232,57,42,0.3)", background: "rgba(232,57,42,0.02)", cursor: "pointer", color: "var(--emt-red)", fontWeight: 700, fontSize: "13px", width: "100%" }}><MapPin size={16} /> Add your first address</button>
            ) : addresses.map((addr) => (
              <button key={addr.id} onClick={() => setAddressId(addr.id)} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "14px", cursor: "pointer", textAlign: "left", border: `2px solid ${addressId === addr.id ? "var(--emt-red)" : "rgba(212,184,150,0.2)"}`, background: addressId === addr.id ? "rgba(232,57,42,0.03)" : "white", transition: "all 200ms", width: "100%" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--emt-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{ADDR_ICONS[addr.type]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: "13px", color: "#1A1A1A", margin: 0, textTransform: "capitalize" }}>{addr.type}{addr.is_default && <span style={{ marginLeft: "6px", fontSize: "9px", background: "rgba(27,94,48,0.1)", color: "#1B5E30", borderRadius: "999px", padding: "2px 6px", fontWeight: 700 }}>Default</span>}</p>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: "3px 0 0" }}>{[addr.house_flat_no, addr.landmark, addr.area, addr.city].filter(Boolean).join(", ")}</p>
                </div>
                {addressId === addr.id && <Check size={16} style={{ color: "var(--emt-red)", flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", marginBottom: "12px" }}><CreditCard size={14} style={{ display: "inline", marginRight: "6px" }} />Payment Method</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {([["phonepe","💜 PhonePe","UPI · Cards · Wallets"],["cod","💵 Cash on Delivery","Pay when delivered"]] as const).map(([v,l,s]) => (
              <button key={v} onClick={() => setPaymentMethod(v)} style={{ padding: "14px", borderRadius: "14px", cursor: "pointer", textAlign: "left", border: `2px solid ${paymentMethod === v ? "var(--emt-red)" : "rgba(212,184,150,0.2)"}`, background: paymentMethod === v ? "rgba(232,57,42,0.04)" : "white", transition: "all 200ms" }}>
                <p style={{ fontWeight: 800, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{l}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "3px 0 0" }}>{s}</p>
                {paymentMethod === v && <Check size={14} style={{ color: "var(--emt-red)", marginTop: "6px" }} />}
              </button>
            ))}
          </div>
        </section>

        <button onClick={handlePlaceOrder} disabled={placing} className="btn-glare" style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #E8392A, #B91C1C)", color: "white", border: "none", borderRadius: "16px", fontWeight: 900, fontSize: "16px", cursor: placing ? "not-allowed" : "pointer", opacity: placing ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 32px rgba(232,57,42,0.35)" }}>
          {placing ? <><span style={{ display: "inline-block", width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Processing…</> : <>Place Order · ₹{grand} <ChevronRight size={18} /></>}
        </button>
      </main>
    </div>
  );
}
