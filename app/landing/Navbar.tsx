"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { LandingFloatingNav } from "@/components/LandingFloatingNav";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#why-us" },
  { label: "Menu", href: "#weekly-menu" },
  { label: "Plans", href: "#meal-plans" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <>
    <nav
      className="sticky top-0 z-[999] border-b border-t-0"
      style={{
        background: scrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 1)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderColor: "rgba(212, 184, 150, 0.2)",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
        transition: "background 300ms, backdrop-filter 300ms, box-shadow 300ms",
      }}
      aria-label="Main navigation"
    >
      <style>{`
        @media (min-width: 1025px) {
          .nav-links-custom { display: flex !important; }
          .hamburger-custom { display: none !important; }
          .drawer-custom { display: none !important; }
        }
        @media (max-width: 1024px) {
          .nav-links-custom { display: none !important; }
          .hamburger-custom { display: flex !important; }
          .drawer-custom { display: flex !important; }
        }
      `}</style>
      <div
        className="mx-auto flex items-center justify-between px-6"
        style={{ maxWidth: "var(--max-width)", height: "72px" }}
      >
        {/* Logo */}
        <a href="#home" className="flex flex-col leading-none" aria-label="EazyMyTiffin home">
          <span className="font-black text-2xl tracking-tight">
            <span style={{ color: "#1A1A1A" }}>EazyMy-</span>
            <span style={{ color: "#E8392A" }}>Tiffin</span>
          </span>
          <span
            className="text-[10px] font-semibold tracking-[1.5px] uppercase"
            style={{ color: "#5A4A3A" }}
          >
            India&apos;s Premium Tiffin Brand
          </span>
        </a>

        {/* Right side controls (visible on all devices) */}
        <div className="flex items-center gap-1.5 md:gap-4">
          <a
            href="tel:9770144899"
            className="btn-glare bg-[#E8392A] hover:bg-red-700 hidden lg:flex items-center gap-2 px-5 py-2.5 lg:px-8 lg:py-3 rounded-full text-[12px] lg:text-[13px] font-bold uppercase tracking-[1px] text-white transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
          >
            Book Now <ArrowUpRight size={14} className="md:w-4 md:h-4" strokeWidth={3} />
          </a>
          {!isSignedIn && (
            <a
              href="/sign-in"
              className="border-[1.5px] border-[#E8392A] text-[#E8392A] hover:bg-[#E8392A] hover:text-white hidden lg:flex items-center gap-2 px-5 py-2.5 lg:px-8 lg:py-3 rounded-full text-[12px] lg:text-[13px] font-bold uppercase tracking-[1px] transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
            >
              Login
            </a>
          )}
          {isSignedIn && (
            <div className="flex items-center gap-1.5 md:gap-4">
              {isAdmin && (
                <a
                  href="/admin"
                  className="hidden lg:flex bg-[#E8392A] text-white hover:bg-red-700 items-center gap-2 px-5 py-2.5 lg:px-8 lg:py-3 rounded-full text-[12px] lg:text-[13px] font-bold uppercase tracking-[1px] transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
                >
                  Admin
                </a>
              )}
              <a
                href="/home"
                className="border-[1.5px] border-[#5A4A3A] text-[#5A4A3A] hover:bg-[#5A4A3A] hover:text-white hidden lg:flex items-center gap-2 px-5 py-2.5 lg:px-8 lg:py-3 rounded-full text-[12px] lg:text-[13px] font-bold uppercase tracking-[1px] transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
              >
                Dashboard
              </a>
            </div>
          )}

      {/* Mobile hamburger - REPLACED WITH FLOATING NAV */}
        </div>
      </div>
    </nav>
    
    {/* Floating Action Button Navigation for Mobile */}
    <LandingFloatingNav />
    </>
  );
}
