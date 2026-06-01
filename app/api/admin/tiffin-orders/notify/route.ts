import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyAdmin(userId: string) {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .single();
  return data?.role === "admin" ? data : null;
}

// POST — send in-app notification to tiffin customer
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { subscriptionDayId, title, message } = await req.json();
    if (!subscriptionDayId || !title || !message) {
      return NextResponse.json({ error: "subscriptionDayId, title, and message are required" }, { status: 400 });
    }

    // 1. Fetch subscription_day → subscription_id
    const { data: day, error: dayErr } = await supabaseAdmin
      .from("subscription_days")
      .select("id, subscription_id")
      .eq("id", subscriptionDayId)
      .single();
    if (dayErr || !day) return NextResponse.json({ error: "Tiffin order not found" }, { status: 404 });

    // 2. Fetch subscription → user_id
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("id", day.subscription_id)
      .single();
    if (subErr || !sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    // 3. Insert notification
    const { error: notifErr } = await supabaseAdmin.from("notifications").insert([{
      user_id: sub.user_id,
      title,
      body: message,
      type: "subscription",
      channel: "in_app",
    }]);
    if (notifErr) return NextResponse.json({ error: notifErr.message }, { status: 500 });

    // 4. Audit log
    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "tiffin_notification_sent",
      entity: "subscription_days",
      entity_id: subscriptionDayId,
      metadata: { title, message, user_id: sub.user_id },
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
