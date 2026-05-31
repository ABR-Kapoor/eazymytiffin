"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, Upload, X, Check, Search, Calendar, Sun, Moon } from "lucide-react";
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "36px", color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}>Food Delivery</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>{items.length} items</p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setEditItem(null); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "#E8392A", color: "white", border: "none", borderRadius: "12px", padding: "10px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px", maxWidth: "320px" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
        <input placeholder="Search menu…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Menu Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px", marginBottom: "32px" }}>
        {filtered.map((item) => (
          <div key={item.id} style={{ background: "white", borderRadius: "16px", border: "1px solid rgba(212,184,150,0.15)", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", opacity: item.is_active ? 1 : 0.5 }}>
            <img src={item.image_url || (item.category === "veg" ? "/images/veg-placeholder.png" : "/images/nonveg-placeholder.png")} alt={item.title} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <p style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", margin: 0 }}>{item.title}</p>
                <span style={{ fontSize: "10px", fontWeight: 700, background: item.category === "veg" ? "rgba(27,94,48,0.1)" : "rgba(232,57,42,0.1)", color: item.category === "veg" ? "#1B5E30" : "#E8392A", borderRadius: "999px", padding: "2px 7px", flexShrink: 0 }}>
                  {item.category === "veg" ? "VEG" : "NON-VEG"}
                </span>
              </div>
              {item.badge && <span style={{ fontSize: "10px", fontWeight: 700, background: "rgba(245,158,11,0.1)", color: "#D97706", borderRadius: "999px", padding: "2px 8px", display: "inline-block", marginBottom: "6px" }}>{item.badge}</span>}
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 10px", textTransform: "capitalize" }}>
                {item.meal_type === "both" ? "Lunch + Dinner" : item.meal_type}
              </p>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => { setEditItem(item); setForm({ title: item.title, description: item.description || "", badge: item.badge || "", category: item.category, meal_type: item.meal_type, is_active: item.is_active, image_url: item.image_url || "" }); setShowForm(true); }}
                  style={{ flex: 1, padding: "7px", borderRadius: "8px", background: "rgba(99,102,241,0.08)", color: "#6366F1", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleToggleActive(item.id, item.is_active)}
                  style={{ padding: "7px 10px", borderRadius: "8px", background: item.is_active ? "rgba(27,94,48,0.08)" : "rgba(156,163,175,0.1)", color: item.is_active ? "#1B5E30" : "#9CA3AF", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>
                  {item.is_active ? <Check size={12} /> : "Off"}
                </button>
                <button onClick={() => handleDelete(item.id)}
                  style={{ padding: "7px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "none", cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Cycle Editor */}
      <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontWeight: 800, fontSize: "18px", color: "#1A1A1A", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={20} color="#6366F1" /> Weekly Menu Cycle</h2>
        <p style={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "16px" }}>Set which dish appears each day for lunch and dinner slots.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
          {DAYS.map((day, idx) => {
            const weekday = idx === 6 ? 0 : idx + 1; // Sun=0 in JS but idx 6 in array
            return (
              <div key={day} style={{ border: "1px solid rgba(212,184,150,0.2)", borderRadius: "12px", padding: "12px" }}>
                <p style={{ fontWeight: 800, fontSize: "13px", color: idx === 6 ? "#9CA3AF" : "#1A1A1A", marginBottom: "8px" }}>
                  {day} {idx === 6 && <span style={{ fontSize: "10px" }}>(Closed)</span>}
                </p>
                {idx !== 6 && (
                  <>
                    <div style={{ marginBottom: "6px" }}>
                      <label style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}><Sun size={12} color="#F59E0B" /> Lunch</label>
                      <CustomSelect 
                        value=""
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
                      <label style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}><Moon size={12} color="#6366F1" /> Dinner</label>
                      <CustomSelect 
                        value=""
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
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
