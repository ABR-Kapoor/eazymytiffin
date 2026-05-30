import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { subscriptionId } = await req.json();
    if (!subscriptionId) return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });

    const { data: userData } = await supabaseAdmin
      .from("users").select("id").eq("clerk_user_id", userId).single();
    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, status, user_id")
      .eq("id", subscriptionId)
      .eq("user_id", userData.id)
      .single();
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    if (sub.status === "cancelled") return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

    const { data: updated, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Cancel all upcoming subscription_days
    await supabaseAdmin
      .from("subscription_days")
      .update({ status: "cancelled" })
      .eq("subscription_id", subscriptionId)
      .eq("status", "upcoming");

    // Notification
    await supabaseAdmin.from("notifications").insert([{
      user_id: userData.id,
      title: "Subscription Cancelled",
      body: "Your tiffin subscription has been cancelled. You can subscribe again anytime.",
      type: "subscription",
      channel: "in_app",
    }]);

    // Admin log
    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: userData.id,
      action: "subscription_cancelled",
      entity: "subscriptions",
      entity_id: subscriptionId,
    }]);

    return NextResponse.json({ success: true, subscription: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
