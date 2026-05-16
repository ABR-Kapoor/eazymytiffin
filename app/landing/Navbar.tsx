"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#why-us" },
  { label: "Menu", href: "#weekly-menu" },
  { label: "Plans", href: "#meal-plans" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <ul className="hidden md:flex items-center gap-8" role="list">
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

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="tel:9770144899"
            className="btn-glare flex items-center gap-2 px-7 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-[1px] text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "#E8392A" }}
          >
            Book Now <ArrowUpRight size={16} strokeWidth={3} />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Navigation menu"
        >
          <span
            className="block w-6 h-0.5 transition-all duration-200"
            style={{
              background: "#1A1A1A",
              transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-200"
            style={{
              background: "#1A1A1A",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-200"
            style={{
              background: "#1A1A1A",
              transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#D4B896] px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-semibold py-2"
              style={{ color: "#5A4A3A" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="tel:9770144899"
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-bold uppercase tracking-[1px] text-white"
            style={{ background: "#E8392A" }}
            onClick={() => setMenuOpen(false)}
          >
            Book Now <ArrowUpRight size={18} strokeWidth={3} />
          </a>
        </div>
      )}
    </nav>
  );
}
