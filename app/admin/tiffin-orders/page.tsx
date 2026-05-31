"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search, RefreshCw, Plus, X, Send, FileText,
  CheckCircle, SkipForward, Trash2, ChefHat, Bell, Calendar, Leaf, Drumstick, Sun, Moon
} from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useConfirm } from "@/components/ConfirmProvider";

type TiffinDay = {
  id: string;
  meal_date: string;
  meal_type: string;
  status: string;
  deducted: boolean;
  created_at: string;
  subscription: {
    id: string;
    category: string;
    meal_type: string;
    status: string;
    remaining_days: number;
    user: { id: string; full_name: string; phone: string; email: string } | null;
  } | null;
};

type SubscriptionOption = {
  id: string;
  category: string;
  meal_type: string;
  status: string;
  user: { full_name: string; phone: string } | null;
};

const STATUS_CHIP: Record<string, { bg: string; text: string; label: string }> = {
  upcoming:  { bg: "rgba(99,102,241,0.1)",   text: "#6366F1", label: "Upcoming"  },
  preparing: { bg: "rgba(245,158,11,0.1)",   text: "#D97706", label: "Preparing" },
  delivered: { bg: "rgba(27,94,48,0.1)",     text: "#1B5E30", label: "Delivered" },
  skipped:   { bg: "rgba(156,163,175,0.1)",  text: "#6B7280", label: "Skipped"   },
  cancelled: { bg: "rgba(239,68,68,0.1)",    text: "#EF4444", label: "Cancelled" },
};

const ALL_STATUSES = ["all", "upcoming", "preparing", "delivered", "skipped", "cancelled"];

