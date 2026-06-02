"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Shield } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomNav } from "@/components/BottomNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.isAdmin)();
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef<{ toggle: () => void }>(null);
  const pathname = usePathname();

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
        <div className="flex items-center gap-2 md:gap-3">
          {isAdmin && (
            <Link href="/admin" title="Admin" className="flex items-center justify-center gap-1.5 no-underline p-2.5 md:px-4 md:py-2 rounded-full transition-all hover:scale-105 shrink-0 text-[12px] font-bold" style={{ background: "#FEF3C7", color: "#92400E" }}>
              <Shield size={16} /> <span className="hidden md:block">Admin</span>
            </Link>
          )}
          <a
            href="https://wa.me/919770144899"
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp Us"
            className="flex items-center justify-center gap-1.5 no-underline p-2.5 md:px-4 md:py-2 rounded-full text-[12px] font-bold transition-all hover:scale-105 shrink-0"
            style={{ background: "#DCFCE7", color: "#166534" }}
            aria-label="WhatsApp us"
          >
            <MessageCircle size={16} />
            <span className="hidden md:block">WhatsApp</span>
          </a>
          <div title="Notifications" className="flex items-center justify-center gap-1.5 p-2.5 md:px-4 md:py-2 rounded-full text-[12px] font-bold transition-all hover:scale-105 cursor-pointer shrink-0" style={{ background: "#F1F5F9", color: "#374151" }} onClick={() => notifRef.current?.toggle()}>
            <NotificationBell compact ref={notifRef} />
            <span className="hidden md:block">Notifications</span>
          </div>
          <Link href="/profile" title="Profile" className="no-underline shrink-0 hidden lg:block">
            <div className="flex items-center justify-center gap-2 p-1.5 md:px-4 md:py-1.5 rounded-full text-[12px] font-bold transition-all hover:scale-105" style={{ background: "#FEF2F2", color: "#374151" }}>
              <div className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full bg-gradient-to-br from-[#E8392A] to-[#B91C1C] flex items-center justify-center text-white font-extrabold text-[12px] shrink-0">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="hidden md:block">Profile</span>
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
