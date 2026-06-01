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
      .select("id, status, user_id, remaining_days")
      .eq("id", subscriptionId)
      .eq("user_id", userData.id)
      .single();
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    if (sub.status !== "paused") return NextResponse.json({ error: "Subscription is not paused" }, { status: 400 });
    if (sub.remaining_days <= 0) return NextResponse.json({ error: "No meal days remaining" }, { status: 400 });

    const { data: updated, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "active", paused_until: null, updated_at: new Date().toISOString() })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notification
    await supabaseAdmin.from("notifications").insert([{
      user_id: userData.id,
      title: "Subscription Resumed ",
      body: "Your tiffin subscription is active again. Fresh meals will be delivered tomorrow!",
      type: "subscription",
      channel: "in_app",
    }]);

    return NextResponse.json({ success: true, subscription: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
