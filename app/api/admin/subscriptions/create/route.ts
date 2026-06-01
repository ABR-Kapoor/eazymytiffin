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

// POST — admin creates a subscription for a user (bypasses payment)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { userId: targetUserId, planId, category, mealType, startsAt } = await req.json();
    if (!targetUserId || !category || !mealType || !startsAt) {
      return NextResponse.json({ error: "userId, category, mealType, startsAt are required" }, { status: 400 });
    }

    // Resolve duration_days from plan (if planId provided), else default 30
    let durationDays = 30;
    let planTitle = "Custom Plan";
    if (planId) {
      const { data: plan } = await supabaseAdmin
        .from("subscription_plans")
        .select("duration_days, title")
        .eq("id", planId)
        .single();
      if (plan) { durationDays = plan.duration_days; planTitle = plan.title; }
    }

    const { data: newSub, error } = await supabaseAdmin
      .from("subscriptions")
      .insert([{
        user_id: targetUserId,
        plan_id: planId || null,
        category,
        meal_type: mealType,
        remaining_days: durationDays,
        total_days: durationDays,
        status: "active",
        starts_at: startsAt,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send in-app notification to customer
    await supabaseAdmin.from("notifications").insert([{
      user_id: targetUserId,
      title: "Subscription Activated 🍱",
      body: `Your ${planTitle} subscription has been activated by admin. Enjoy your meals!`,
      type: "subscription",
      channel: "in_app",
    }]);

    // Audit log
    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "subscription_created",
      entity: "subscriptions",
      entity_id: newSub.id,
      metadata: { user_id: targetUserId, plan_id: planId, category, meal_type: mealType, duration_days: durationDays },
    }]);

    return NextResponse.json({ success: true, subscription: newSub });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
