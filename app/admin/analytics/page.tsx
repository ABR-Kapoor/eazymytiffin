"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, BarChart3, Users, ChefHat, FlaskConical, BarChart, LineChart, ChevronDown } from "lucide-react";

type RevenueDay = { date: string; amount: number };

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenueDay[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0, subRevenue: 0, foodRevenue: 0,
    totalSubs: 0, trialSubs: 0, conversionRate: 0,
    totalUsers: 0, activeUsers: 0,
  });

  const [timeFilter, setTimeFilter] = useState(15); // 7, 15, 30
  const [chartType, setChartType] = useState<"bar" | "area">("bar");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeFilter);

      const [
        { data: payments },
        { data: subs },
        { data: users },
      ] = await Promise.all([
        supabase.from("payments")
          .select("amount, payment_status, subscription_id, order_id, created_at")
          .eq("payment_status", "paid")
          .gte("created_at", startDate.toISOString()),
        supabase.from("subscriptions").select("id, status, plan_id").gte("created_at", startDate.toISOString()),
        supabase.from("users").select("id, status, has_used_trial").gte("created_at", startDate.toISOString()),
      ]);

      // Revenue breakdown
      const subRev = (payments || []).filter((p) => p.subscription_id).reduce((s, p) => s + p.amount, 0);
      const foodRev = (payments || []).filter((p) => p.order_id).reduce((s, p) => s + p.amount, 0);

      // Daily revenue map
      const revMap: Record<string, number> = {};
      (payments || []).forEach((p) => {
        const day = p.created_at.split("T")[0];
        revMap[day] = (revMap[day] || 0) + p.amount;
      });
      
      const daysData: RevenueDay[] = [];
      for (let i = timeFilter - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        daysData.push({ date: key, amount: revMap[key] || 0 });
      }

      const trialUsers = (users || []).filter((u) => u.has_used_trial).length;
      const activeUsers = (users || []).filter((u) => u.status === "active").length;

      setRevenue(daysData);
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
  }, [timeFilter]);

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

  const renderAreaChart = () => {
    if (revenue.length === 0) return null;
    const width = 1000;
    const height = 230;
    const n = revenue.length || 1;
    
    const points = revenue.map((d, i) => {
      const x = ((i + 0.5) / n) * width;
      const y = height - Math.max(4, (d.amount / maxRevenue) * 220);
      return `${x},${y}`;
    });

    const areaPath = `M ${(0.5 / n) * width},${height} L ${points.join(" L ")} L ${((n - 0.5) / n) * width},${height} Z`;
    const linePath = `M ${points.join(" L ")}`;

    return (
      <svg width="100%" height="230px" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ position: "absolute", top: "30px", left: 0, right: 0, zIndex: 0 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8392A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E8392A" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGradient)" />
        <path d={linePath} fill="none" stroke="#E8392A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div>
      <h1 style={{ fontWeight: 900, fontSize: "36px", color: "#1A1A1A", marginBottom: "20px", letterSpacing: "-0.02em" }}>Analytics</h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.2)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF" }}>Computing analytics…</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            <MetricCard label="Total Revenue" value={`₹${metrics.totalRevenue.toLocaleString("en-IN")}`} icon={<TrendingUp size={18} />} color="#1B5E30" sub={`Sub: ₹${metrics.subRevenue.toLocaleString("en-IN")}`} />
            <MetricCard label="Food Revenue" value={`₹${metrics.foodRevenue.toLocaleString("en-IN")}`} icon={<BarChart3 size={18} />} color="#E8392A" />
            <MetricCard label="Total Subscriptions" value={metrics.totalSubs} icon={<ChefHat size={18} />} color="#6366F1" />
            <MetricCard label="Total Users" value={metrics.totalUsers} icon={<Users size={18} />} color="#0EA5E9" sub={`${metrics.activeUsers} active`} />
            <MetricCard label="Trial Users" value={metrics.trialSubs} icon={<FlaskConical size={18} />} color="#F59E0B" sub={`${metrics.conversionRate}% of total`} />
          </div>

          {/* Revenue Chart */}
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1px solid rgba(212,184,150,0.15)", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "16px", color: "#1A1A1A", margin: 0 }}>Revenue</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <button 
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(212,184,150,0.3)", fontSize: "13px", fontWeight: 600, outline: "none", cursor: "pointer", background: "white", color: "#1A1A1A", display: "flex", alignItems: "center", gap: "6px" }}>
                    {timeFilter === 7 ? "7 Days" : timeFilter === 15 ? "15 Days" : "1 Month"}
                    <ChevronDown size={14} />
                  </button>
                  {showTimeDropdown && (
                    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "6px", background: "white", border: "1px solid rgba(212,184,150,0.2)", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden", minWidth: "120px" }}>
                      {[
                        { label: "7 Days", val: 7 },
                        { label: "15 Days", val: 15 },
                        { label: "1 Month", val: 30 },
                      ].map((opt, i) => (
                        <div 
                          key={i}
                          onClick={() => { setTimeFilter(opt.val); setShowTimeDropdown(false); }}
                          style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: timeFilter === opt.val ? "#E8392A" : "#4B5563", cursor: "pointer", background: timeFilter === opt.val ? "rgba(232,57,42,0.05)" : "transparent", transition: "background 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = timeFilter === opt.val ? "rgba(232,57,42,0.05)" : "#F3F4F6")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = timeFilter === opt.val ? "rgba(232,57,42,0.05)" : "transparent")}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "8px", padding: "2px" }}>
                  <button onClick={() => setChartType("bar")} style={{ padding: "4px 8px", borderRadius: "6px", background: chartType === "bar" ? "white" : "transparent", boxShadow: chartType === "bar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", border: "none", cursor: "pointer", color: chartType === "bar" ? "#E8392A" : "#9CA3AF" }}>
                    <BarChart size={16} />
                  </button>
                  <button onClick={() => setChartType("area")} style={{ padding: "4px 8px", borderRadius: "6px", background: chartType === "area" ? "white" : "transparent", boxShadow: chartType === "area" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", border: "none", cursor: "pointer", color: chartType === "area" ? "#E8392A" : "#9CA3AF" }}>
                    <LineChart size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ position: "relative", paddingLeft: "45px" }}>
              <div style={{ position: "absolute", left: 0, top: "40px", bottom: "40px", width: "45px", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#9CA3AF", fontSize: "10px", fontWeight: 700, pointerEvents: "none", textAlign: "right", paddingRight: "8px", borderRight: "1px dashed rgba(212,184,150,0.3)" }}>
                <span>₹{maxRevenue >= 1000 ? (maxRevenue / 1000).toFixed(1) + 'k' : maxRevenue}</span>
                <span>₹{Math.round(maxRevenue / 2) >= 1000 ? (Math.round(maxRevenue / 2) / 1000).toFixed(1) + 'k' : Math.round(maxRevenue / 2)}</span>
                <span>₹0</span>
              </div>

              <div style={{ position: "absolute", left: "45px", right: 0, top: "40px", bottom: "40px", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", zIndex: 0 }}>
                <div style={{ width: "100%", borderTop: "1px dashed rgba(212,184,150,0.15)" }} />
                <div style={{ width: "100%", borderTop: "1px dashed rgba(212,184,150,0.15)" }} />
                <div style={{ width: "100%", borderTop: "1px dashed rgba(212,184,150,0.15)" }} />
              </div>

              <div style={{ position: "relative", overflowX: "auto", overflowY: "hidden" }}>
                <div style={{ position: "relative", display: "flex", minWidth: "100%", height: "300px", width: "max-content" }}>
                  {chartType === "area" && renderAreaChart()}
                  
                  {revenue.map((day, i) => (
                    <div key={day.date} 
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      style={{ flex: "1 0 16px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10, cursor: "crosshair", height: "100%" }}>
                      
                      {hoverIndex === i && (
                        <div style={{ position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)", background: "#1A1A1A", color: "white", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 50 }}>
                          ₹{day.amount.toLocaleString("en-IN")}
                          <div style={{ fontSize: "9px", color: "#9CA3AF", fontWeight: 500 }}>{new Date(day.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                          <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #1A1A1A" }} />
                        </div>
                      )}

                      <div style={{ height: "40px", width: "100%", flexShrink: 0 }} /> 

                      <div style={{ height: "220px", width: "100%", flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>
                        {chartType === "bar" && (
                          <div style={{
                            width: "calc(100% - 4px)",
                            minWidth: "12px",
                            height: `${Math.max(4, (day.amount / maxRevenue) * 220)}px`,
                            background: hoverIndex === i ? "#B91C1C" : (day.amount > 0 ? "linear-gradient(to top, #E8392A, #F87171)" : "#F3F4F6"),
                            borderRadius: "4px 4px 0 0", transition: "all 200ms ease",
                          }} />
                        )}
                        {chartType === "area" && (
                          <div style={{ width: "2px", height: "100%", background: hoverIndex === i ? "rgba(232,57,42,0.3)" : "transparent", position: "absolute", bottom: 0 }} />
                        )}
                      </div>

                      <div style={{ height: "40px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", paddingTop: "6px" }}>
                        <p style={{ fontSize: "8px", color: hoverIndex === i ? "#1A1A1A" : "#D1D5DB", fontWeight: hoverIndex === i ? 800 : 500, transform: "rotate(-45deg)", whiteSpace: "nowrap", margin: 0, transition: "color 200ms ease" }}>
                          {new Date(day.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
