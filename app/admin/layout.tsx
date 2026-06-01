"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Package, Truck, ChefHat,
  BarChart3, Bell, Settings, LogOut, Menu, X, Bike,
  Utensils, ShieldCheck, CalendarDays, ClipboardList
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Tiffin",
    items: [
      { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, exact: true },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: <ChefHat size={18} /> },
      { href: "/admin/tiffin-orders", label: "Tiffin Orders", icon: <CalendarDays size={18} /> },
      { href: "/admin/deliveries", label: "Delivery", icon: <Truck size={18} /> },
      { href: "/admin/delivery-boys", label: "Delivery Boys", icon: <Bike size={18} /> },
      { href: "/admin/plans", label: "Plans", icon: <ClipboardList size={18} /> },
    ]
  },
  {
    label: "Food Delivery",
    items: [
      { href: "/admin/food-delivery", label: "Food Delivery", icon: <Utensils size={18} /> },
      { href: "/admin/orders", label: "Food Orders", icon: <Package size={18} /> },
    ]
  },
  {
    label: "Operations",
    items: [
      
      { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
      { href: "/admin/notifications", label: "Notifications", icon: <Bell size={18} /> },
      { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realtimePulse, setRealtimePulse] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }

    const check = async () => {
      try {
        const res = await fetch("/api/users/sync");
        const json = await res.json();
        if (json.success && json.user?.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/home");
        }
      } catch {
        router.push("/home");
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [isLoaded, user, router]);

  // Pulse the realtime indicator
  useEffect(() => {
    const t = setInterval(() => setRealtimePulse((p) => !p), 2000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FDF9F3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <div style={{ 
            position: "absolute", inset: "-12px", borderRadius: "50%",
            border: "3px solid transparent", borderTopColor: "#E8392A", borderRightColor: "#E8392A",
            animation: "spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite"
          }}></div>
          <div style={{
            background: "white", borderRadius: "50%", padding: "20px",
            boxShadow: "0 8px 30px rgba(232,57,42,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
            animation: "pulse-scale 2s ease-in-out infinite"
          }}>
            <ChefHat size={40} color="#E8392A" />
          </div>
        </div>
        
        <h2 style={{ fontWeight: 900, fontSize: "24px", color: "#1A1A1A", margin: "0 0 8px", letterSpacing: "-0.02em" }}>EazyMyTiffin</h2>
        
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <p style={{ color: "#9CA3AF", fontWeight: 700, fontSize: "14px", margin: 0 }}>Verifying admin access</p>
          <span style={{ display: "flex", gap: "2px" }}>
            <span className="dot" style={{ animationDelay: "0s" }}>.</span>
            <span className="dot" style={{ animationDelay: "0.2s" }}>.</span>
            <span className="dot" style={{ animationDelay: "0.4s" }}>.</span>
          </span>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.95); } }
          .dot { color: #E8392A; font-weight: 900; font-size: 16px; animation: bounce 1.4s infinite ease-in-out both; }
          @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-4px); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  if (!isAdmin) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Get active item label for the header
  let activeLabel = "Admin";
  NAV_SECTIONS.forEach(section => {
    section.items.forEach(item => {
      if (isActive(item.href, item.exact)) activeLabel = item.label;
    });
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F8FAFC" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: "none" }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: "240px", background: "#1A1A1A", flexShrink: 0,
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <p style={{ color: "white", fontWeight: 900, fontSize: "20px", margin: 0, letterSpacing: "-0.02em" }}>
                EazyMy-<span style={{ color: "#E8392A" }}>Tiffin</span>
              </p>
              <p style={{ color: "#6B7280", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", margin: "1px 0 0" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="custom-scrollbar" style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.label} style={{ marginBottom: "16px" }}>
              <p style={{ color: "#6B7280", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 12px" }}>
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 12px", borderRadius: "10px",
                      marginBottom: "2px", textDecoration: "none",
                      background: active ? "rgba(232,57,42,0.15)" : "transparent",
                      color: active ? "#E8392A" : "#9CA3AF",
                      fontWeight: active ? 700 : 500, fontSize: "13px",
                      transition: "all 150ms ease",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              {sIdx < NAV_SECTIONS.length - 1 && (
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "16px 12px 0" }} />
              )}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", marginBottom: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: realtimePulse ? "#22C55E" : "#166534", transition: "background 500ms", boxShadow: realtimePulse ? "0 0 8px #22C55E" : "none" }} />
            <span style={{ color: "#6B7280", fontSize: "11px", fontWeight: 600 }}>Realtime Active</span>
          </div>
          <Link
            href="/home"
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", color: "#6B7280", textDecoration: "none", fontSize: "12px", fontWeight: 600, transition: "color 150ms" }}
          >
            <LogOut size={15} /> Back to App
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, marginLeft: "240px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>


        {/* Page content */}
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
