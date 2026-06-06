"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

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

        {/* Desktop nav links */}
        <ul className="nav-links-custom hidden items-center gap-8" role="list">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[14px] font-semibold tracking-[0.3px] transition-colors duration-200"
                style={{ color: "#5A4A3A" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "#E8392A")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "#5A4A3A")
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side controls (visible on all devices) */}
        <div className="flex items-center gap-1.5 md:gap-4">
          <a
            href="tel:9770144899"
            className="btn-glare bg-[#E8392A] hover:bg-red-700 hidden md:flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-3 rounded-full text-[12px] md:text-[13px] font-bold uppercase tracking-[1px] text-white transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
          >
            Book Now <ArrowUpRight size={14} className="md:w-4 md:h-4" strokeWidth={3} />
          </a>
          {!isSignedIn && (
            <a
              href="/sign-in"
              className="border-[1.5px] border-[#E8392A] text-[#E8392A] hover:bg-[#E8392A] hover:text-white hidden md:flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-3 rounded-full text-[12px] md:text-[13px] font-bold uppercase tracking-[1px] transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
            >
              Login
            </a>
          )}
          {isSignedIn && (
            <div className="flex items-center gap-1.5 md:gap-4">
              {isAdmin && (
                <a
                  href="/admin"
                  className="hidden md:flex bg-[#E8392A] text-white hover:bg-red-700 items-center gap-2 px-5 py-2.5 md:px-8 md:py-3 rounded-full text-[12px] md:text-[13px] font-bold uppercase tracking-[1px] transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
                >
                  Admin
                </a>
              )}
              <a
                href="/home"
                className="border-[1.5px] border-[#5A4A3A] text-[#5A4A3A] hover:bg-[#5A4A3A] hover:text-white hidden md:flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-3 rounded-full text-[12px] md:text-[13px] font-bold uppercase tracking-[1px] transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
              >
                Dashboard
              </a>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="hamburger-custom flex items-center justify-center p-1 ml-1 text-[#1A1A1A] transition-transform hover:scale-110 active:scale-95"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Navigation menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="drawer-custom bg-white border-t border-[#D4B896] px-6 py-6 flex flex-col gap-4 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[16px] font-semibold py-2 text-center"
              style={{ color: "#5A4A3A" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {/* Buttons kept in drawer for small screens where they're hidden from top bar */}
          <div className="mt-2 flex flex-col gap-3">
            <a
              href="tel:9770144899"
              className="w-full md:hidden flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-[1px] text-white"
              style={{ background: "#E8392A" }}
              onClick={() => setMenuOpen(false)}
            >
              Book Now <ArrowUpRight size={16} strokeWidth={3} />
            </a>
            {!isSignedIn && (
              <Link
                href="/sign-in"
                className="w-full md:hidden flex items-center justify-center py-2.5 border-[1.5px] border-[#E8392A] text-[#E8392A] rounded-full text-[13px] font-bold uppercase tracking-[1.2px]"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
            {isSignedIn && (
              <Link
                href="/home"
                className="w-full md:hidden flex items-center justify-center py-2.5 border-[1.5px] border-[#5A4A3A] text-[#5A4A3A] rounded-full text-[13px] font-bold uppercase tracking-[1.2px]"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
          {/* Admin panel link kept in drawer for mobile if signed in as admin */}
          {isSignedIn && isAdmin && (
            <div className="mt-2 flex flex-col gap-3">
              <Link
                href="/admin"
                className="w-full flex items-center justify-center py-2.5 bg-[#E8392A] text-white rounded-full text-[13px] font-bold uppercase tracking-[1.2px]"
                onClick={() => setMenuOpen(false)}
              >
                Admin Panel
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
