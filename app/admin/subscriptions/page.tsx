"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, RefreshCw, Pause, Play, X, Plus, ChevronDown, Check, Users, ArrowRight, Sun, Moon } from "lucide-react";
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
                      { value: "lunch", label: <span className="flex items-center gap-1.5"><Sun size={14}/> Lunch</span> },
                      { value: "dinner", label: <span className="flex items-center gap-1.5"><Moon size={14}/> Dinner</span> },
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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8392A]/10 flex items-center justify-center text-[#E8392A]">
              <Users size={20} />
            </div>
            Subscriptions
          </h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1.5 font-medium ml-[48px]">
            {filtered.length} of {subs.length} plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-glare flex items-center justify-center gap-2 bg-white border border-[rgba(212,184,150,0.3)] hover:border-[#E8392A] hover:text-[#E8392A] text-[#4A3A2A] rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-sm transition-all h-fit w-fit">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => { setShowCreateModal(true); fetchCreateOptions(); }}
            className="btn-glare flex items-center justify-center gap-2 bg-[#E8392A] text-white rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-sm shadow-[#E8392A]/30 hover:shadow-[#E8392A]/50 hover:-translate-y-0.5 transition-all h-fit w-fit">
            <Plus size={16} /> New Subscription
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative flex-1 min-w-[240px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input placeholder="Search by name, phone, ID…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(212,184,150,0.3)] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E8392A] focus:border-transparent transition-all shadow-sm" />
        </div>
        <div className="flex flex-wrap gap-2 items-center bg-white p-1.5 rounded-xl border border-[rgba(212,184,150,0.2)] shadow-sm h-fit no-scrollbar overflow-x-auto">
          {["all", "active", "paused", "expired", "cancelled"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-[12px] font-bold capitalize transition-all duration-200 whitespace-nowrap ${statusFilter === s ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-[rgba(212,184,150,0.2)] overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#E5E7EB] border-b border-[#D1D5DB]">
                {["Customer", "Plan", "Remaining", "Status", "Starts", "Delivery Boy", "Tiffin", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-[11px] font-extrabold text-[#4B5563] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(212,184,150,0.1)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#9CA3AF]">
                    <div className="w-8 h-8 border-4 border-[#E8392A] border-opacity-20 border-t-[#E8392A] rounded-full animate-spin mx-auto mb-3" />
                    <span className="font-medium text-sm">Loading subscriptions…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#9CA3AF]">
                    <Users size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="font-extrabold text-[18px] text-[#1A1A1A] m-0 mb-1">No subscriptions found</p>
                    <p className="text-[13px] m-0">Try changing filters or create a new one</p>
                  </td>
                </tr>
              ) : filtered.map((sub) => {
                const sc = STATUS_CHIP[sub.status] || STATUS_CHIP.cancelled;
                const isProcessing = actionLoading?.startsWith(sub.id);
                return (
                  <tr key={sub.id} className="even:bg-gray-100 hover:bg-gray-200 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-[14px] shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                          style={{ background: sub.category === "veg" ? "linear-gradient(135deg,#1B5E30,#064E3B)" : "linear-gradient(135deg,#E8392A,#B91C1C)" }}>
                          {sub.user?.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-[#1A1A1A] m-0">{sub.user?.full_name || "—"}</p>
                          <p className="text-[11px] text-[#9CA3AF] font-medium m-0 mt-0.5">{sub.user?.phone || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`text-[10px] font-extrabold rounded-md px-2 py-1 flex-shrink-0 uppercase tracking-wider ${sub.category === "veg" ? "bg-[#1B5E30]/10 text-[#1B5E30]" : "bg-[#E8392A]/10 text-[#E8392A]"}`}>
                          {sub.category === "veg" ? "VEG" : "NON-VEG"}
                        </span>
                        <span className="text-[10px] font-extrabold bg-[#6366F1]/10 text-[#4F46E5] rounded-md px-2 py-1 uppercase tracking-wider flex-shrink-0">
                          {sub.meal_type === "both" ? "LUNCH & DINNER" : sub.meal_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-[60px] h-1.5 rounded-full bg-gray-200 overflow-hidden relative shadow-inner">
                          <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${sub.remaining_days <= 3 ? "bg-[#EF4444]" : sub.remaining_days <= 7 ? "bg-[#F59E0B]" : "bg-[#1B5E30]"}`} 
                               style={{ width: `${Math.max(4, (sub.remaining_days / sub.total_days) * 100)}%` }} />
                        </div>
                        <span className="text-[13px] font-bold text-[#4A3A2A]">{sub.remaining_days}d</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: sc.bg, color: sc.text }}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-[#6B7280]">
                      {new Date(sub.starts_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-[180px]">
                      <CustomSelect
                        value={sub.assigned_delivery_boy || ""}
                        onChange={(val) => handleAssign(sub.id, val)}
                        options={[
                          { value: "", label: "Unassigned" },
                          ...deliveryBoys.map(b => ({ value: b.id, label: b.full_name }))
                        ]}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/tiffin-orders?subscription_id=${sub.id}`}
                        className="text-[12px] font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors inline-flex items-center gap-1">
                        View Orders <ArrowRight size={12} />
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {sub.status === "active" && (
                          <button onClick={() => handleAction("pause", sub.id)} disabled={isProcessing}
                            title="Pause" className="px-2 py-1.5 rounded-lg bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706] hover:text-white border-none cursor-pointer text-[12px] font-bold transition-colors">
                            <Pause size={14} />
                          </button>
                        )}
                        {sub.status === "paused" && (
                          <button onClick={() => handleAction("resume", sub.id)} disabled={isProcessing}
                            title="Resume" className="px-2 py-1.5 rounded-lg bg-[#1B5E30]/10 text-[#1B5E30] hover:bg-[#1B5E30] hover:text-white border-none cursor-pointer text-[12px] font-bold transition-colors">
                            <Play size={14} />
                          </button>
                        )}
                        <button onClick={() => setShowExtendModal(sub.id)}
                          title="Extend" className="px-2 py-1.5 rounded-lg bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1] hover:text-white border-none cursor-pointer text-[11px] font-bold transition-colors">
                          +d
                        </button>
                        {["active", "paused"].includes(sub.status) && (
                          <button onClick={() => {
                            confirm({
                              title: "Cancel Subscription",
                              message: "Are you sure you want to cancel this subscription?",
                              confirmText: "Cancel Subscription",
                              onConfirm: () => handleAction("cancel", sub.id)
                            });
                          }} disabled={isProcessing}
                            title="Cancel" className="px-2 py-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white border-none cursor-pointer text-[12px] font-bold transition-colors">
                            <X size={14} />
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
