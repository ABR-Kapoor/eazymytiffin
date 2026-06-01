"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Package, Truck, ChefHat,
  BarChart3, Bell, Settings, LogOut, Menu, X, Bike,
  Utensils, ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, exact: true },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: <ChefHat size={18} /> },
  { href: "/admin/orders", label: "Food Orders", icon: <Package size={18} /> },
  { href: "/admin/deliveries", label: "Delivery", icon: <Truck size={18} /> },
  { href: "/admin/delivery-boys", label: "Delivery Boys", icon: <Bike size={18} /> },
  { href: "/admin/meals", label: "Menu Mgmt", icon: <Utensils size={18} /> },
  { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell size={18} /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
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
      <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid rgba(232,57,42,0.3)", borderTopColor: "#E8392A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Verifying admin access…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

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
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #E8392A, #B91C1C)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 900, fontSize: "14px", margin: 0, letterSpacing: "-0.01em" }}>
                EazyMy<span style={{ color: "#E8392A" }}>Tiffin</span>
              </p>
              <p style={{ color: "#6B7280", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", margin: "1px 0 0" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => {
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
                  borderLeft: `3px solid ${active ? "#E8392A" : "transparent"}`,
                  transition: "all 150ms ease",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
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
        {/* Top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,184,150,0.2)",
          padding: "0 24px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontWeight: 800, fontSize: "16px", color: "#1A1A1A", margin: 0, letterSpacing: "-0.02em" }}>
              {NAV_ITEMS.find((n) => isActive(n.href, n.exact))?.label || "Admin"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(27,94,48,0.08)", borderRadius: "999px", padding: "5px 12px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#1B5E30" }}>Live</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #E8392A, #B91C1C)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "12px" }}>
                {user?.firstName?.charAt(0) || "A"}
              </div>
              <div style={{ display: "none" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", color: "#1A1A1A", margin: 0 }}>{user?.firstName}</p>
                <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>Admin</p>
              </div>
            </div>
          </div>
        </header>

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
      `}</style>
    </div>
  );
}
