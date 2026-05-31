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

// GET — list subscription_days with subscription + user joins
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyAdmin(userId))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const subscriptionId = searchParams.get("subscription_id");
    const search = searchParams.get("search");

    let query = supabaseAdmin
      .from("subscription_days")
      .select(`
        id, meal_date, meal_type, status, deducted, created_at,
        subscription:subscriptions(
          id, category, meal_type, status, remaining_days,
          user:users!subscriptions_user_id_fkey(id, full_name, phone, email)
        )
      `)
      .order("meal_date", { ascending: false })
      .limit(200);

    if (status && status !== "all") query = query.eq("status", status);
    if (date) query = query.eq("meal_date", date);
    if (subscriptionId) query = query.eq("subscription_id", subscriptionId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Filter by customer name/phone if search provided
    let result = data || [];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d: any) => {
        const user = d.subscription?.user;
        return (
          user?.full_name?.toLowerCase().includes(q) ||
          user?.phone?.includes(q)
        );
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — create a new subscription_day
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { subscriptionId, mealDate, mealType } = await req.json();
    if (!subscriptionId || !mealDate || !mealType) {
      return NextResponse.json({ error: "subscriptionId, mealDate, mealType are required" }, { status: 400 });
    }

    const { data: newDay, error } = await supabaseAdmin
      .from("subscription_days")
      .insert([{ subscription_id: subscriptionId, meal_date: mealDate, meal_type: mealType, status: "upcoming", deducted: false }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit log
    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "tiffin_order_created",
      entity: "subscription_days",
      entity_id: newDay.id,
      metadata: { meal_date: mealDate, meal_type: mealType, subscription_id: subscriptionId },
    }]);

    return NextResponse.json({ success: true, data: newDay });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update status of a subscription_day
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { id, status, fromStatus } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const updatePayload: any = { status };
    // Auto-mark deducted when preparing
    if (status === "preparing") updatePayload.deducted = true;

    const { error } = await supabaseAdmin
      .from("subscription_days")
      .update(updatePayload)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit log
    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "tiffin_order_updated",
      entity: "subscription_days",
      entity_id: id,
      metadata: { from_status: fromStatus, to_status: status },
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — remove a subscription_day
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { id, mealDate } = await req.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("subscription_days").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit log
    await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "tiffin_order_deleted",
      entity: "subscription_days",
      entity_id: id,
      metadata: { meal_date: mealDate },
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
