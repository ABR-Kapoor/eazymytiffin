"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminMealsPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "veg" as "veg" | "non_veg",
    meal_type: "lunch" as "lunch" | "dinner" | "both",
    image_url: "",
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const { data } = await supabase
        .from("menus")
        .select("*")
        .order("created_at", { ascending: false });

      setMenus(data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = async () => {
    if (!formData.title) {
      alert("Please fill all fields");
      return;
    }

    try {
      const { error } = await supabase.from("menus").insert([
        {
          ...formData,
          is_active: true,
        },
      ]);

      if (error) throw error;
      setFormData({
        title: "",
        description: "",
        category: "veg",
        meal_type: "lunch",
        image_url: "",
      });
      setShowForm(false);
      fetchMenus();
    } catch (error) {
      console.error("Error adding menu:", error);
      alert("Failed to add menu");
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Delete this menu?")) return;

    try {
      const { error } = await supabase.from("menus").delete().eq("id", id);

      if (error) throw error;
      setMenus(menus.filter((menu) => menu.id !== id));
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Failed to delete menu");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-[#F8FAFC] rounded-lg">
              <ArrowLeft size={20} className="text-[#1A1A1A]" />
            </Link>
            <h1 className="text-2xl font-800 text-[#1A1A1A]">Menu Management</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#E8392A] text-white font-600 px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Menu
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-[#D4B896]/20 p-6 mb-8">
            <h2 className="text-xl font-700 text-[#1A1A1A] mb-4">Add New Menu Item</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Menu title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-2 px-4 py-3 border border-[#D4B896]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8392A]"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-2 px-4 py-3 border border-[#D4B896]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8392A]"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "veg" | "non_veg" })}
                className="px-4 py-3 border border-[#D4B896]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8392A]"
              >
                <option value="veg">Vegetarian</option>
                <option value="non_veg">Non-Vegetarian</option>
              </select>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value as "lunch" | "dinner" | "both" })}
                className="px-4 py-3 border border-[#D4B896]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8392A]"
              >
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="both">Both</option>
              </select>
              <input
                type="text"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="col-span-2 px-4 py-3 border border-[#D4B896]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8392A]"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleAddMenu}
                className="flex-1 bg-[#E8392A] text-white font-600 py-3 rounded-lg hover:bg-red-700"
              >
                Add Menu
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-[#1A1A1A] font-600 py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Menus List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading menus...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No menus added yet. Start by adding a menu item!</p>
              </div>
            ) : (
              menus.map((menu) => (
                <div key={menu.id} className="bg-white rounded-lg border border-[#D4B896]/20 overflow-hidden hover:shadow-lg transition-shadow">
                  {menu.image_url && (
                    <img
                      src={menu.image_url}
                      alt={menu.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-700 text-[#1A1A1A] mb-1">{menu.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{menu.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-2">
                        <span className="bg-[#F8FAFC] px-2 py-1 rounded text-xs font-600 text-gray-700">
                          {menu.meal_type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-600 ${
                          menu.category === 'veg' ? 'bg-green-100 text-[#1B5E30]' : 'bg-red-100 text-[#E8392A]'
                        }`}>
                          {menu.category === 'veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-600 ${menu.is_active ? 'bg-green-100 text-[#1B5E30]' : 'bg-gray-100 text-gray-700'}`}>
                        {menu.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-[#E8392A]"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
