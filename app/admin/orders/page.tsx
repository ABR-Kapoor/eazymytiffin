"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await supabase
          .from("food_orders")
          .select("*, users:user_id(full_name, email)")
          .order("created_at", { ascending: false });

        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.includes(search) ||
      order.users?.email?.includes(search) ||
      order.users?.full_name?.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-[#F8FAFC] rounded-lg">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </Link>
          <h1 className="text-2xl font-800 text-[#1A1A1A]">Orders Management</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by order ID, email, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[#D4B896]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8392A]"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#D4B896]/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#D4B896]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#D4B896]/20 hover:bg-[#F8FAFC]">
                      <td className="px-6 py-3 font-600 text-[#1A1A1A]">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3 text-gray-600">{order.users?.full_name}</td>
                      <td className="px-6 py-3 font-700 text-[#E8392A]">₹{order.total_amount}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-600 ${
                            order.status === "delivered"
                              ? "bg-green-100 text-[#1B5E30]"
                              : order.status === "out_for_delivery"
                              ? "bg-orange-100 text-[#E8392A]"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-600 ${
                            order.payment_status === "paid"
                              ? "bg-green-100 text-[#1B5E30]"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.payment_status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
