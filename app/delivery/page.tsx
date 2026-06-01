"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin, Phone, Clock, CheckCircle, Camera, Upload, Sun, Moon, Bike, PartyPopper } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";

type Assignment = {
  id: string; order_id: string; status: string; eta: string | null; proof_image: string | null; created_at: string;
  order: {
    user_id: string; time_slot: string; total_amount: number; notes: string | null;
    address: { house_flat_no: string | null; area: string; landmark: string | null; city: string; google_map_link: string | null } | null;
    user: { full_name: string; phone: string } | null;
  } | null;
};

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }> = {
  assigned: { next: "on_the_way", label: "Start Delivery", color: "#0EA5E9" },
  on_the_way: { next: "arriving", label: "Arriving Soon", color: "#F59E0B" },
  arriving: { next: "delivered", label: "Mark Delivered", color: "#1B5E30" },
};

const ETA_OPTIONS = ["5 mins", "10 mins", "15 mins", "20 mins", "30 mins", "Delayed"];

export default function DeliveryDashboard() {
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [active, setActive] = useState<Assignment[]>([]);
  const [completed, setCompleted] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const proofRef = useRef<HTMLInputElement>(null);
  const [pendingProofId, setPendingProofId] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const getMyId = async () => {
    const res = await fetch("/api/users/sync");
    const json = await res.json();
    if (json.success) { setMyUserId(json.user.id); return json.user.id; }
    return null;
  };

  const fetchDeliveries = async (uid: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("delivery_assignments")
      .select(`id, order_id, status, eta, proof_image, created_at,
        order:food_orders(user_id, time_slot, total_amount, notes,
          address:addresses(house_flat_no, area, landmark, city, google_map_link),
          user:users(full_name, phone)
        )`)
      .eq("delivery_boy_id", uid)
      .order("created_at", { ascending: false });

    const all = (data as any) || [];
    const todayItems = all.filter((a: Assignment) => a.created_at.startsWith(today));
    setActive(all.filter((a: Assignment) => a.status !== "delivered" && a.status !== "failed"));
    setCompleted(todayItems.filter((a: Assignment) => a.status === "delivered"));
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const uid = await getMyId();
      if (!uid) return;
      await fetchDeliveries(uid);
      channelRef.current = supabase.channel(`delivery:${uid}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments" }, () => fetchDeliveries(uid))
        .subscribe();
    };
    init();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const handleStatusAdvance = async (assignment: Assignment) => {
    const transition = STATUS_FLOW[assignment.status];
    if (!transition) return;
    if (transition.next === "delivered") {
      // Must upload proof first
      setPendingProofId(assignment.id);
      proofRef.current?.click();
      return;
    }
    setActionLoading(assignment.id);
    try {
      const { error } = await supabase.from("delivery_assignments").update({ status: transition.next }).eq("id", assignment.id);
      if (!error) {
        // Also update food_order status
        if (transition.next === "on_the_way") {
          await supabase.from("food_orders").update({ status: "out_for_delivery" }).eq("id", assignment.order_id);
        }
        showToast("Status updated successfully!");
        if (myUserId) fetchDeliveries(myUserId);
      } else showToast("Update failed.", "error");
    } finally { setActionLoading(null); }
  };

  const handleProofUpload = async (file: File) => {
    if (!pendingProofId) return;
    setUploading(pendingProofId);
    try {
      const ext = file.name.split(".").pop();
      const filename = `proof-${pendingProofId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("delivery-proofs").upload(filename, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("delivery-proofs").getPublicUrl(filename);

      // Mark delivered
      const assignment = active.find((a) => a.id === pendingProofId);
      if (!assignment) throw new Error("Assignment not found");

      await supabase.from("delivery_assignments").update({ status: "delivered", proof_image: publicUrl }).eq("id", pendingProofId);
      await supabase.from("food_orders").update({ status: "delivered" }).eq("id", assignment.order_id);

      // Notify customer
      if (assignment.order?.user_id) {
        await supabase.from("notifications").insert([{
          user_id: assignment.order.user_id, title: "Meal Delivered! 🎉",
          body: "Your tiffin has been delivered. Enjoy your meal! 😋", type: "delivery", channel: "in_app",
        }]);
      }

      showToast("Delivery marked as complete successfully!");
      setPendingProofId(null);
      if (myUserId) fetchDeliveries(myUserId);
    } catch (err: any) {
      showToast(err.message || "Proof upload failed", "error");
    } finally { setUploading(null); }
  };

  const handleEtaUpdate = async (assignmentId: string, eta: string) => {
    const { error } = await supabase.from("delivery_assignments").update({ eta }).eq("id", assignmentId);
    if (!error) showToast("ETA updated successfully!");
    else showToast("Update failed.", "error");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      {toast && <div style={{ position: "fixed", top: "72px", right: "16px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>{toast.msg}</div>}

      <input type="file" ref={proofRef} accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleProofUpload(e.target.files[0])} />

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>My Deliveries</h1>
        <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>
          {active.length} active · {completed.length} delivered today
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(14,165,233,0.2)", borderTopColor: "#0EA5E9", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF" }}>Loading deliveries…</p>
        </div>
      ) : active.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ marginBottom: "12px", color: "rgba(14,165,233,0.6)", display: "flex", justifyContent: "center" }}><Bike size={48} /></div>
          <p style={{ fontWeight: 700, color: "#1A1A1A" }}>No active deliveries</p>
          <p style={{ color: "#9CA3AF", fontSize: "13px" }}>You're all caught up! New assignments will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
          {active.map((a) => {
            const transition = STATUS_FLOW[a.status];
            const isActionLoading = actionLoading === a.id;
            const isUploading = uploading === a.id;
            const addr = a.order?.address;
            return (
              <div key={a.id} style={{ background: "white", borderRadius: "20px", border: "1px solid rgba(14,165,233,0.2)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "white", fontWeight: 800, fontSize: "14px", margin: 0 }}>{a.order?.user?.full_name || "—"}</p>
                    <p style={{ color: "#94A3B8", fontSize: "11px", margin: "2px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                      {a.order?.time_slot === "lunch" ? <><Sun size={10} /> Lunch</> : <><Moon size={10} /> Dinner</>} · ₹{a.order?.total_amount}
                    </p>
                  </div>
                  <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", background: "rgba(14,165,233,0.2)", color: "#0EA5E9", textTransform: "capitalize" }}>
                    {a.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div style={{ padding: "14px 16px" }}>
                  {/* Address */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px", padding: "12px", background: "#F8FAFC", borderRadius: "12px" }}>
                    <MapPin size={16} style={{ color: "#E8392A", flexShrink: 0, marginTop: "2px" }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>
                        {[addr?.house_flat_no, addr?.landmark, addr?.area, addr?.city].filter(Boolean).join(", ")}
                      </p>
                      {addr?.google_map_link && (
                        <a href={addr.google_map_link} target="_blank" rel="noreferrer"
                          style={{ fontSize: "11px", color: "#0EA5E9", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "4px" }}>
                          📍 Open in Maps
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Call customer */}
                  {a.order?.user?.phone && (
                    <a href={`tel:${a.order.user.phone}`}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(27,94,48,0.06)", borderRadius: "10px", textDecoration: "none", color: "#1B5E30", fontWeight: 700, fontSize: "13px", marginBottom: "12px" }}>
                      <Phone size={16} /> {a.order.user.phone} — Call Customer
                    </a>
                  )}

                  {/* Notes */}
                  {a.order?.notes && (
                    <div style={{ padding: "8px 12px", background: "rgba(245,158,11,0.06)", borderRadius: "8px", marginBottom: "12px", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <p style={{ fontSize: "12px", color: "#D97706", margin: 0 }}>📝 {a.order.notes}</p>
                    </div>
                  )}

                  {/* ETA */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <Clock size={15} style={{ color: "#9CA3AF", flexShrink: 0, marginTop: "7px" }} />
                    <CustomSelect 
                      value={a.eta || ""} 
                      onChange={(val) => handleEtaUpdate(a.id, val)}
                      options={[
                        { value: "", label: "Set ETA" },
                        ...ETA_OPTIONS.map(o => ({ value: o, label: o }))
                      ]}
                      style={{ flex: 1 }}
                    />
                  </div>

                  {/* Action button */}
                  {transition && (
                    <button
                      onClick={() => handleStatusAdvance(a)}
                      disabled={isActionLoading || isUploading}
                      style={{
                        width: "100%", padding: "13px", borderRadius: "12px", border: "none", cursor: "pointer",
                        background: transition.color, color: "white", fontWeight: 800, fontSize: "14px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        opacity: (isActionLoading || isUploading) ? 0.6 : 1,
                      }}>
                      {isUploading ? <><Upload size={14} /> Uploading proof…</> : isActionLoading ? <><span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Updating…</> : transition.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed today */}
      {completed.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 800, fontSize: "16px", color: "#1A1A1A", marginBottom: "12px" }}>Completed Today ({completed.length})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {completed.map((a) => (
              <div key={a.id} style={{ background: "white", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(27,94,48,0.15)", display: "flex", gap: "12px", alignItems: "center" }}>
                <CheckCircle size={24} style={{ color: "#1B5E30", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{a.order?.user?.full_name || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>{a.order?.time_slot === "lunch" ? <><Sun size={10} /> Lunch</> : <><Moon size={10} /> Dinner</>} · ₹{a.order?.total_amount}</p>
                </div>
                {a.proof_image && (
                  <a href={a.proof_image} target="_blank" rel="noreferrer">
                    <img src={a.proof_image} alt="proof" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
