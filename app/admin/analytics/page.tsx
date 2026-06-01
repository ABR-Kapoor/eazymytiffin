"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, BarChart3, Users, ChefHat } from "lucide-react";

type RevenueDay = { date: string; amount: number };
type TopDish = { title: string; total: number };

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenueDay[]>([]);
  const [topDishes, setTopDishes] = useState<TopDish[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0, subRevenue: 0, foodRevenue: 0,
    totalSubs: 0, trialSubs: 0, conversionRate: 0,
    totalUsers: 0, activeUsers: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      const last30 = new Date();
      last30.setDate(last30.getDate() - 30);

      const [
        { data: payments },
        { data: subs },
        { data: users },
        { data: orderItems },
      ] = await Promise.all([
        supabase.from("payments").select("amount, payment_status, subscription_id, order_id, created_at").eq("payment_status", "paid"),
        supabase.from("subscriptions").select("id, status, plan_id"),
        supabase.from("users").select("id, status, has_used_trial"),
        supabase.from("food_order_items").select("quantity, menu:menus(title)"),
      ]);

      // Revenue breakdown
      const subRev = (payments || []).filter((p) => p.subscription_id).reduce((s, p) => s + p.amount, 0);
      const foodRev = (payments || []).filter((p) => p.order_id).reduce((s, p) => s + p.amount, 0);

      // Daily revenue last 30 days
      const revMap: Record<string, number> = {};
      (payments || []).forEach((p) => {
        const day = p.created_at.split("T")[0];
        revMap[day] = (revMap[day] || 0) + p.amount;
      });
      const last30Days: RevenueDay[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        last30Days.push({ date: key, amount: revMap[key] || 0 });
      }

      // Top dishes
      const dishMap: Record<string, number> = {};
      (orderItems || []).forEach((item: any) => {
        if (item.menu?.title) dishMap[item.menu.title] = (dishMap[item.menu.title] || 0) + item.quantity;
      });
      const dishes = Object.entries(dishMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([title, total]) => ({ title, total }));

      const trialUsers = (users || []).filter((u) => u.has_used_trial).length;
      const activeUsers = (users || []).filter((u) => u.status === "active").length;

      setRevenue(last30Days);
      setTopDishes(dishes);
      setMetrics({
        totalRevenue: subRev + foodRev,
        subRevenue: subRev, foodRevenue: foodRev,
        totalSubs: (subs || []).length,
        trialSubs: trialUsers,
        conversionRate: users?.length ? Math.round((trialUsers / users.length) * 100) : 0,
        totalUsers: users?.length || 0, activeUsers,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const maxRevenue = Math.max(...revenue.map((r) => r.amount), 1);

  const MetricCard = ({ label, value, sub, icon, color }: any) => (
    <div style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid rgba(212,184,150,0.15)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      </div>
      <p style={{ fontWeight: 900, fontSize: "26px", color: "#1A1A1A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{value}</p>
      <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700, margin: "0 0 4px" }}>{label}</p>
      {sub && <p style={{ fontSize: "11px", color: color, fontWeight: 600, margin: 0 }}>{sub}</p>}
    </div>
  );

  return (
    <div>
      <h1 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", marginBottom: "20px" }}>Analytics</h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF" }}>Computing analytics…</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            <MetricCard label="Total Revenue" value={`₹${metrics.totalRevenue.toLocaleString("en-IN")}`} icon={<TrendingUp size={18} />} color="#1B5E30" sub={`Sub: ₹${metrics.subRevenue.toLocaleString("en-IN")}`} />
            <MetricCard label="Food Revenue" value={`₹${metrics.foodRevenue.toLocaleString("en-IN")}`} icon={<BarChart3 size={18} />} color="#E8392A" />
            <MetricCard label="Total Subscriptions" value={metrics.totalSubs} icon={<ChefHat size={18} />} color="#6366F1" />
            <MetricCard label="Total Users" value={metrics.totalUsers} icon={<Users size={18} />} color="#0EA5E9" sub={`${metrics.activeUsers} active`} />
            <MetricCard label="Trial Users" value={metrics.trialSubs} icon="🧪" color="#F59E0B" sub={`${metrics.conversionRate}% of total`} />
          </div>

          {/* Revenue Chart */}
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)", marginBottom: "20px" }}>
            <h2 style={{ fontWeight: 800, fontSize: "16px", color: "#1A1A1A", marginBottom: "16px" }}>📈 Revenue — Last 30 Days</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "160px", overflowX: "auto" }}>
              {revenue.map((day) => (
                <div key={day.date} title={`₹${day.amount} on ${day.date}`}
                  style={{ flex: "1 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    width: "100%", minWidth: "10px",
                    height: `${Math.max(4, (day.amount / maxRevenue) * 120)}px`,
                    background: day.amount > 0 ? "linear-gradient(to top, #E8392A, #F87171)" : "#F3F4F6",
                    borderRadius: "4px 4px 0 0", transition: "height 400ms ease",
                  }} />
                  <p style={{ fontSize: "8px", color: "#D1D5DB", transform: "rotate(-45deg)", whiteSpace: "nowrap", margin: 0 }}>
                    {new Date(day.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Dishes */}
          {topDishes.length > 0 && (
            <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)" }}>
              <h2 style={{ fontWeight: 800, fontSize: "16px", color: "#1A1A1A", marginBottom: "16px" }}>🍲 Most Ordered Dishes</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {topDishes.map((d, i) => (
                  <div key={d.title} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 800, fontSize: "14px", color: "#D1D5DB", width: "20px", flexShrink: 0 }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                        <span style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A" }}>{d.title}</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>{d.total} orders</span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "999px", background: "#F3F4F6", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(d.total / topDishes[0].total) * 100}%`, background: i === 0 ? "#E8392A" : i === 1 ? "#D97706" : "#6366F1", borderRadius: "999px" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
