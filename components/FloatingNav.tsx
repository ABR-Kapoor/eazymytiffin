"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, UtensilsCrossed, Package, Bike, X, LayoutGrid, ArrowUpRight, Shield, Info, Phone, LayoutDashboard } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";

import { useAuth } from "@clerk/nextjs";

export function FloatingNav() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.is_read).length);
  const isVegTheme = useThemeStore((s) => s.isVegTheme);
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const isDeliveryBoy = user?.role === "delivery_boy";
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/#home", label: "Home", icon: Home },
    { href: "/#why-us", label: "About", icon: Info },
    { href: "/#weekly-menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/#meal-plans", label: "Plans", icon: Calendar },
    { href: "/#contact", label: "Contact", icon: Phone },
    ...(isSignedIn ? [{ href: "/home", label: "Dashboard", icon: LayoutDashboard }] : [{ href: "/sign-in", label: "Login", icon: LayoutDashboard }]),
    { href: "tel:9770144899", label: "Book Now", icon: ArrowUpRight },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
    ...(isDeliveryBoy ? [{ href: "/home/delivery", label: "Delivery", icon: Bike }] : [])
  ];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const pageColor = (() => {
    if (pathname.startsWith("/home/delivery")) return { bg: "#22C55E", shadow: "0 8px 32px rgba(34,197,94,0.5)" };
    if (pathname.startsWith("/food"))          return { bg: "#FC8019", shadow: "0 8px 32px rgba(252,128,25,0.5)" };
    if (pathname.startsWith("/orders"))        return { bg: "#2563EB", shadow: "0 8px 32px rgba(37,99,235,0.5)" };
    if (pathname.startsWith("/subscription"))  return { bg: "#7C3AED", shadow: "0 8px 32px rgba(124,58,237,0.5)" };
    if (pathname.startsWith("/profile"))       return { bg: "#0D9488", shadow: "0 8px 32px rgba(13,148,136,0.5)" };
    if (isVegTheme)                            return { bg: "#0d5c3d", shadow: "0 8px 32px rgba(13,92,61,0.5)" };
    return                                            { bg: "#E8392A", shadow: "0 8px 32px rgba(232,57,42,0.5)" };
  })();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB — fixed to viewport bottom-right */}
      <div
        ref={fabRef}
        className="fixed z-[999] bottom-6 right-6 md:bottom-8 md:right-8"
      >
        {/* Nav items fan up */}
        <div className="flex flex-col items-end gap-3 mb-3">
          {navItems.map(({ href, label, icon: Icon }, idx) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            const isOrders = href === "/orders";
            const delay = `${(navItems.length - 1 - idx) * 55}ms`;

            return (
              <div
                key={href}
                className="flex items-center gap-3"
                style={{
                  transition: `opacity 220ms ease ${open ? delay : "0ms"}, transform 220ms cubic-bezier(0.34,1.56,0.64,1) ${open ? delay : "0ms"}`,
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.75)",
                  pointerEvents: open ? "auto" : "none",
                }}
              >
                {/* Label pill */}
                <span
                  className="text-[12px] font-bold px-3.5 py-1.5 rounded-full shadow-lg"
                  style={{
                    background: isActive ? pageColor.bg : "rgba(255,255,255,0.97)",
                    color: isActive ? "#fff" : "#1C1C1C",
                    boxShadow: isActive ? pageColor.shadow : "0 2px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {label}
                </span>

                {/* Icon circle */}
                <Link
                  href={href}
                  className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center no-underline transition-transform duration-150 active:scale-90"
                  style={{
                    background: isActive ? pageColor.bg : "#fff",
                    color: isActive ? "#fff" : "#1C1C1C",
                    boxShadow: isActive ? pageColor.shadow : "0 4px 16px rgba(0,0,0,0.18)",
                  }}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isOrders && unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 rounded-full text-[9px] font-extrabold min-w-[17px] h-[17px] flex items-center justify-center px-[3px] leading-none text-white ring-2 ring-white"
                      style={{ background: pageColor.bg }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Main toggle FAB */}
        <div className="flex justify-end">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white transition-transform duration-300 active:scale-90"
            style={{
              background: pageColor.bg,
              boxShadow: pageColor.shadow,
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open
              ? <X size={26} strokeWidth={2.5} />
              : <LayoutGrid size={24} strokeWidth={2.5} />
            }
          </button>
        </div>
      </div>
    </>
  );
}
