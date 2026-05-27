"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Users, Package, TrendingUp, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        // Get total orders
        const { count: orderCount } = await supabase
          .from("food_orders")
          .select("*", { count: "exact", head: true });

        // Get active subscriptions
        const { count: subCount } = await supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // Get revenue
        const { data: orders } = await supabase
          .from("food_orders")
          .select("total_amount")
          .eq("status", "delivered");

        const revenue = (orders || []).reduce((sum, order) => sum + order.total_amount, 0);

        setStats({
          totalUsers: userCount || 0,
          totalOrders: orderCount || 0,
          activeSubscriptions: subCount || 0,
          revenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-800">
            Admin <span className="text-[#E8392A]">Dashboard</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">{user?.firstName}</span>
            <button
              onClick={() => (window.location.href = "/")}
              className="p-2 hover:bg-[#F8FAFC] rounded-lg"
              title="Logout"
            >
              <LogOut size={20} className="text-[#1A1A1A]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-800 text-[#1A1A1A] mb-8">Dashboard Overview</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-700 text-[#1A1A1A]">Total Users</h2>
                  <Users size={24} className="text-[#E8392A]" />
                </div>
                <p className="text-3xl font-800 text-[#1A1A1A]">{stats.totalUsers}</p>
              </div>

              <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-700 text-[#1A1A1A]">Total Orders</h2>
                  <Package size={24} className="text-[#1B5E30]" />
                </div>
                <p className="text-3xl font-800 text-[#1A1A1A]">{stats.totalOrders}</p>
              </div>

              <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-700 text-[#1A1A1A]">Revenue</h2>
                  <TrendingUp size={24} className="text-blue-600" />
                </div>
                <p className="text-3xl font-800 text-[#1A1A1A]">₹{stats.revenue}</p>
              </div>

              <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-700 text-[#1A1A1A]">Active Subs</h2>
                  <BarChart3 size={24} className="text-purple-600" />
                </div>
                <p className="text-3xl font-800 text-[#1A1A1A]">{stats.activeSubscriptions}</p>
              </div>
            </div>

            {/* Admin Panel Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/admin/orders"
                className="bg-white rounded-lg border border-[#D4B896]/20 p-6 hover:shadow-lg transition-shadow"
              >
                <Package size={32} className="text-[#E8392A] mb-4" />
                <h3 className="text-xl font-700 text-[#1A1A1A] mb-2">Manage Orders</h3>
                <p className="text-gray-600">View and manage customer orders</p>
              </Link>

              <Link
                href="/admin/users"
                className="bg-white rounded-lg border border-[#D4B896]/20 p-6 hover:shadow-lg transition-shadow"
              >
                <Users size={32} className="text-[#1B5E30] mb-4" />
                <h3 className="text-xl font-700 text-[#1A1A1A] mb-2">Manage Users</h3>
                <p className="text-gray-600">View and manage customer profiles</p>
              </Link>

              <Link
                href="/admin/meals"
                className="bg-white rounded-lg border border-[#D4B896]/20 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-4">🍲</div>
                <h3 className="text-xl font-700 text-[#1A1A1A] mb-2">Manage Menus</h3>
                <p className="text-gray-600">Create and update menu items</p>
              </Link>

              <Link
                href="/admin/deliveries"
                className="bg-white rounded-lg border border-[#D4B896]/20 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-4">🚴</div>
                <h3 className="text-xl font-700 text-[#1A1A1A] mb-2">Track Deliveries</h3>
                <p className="text-gray-600">Monitor real-time delivery status</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
