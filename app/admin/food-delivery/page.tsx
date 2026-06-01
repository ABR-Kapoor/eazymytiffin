"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, Upload, X, Check, Search, Calendar, Sun, Moon, Utensils } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";

type MenuItem = {
  id: string; title: string; description: string | null; image_url: string | null;
  badge: string | null; category: "veg" | "non_veg"; meal_type: "lunch" | "dinner" | "both";
  is_active: boolean; created_at: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyForm = {
  title: "", description: "", badge: "", category: "veg" as "veg" | "non_veg",
  meal_type: "both" as "lunch" | "dinner" | "both", is_active: true, image_url: "",
};

export default function AdminFoodDeliveryPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cycle, setCycle] = useState<Record<number, { lunch?: MenuItem; dinner?: MenuItem }>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const { confirm } = useConfirm();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const { data } = await supabase.from("menus").select("*").order("created_at", { ascending: false });
    setItems((data as MenuItem[]) || []);

    // Fetch weekly cycle
    const { data: cycleData } = await supabase.from("weekly_menu_cycles").select("*, menu:menus(*)");
    const cycleMap: Record<number, { lunch?: MenuItem; dinner?: MenuItem }> = {};
    (cycleData || []).forEach((c: any) => {
      if (!cycleMap[c.weekday]) cycleMap[c.weekday] = {};
      if (c.menu?.meal_type === "lunch" || c.menu?.meal_type === "both") {
        cycleMap[c.weekday].lunch = c.menu;
      }
      if (c.menu?.meal_type === "dinner" || c.menu?.meal_type === "both") {
        cycleMap[c.weekday].dinner = c.menu;
      }
    });
    setCycle(cycleMap);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/menus/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      setForm((f) => ({ ...f, image_url: json.url }));
      showToast("Image uploaded successfully!");
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      if (editItem) {
        const res = await fetch("/api/admin/menus", { method: "PATCH", body: JSON.stringify({ id: editItem.id, ...form }) });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        showToast("Food item updated successfully!");
      } else {
        const res = await fetch("/api/admin/menus", { method: "POST", body: JSON.stringify(form) });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        showToast("Food item created successfully!");
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: "Delete Item",
      message: "Delete this food item?",
      confirmText: "Delete",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/menus?id=${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) { showToast("Food item deleted successfully!"); fetchData(); }
        else showToast(json.error || "Delete failed", "error");
      }
    });
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const res = await fetch("/api/admin/menus", { method: "PATCH", body: JSON.stringify({ id, is_active: !current }) });
    const json = await res.json();
    if (json.success) fetchData();
    else showToast(json.error || "Update failed", "error");
  };

  const handleSetCycle = async (weekday: number, menuId: string, slot: "lunch" | "dinner") => {
    // Remove existing for this weekday+slot
    await supabase.from("weekly_menu_cycles").delete().eq("weekday", weekday)
      .in("menu_id", items.filter((m) => m.meal_type === slot || m.meal_type === "both").map((m) => m.id));
    if (menuId) {
      await supabase.from("weekly_menu_cycles").insert([{ menu_id: menuId, weekday }]);
    }
    fetchData();
  };

  const filtered = items.filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>{toast.msg}</div>}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
          <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ background: "white", borderRadius: "24px", padding: "28px", maxWidth: "500px", width: "100%", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "20px", margin: 0 }}>{editItem ? "Edit Menu Item" : "New Menu Item"}</h3>
              <button onClick={() => { setShowForm(false); setEditItem(null); setForm({ ...emptyForm }); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: "14px" }}>
              {form.image_url ? (
                <div style={{ position: "relative", marginBottom: "8px" }}>
                  <img src={form.image_url} alt="preview" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "12px" }} />
                  <button onClick={() => setForm((f) => ({ ...f, image_url: "" }))} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.5)", border: "none", color: "white", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer" }}><X size={14} /></button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(232,57,42,0.3)", borderRadius: "12px", padding: "28px", textAlign: "center", cursor: "pointer", background: "rgba(232,57,42,0.02)" }}>
                  <Upload size={24} style={{ color: "#E8392A", marginBottom: "8px" }} />
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#9CA3AF" }}>{uploading ? "Uploading…" : "Click to upload image"}</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Or paste image URL</label>
                <input type="url" placeholder="https://…" value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Title *</label>
              <input type="text" placeholder="Dal Tadka" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Description</label>
              <input type="text" placeholder="Creamy yellow dal with tadka" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Badge</label>
              <input type="text" placeholder="Chef's Special" value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Category</label>
                <CustomSelect 
                  value={form.category} 
                  onChange={(val) => setForm((f) => ({ ...f, category: val as any }))}
                  options={[
                    { value: "veg", label: "Veg" },
                    { value: "non_veg", label: "Non-Veg" }
                  ]}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Meal Type</label>
                <CustomSelect 
                  value={form.meal_type} 
                  onChange={(val) => setForm((f) => ({ ...f, meal_type: val as any }))}
                  options={[
                    { value: "lunch", label: "Lunch" },
                    { value: "dinner", label: "Dinner" },
                    { value: "both", label: "Both" }
                  ]}
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "20px" }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
              Active (visible to customers)
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setShowForm(false); setEditItem(null); }} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8392A]/10 flex items-center justify-center text-[#E8392A]">
              <Utensils size={20} />
            </div>
            Menu & Cycles
          </h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1.5 font-medium ml-[48px]">{items.length} food items managed</p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setEditItem(null); setShowForm(true); }}
          className="btn-glare flex items-center justify-center gap-2 bg-[#E8392A] text-white rounded-xl px-5 py-2.5 text-[13px] font-bold shadow-lg shadow-[#E8392A]/30 hover:shadow-[#E8392A]/50 hover:-translate-y-0.5 transition-all w-fit">
          <Plus size={16} /> Add Menu Item
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 w-full animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input placeholder="Search menu items…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(212,184,150,0.3)] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#E8392A] focus:border-transparent transition-all shadow-sm" />
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
        {filtered.map((item) => (
          <div key={item.id} className={`card-lift bg-white rounded-2xl border border-[rgba(212,184,150,0.2)] overflow-hidden shadow-sm flex flex-col transition-all duration-300 ${!item.is_active ? 'opacity-60 grayscale-[30%]' : ''}`}>
            <div className="relative">
              <img src={item.image_url || (item.category === "veg" ? "/images/veg-placeholder.png" : "/images/nonveg-placeholder.png")} alt={item.title} className="w-full h-[160px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider ${item.category === "veg" ? "bg-[#1B5E30] text-white" : "bg-[#E8392A] text-white"}`}>
                  {item.category === "veg" ? "Veg" : "Non-Veg"}
                </span>
                {item.badge && <span className="text-[10px] font-bold bg-[#F59E0B] text-white rounded-md px-2.5 py-1 shadow-sm">{item.badge}</span>}
              </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-auto">
                <p className="font-extrabold text-[16px] text-[#1A1A1A] m-0 mb-1 leading-tight">{item.title}</p>
                <p className="text-[12px] font-medium text-[#6B7280] m-0 capitalize mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
                  {item.meal_type === "both" ? "Lunch & Dinner" : item.meal_type}
                </p>
              </div>
              <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
                <button onClick={() => { setEditItem(item); setForm({ title: item.title, description: item.description || "", badge: item.badge || "", category: item.category, meal_type: item.meal_type, is_active: item.is_active, image_url: item.image_url || "" }); setShowForm(true); }}
                  className="flex-1 py-2 rounded-lg bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#1F2937] border-none cursor-pointer text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleToggleActive(item.id, item.is_active)}
                  className={`px-3 py-2 rounded-lg border-none cursor-pointer text-[12px] font-bold flex items-center justify-center transition-colors ${item.is_active ? "bg-[#1B5E30]/10 text-[#1B5E30] hover:bg-[#1B5E30] hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {item.is_active ? <Check size={14} /> : "Off"}
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="px-3 py-2 rounded-lg bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white border-none cursor-pointer transition-colors flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Cycle Editor */}
      <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-[rgba(212,184,150,0.2)] shadow-sm animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
            <Calendar size={20} />
          </div>
          <h2 className="font-extrabold text-[20px] text-[#1A1A1A] m-0">Weekly Menu Cycle</h2>
        </div>
        <p className="text-[#6B7280] text-[13px] mb-8 font-medium ml-[52px]">Set which dish appears each day for lunch and dinner slots.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS.map((day, idx) => {
            const weekday = idx === 6 ? 0 : idx + 1; // Sun=0 in JS but idx 6 in array
            const CARD_COLORS = ["#1B5E30", "#E8392A", "#D35400", "#6366F1", "#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981"];
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <div key={day} 
                className={`rounded-[20px] p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group ${idx === 6 ? 'opacity-60 grayscale-[30%]' : ''}`}
                style={{ 
                  background: idx === 6 ? '#F9FAFB' : `linear-gradient(135deg, ${color}12, ${color}03)`, 
                  border: idx === 6 ? '1px solid #E5E7EB' : `1px solid ${color}25` 
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-50 pointer-events-none rounded-bl-full" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <p className={`font-extrabold text-[16px] m-0 ${idx === 6 ? 'text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>
                    {day}
                  </p>
                  {idx === 6 && <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Closed</span>}
                </div>
                
                {idx !== 6 && (
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="text-[11px] font-bold text-[#6B7280] flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                        <Sun size={14} className="text-[#F59E0B]" /> Lunch Slot
                      </label>
                      <CustomSelect 
                        value={cycle[weekday]?.lunch?.id || ""}
                        onChange={(val) => handleSetCycle(weekday, val, "lunch")}
                        options={[
                          { value: "", label: "— Not set —" },
                          ...items.filter((m) => m.is_active && (m.meal_type === "lunch" || m.meal_type === "both")).map((m) => ({
                            value: m.id,
                            label: `${m.title} ${m.category === "veg" ? "(Veg)" : "(Non-veg)"}`
                          }))
                        ]}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#6B7280] flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                        <Moon size={14} className="text-[#6366F1]" /> Dinner Slot
                      </label>
                      <CustomSelect 
                        value={cycle[weekday]?.dinner?.id || ""}
                        onChange={(val) => handleSetCycle(weekday, val, "dinner")}
                        options={[
                          { value: "", label: "— Not set —" },
                          ...items.filter((m) => m.is_active && (m.meal_type === "dinner" || m.meal_type === "both")).map((m) => ({
                            value: m.id,
                            label: `${m.title} ${m.category === "veg" ? "(Veg)" : "(Non-veg)"}`
                          }))
                        ]}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
