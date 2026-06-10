"use client";

import { useEffect, useState } from "react";
import { Plus, X, Edit2, Trash2, ChefHat, ToggleLeft, ToggleRight, ClipboardList } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/lib/useToast";

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
  const { toast, showToast } = useToast();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8392A]/10 flex items-center justify-center text-[#E8392A]">
              <ClipboardList size={20} />
            </div>
            Subscription Plans
          </h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1.5 font-medium ml-[48px]">{plans.length} plans configured</p>
        </div>
        <button onClick={openCreate}
          className="btn-glare flex items-center justify-center gap-2 bg-[#E8392A] text-white rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-lg shadow-[#E8392A]/30 hover:shadow-[#E8392A]/50 hover:-translate-y-0.5 transition-all w-fit">
          <Plus size={16} /> New Plan
        </button>
      </div>

      {/* Plans grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF" }}>Loading plans…</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 px-5 bg-white rounded-2xl border border-[rgba(212,184,150,0.15)] shadow-sm animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <ChefHat size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-900 m-0 mb-1">No plans created yet</p>
          <p className="text-[13px] text-gray-400 m-0 mb-4">Create your first subscription plan</p>
          <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-[#E8392A] text-white border-none font-bold cursor-pointer hover:bg-red-700 transition-colors shadow-md">+ Create Plan</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {plans.map((plan, index) => {
            const CARD_COLORS = ["#1B5E30", "#E8392A", "#D35400", "#6366F1", "#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981"];
            const color = CARD_COLORS[index % CARD_COLORS.length];
            return (
            <div key={plan.id} 
              className={`rounded-[24px] p-5 relative overflow-hidden flex flex-col shadow-sm transition-all duration-300 hover:shadow-md group ${!plan.is_active ? 'opacity-60 grayscale-[30%]' : ''}`}
              style={{ 
                background: plan.is_active ? `linear-gradient(135deg, ${color}12, ${color}03)` : '#F9FAFB', 
                border: plan.is_active ? `1px solid ${color}25` : '1px solid #E5E7EB' 
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-50 pointer-events-none rounded-bl-full" />
              {/* Card header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2.5 flex-wrap">
                    {plan.is_trial && <span className="text-[10px] font-extrabold bg-[#F59E0B]/10 text-[#D97706] rounded-full px-2.5 py-0.5 tracking-wider uppercase border border-[#F59E0B]/20">Trial</span>}
                    {!plan.is_active && <span className="text-[10px] font-extrabold bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 tracking-wider uppercase border border-gray-200">Inactive</span>}
                    <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 tracking-wider uppercase border ${plan.category === "veg" ? "bg-[#1B5E30]/10 text-[#1B5E30] border-[#1B5E30]/20" : "bg-[#E8392A]/10 text-[#E8392A] border-[#E8392A]/20"}`}>
                      {plan.category === "veg" ? "VEG" : "NON-VEG"}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[17px] text-[#1A1A1A] m-0 leading-tight">{plan.title}</h3>
                  {plan.description && <p className="text-[12px] font-medium text-[#6B7280] mt-1.5 mb-0 leading-relaxed">{plan.description}</p>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5 mt-auto relative z-10">
                {[
                  { label: "Duration", value: `${plan.duration_days}d` },
                  { label: "Price", value: plan.is_trial ? "FREE" : `₹${plan.price}` },
                  { label: "Meals", value: plan.meal_type === "both" ? "Both" : plan.meal_type === "lunch" ? "Lunch" : "Dinner" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-2.5 text-center shadow-sm" style={{ border: `1px solid ${color}20` }}>
                    <p className="font-extrabold text-[15px] text-[#1A1A1A] m-0 mb-0.5">{s.value}</p>
                    <p className="text-[10px] font-bold text-[#9CA3AF] m-0 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-black/5 relative z-10">
                <button onClick={() => openEdit(plan)}
                  className="flex-1 py-2 rounded-lg bg-white shadow-sm text-gray-700 hover:text-[#1A1A1A] cursor-pointer text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5"
                  style={{ border: `1px solid ${color}20` }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleToggleActive(plan)}
                  className={`flex-1 py-2 rounded-lg bg-white shadow-sm cursor-pointer text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 ${plan.is_active ? "text-[#D97706] hover:bg-[#F59E0B] hover:text-white" : "text-[#1B5E30] hover:bg-[#1B5E30] hover:text-white"}`}
                  style={{ border: `1px solid ${color}20` }}>
                  {plan.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {plan.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDelete(plan)}
                  className="px-2.5 py-2 rounded-lg bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white border-none cursor-pointer transition-colors flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
