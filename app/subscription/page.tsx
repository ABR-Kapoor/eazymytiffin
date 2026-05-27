"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_PLANS = [
  {
    id: "veg-weekly",
    title: "Veg Weekly",
    description: "Pure vegetarian meals",
    category: "veg" as const,
    meal_type: "both" as const,
    duration_days: 7,
    price: 560,
    icon: "🥗",
  },
  {
    id: "nonveg-weekly",
    title: "Non-Veg Weekly",
    description: "Chicken & meat specials",
    category: "non_veg" as const,
    meal_type: "both" as const,
    duration_days: 7,
    price: 700,
    icon: "🍗",
  },
  {
    id: "veg-monthly",
    title: "Veg Monthly",
    description: "Pure vegetarian meals",
    category: "veg" as const,
    meal_type: "both" as const,
    duration_days: 26,
    price: 2490,
    icon: "🥗",
  },
];

export default function SubscriptionPage() {
  const { user } = useUser();
  const [plans, setPlans] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        // Get subscription plans
        const { data: plansData } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("duration_days", { ascending: true });

        setPlans(plansData || DEFAULT_PLANS);

        // Get user's active subscription
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (userData) {
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userData.id)
            .eq("status", "active")
            .single();

          setActiveSubscription(subData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setPlans(DEFAULT_PLANS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FDF9F3]">
      {/* Header */}
      <div className="bg-white border-b border-[#D4B896]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-[#F8FAFC] rounded-lg">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </Link>
          <h1 className="text-2xl font-800 text-[#1A1A1A]">Meal Plans</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeSubscription && (
          <div className="bg-gradient-to-r from-[#E8392A] to-red-700 text-white rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-800 mb-2">Active Subscription</h2>
            <p className="mb-4">
              {activeSubscription.category} plan · {activeSubscription.remaining_days} days remaining
            </p>
            <button
              onClick={() => alert("Pause/Cancel functionality coming soon")}
              className="bg-white text-[#E8392A] font-600 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Manage Subscription
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading plans...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-800 text-[#1A1A1A] mb-8">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border-2 transition-all ${
                    activeSubscription?.plan_id === plan.id
                      ? "border-[#E8392A] bg-red-50"
                      : "border-[#D4B896]/20 bg-white hover:border-[#E8392A]"
                  }`}
                >
                  <div className="p-6">
                    <div className="text-4xl mb-4">
                      {plan.category === "veg" ? "🥗" : "🍗"}
                    </div>
                    <h3 className="text-2xl font-800 text-[#1A1A1A] mb-2">{plan.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <p className="text-4xl font-800 text-[#E8392A]">₹{plan.price}</p>
                      <p className="text-gray-600 text-sm">for {plan.duration_days} days</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check size={18} className="text-[#1B5E30]" />
                        Daily fresh meals
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check size={18} className="text-[#1B5E30]" />
                        {plan.category === "veg" ? "100% Vegetarian" : "Premium Non-Veg"}
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check size={18} className="text-[#1B5E30]" />
                        Menu rotation
                      </li>
                    </ul>

                    <button
                      onClick={() => alert("Payment integration coming soon")}
                      className={`w-full font-600 py-3 rounded-lg transition-all ${
                        activeSubscription?.plan_id === plan.id
                          ? "bg-[#E8392A] text-white"
                          : "bg-[#E8392A] text-white hover:bg-red-700"
                      }`}
                    >
                      {activeSubscription?.plan_id === plan.id ? "Current Plan" : "Select Plan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
