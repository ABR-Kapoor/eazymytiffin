"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Package, Heart, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    activeSubscription: false,
    nextDelivery: null as string | null,
    recentOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Get user ID from Supabase
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (!userData) return;

        // Get active subscription
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userData.id)
          .eq("status", "active")
          .single();

        // Get recent orders
        const { data: ordersData, count } = await supabase
          .from("food_orders")
          .select("*", { count: "exact" })
          .eq("user_id", userData.id)
          .limit(5);

        setStats({
          activeSubscription: !!subData,
          nextDelivery: null,
          recentOrders: count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-800">
            EazyMy<span className="text-[#E8392A]">Tiffin</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">{user?.firstName} {user?.lastName}</span>
            <Link
              href="/profile"
              className="p-2 hover:bg-[#F8FAFC] rounded-lg"
              title="Profile"
            >
              <User size={20} className="text-[#1A1A1A]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-800 text-[#1A1A1A] mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Manage your tiffin orders and subscriptions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Subscription Status */}
          <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-700 text-[#1A1A1A]">Subscription</h2>
              <Heart size={24} className={stats.activeSubscription ? "text-[#E8392A] fill-[#E8392A]" : "text-gray-300"} />
            </div>
            <p className="text-2xl font-800 text-[#1A1A1A] mb-2">
              {stats.activeSubscription ? "Active" : "No Active Plan"}
            </p>
            {stats.activeSubscription && (
              <Link href="/subscription" className="text-[#E8392A] font-600 hover:text-red-700">
                Manage Plan →
              </Link>
            )}
            {!stats.activeSubscription && (
              <Link href="/subscription" className="text-[#E8392A] font-600 hover:text-red-700">
                Start Subscription →
              </Link>
            )}
          </div>

          {/* Next Delivery */}
          <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-700 text-[#1A1A1A]">Next Delivery</h2>
              <Package size={24} className="text-[#1B5E30]" />
            </div>
            <p className="text-2xl font-800 text-[#1A1A1A] mb-2">
              {stats.nextDelivery ? new Date(stats.nextDelivery).toLocaleDateString() : "—"}
            </p>
            <Link href="/orders" className="text-[#1B5E30] font-600 hover:text-green-700">
              View Orders →
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-700 text-[#1A1A1A]">Orders</h2>
              <Home size={24} className="text-[#E8392A]" />
            </div>
            <p className="text-2xl font-800 text-[#1A1A1A] mb-2">{stats.recentOrders}</p>
            <Link href="/orders" className="text-[#E8392A] font-600 hover:text-red-700">
              View All →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/orders"
            className="bg-white rounded-lg border border-[#D4B896]/20 p-6 hover:shadow-lg transition-shadow"
          >
            <Package size={32} className="text-[#E8392A] mb-4" />
            <h3 className="text-xl font-700 text-[#1A1A1A] mb-2">New Order</h3>
            <p className="text-gray-600">Order today's meals or select weekly plans</p>
          </Link>

          <Link
            href="/subscription"
            className="bg-white rounded-lg border border-[#D4B896]/20 p-6 hover:shadow-lg transition-shadow"
          >
            <Heart size={32} className="text-[#1B5E30] mb-4" />
            <h3 className="text-xl font-700 text-[#1A1A1A] mb-2">Subscription Plans</h3>
            <p className="text-gray-600">Monthly and weekly meal plans</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
