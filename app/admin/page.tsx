"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users, Package, TrendingUp, Pause, Clock, AlertTriangle,
  Truck, ChefHat, Wallet, RefreshCw, ArrowUpRight, Bike
} from "lucide-react";
import Link from "next/link";

type Stats = {
  activeSubscribers: number;
  pausedSubscriptions: number;
  todayRevenue: number;
  pendingOrders: number;
  failedPayments: number;
  totalUsers: number;
  activeDeliveries: number;
};

type Activity = {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
};

type ActiveDelivery = {
  id: string;
  order_id: string;
  status: string;
  eta: string | null;
  delivery_boy: { full_name: string; phone: string } | null;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  assigned: { bg: "rgba(14,165,233,0.1)", text: "#0EA5E9" },
  on_the_way: { bg: "rgba(232,57,42,0.1)", text: "#E8392A" },
  arriving: { bg: "rgba(245,166,35,0.1)", text: "#F59E0B" },
  delivered: { bg: "rgba(27,94,48,0.1)", text: "#1B5E30" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    activeSubscribers: 0, pausedSubscriptions: 0, todayRevenue: 0,
    pendingOrders: 0, failedPayments: 0, totalUsers: 0, activeDeliveries: 0,
  });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const channelRef = useRef<any>(null);

  const fetchAll = async () => {
    try {
      const [
        { count: activeSubs },
        { count: pausedSubs },
        { count: pendingOrders },
        { count: failedPay },
        { count: totalUsers },
        { count: activeDeliv },
        { data: todayPayments },
        { data: recentNotifs },
        { data: liveDeliveries },
      ] = await Promise.all([
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "paused"),
        supabase.from("food_orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("payments").select("*", { count: "exact", head: true }).eq("payment_status", "failed"),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("delivery_assignments").select("*", { count: "exact", head: true }).neq("status", "delivered"),
        supabase.from("payments").select("amount").eq("payment_status", "paid")
          .gte("created_at", new Date().toISOString().split("T")[0]),
        supabase.from("notifications").select("id, title, body, type, created_at")
          .order("created_at", { ascending: false }).limit(10),
        supabase.from("delivery_assignments").select("id, order_id, status, eta, delivery_boy_id")
          .neq("status", "delivered").order("created_at", { ascending: false }).limit(8),
      ]);

      const todayRev = (todayPayments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      // Fetch delivery boy details
      const deliveryBoyIds = (liveDeliveries || []).map((d: any) => d.delivery_boy_id).filter(Boolean);
      let boyMap: Record<string, any> = {};
      if (deliveryBoyIds.length > 0) {
        const { data: boys } = await supabase.from("users").select("id, full_name, phone").in("id", deliveryBoyIds);
        (boys || []).forEach((b: any) => { boyMap[b.id] = b; });
      }

      setStats({
        activeSubscribers: activeSubs || 0,
        pausedSubscriptions: pausedSubs || 0,
        todayRevenue: todayRev,
        pendingOrders: pendingOrders || 0,
        failedPayments: failedPay || 0,
        totalUsers: totalUsers || 0,
        activeDeliveries: activeDeliv || 0,
      });
      setActivity(recentNotifs || []);
      setDeliveries((liveDeliveries || []).map((d: any) => ({
        ...d, delivery_boy: boyMap[d.delivery_boy_id] || null,
      })));
      setLastRefresh(new Date());
    } catch (err) {
      console.error("[Admin dashboard] fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Realtime: listen to notifications for live feed
    channelRef.current = supabase
      .channel("admin:dashboard")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setActivity((prev) => [payload.new as Activity, ...prev].slice(0, 10));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "food_orders" }, () => {
        fetchAll();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => {
        fetchAll();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_assignments" }, () => {
        fetchAll();
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const STAT_CARDS = [
    { label: "Active Subscribers", value: stats.activeSubscribers, icon: <ChefHat size={20} />, color: "#E8392A", bg: "rgba(232,57,42,0.08)", href: "/admin/subscriptions?status=active" },
    { label: "Paused Plans", value: stats.pausedSubscriptions, icon: <Pause size={20} />, color: "#D97706", bg: "rgba(217,119,6,0.08)", href: "/admin/subscriptions?status=paused" },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString("en-IN")}`, icon: <Wallet size={20} />, color: "#1B5E30", bg: "rgba(27,94,48,0.08)", href: "/admin/analytics" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: <Clock size={20} />, color: "#6366F1", bg: "rgba(99,102,241,0.08)", href: "/admin/orders?status=pending" },
    { label: "Failed Payments", value: stats.failedPayments, icon: <AlertTriangle size={20} />, color: "#EF4444", bg: "rgba(239,68,68,0.08)", href: "/admin/analytics" },
    { label: "Total Users", value: stats.totalUsers, icon: <Users size={20} />, color: "#0EA5E9", bg: "rgba(14,165,233,0.08)", href: "/admin/users" },
    { label: "Active Deliveries", value: stats.activeDeliveries, icon: <Truck size={20} />, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", href: "/admin/deliveries" },
  ];

  const NOTIF_TYPE_COLORS: Record<string, string> = {
    payment: "#1B5E30", delivery: "#E8392A", subscription: "#6366F1", system: "#9CA3AF",
  };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "28px", color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}>
            Operations Center
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "4px 0 0" }}>
            Last updated: {lastRefresh.toLocaleTimeString("en-IN")}
          </p>
        </div>
        <button
          onClick={fetchAll}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid rgba(212,184,150,0.3)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, color: "#4A3A2A", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF" }}>Loading dashboard…</p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>
            {STAT_CARDS.map((card) => (
              <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
                <div
                  style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", cursor: "pointer", transition: "transform 200ms, box-shadow 200ms" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>{card.icon}</div>
                    <ArrowUpRight size={14} style={{ color: "#D1D5DB" }} />
                  </div>
                  <p style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{card.value}</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, margin: 0 }}>{card.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Two column: Activity + Deliveries */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Activity Feed */}
            <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}>🔔 Live Activity</h2>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", animation: "pulse 2s infinite" }} />
              </div>
              {activity.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#D1D5DB" }}>
                  <Bell size={32} style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "13px" }}>No activity yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "340px", overflowY: "auto" }}>
                  {activity.map((a) => (
                    <div key={a.id} style={{ display: "flex", gap: "10px", padding: "10px", borderRadius: "10px", background: "#F8FAFC" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: NOTIF_TYPE_COLORS[a.type] || "#9CA3AF", flexShrink: 0, marginTop: "5px" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: "12px", color: "#1A1A1A", margin: 0 }}>{a.title}</p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.body}</p>
                      </div>
                      <p style={{ fontSize: "10px", color: "#D1D5DB", flexShrink: 0, margin: "3px 0 0" }}>
                        {new Date(a.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Deliveries */}
            <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}>🚴 Live Deliveries</h2>
                <Link href="/admin/deliveries" style={{ fontSize: "11px", fontWeight: 700, color: "#E8392A", textDecoration: "none" }}>View all →</Link>
              </div>
              {deliveries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#D1D5DB" }}>
                  <Truck size={32} style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "13px" }}>No active deliveries</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "340px", overflowY: "auto" }}>
                  {deliveries.map((d) => {
                    const sc = STATUS_COLORS[d.status] || { bg: "rgba(156,163,175,0.1)", text: "#6B7280" };
                    return (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "#F8FAFC", border: `1px solid ${sc.bg}` }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", color: sc.text, fontSize: "16px", flexShrink: 0 }}>🛵</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: "12px", color: "#1A1A1A", margin: 0 }}>
                            {d.delivery_boy?.full_name || "Unassigned"}
                          </p>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "1px 0 0" }}>
                            Order #{d.order_id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, background: sc.bg, color: sc.text, borderRadius: "999px", padding: "3px 8px", textTransform: "capitalize" }}>
                            {d.status.replace(/_/g, " ")}
                          </span>
                          {d.eta && <p style={{ fontSize: "10px", color: "#9CA3AF", margin: "3px 0 0" }}>{d.eta}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", marginBottom: "14px" }}>⚡ Quick Navigation</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { href: "/admin/subscriptions", label: "🍱 Manage Subscriptions", color: "#E8392A" },
                { href: "/admin/orders", label: "📦 Process Orders", color: "#6366F1" },
                { href: "/admin/deliveries", label: "🛵 Assign Deliveries", color: "#0EA5E9" },
                { href: "/admin/meals", label: "🍲 Update Menu", color: "#1B5E30" },
                { href: "/admin/users", label: "👥 Manage Users", color: "#D97706" },
                { href: "/admin/notifications", label: "🔔 Send Notification", color: "#8B5CF6" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "var(--emt-cream, #FDF9F3)", border: "1px solid rgba(212,184,150,0.2)", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textDecoration: "none", transition: "all 150ms ease" }}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
