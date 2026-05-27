"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Mail, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("role", "customer")
          .order("created_at", { ascending: false });

        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email?.includes(search) ||
      user.full_name?.includes(search) ||
      user.phone?.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-[#F8FAFC] rounded-lg">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </Link>
          <h1 className="text-2xl font-800 text-[#1A1A1A]">Users Management</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by email, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[#D4B896]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8392A]"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#D4B896]/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#D4B896]/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-700 text-[#1A1A1A]">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#D4B896]/20 hover:bg-[#F8FAFC]">
                      <td className="px-6 py-3 font-600 text-[#1A1A1A]">{user.full_name || "—"}</td>
                      <td className="px-6 py-3 text-gray-600 flex items-center gap-2">
                        <Mail size={16} />
                        {user.email}
                      </td>
                      <td className="px-6 py-3 text-gray-600 flex items-center gap-2">
                        <Phone size={16} />
                        {user.phone || "—"}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-600 ${
                            user.status === "active"
                              ? "bg-green-100 text-[#1B5E30]"
                              : "bg-red-100 text-[#E8392A]"
                          }`}
                        >
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
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
