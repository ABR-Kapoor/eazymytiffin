"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Search, Filter, Trash2, RefreshCw, Send, ArrowRight, ClipboardList, Megaphone, User } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";

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
        showToast(`Sent to ${users.length} users successfully!`);
      } else {
        const { error } = await supabase.from("notifications").insert([{
          user_id: form.userId, title: form.title, body: form.body,
          type: form.type, channel: form.channel,
        }]);
        if (error) throw error;
        showToast("Notification sent successfully!");
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
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, background: toast.type === "success" ? "#1B5E30" : "#E8392A", color: "white", borderRadius: "12px", padding: "12px 20px", fontSize: "13px", fontWeight: 600 }}>{toast.msg}</div>}

      <h1 className="font-extrabold text-[28px] text-[#1A1A1A] m-0 tracking-tight flex items-center gap-2 mb-8 animate-fade-up">
        <div className="w-10 h-10 rounded-xl bg-[#E8392A]/10 flex items-center justify-center text-[#E8392A]">
          <Bell size={20} />
        </div>
        Notifications
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send panel */}
        <div className="card-lift bg-white rounded-[24px] p-6 shadow-sm border border-[rgba(212,184,150,0.2)] h-fit animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-extrabold text-lg mb-5 flex items-center gap-2 text-[#1A1A1A]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#E8392A]" style={{ background: "rgba(232, 57, 42, 0.1)" }}>
              <Bell size={16} />
            </div>
            Send Notification
          </h2>

          <div className="mb-4">
            <label className="text-[11px] font-bold text-[#9CA3AF] block mb-1.5 uppercase tracking-wider">Recipient</label>
            <CustomSelect 
              value={form.userId} 
              onChange={(val) => setForm((f) => ({ ...f, userId: val }))}
              options={[
                { value: "all", label: <span className="flex items-center gap-2"><Megaphone size={14} /> All Active Customers ({users.length})</span> },
                ...users.map(u => ({ value: u.id, label: <span className="flex items-center gap-2"><User size={14} /> {u.full_name}</span> }))
              ]}
            />
          </div>

          <div className="mb-4">
            <label className="text-[11px] font-bold text-[#9CA3AF] block mb-1.5 uppercase tracking-wider">Type</label>
            <CustomSelect 
              value={form.type} 
              onChange={(val) => setForm((f) => ({ ...f, type: val }))}
              options={[
                { value: "system", label: "System" },
                { value: "payment", label: "Payment" },
                { value: "delivery", label: "Delivery" },
                { value: "subscription", label: "Subscription" }
              ]}
            />
          </div>

          <div className="mb-4">
            <label className="text-[11px] font-bold text-[#9CA3AF] block mb-1.5 uppercase tracking-wider">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Notification title…"
              className="w-full px-4 py-3 rounded-xl border border-[rgba(212,184,150,0.3)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#E8392A] focus:border-transparent transition-all bg-white" />
          </div>

          <div className="mb-5">
            <label className="text-[11px] font-bold text-[#9CA3AF] block mb-1.5 uppercase tracking-wider">Message</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={3} placeholder="Write your message…"
              className="w-full px-4 py-3 rounded-xl border border-[rgba(212,184,150,0.3)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#E8392A] focus:border-transparent transition-all bg-white resize-none" />
          </div>

          <button onClick={handleSend} disabled={sending}
            className="w-full py-3.5 bg-[#E8392A] hover:bg-[#C72E1F] text-white rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(232,57,42,0.2)] hover:shadow-[0_6px_16px_rgba(232,57,42,0.3)] disabled:opacity-60 disabled:cursor-not-allowed btn-glare">
            <Send size={16} /> {sending ? "Sending…" : "Send Notification"}
          </button>
        </div>

        {/* History */}
        <div className="lg:col-span-2 card-lift bg-white rounded-[24px] p-6 shadow-sm border border-[rgba(212,184,150,0.2)] animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-extrabold text-lg mb-5 flex items-center gap-2 text-[#1A1A1A]">
            <div className="w-8 h-8 rounded-lg bg-[#F4EBE0] flex items-center justify-center text-[#6B7280]">
              <ClipboardList size={16} />
            </div>
            Recent Notifications
          </h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#E8392A] border-opacity-20 border-t-[#E8392A] rounded-full animate-spin mb-4" />
              <p className="text-[#9CA3AF] font-medium text-sm">Loading history…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-4 p-4 rounded-[16px] bg-[#FDF9F3] border border-[rgba(212,184,150,0.2)] hover:bg-white hover:shadow-md transition-all duration-300 group relative overflow-hidden shrink-0 items-start">
                  <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: TYPE_COLORS[n.type] || "#9CA3AF" }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${TYPE_COLORS[n.type]}15`, color: TYPE_COLORS[n.type] }}>
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="font-bold text-[14px] text-[#1A1A1A] truncate pr-4">{n.title}</p>
                      <span className="text-[11px] font-medium text-[#9CA3AF] flex-shrink-0 whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                        {new Date(n.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6B7280] mb-3 leading-relaxed">{n.body}</p>
                    <div className="flex flex-wrap gap-2 items-center mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ background: `${TYPE_COLORS[n.type]}15`, color: TYPE_COLORS[n.type] }}>
                        {n.type}
                      </span>
                      <span className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1.5 bg-white border border-gray-100 px-2 py-0.5 rounded-md shadow-sm">
                        <ArrowRight size={10} className="text-gray-400" /> {n.user?.full_name || "All Users"}
                      </span>
                      {!n.is_read && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-50 text-red-600 ml-auto">
                          Unread
                        </span>
                      )}
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
