"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, Pause, Play, X, Plus, ChevronDown, Check, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";

type Sub = {
  id: string; user_id: string; plan_id: string | null; category: string; meal_type: string;
  remaining_days: number; total_days: number; status: string; starts_at: string;
  expires_at: string | null; paused_until: string | null; created_at: string;
  user: { full_name: string; phone: string; email: string } | null;
  assigned_delivery_boy: string | null;
};

const STATUS_CHIP: Record<string, { bg: string; text: string }> = {
  active: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30" },
  paused: { bg: "rgba(217,119,6,0.1)", text: "#D97706" },
  expired: { bg: "rgba(156,163,175,0.1)", text: "#6B7280" },
  cancelled: { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
};

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showExtendModal, setShowExtendModal] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState(7);
  const { confirm } = useConfirm();
  const channelRef = useRef<any>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; full_name: string; phone: string }[]>([]);
  const [plans, setPlans] = useState<{ id: string; title: string; meal_type: string; category: string; duration_days: number }[]>([]);
  const [createForm, setCreateForm] = useState({ userId: "", planId: "", category: "veg", mealType: "both", startsAt: new Date().toISOString().split("T")[0] });
  const [creating, setCreating] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("subscriptions")
      .select("*, user:users!subscriptions_user_id_fkey(full_name, phone, email)")
      .order("created_at", { ascending: false });
    setSubs((data as any) || []);

    const { data: boys } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "delivery_boy")
      .eq("status", "active");
    setDeliveryBoys(boys || []);
    setLoading(false);
  };

  const fetchCreateOptions = async () => {
    const { data: cData } = await supabase.from("users").select("id, full_name, phone").eq("role", "customer");
    setCustomers(cData || []);
    const { data: pData } = await supabase.from("subscription_plans").select("id, title, meal_type, category, duration_days").eq("is_active", true);
    setPlans(pData || []);
  };

  useEffect(() => {
    fetchData();
    channelRef.current = supabase
      .channel("admin:subscriptions")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, fetchData)
      .subscribe();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const handleAction = async (action: "pause" | "resume" | "cancel" | "extend", subId: string, extra?: any) => {
    setActionLoading(subId + action);
    try {
      let body: any = { subscriptionId: subId };
      if (action === "extend") body = { ...body, days: extendDays };

      const endpoint = action === "extend"
        ? "/api/admin/subscriptions/extend"
        : `/api/admin/subscriptions/${action}`;

      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) {
        showToast(`Subscription ${action}d successfully!`);
        fetchData();
        setShowExtendModal(null);
      } else showToast(result.error || "Action failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setActionLoading(null); }
  };

  const handleAssign = async (subId: string, boyId: string) => {
    const { error } = await supabase.from("subscriptions").update({ assigned_delivery_boy: boyId }).eq("id", subId);
    if (!error) showToast("Delivery boy assigned successfully!");
    else showToast("Assignment failed", "error");
  };

  const handleCreate = async () => {
    if (!createForm.userId || !createForm.category || !createForm.mealType || !createForm.startsAt) {
      showToast("Please fill all required fields", "error"); return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Subscription created successfully!");
        setShowCreateModal(false);
        fetchData();
      } else showToast(json.error || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setCreating(false); }
  };

  const filtered = subs.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (s.user?.full_name?.toLowerCase().includes(q) || s.user?.phone?.includes(q) || s.id.includes(q));
    }
    return true;
  });

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 500, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "18px", margin: 0 }}>Create Subscription</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Customer *</label>
                <CustomSelect 
                  value={createForm.userId} 
                  onChange={(val) => setCreateForm({ ...createForm, userId: val })}
                  options={[
                    { value: "", label: "Select customer..." },
                    ...customers.map(c => ({ value: c.id, label: `${c.full_name} (${c.phone})` }))
                  ]}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Plan (Optional)</label>
                <CustomSelect 
                  value={createForm.planId} 
                  onChange={(val) => {
                    const planId = val;
                    const plan = plans.find(p => p.id === planId);
                    if (plan) {
                      setCreateForm({ ...createForm, planId, category: plan.category, mealType: plan.meal_type });
                    } else {
                      setCreateForm({ ...createForm, planId: "" });
                    }
                  }} 
                  options={[
                    { value: "", label: "Custom Plan" },
                    ...plans.map(p => ({ value: p.id, label: `${p.title} (${p.duration_days} days)` }))
                  ]}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Category *</label>
                  <CustomSelect 
                    value={createForm.category} 
                    onChange={(val) => setCreateForm({ ...createForm, category: val })} 
                    disabled={!!createForm.planId}
                    options={[
                      { value: "veg", label: "Veg" },
                      { value: "non_veg", label: "Non-Veg" }
                    ]}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Meal Type *</label>
                  <CustomSelect 
                    value={createForm.mealType} 
                    onChange={(val) => setCreateForm({ ...createForm, mealType: val })} 
                    disabled={!!createForm.planId}
                    options={[
                      { value: "lunch", label: "🌤️ Lunch" },
                      { value: "dinner", label: "🌙 Dinner" },
                      { value: "both", label: "Both" }
                    ]}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Start Date *</label>
                <input type="date" value={createForm.startsAt} onChange={(e) => setCreateForm({ ...createForm, startsAt: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreate} disabled={creating}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.6 : 1 }}>
                {creating ? "Creating…" : "Create Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExtendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "360px", width: "90%" }}>
            <h3 style={{ fontWeight: 800, fontSize: "18px", marginBottom: "16px" }}>Extend Subscription</h3>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "8px" }}>Days to add</label>
            <input type="number" value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value))} min={1} max={90}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(232,57,42,0.3)", fontSize: "16px", fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => setShowExtendModal(null)} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleAction("extend", showExtendModal)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}>Extend +{extendDays}d</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "36px", color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}>Subscriptions</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>{filtered.length} of {subs.length} plans</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid rgba(212,184,150,0.3)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setShowCreateModal(true); fetchCreateOptions(); }}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#E8392A", color: "white", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            <Plus size={14} /> New Subscription
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input placeholder="Search by name, phone, ID…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
        {["all", "active", "paused", "expired", "cancelled"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", textTransform: "capitalize", border: "1px solid", background: statusFilter === s ? "#1A1A1A" : "white", color: statusFilter === s ? "white" : "#4A3A2A", borderColor: statusFilter === s ? "#1A1A1A" : "rgba(212,184,150,0.3)" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "16px", border: "1px solid rgba(212,184,150,0.15)", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(212,184,150,0.15)" }}>
                {["Customer", "Plan", "Remaining", "Status", "Starts", "Delivery Boy", "Tiffin", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No subscriptions found</td></tr>
              ) : filtered.map((sub) => {
                const sc = STATUS_CHIP[sub.status] || STATUS_CHIP.cancelled;
                const isProcessing = actionLoading?.startsWith(sub.id);
                return (
                  <tr key={sub.id} style={{ borderBottom: "1px solid rgba(212,184,150,0.1)", transition: "background 150ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 14px" }}>
                      <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{sub.user?.full_name || "—"}</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>{sub.user?.phone || "—"}</p>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, background: sub.category === "veg" ? "rgba(27,94,48,0.1)" : "rgba(232,57,42,0.1)", color: sub.category === "veg" ? "#1B5E30" : "#E8392A", borderRadius: "999px", padding: "2px 8px", flexShrink: 0 }}>
                          {sub.category === "veg" ? "VEG" : "NON-VEG"}
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(99,102,241,0.1)", color: "#4F46E5", borderRadius: "999px", padding: "2px 8px", textTransform: "uppercase", flexShrink: 0 }}>
                          {sub.meal_type === "both" ? "LUNCH & DINNER" : sub.meal_type}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "60px", height: "6px", borderRadius: "999px", background: "#F3F4F6", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.max(4, (sub.remaining_days / sub.total_days) * 100)}%`, background: sub.remaining_days <= 3 ? "#EF4444" : sub.remaining_days <= 7 ? "#F59E0B" : "#1B5E30", borderRadius: "999px" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#4A3A2A" }}>{sub.remaining_days}d</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: sc.bg, color: sc.text, textTransform: "capitalize" }}>{sub.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: "#6B7280" }}>
                      {new Date(sub.starts_at).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <CustomSelect
                        value={sub.assigned_delivery_boy || ""}
                        onChange={(val) => handleAssign(sub.id, val)}
                        options={[
                          { value: "", label: "Unassigned" },
                          ...deliveryBoys.map(b => ({ value: b.id, label: b.full_name }))
                        ]}
                        style={{ minWidth: "120px" }}
                      />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Link href={`/admin/tiffin-orders?subscription_id=${sub.id}`}
                        style={{ fontSize: "11px", fontWeight: 700, color: "#6366F1", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                        View Orders <ArrowRight size={10} />
                      </Link>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {sub.status === "active" && (
                          <button onClick={() => handleAction("pause", sub.id)} disabled={isProcessing}
                            title="Pause" style={{ padding: "5px 8px", borderRadius: "6px", background: "rgba(217,119,6,0.1)", color: "#D97706", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>
                            <Pause size={12} />
                          </button>
                        )}
                        {sub.status === "paused" && (
                          <button onClick={() => handleAction("resume", sub.id)} disabled={isProcessing}
                            title="Resume" style={{ padding: "5px 8px", borderRadius: "6px", background: "rgba(27,94,48,0.1)", color: "#1B5E30", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>
                            <Play size={12} />
                          </button>
                        )}
                        <button onClick={() => setShowExtendModal(sub.id)}
                          title="Extend" style={{ padding: "5px 8px", borderRadius: "6px", background: "rgba(99,102,241,0.1)", color: "#6366F1", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: 700 }}>+d</button>
                        {["active", "paused"].includes(sub.status) && (
                          <button onClick={() => {
                            confirm({
                              title: "Cancel Subscription",
                              message: "Are you sure you want to cancel this subscription?",
                              confirmText: "Cancel Subscription",
                              onConfirm: () => handleAction("cancel", sub.id)
                            });
                          }} disabled={isProcessing}
                            title="Cancel" style={{ padding: "5px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
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
