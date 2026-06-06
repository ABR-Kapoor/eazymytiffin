"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Shield,
  MapPin,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useThemeStore } from "@/store/themeStore";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomNav } from "@/components/BottomNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUserStore((s) => s.user);
  const isAdmin = useUserStore((s) => s.isAdmin)();
  const isVegTheme = useThemeStore((s) => s.isVegTheme);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const notifRef = useRef<{ toggle: () => void }>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchAddr = async () => {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .limit(1)
          .single();
        if (data) setDefaultAddress(data);
      };
      fetchAddr();
    }
  }, [user, pathname]);

  if (!mounted) return null;

  const isHome = pathname === "/home";
  const hasFullHero = ["/food", "/orders", "/subscription", "/profile"].some(p => pathname.startsWith(p));

  const themeBgColor = (() => {
    if (pathname.startsWith("/food")) return "bg-[#FC8019]";
    if (pathname.startsWith("/orders")) return "bg-[#2563EB]";
    if (pathname.startsWith("/subscription")) return "bg-[#7C3AED]";
    if (pathname.startsWith("/profile")) return "bg-[#0D9488]";
    return isVegTheme ? "bg-[#0d5c3d]" : "bg-[#A30000]";
  })();
  const themeBorderColor = isVegTheme ? "border-[#0d5c3d]" : "border-[#A30000]";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-30 h-[56px] flex justify-center w-full transition-shadow duration-300 ${
          isScrolled ? "shadow-sm" : ""
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="relative w-full max-w-[960px] h-full">
          {/* Background layer with overflow-hidden for rounded corners */}
          <div className={`absolute inset-0 overflow-hidden ${themeBgColor} transition-all duration-300 ${
            isScrolled ? "rounded-b-[24px]" : ""
          }`}>
            {/* Food Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-60 invert pointer-events-none" />
          </div>

          {/* Content layer (no overflow-hidden so dropdowns can bleed out) */}
          <div className="relative z-10 flex items-center justify-between h-full px-4 text-white">
            {/* Left: Location */}
          <Link
            href="/profile"
            className="relative z-10 flex items-center gap-2.5 no-underline group flex-1 min-w-0"
          >
            <MapPin size={22} className="shrink-0 text-white" />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1 font-bold text-[15px] leading-tight text-white">
                <span className="capitalize">{defaultAddress?.type || "Home"}</span>
                <ChevronDown size={16} className="shrink-0 text-white/80" />
              </div>
              <span className="text-[12px] truncate leading-tight w-[180px] sm:w-[250px] text-white/90">
                {defaultAddress
                  ? `${defaultAddress.house_flat_no ? defaultAddress.house_flat_no + ', ' : ''}${defaultAddress.area}`
                  : user?.city || "Set your location"}
              </span>
            </div>
          </Link>

          {/* Right: Actions */}
          <div className="relative z-10 flex items-center gap-2.5 shrink-0 ml-4">
            {isAdmin && (
              <Link
                href="/admin"
                title="Admin"
                className="w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all hover:scale-105 border bg-white/20 text-white border-white/30 backdrop-blur-md"
              >
                <Shield size={18} />
              </Link>
            )}
            <Link
              href="/food/checkout"
              title="Cart"
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all hover:scale-105 border bg-white/20 text-white border-white/30 backdrop-blur-md"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
            <div
              title="Notifications"
              className="relative w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer border bg-white/20 text-white border-white/30 backdrop-blur-md"
              onClick={() => notifRef.current?.toggle()}
            >
              <NotificationBell compact ref={notifRef} />
            </div>
            <Link
              href="/profile"
              title="Profile"
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all hover:scale-105 border bg-white/20 text-white border-white/30 backdrop-blur-md"
            >
              <UserCircle size={22} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
      </header>

      {/* Main Container */}
      <main
        id="main"
        className={`max-w-[960px] mx-auto pb-24 px-4 lg:px-0 ${isHome || hasFullHero ? "pt-0" : "pt-4"}`}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
