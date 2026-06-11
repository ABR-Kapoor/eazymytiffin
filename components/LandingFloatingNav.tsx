"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Home, Info, UtensilsCrossed, Calendar, Phone, 
  ArrowUpRight, LayoutDashboard, Shield, X, LayoutGrid, LogIn, LogOut 
} from "lucide-react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";

export function LandingFloatingNav() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      const checkAdmin = async () => {
        try {
          const res = await fetch("/api/users/sync");
          const json = await res.json();
          if (json.success && json.user?.role === "admin") {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Error checking admin status:", e);
        }
      };
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

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

  // Handle smooth scroll for hash links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setOpen(false);
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    { href: "#home", label: "Home", icon: Home },
    { href: "#why-us", label: "About", icon: Info },
    { href: "#weekly-menu", label: "Menu", icon: UtensilsCrossed },
    { href: "#meal-plans", label: "Plans", icon: Calendar },
    { href: "#contact", label: "Contact", icon: Phone },
    { href: "tel:9770144899", label: "Book Now", icon: ArrowUpRight, primary: true },
    ...(isSignedIn ? [
      { href: "/home", label: "Dashboard", icon: LayoutDashboard },
      ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: Shield, primary: true }] : []),
      { href: "#", label: "Sign Out", icon: LogOut, action: () => signOut({ redirectUrl: "/" }) }
    ] : [
      { href: "/sign-in", label: "Login", icon: LogIn }
    ])
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[998] bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div
        ref={fabRef}
        className="fixed z-[999] bottom-6 right-6 md:bottom-8 md:right-8"
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}
      >
        {/* Nav items fan up — pointer-events disabled on whole group when closed */}
        <div
          className="flex flex-col items-end gap-2.5 mb-3"
          style={{ pointerEvents: open ? "auto" : "none" }}
        >
          {navItems.map(({ href, label, icon: Icon, primary, action }, idx) => {
            const delay = `${(navItems.length - 1 - idx) * 45}ms`;

            return (
              <div
                key={label}
                className="flex items-center gap-3"
                style={{
                  transition: `opacity 220ms ease ${open ? delay : "0ms"}, transform 220ms cubic-bezier(0.34,1.56,0.64,1) ${open ? delay : "0ms"}`,
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.8)",
                }}
              >
                {/* Label pill */}
                <span
                  className="text-[12px] font-bold px-3.5 py-1.5 rounded-full shadow-lg"
                  style={{
                    background: primary ? "#E8392A" : "rgba(255,255,255,0.97)",
                    color: primary ? "#fff" : "#1A1A1A",
                    boxShadow: primary ? "0 4px 16px rgba(232,57,42,0.3)" : "0 2px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {label}
                </span>

                {/* Icon circle */}
                <a
                  href={href}
                  className="relative w-[48px] h-[48px] rounded-full flex items-center justify-center no-underline transition-transform duration-150 active:scale-90"
                  style={{
                    background: primary ? "#E8392A" : "#fff",
                    color: primary ? "#fff" : "#1A1A1A",
                    boxShadow: primary ? "0 4px 16px rgba(232,57,42,0.4)" : "0 4px 16px rgba(0,0,0,0.15)",
                  }}
                  onClick={(e) => {
                    if (action) {
                      e.preventDefault();
                      action();
                    } else {
                      handleNavClick(e, href);
                    }
                  }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </a>
              </div>
            );
          })}
        </div>

        {/* Main toggle FAB — always on top via position relative + z-index */}
        <div className="flex justify-end" style={{ position: "relative", zIndex: 10 }}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-white transition-transform duration-300 active:scale-90"
            style={{
              background: "#E8392A",
              boxShadow: "0 8px 32px rgba(232,57,42,0.45)",
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
