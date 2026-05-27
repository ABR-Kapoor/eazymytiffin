"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: "", full_name: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_user_id", user.id)
          .single();

        setProfile(data);
        setFormData({ phone: data?.phone || "", full_name: data?.full_name || "" });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ phone: formData.phone, full_name: formData.full_name })
        .eq("id", profile.id);

      if (error) throw error;
      setEditing(false);
      setProfile({ ...profile, ...formData });
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-[#F8FAFC] rounded-lg">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </Link>
          <h1 className="text-2xl font-800 text-[#1A1A1A]">Profile</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#D4B896]/20 p-8">
            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-600 text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div className="mb-6">
              <label className="block text-sm font-600 text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-3 border rounded-lg ${
                  editing
                    ? "border-[#D4B896] bg-white text-[#1A1A1A]"
                    : "border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="block text-sm font-600 text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                className={`w-full px-4 py-3 border rounded-lg ${
                  editing
                    ? "border-[#D4B896] bg-white text-[#1A1A1A]"
                    : "border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Role */}
            <div className="mb-8">
              <label className="block text-sm font-600 text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={profile?.role || "customer"}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Status */}
            <div className="mb-8">
              <label className="block text-sm font-600 text-gray-700 mb-2">Status</label>
              <input
                type="text"
                value={profile?.status || "active"}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-[#E8392A] text-white font-600 px-6 py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({ phone: profile?.phone || "", full_name: profile?.full_name || "" });
                    }}
                    className="flex-1 bg-gray-200 text-[#1A1A1A] font-600 px-6 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-[#E8392A] text-white font-600 px-6 py-3 rounded-lg hover:bg-red-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="mt-8 pt-8 border-t border-[#D4B896]/20">
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="w-full bg-red-100 text-[#E8392A] font-600 px-6 py-3 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
