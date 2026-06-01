"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Bell } from "lucide-react";

type Notification = {
  id: string; title: string; body: string; type: string; channel: string; is_read: boolean; created_at: string;
  user: { full_name: string } | null;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ userId: "all", title: "", body: "", type: "system", channel: "in_app" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    const { data: notifs } = await supabase
      .from("notifications").select("*, user:users(full_name)")
      .order("created_at", { ascending: false }).limit(50);
    setNotifications((notifs as any) || []);

    const { data: userList } = await supabase.from("users").select("id, full_name").eq("role", "customer").eq("status", "active");
    setUsers(userList || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) { showToast("Title and body required", "error"); return; }
    setSending(true);
    try {
      if (form.userId === "all") {
        // Broadcast to all active customers
        const inserts = users.map((u) => ({
          user_id: u.id, title: form.title, body: form.body,
          type: form.type, channel: form.channel,
        }));
        const { error } = await supabase.from("notifications").insert(inserts);
        if (error) throw error;
        showToast(`Sent to ${users.length} users!`);
      } else {
        const { error } = await supabase.from("notifications").insert([{
          user_id: form.userId, title: form.title, body: form.body,
          type: form.type, channel: form.channel,
        }]);
        if (error) throw error;
        showToast("Notification sent!");
      }
      setForm((f) => ({ ...f, title: "", body: "" }));
      fetchData();
    } catch (err: any) { showToast(err.message || "Send failed", "error"); }
    finally { setSending(false); }
  };

  const TYPE_COLORS: Record<string, string> = {
    system: "#9CA3AF", payment: "#1B5E30", delivery: "#E8392A", subscription: "#6366F1",
  };

  return (
    <div>
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600 }}>{toast.type === "success" ? "✅ " : "❌ "}{toast.msg}</div>}

      <h1 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", marginBottom: "20px" }}>Notifications</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        {/* Send panel */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)", height: "fit-content" }}>
          <h2 style={{ fontWeight: 800, fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} style={{ color: "#E8392A" }} /> Send Notification
          </h2>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Recipient</label>
            <select value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              style={{ width: "100%", padding: "9px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none" }}>
              <option value="all">📢 All Active Customers ({users.length})</option>
              {users.map((u) => <option key={u.id} value={u.id}>👤 {u.full_name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              style={{ width: "100%", padding: "9px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none" }}>
              <option value="system">System</option>
              <option value="payment">Payment</option>
              <option value="delivery">Delivery</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Notification title…"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: "4px" }}>Message</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={3} placeholder="Write your message…"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", outline: "none", boxSizing: "border-box", resize: "none" }} />
          </div>

          <button onClick={handleSend} disabled={sending}
            style={{ width: "100%", padding: "12px", background: "#E8392A", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Send size={16} /> {sending ? "Sending…" : "Send Notification"}
          </button>
        </div>

        {/* History */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)" }}>
          <h2 style={{ fontWeight: 800, fontSize: "16px", marginBottom: "16px" }}>📋 Recent Notifications</h2>
          {loading ? (
            <p style={{ color: "#9CA3AF", textAlign: "center", padding: "40px 0" }}>Loading…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "500px", overflowY: "auto" }}>
              {notifications.map((n) => (
                <div key={n.id} style={{ display: "flex", gap: "10px", padding: "12px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid rgba(212,184,150,0.1)" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: TYPE_COLORS[n.type] || "#9CA3AF", flexShrink: 0, marginTop: "4px" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{n.title}</p>
                      <span style={{ fontSize: "10px", color: "#9CA3AF", flexShrink: 0 }}>
                        {new Date(n.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: "3px 0 4px" }}>{n.body}</p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, background: `${TYPE_COLORS[n.type]}20`, color: TYPE_COLORS[n.type], borderRadius: "999px", padding: "2px 6px" }}>{n.type}</span>
                      <span style={{ fontSize: "10px", color: "#9CA3AF" }}>→ {n.user?.full_name || "All"}</span>
                      {!n.is_read && <span style={{ fontSize: "10px", fontWeight: 700, background: "rgba(239,68,68,0.1)", color: "#EF4444", borderRadius: "999px", padding: "2px 6px" }}>Unread</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
