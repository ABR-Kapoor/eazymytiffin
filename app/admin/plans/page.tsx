"use client";

import { useEffect, useState } from "react";
import { Plus, X, Edit2, Trash2, ChefHat, ToggleLeft, ToggleRight } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";

type Plan = {
  id: string;
  title: string;
  description: string | null;
  meal_type: "lunch" | "dinner" | "both";
  category: "veg" | "non_veg";
  duration_days: number;
  price: number;
  is_trial: boolean;
  is_active: boolean;
  created_at: string;
};

const emptyForm = {
  title: "", description: "", meal_type: "both" as Plan["meal_type"],
  category: "veg" as Plan["category"], duration_days: 30, price: 0,
  is_trial: false, is_active: true,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      const json = await res.json();
      if (json.success) setPlans(json.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => { setForm({ ...emptyForm }); setEditingId(null); setModal("create"); };
  const openEdit = (plan: Plan) => {
    setForm({ title: plan.title, description: plan.description || "", meal_type: plan.meal_type, category: plan.category, duration_days: plan.duration_days, price: plan.price, is_trial: plan.is_trial, is_active: plan.is_active });
    setEditingId(plan.id);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (form.price <= 0 && !form.is_trial) { showToast("Price must be greater than 0", "error"); return; }
    setSaving(true);
    try {
      const isEdit = modal === "edit";
      const res = await fetch(isEdit ? `/api/admin/plans?id=${editingId}` : "/api/admin/plans", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, duration_days: Number(form.duration_days), price: Number(form.price) }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(isEdit ? "Plan updated successfully!" : "Plan created successfully!");
        setModal(null);
        fetchPlans();
      } else showToast(json.error || "Save failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (plan: Plan) => {
    const res = await fetch(`/api/admin/plans?id=${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !plan.is_active }),
    });
    const json = await res.json();
    if (json.success) {
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: !p.is_active } : p));
      showToast(`Plan ${!plan.is_active ? "activated" : "deactivated"} successfully!`);
    } else showToast(json.error || "Failed", "error");
  };

  const handleDelete = async (plan: Plan) => {
    confirm({
      title: "Delete Plan",
      message: `Delete plan "${plan.title}"? This cannot be undone.`,
      confirmText: "Delete",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/plans?id=${plan.id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          if (json.activeSubsWarning > 0) showToast(`Plan deleted successfully! Note: ${json.activeSubsWarning} active subscriptions used this plan.`);
          else showToast("Plan deleted successfully!");
          setPlans(prev => prev.filter(p => p.id !== plan.id));
        } else showToast(json.error || "Delete failed", "error");
      }
    });
  };
  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 500, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
          {toast.msg}
        </div>
      )}

      {(modal === "create" || modal === "edit") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
          <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ background: "white", borderRadius: "24px", padding: "28px", maxWidth: "480px", width: "100%", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "18px", margin: 0 }}>{modal === "edit" ? "Edit Plan" : "Create Plan"}</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Title *</label>
              <input type="text" placeholder="e.g. Monthly Veg Plan" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Description</label>
              <input type="text" placeholder="Optional description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Duration (Days) *</label>
              <input type="number" placeholder="30" value={form.duration_days || ""} onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Price (₹) *</label>
              <input type="number" placeholder="999" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Meal Type *</label>
                <CustomSelect 
                  value={form.meal_type} 
                  onChange={(val) => setForm({ ...form, meal_type: val as Plan["meal_type"] })}
                  options={[
                    { value: "lunch", label: "Lunch" },
                    { value: "dinner", label: "Dinner" },
                    { value: "both", label: "Both" }
                  ]}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Category *</label>
                <CustomSelect 
                  value={form.category} 
                  onChange={(val) => setForm({ ...form, category: val as Plan["category"] })}
                  options={[
                    { value: "veg", label: "Veg" },
                    { value: "non_veg", label: "Non-Veg" }
                  ]}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                <input type="checkbox" checked={form.is_trial} onChange={(e) => setForm({ ...form, is_trial: e.target.checked })} style={{ width: "15px", height: "15px", accentColor: "#E8392A" }} />
                Trial Plan
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ width: "15px", height: "15px", accentColor: "#E8392A" }} />
                Active
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "36px", color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}>Subscription Plans</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>{plans.length} plans configured</p>
        </div>
        <button onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "#E8392A", color: "white", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> New Plan
        </button>
      </div>

      {/* Plans grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF" }}>Loading plans…</p>
        </div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "16px", border: "1px solid rgba(212,184,150,0.15)" }}>
          <ChefHat size={40} style={{ color: "#E5E7EB", margin: "0 auto 12px" }} />
          <p style={{ fontWeight: 700, color: "#1A1A1A", margin: "0 0 4px" }}>No plans created yet</p>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "0 0 16px" }}>Create your first subscription plan</p>
          <button onClick={openCreate} style={{ padding: "10px 20px", borderRadius: "10px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}>+ Create Plan</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{ background: "white", borderRadius: "20px", padding: "20px", border: `1px solid ${plan.is_active ? "rgba(212,184,150,0.2)" : "rgba(156,163,175,0.2)"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", opacity: plan.is_active ? 1 : 0.65, transition: "opacity 200ms" }}>
              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                    {plan.is_trial && <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(245,158,11,0.15)", color: "#D97706", borderRadius: "999px", padding: "2px 8px" }}>TRIAL</span>}
                    {!plan.is_active && <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(156,163,175,0.15)", color: "#6B7280", borderRadius: "999px", padding: "2px 8px" }}>INACTIVE</span>}
                    <span style={{ fontSize: "10px", fontWeight: 800, background: plan.category === "veg" ? "rgba(27,94,48,0.1)" : "rgba(232,57,42,0.1)", color: plan.category === "veg" ? "#1B5E30" : "#E8392A", borderRadius: "999px", padding: "2px 8px" }}>
                      {plan.category === "veg" ? "VEG" : "NON-VEG"}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}>{plan.title}</h3>
                  {plan.description && <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0", lineHeight: 1.4 }}>{plan.description}</p>}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                {[
                  { label: "Duration", value: `${plan.duration_days}d` },
                  { label: "Price", value: plan.is_trial ? "FREE" : `₹${plan.price}` },
                  { label: "Meals", value: plan.meal_type === "both" ? "Both" : plan.meal_type === "lunch" ? "Lunch" : "Dinner" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#F8FAFC", borderRadius: "10px", padding: "8px", textAlign: "center" }}>
                    <p style={{ fontWeight: 900, fontSize: "15px", color: "#1A1A1A", margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => openEdit(plan)}
                  style={{ flex: 1, padding: "8px", borderRadius: "9px", background: "rgba(99,102,241,0.08)", color: "#6366F1", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleToggleActive(plan)}
                  style={{ flex: 1, padding: "8px", borderRadius: "9px", background: plan.is_active ? "rgba(245,158,11,0.08)" : "rgba(27,94,48,0.08)", color: plan.is_active ? "#D97706" : "#1B5E30", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                  {plan.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                  {plan.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDelete(plan)}
                  style={{ padding: "8px 10px", borderRadius: "9px", background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "none", cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
