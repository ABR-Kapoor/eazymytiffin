"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, UtensilsCrossed, Package, Bike } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";

const baseNavItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/subscription", label: "Tiffin", icon: Calendar },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/orders", label: "Orders", icon: Package },
];

export function BottomNav() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const isVegTheme = useThemeStore((s) => s.isVegTheme);
  const isDeliveryBoy = useUserStore((s) => s.isDeliveryBoy)();

  const navItems = isDeliveryBoy
    ? [...baseNavItems, { href: "/home/delivery", label: "Delivery", icon: Bike }]
    : baseNavItems;

  const pageColor = (() => {
    if (pathname.startsWith("/home/delivery")) return { bg: "bg-[#22C55E]", shadow: "shadow-[0_-4px_24px_rgba(34,197,94,0.35)]", ring: "ring-[#22C55E]", text: "text-[#22C55E]" };
    if (pathname.startsWith("/food")) return { bg: "bg-[#FC8019]", shadow: "shadow-[0_-4px_24px_rgba(252,128,25,0.3)]", ring: "ring-[#FC8019]", text: "text-[#FC8019]" };
    if (pathname.startsWith("/orders")) return { bg: "bg-[#2563EB]", shadow: "shadow-[0_-4px_24px_rgba(37,99,235,0.3)]", ring: "ring-[#2563EB]", text: "text-[#2563EB]" };
    if (pathname.startsWith("/subscription")) return { bg: "bg-[#7C3AED]", shadow: "shadow-[0_-4px_24px_rgba(124,58,237,0.3)]", ring: "ring-[#7C3AED]", text: "text-[#7C3AED]" };
    if (pathname.startsWith("/profile")) return { bg: "bg-[#0D9488]", shadow: "shadow-[0_-4px_24px_rgba(13,148,136,0.3)]", ring: "ring-[#0D9488]", text: "text-[#0D9488]" };
    if (isVegTheme) return { bg: "bg-[#0d5c3d]", shadow: "shadow-[0_-4px_24px_rgba(13,92,61,0.3)]", ring: "ring-[#0d5c3d]", text: "text-[#0d5c3d]" };
    return { bg: "bg-[#A30000]", shadow: "shadow-[0_-4px_24px_rgba(163,0,0,0.3)]", ring: "ring-[#A30000]", text: "text-[#A30000]" };
  })();

  return (
    <>
      {/* Spacer so content doesn't hide behind the nav */}
      <div className="h-[72px]" />

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <nav className={`w-full max-w-[960px] flex justify-around items-center pointer-events-auto ${pageColor.bg} rounded-t-[24px] ${pageColor.shadow} pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:pt-3 px-1 sm:px-2 transition-colors duration-300`}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            const isOrders = href === "/orders";
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 min-w-[56px] sm:min-w-[64px] px-1 sm:px-2 py-1 relative transition-all duration-200 no-underline ${
                  isActive
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-10 h-[4px] rounded-full bg-white opacity-90" />
                )}
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isOrders && unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1.5 bg-white ${pageColor.text} rounded-full text-[9px] font-extrabold min-w-[15px] h-[15px] flex items-center justify-center px-[3px] leading-none shadow-sm ring-2 ${pageColor.ring}`}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] tracking-wide ${isActive ? "font-bold" : "font-semibold"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
