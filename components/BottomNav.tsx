"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, UtensilsCrossed, Package, User } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/subscription", label: "Tiffin", icon: Calendar },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  return (
    <>
      {/* Spacer so content doesn't hide behind the nav */}
      <div className="h-20 md:hidden" />

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(212,184,150,0.25)",
          boxShadow: "0 -4px 32px rgba(61,31,10,0.08)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "8px 4px 12px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
        className="md:hidden"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const isOrders = href === "/orders";
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                minWidth: "56px",
                padding: "4px 8px",
                borderRadius: "12px",
                position: "relative",
                transition: "all 200ms ease",
                color: isActive ? "var(--emt-red)" : "#9CA3AF",
                background: isActive ? "rgba(232,57,42,0.08)" : "transparent",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
                {isOrders && unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-6px",
                      background: "var(--emt-red)",
                      color: "white",
                      borderRadius: "999px",
                      fontSize: "9px",
                      fontWeight: 800,
                      minWidth: "15px",
                      height: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      lineHeight: 1,
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar nav */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "72px",
          zIndex: 40,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(212,184,150,0.2)",
          boxShadow: "2px 0 24px rgba(61,31,10,0.06)",
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "80px",
          gap: "8px",
        }}
        className="md:flex"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const isOrders = href === "/orders";
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                width: "52px",
                padding: "10px 4px",
                borderRadius: "14px",
                position: "relative",
                transition: "all 200ms ease",
                color: isActive ? "var(--emt-red)" : "#9CA3AF",
                background: isActive ? "rgba(232,57,42,0.08)" : "transparent",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
                {isOrders && unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-5px",
                      background: "var(--emt-red)",
                      color: "white",
                      borderRadius: "999px",
                      fontSize: "8px",
                      fontWeight: 800,
                      minWidth: "14px",
                      height: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "9px", fontWeight: isActive ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </aside>
    </>
  );
}
