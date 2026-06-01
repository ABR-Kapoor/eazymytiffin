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
      <div className="h-20" />

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-2 pb-2 md:px-4 md:pb-4">
        <nav
          className="w-full max-w-[960px] flex justify-around items-center pointer-events-auto bg-white/90 backdrop-blur-xl border border-[#D4B896]/30 shadow-[0_8px_32px_rgba(61,31,10,0.12)] pb-[max(16px,env(safe-area-inset-bottom))] pt-4 px-2 rounded-2xl"
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            const isOrders = href === "/orders";
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 min-w-[56px] px-2 py-1.5 rounded-md relative transition-all duration-200 no-underline ${
                  isActive ? "text-[#E8392A] bg-[#E8392A]/5" : "text-[#9CA3AF] hover:bg-black/5"
                }`}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
                  {isOrders && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-[#E8392A] text-white rounded-full text-[9px] font-extrabold min-w-[15px] h-[15px] flex items-center justify-center px-[3px] leading-none shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
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
