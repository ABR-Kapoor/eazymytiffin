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

// POST — save an admin note for a subscription_day (stored in admin_logs.metadata)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = await verifyAdmin(userId!);
    if (!userId || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { subscriptionDayId, note } = await req.json();
    if (!subscriptionDayId || !note?.trim()) {
      return NextResponse.json({ error: "subscriptionDayId and note are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("admin_logs").insert([{
      admin_id: admin.id,
      action: "tiffin_note",
      entity: "subscription_days",
      entity_id: subscriptionDayId,
      metadata: { note: note.trim() },
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — fetch the latest admin note for a subscription_day
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyAdmin(userId))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const subscriptionDayId = searchParams.get("subscriptionDayId");
    if (!subscriptionDayId) {
      return NextResponse.json({ error: "subscriptionDayId is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("admin_logs")
      .select("id, metadata, created_at")
      .eq("entity", "subscription_days")
      .eq("entity_id", subscriptionDayId)
      .eq("action", "tiffin_note")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      note: (data?.metadata as any)?.note || null,
      savedAt: data?.created_at || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