export default function AdminTiffinOrdersPage() {
  const [orders, setOrders] = useState<TiffinDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionOption[]>([]);
  const [createForm, setCreateForm] = useState({ subscriptionId: "", mealDate: "", mealType: "both" });
  const [creating, setCreating] = useState(false);

  // Interaction drawer
  const [drawerOrder, setDrawerOrder] = useState<TiffinDay | null>(null);
  const { confirm } = useConfirm();
  const [noteText, setNoteText] = useState("");
  const [savedNote, setSavedNote] = useState<{ note: string; savedAt: string } | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: "", message: "" });
  const [notifying, setSending] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/tiffin-orders?${params}`);
      const json = await res.json();
      if (json.success) setOrders(json.data || []);
      else {
        console.error("fetchOrders error:", json.error);
        showToast(json.error || "Failed to load orders", "error");
      }
    } catch (err: any) { 
      console.error("fetchOrders network error:", err);
      showToast("Network error while loading orders", "error");
    }
    finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30s (subscription_days not in realtime)
    intervalRef.current = setInterval(() => fetchOrders(true), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchOrders]);

  const fetchSubscriptionsForCreate = async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, category, meal_type, status, user:users!subscriptions_user_id_fkey(full_name, phone)")
      .eq("status", "active")
      .limit(100);
    setSubscriptions((data as any) || []);
  };

  // CREATE
  const handleCreate = async () => {
    if (!createForm.subscriptionId || !createForm.mealDate || !createForm.mealType) {
      showToast("All fields are required", "error"); return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/tiffin-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: createForm.subscriptionId, mealDate: createForm.mealDate, mealType: createForm.mealType }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Tiffin order created successfully!");
        setShowCreate(false);
        setCreateForm({ subscriptionId: "", mealDate: "", mealType: "both" });
        fetchOrders();
      } else showToast(json.error || "Create failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setCreating(false); }
  };

  // UPDATE STATUS
  const handleStatusChange = async (id: string, newStatus: string, fromStatus: string) => {
    const res = await fetch("/api/admin/tiffin-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus, fromStatus }),
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Status updated to ${newStatus} successfully`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (drawerOrder?.id === id) setDrawerOrder(prev => prev ? { ...prev, status: newStatus } : prev);
    } else showToast(json.error || "Update failed", "error");
  };

  // DELETE
  const handleDelete = async (id: string, mealDate: string) => {
    confirm({
      title: "Delete Order",
      message: "Delete this tiffin order record?",
      confirmText: "Delete",
      onConfirm: async () => {
        const res = await fetch("/api/admin/tiffin-orders", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, mealDate }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Tiffin order deleted successfully!");
          setOrders(prev => prev.filter(o => o.id !== id));
          if (drawerOrder?.id === id) setDrawerOrder(null);
        } else showToast(json.error || "Delete failed", "error");
      }
    });
  };

  // DRAWER — load note
  const openDrawer = async (order: TiffinDay) => {
    setDrawerOrder(order);
    setNoteText("");
    setSavedNote(null);
    setNotifyForm({ title: "", message: "" });
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/admin/tiffin-orders/note?subscriptionDayId=${order.id}`);
      const json = await res.json();
      if (json.success && json.note) setSavedNote({ note: json.note, savedAt: json.savedAt });
    } catch { }
    finally { setNoteLoading(false); }
  };

  // SAVE NOTE
  const handleSaveNote = async () => {
    if (!noteText.trim() || !drawerOrder) return;
    const res = await fetch("/api/admin/tiffin-orders/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionDayId: drawerOrder.id, note: noteText }),
    });
    const json = await res.json();
    if (json.success) {
      showToast("Note saved successfully!");
      setSavedNote({ note: noteText, savedAt: new Date().toISOString() });
      setNoteText("");
    } else showToast(json.error || "Save failed", "error");
  };

  // SEND NOTIFICATION
  const handleSendNotification = async () => {
    if (!notifyForm.title.trim() || !notifyForm.message.trim() || !drawerOrder) {
      showToast("Title and message are required", "error"); return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/tiffin-orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionDayId: drawerOrder.id, title: notifyForm.title, message: notifyForm.message }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Notification sent to customer successfully!");
        setNotifyForm({ title: "", message: "" });
      } else showToast(json.error || "Send failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSending(false); }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 500, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
          {toast.type === "success" ? "Yes" : "No"} {toast.msg}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "24px", padding: "28px", maxWidth: "460px", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "18px", margin: 0 }}>Create Tiffin Order</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {[
              { label: "Meal Date *", type: "date", key: "mealDate" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>{f.label}</label>
                <input type={f.type} value={(createForm as any)[f.key]}
                  onChange={(e) => setCreateForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Subscription *</label>
              <CustomSelect 
                value={createForm.subscriptionId} 
                onChange={(val) => setCreateForm(p => ({ ...p, subscriptionId: val }))}
                options={[
                  { value: "", label: "— Select subscription —" },
                  ...subscriptions.map(s => ({
                    value: s.id,
                    label: `${s.user?.full_name || "Unknown"} · ${s.category === "veg" ? "Veg" : "Non-Veg"} ${s.meal_type}`
                  }))
                ]}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Meal Type *</label>
              <CustomSelect 
                value={createForm.mealType} 
                onChange={(val) => setCreateForm(p => ({ ...p, mealType: val }))}
                options={[
                  { value: "lunch", label: "Lunch" },
                  { value: "dinner", label: "Dinner" },
                  { value: "both", label: "Both" }
                ]}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreate} disabled={creating}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.6 : 1 }}>
                {creating ? "Creating…" : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Drawer */}
      {drawerOrder && (
        <>
          <div onClick={() => setDrawerOrder(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "420px", background: "white", zIndex: 201, boxShadow: "-8px 0 32px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {/* Drawer header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(212,184,150,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1A1A1A", flexShrink: 0 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: "15px", color: "white", margin: 0 }}>Tiffin Order</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>
                  {new Date(drawerOrder.meal_date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setDrawerOrder(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "white" }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Customer Info */}
              <div style={{ background: "#F8FAFC", borderRadius: "14px", padding: "14px" }}>
                <p style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Customer</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#E8392A,#B91C1C)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "14px", flexShrink: 0 }}>
                    {drawerOrder.subscription?.user?.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "14px", color: "#1A1A1A", margin: 0 }}>{drawerOrder.subscription?.user?.full_name || "—"}</p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "1px 0 0" }}>{drawerOrder.subscription?.user?.phone || "—"}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, background: drawerOrder.subscription?.category === "veg" ? "rgba(27,94,48,0.1)" : "rgba(232,57,42,0.1)", color: drawerOrder.subscription?.category === "veg" ? "#1B5E30" : "#E8392A", borderRadius: "999px", padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {drawerOrder.subscription?.category === "veg" ? <><Leaf size={12}/> Veg</> : <><Drumstick size={12}/> Non-Veg</>}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#6366F1", borderRadius: "999px", padding: "3px 8px", textTransform: "capitalize" }}>
                    {drawerOrder.meal_type === "both" ? "Lunch + Dinner" : drawerOrder.meal_type}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, background: (STATUS_CHIP[drawerOrder.status] || STATUS_CHIP.upcoming).bg, color: (STATUS_CHIP[drawerOrder.status] || STATUS_CHIP.upcoming).text, borderRadius: "999px", padding: "3px 8px", textTransform: "capitalize" }}>
                    {drawerOrder.status}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ background: "#F8FAFC", borderRadius: "14px", padding: "14px" }}>
                <p style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>Quick Actions</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { label: "Delivered", status: "delivered", color: "#1B5E30", bg: "rgba(27,94,48,0.1)", icon: <CheckCircle size={14} /> },
                    { label: "Skipped", status: "skipped", color: "#6B7280", bg: "rgba(156,163,175,0.1)", icon: <SkipForward size={14} /> },
                    { label: "Cancelled", status: "cancelled", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: <X size={14} /> },
                  ].map((a) => (
                    <button key={a.status} onClick={() => handleStatusChange(drawerOrder.id, a.status, drawerOrder.status)}
                      disabled={drawerOrder.status === a.status}
                      style={{ padding: "8px 6px", borderRadius: "9px", background: a.bg, color: a.color, border: "none", cursor: drawerOrder.status === a.status ? "default" : "pointer", fontWeight: 700, fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", opacity: drawerOrder.status === a.status ? 0.5 : 1 }}>
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Note */}
              <div style={{ background: "#F8FAFC", borderRadius: "14px", padding: "14px" }}>
                <p style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={12} /> Admin Note
                </p>
                {noteLoading ? (
                  <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Loading…</p>
                ) : savedNote ? (
                  <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: "8px", padding: "10px", marginBottom: "8px", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <p style={{ fontSize: "12px", color: "#1A1A1A", margin: "0 0 4px", fontWeight: 500 }}>{savedNote.note}</p>
                    <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>
                      Saved {new Date(savedNote.savedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ) : null}
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  rows={2} placeholder="Add a note for this tiffin order…"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "12px", outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit" }} />
                <button onClick={handleSaveNote} disabled={!noteText.trim()}
                  style={{ marginTop: "6px", padding: "7px 14px", borderRadius: "8px", background: "#6366F1", color: "white", border: "none", fontWeight: 700, fontSize: "12px", cursor: noteText.trim() ? "pointer" : "not-allowed", opacity: noteText.trim() ? 1 : 0.5 }}>
                  Save Note
                </button>
              </div>

              {/* Send Notification */}
              <div style={{ background: "#F8FAFC", borderRadius: "14px", padding: "14px" }}>
                <p style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Bell size={12} /> Notify Customer
                </p>
                <input type="text" placeholder="Notification title…" value={notifyForm.title}
                  onChange={(e) => setNotifyForm(p => ({ ...p, title: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "12px", outline: "none", boxSizing: "border-box", marginBottom: "8px" }} />
                <textarea rows={2} placeholder="Write your message…" value={notifyForm.message}
                  onChange={(e) => setNotifyForm(p => ({ ...p, message: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "12px", outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit" }} />
                <button onClick={handleSendNotification} disabled={notifying || !notifyForm.title.trim() || !notifyForm.message.trim()}
                  style={{ marginTop: "8px", width: "100%", padding: "10px", borderRadius: "10px", background: "#E8392A", color: "white", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: (notifying || !notifyForm.title.trim() || !notifyForm.message.trim()) ? 0.6 : 1 }}>
                  <Send size={14} /> {notifying ? "Sending…" : "Send Notification"}
                </button>
              </div>

              {/* Danger zone */}
              <div style={{ borderTop: "1px solid rgba(239,68,68,0.15)", paddingTop: "12px" }}>
                <button onClick={() => handleDelete(drawerOrder.id, drawerOrder.meal_date)}
                  style={{ padding: "8px 14px", borderRadius: "9px", background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Trash2 size={13} /> Delete Record
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "36px", color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}>Tiffin Orders</h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>
            {orders.length} records · auto-refreshes every 30s
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => fetchOrders()} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid rgba(212,184,150,0.3)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => { setShowCreate(true); fetchSubscriptionsForCreate(); }}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#E8392A", color: "white", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input placeholder="Search customer name or phone…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "10px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
        {ALL_STATUSES.map((s) => {
          const chip = STATUS_CHIP[s];
          const isActive = statusFilter === s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", textTransform: "capitalize", border: "1px solid", background: isActive ? "#1A1A1A" : "white", color: isActive ? "white" : "#4A3A2A", borderColor: isActive ? "#1A1A1A" : "rgba(212,184,150,0.3)" }}>
              {s === "all" ? "All" : chip?.label || s}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "16px", border: "1px solid rgba(212,184,150,0.15)", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid rgba(212,184,150,0.15)" }}>
                {["Customer", "Date", "Meal Type", "Category", "Status", "Deducted", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "50px", color: "#9CA3AF" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                  Loading…
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "60px", color: "#D1D5DB" }}>
                  <Calendar size={36} style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontWeight: 700, color: "#1A1A1A", margin: 0 }}>No tiffin orders found</p>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "4px 0 0" }}>Try changing filters or create a new one</p>
                </td></tr>
              ) : orders.map((order) => {
                const sc = STATUS_CHIP[order.status] || STATUS_CHIP.upcoming;
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid rgba(212,184,150,0.08)", transition: "background 150ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 14px" }}>
                      <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{order.subscription?.user?.full_name || "—"}</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "1px 0 0" }}>{order.subscription?.user?.phone || "—"}</p>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: "#4A3A2A", fontWeight: 600 }}>
                      {new Date(order.meal_date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "capitalize", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {order.meal_type === "both" ? <><Sun size={12}/><Moon size={12}/> Both</> : order.meal_type === "lunch" ? <><Sun size={12}/> Lunch</> : <><Moon size={12}/> Dinner</>}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: order.subscription?.category === "veg" ? "rgba(27,94,48,0.1)" : "rgba(232,57,42,0.1)", color: order.subscription?.category === "veg" ? "#1B5E30" : "#E8392A", borderRadius: "999px", padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {order.subscription?.category === "veg" ? <><Leaf size={12}/> Veg</> : <><Drumstick size={12}/> Non-Veg</>}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <CustomSelect 
                        value={order.status}
                        onChange={(val) => handleStatusChange(order.id, val, order.status)}
                        options={Object.entries(STATUS_CHIP).map(([k, v]) => ({ value: k, label: v.label }))}
                        style={{ minWidth: "100px" }}
                      />
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "16px" }}>
                      {order.deducted ? "Yes" : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => openDrawer(order)}
                          style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(99,102,241,0.1)", color: "#6366F1", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <FileText size={12} /> Details
                        </button>
                        <button onClick={() => handleDelete(order.id, order.meal_date)}
                          style={{ padding: "5px 8px", borderRadius: "7px", background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "none", cursor: "pointer" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
