"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomNav } from "@/components/BottomNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.isAdmin)();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--emt-cream)" }}>
      {/* Premium Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#D4B896]/20 px-5 h-[60px] flex justify-center shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-[960px] flex items-center justify-between h-full">
        <Link href="/home" className="flex flex-col leading-none no-underline" aria-label="EazyMyTiffin home">
          <span className="font-black text-[20px] tracking-tight">
            <span style={{ color: "#1A1A1A" }}>EazyMy-</span>
            <span style={{ color: "#E8392A" }}>Tiffin</span>
          </span>
          <span
            className="text-[9px] font-bold tracking-[1px] uppercase mt-0.5"
            style={{ color: "#5A4A3A" }}
          >
            India&apos;s Premium Tiffin Brand
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin" className="text-[11px] font-bold px-3 py-1.5 rounded-full no-underline transition-all hover:scale-105" style={{ background: "#FEF3C7", color: "#92400E" }}>
              Admin
            </Link>
          )}
          <a
            href="https://wa.me/919770144899"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 no-underline px-3 py-1.5 rounded-full text-[11px] font-bold transition-all hover:scale-105"
            style={{ background: "#DCFCE7", color: "#166534" }}
            aria-label="WhatsApp us"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all hover:scale-105" style={{ background: "#F1F5F9", color: "#374151" }}>
            <NotificationBell compact />
            <span>Notifications</span>
          </div>
          <Link href="/profile" className="no-underline">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all hover:scale-105" style={{ background: "#FEF2F2", color: "#374151" }}>
              <div className="w-[20px] h-[20px] rounded-full bg-gradient-to-br from-[#E8392A] to-[#B91C1C] flex items-center justify-center text-white font-extrabold text-[10px]">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span>Profile</span>
            </div>
          </Link>
        </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main" className="max-w-[960px] mx-auto px-4 pt-6 pb-24 lg:px-0">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
