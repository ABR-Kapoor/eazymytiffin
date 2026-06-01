"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bike } from "lucide-react";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }

    const check = async () => {
      try {
        const res = await fetch("/api/users/sync");
        const json = await res.json();
        if (json.success && json.user?.role === "delivery_boy") {
          setAllowed(true);
        } else {
          router.push("/home");
        }
      } catch { router.push("/home"); }
      finally { setLoading(false); }
    };
    check();
  }, [isLoaded, user, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(14,165,233,0.3)", borderTopColor: "#0EA5E9", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <header style={{ background: "#1A1A1A", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #0EA5E9, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Bike size={18} /></div>
          <span style={{ color: "white", fontWeight: 800, fontSize: "15px" }}>EazyMyTiffin <span style={{ color: "#0EA5E9" }}>Delivery</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#9CA3AF", fontSize: "12px" }}>{user?.firstName}</span>
          <button onClick={() => signOut({ redirectUrl: "/" })} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#9CA3AF", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
        </div>
      </header>
      {children}
    </div>
  );
}
