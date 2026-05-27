"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (!userData) return;

        const { data } = await supabase
          .from("food_orders")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false });

        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={20} className="text-[#1B5E30]" />;
      case "out_for_delivery":
        return <Package size={20} className="text-[#E8392A]" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-[#1B5E30]";
      case "out_for_delivery":
        return "bg-orange-100 text-[#E8392A]";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "preparing":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-[#F8FAFC] rounded-lg">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </Link>
          <h1 className="text-2xl font-800 text-[#1A1A1A]">Your Orders</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#D4B896]/20 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-700 text-[#1A1A1A] mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-4">Start by placing your first order or subscription</p>
            <Link
              href="/subscription"
              className="inline-block bg-[#E8392A] text-white font-600 px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Browse Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-[#D4B896]/20 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-700 text-[#1A1A1A]">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-600 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.replace(/_/g, " ").toUpperCase()}
                  </div>
                </div>

                <div className="border-t border-[#D4B896]/20 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 text-sm">Total Amount</p>
                    </div>
                    <p className="text-xl font-800 text-[#E8392A]">₹{order.total_amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
