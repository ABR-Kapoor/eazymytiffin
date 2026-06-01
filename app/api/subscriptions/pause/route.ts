import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

// IST time helpers
function getISTHour() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  ).getHours();
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { subscriptionId } = await req.json();
    if (!subscriptionId) return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });

    // Verify ownership
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();
    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, status, meal_type, user_id")
      .eq("id", subscriptionId)
      .eq("user_id", userData.id)
      .single();
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    if (sub.status !== "active") return NextResponse.json({ error: "Subscription is not active" }, { status: 400 });

    // Cutoff validation (IST)
    const hour = getISTHour();
    if (sub.meal_type === "lunch" || sub.meal_type === "both") {
      if (hour >= 11) {
        return NextResponse.json({
          error: "Lunch pause cutoff has passed (11 AM IST). You can pause tomorrow.",
        }, { status: 400 });
      }
    }
    if (sub.meal_type === "dinner") {
      if (hour >= 18) {
        return NextResponse.json({
          error: "Dinner pause cutoff has passed (6 PM IST). You can pause tomorrow.",
        }, { status: 400 });
      }
    }

    // Pause subscription
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pausedUntil = tomorrow.toISOString().split("T")[0];

    const { data: updated, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "paused", paused_until: pausedUntil, updated_at: new Date().toISOString() })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mark today's subscription_day as paused
    const today = new Date().toISOString().split("T")[0];
    await supabaseAdmin
      .from("subscription_days")
      .update({ status: "paused" })
      .eq("subscription_id", subscriptionId)
      .eq("meal_date", today)
      .eq("status", "upcoming");

    // Create in-app notification
    await supabaseAdmin.from("notifications").insert([{
      user_id: userData.id,
      title: "Subscription Paused ",
      body: "Your tiffin subscription has been paused for today. It will resume tomorrow automatically.",
      type: "subscription",
      channel: "in_app",
    }]);

    // Admin log
    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: userData.id,
      action: "subscription_paused",
      entity: "subscriptions",
      entity_id: subscriptionId,
      metadata: { paused_until: pausedUntil },
    }]);

    return NextResponse.json({ success: true, subscription: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
