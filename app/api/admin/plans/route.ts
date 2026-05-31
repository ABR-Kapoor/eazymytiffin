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

// GET — list all subscription_plans
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyAdmin(userId))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { data, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — create a new plan
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const body = await req.json();
    const { title, description, meal_type, category, duration_days, price, is_trial, is_active } = body;
    if (!title || !meal_type || !category || !duration_days || price === undefined) {
      return NextResponse.json({ error: "title, meal_type, category, duration_days, price are required" }, { status: 400 });
    }

    const { data: newPlan, error } = await supabaseAdmin
      .from("subscription_plans")
      .insert([{ title, description: description || null, meal_type, category, duration_days: Number(duration_days), price: Number(price), is_trial: !!is_trial, is_active: is_active !== false }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "plan_created",
      entity: "subscription_plans",
      entity_id: newPlan.id,
      metadata: { title, price, duration_days },
    }]);

    return NextResponse.json({ success: true, data: newPlan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update a plan
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Plan id is required" }, { status: 400 });

    const body = await req.json();
    const { title, description, meal_type, category, duration_days, price, is_trial, is_active } = body;

    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (meal_type !== undefined) updatePayload.meal_type = meal_type;
    if (category !== undefined) updatePayload.category = category;
    if (duration_days !== undefined) updatePayload.duration_days = Number(duration_days);
    if (price !== undefined) updatePayload.price = Number(price);
    if (is_trial !== undefined) updatePayload.is_trial = is_trial;
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { error } = await supabaseAdmin.from("subscription_plans").update(updatePayload).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "plan_updated",
      entity: "subscription_plans",
      entity_id: id,
      metadata: { changes: updatePayload },
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — delete a plan
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Plan id is required" }, { status: 400 });

    // Check if any active subscriptions use this plan
    const { count } = await supabaseAdmin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("plan_id", id)
      .eq("status", "active");

    // Fetch plan title for log
    const { data: plan } = await supabaseAdmin.from("subscription_plans").select("title").eq("id", id).single();

    const { error } = await supabaseAdmin.from("subscription_plans").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "plan_deleted",
      entity: "subscription_plans",
      entity_id: id,
      metadata: { title: plan?.title, active_sub_count: count || 0 },
    }]);

    return NextResponse.json({ success: true, activeSubsWarning: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
