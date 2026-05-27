"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const { data } = await supabase
          .from("deliveries")
          .select("*, orders:order_id(id, user_id, users:user_id(full_name, email))")
          .order("created_at", { ascending: false })
          .limit(50);

        setDeliveries(data || []);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-[#1B5E30]";
      case "in_transit":
        return "bg-orange-100 text-[#E8392A]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-[#F8FAFC] rounded-lg">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </Link>
          <h1 className="text-2xl font-800 text-[#1A1A1A]">Deliveries Tracking</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading deliveries...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#D4B896]/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#D4B896]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">
                    Delivery ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      No deliveries found
                    </td>
                  </tr>
                ) : (
                  deliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-[#D4B896]/20 hover:bg-[#F8FAFC]"
                    >
                      <td className="px-6 py-3 font-600 text-[#1A1A1A]">
                        {delivery.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {delivery.orders?.users?.full_name}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-600 ${getStatusColor(
                            delivery.status
                          )}`}
                        >
                          {delivery.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {delivery.location_lat.toFixed(4)}, {delivery.location_lng.toFixed(4)}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(delivery.created_at).toLocaleTimeString()}
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
