import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB not init" }, { status: 500 });

    const { id: orderId } = await params;

    // Get user
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check order belongs to user and is cancellable
    const { data: order } = await supabaseAdmin
      .from("food_orders")
      .select("id, status, user_id")
      .eq("id", orderId)
      .eq("user_id", userData.id)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Order can only be cancelled when in 'pending' status." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("food_orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notification
    await supabaseAdmin.from("notifications").insert([{
      user_id: userData.id,
      title: "Order Cancelled",
      body: `Your order #${orderId.slice(0, 8).toUpperCase()} has been cancelled.`,
      type: "system",
      channel: "in_app",
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
