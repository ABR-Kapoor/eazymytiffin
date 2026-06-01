import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyAdmin(userId: string) {
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin.from("users").select("role").eq("clerk_user_id", userId).single();
  return data?.role === "admin";
}

// Deduct meal day when order moves to "preparing"
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyAdmin(userId))) return NextResponse.json({ error: "Admin only" }, { status: 403 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { orderId } = await req.json();
    const { data: order } = await supabaseAdmin.from("food_orders").select("user_id, time_slot").eq("id", orderId).single();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const today = new Date().toISOString().split("T")[0];

    // Find active subscription for this user
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, remaining_days, status")
      .eq("user_id", order.user_id)
      .eq("status", "active")
      .maybeSingle();

    if (!sub || sub.remaining_days <= 0) return NextResponse.json({ success: true, message: "No active subscription to deduct from" });

    // Mark today's subscription_day as delivered
    await supabaseAdmin
      .from("subscription_days")
      .update({ status: "delivered", deducted: true })
      .eq("subscription_id", sub.id)
      .eq("meal_date", today)
      .eq("status", "upcoming");

    // Decrement remaining_days
    const newDays = sub.remaining_days - 1;
    await supabaseAdmin.from("subscriptions").update({ remaining_days: newDays }).eq("id", sub.id);

    // Renewal reminder notifications
    if (newDays === 7 || newDays === 3) {
      await supabaseAdmin.from("notifications").insert([{
        user_id: order.user_id,
        title: `Only ${newDays} days left! 🔔`,
        body: `Your tiffin subscription has ${newDays} meal days remaining. Renew now to continue enjoying fresh meals!`,
        type: "subscription",
        channel: "in_app",
      }]);
    }
    if (newDays === 0) {
      await supabaseAdmin.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);
      await supabaseAdmin.from("notifications").insert([{
        user_id: order.user_id,
        title: "Subscription Expired 😔",
        body: "Your tiffin subscription has expired. Subscribe again to continue getting fresh home meals!",
        type: "subscription",
        channel: "in_app",
      }]);
    }

    return NextResponse.json({ success: true, remainingDays: newDays });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
