"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("clerk_id", user.id)
          .single();

        if (data?.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/home");
        }
      } catch (error) {
        console.error("Error checking admin:", error);
        router.push("/home");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F3] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl">⏳</div>
          <p className="text-gray-600 mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}
