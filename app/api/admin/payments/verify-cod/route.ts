import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyAdmin(userId: string) {
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin.from("users").select("role").eq("clerk_user_id", userId).single();
  return data?.role === "admin";
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyAdmin(userId))) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { orderId } = await req.json();
    const { data: order } = await supabaseAdmin.from("food_orders").select("user_id, total_amount, payment_method").eq("id", orderId).single();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Mark payment as paid
    await supabaseAdmin.from("payments").update({ payment_status: "paid" }).eq("order_id", orderId);
    await supabaseAdmin.from("food_orders").update({ payment_status: "paid" }).eq("id", orderId);

    // Notify customer
    await supabaseAdmin.from("notifications").insert([{
      user_id: order.user_id, title: "COD Payment Confirmed ",
      body: `Cash payment of ₹${order.total_amount} has been verified by admin.`, type: "payment", channel: "in_app",
    }]);

    // Admin log
    const { data: adminUser } = await supabaseAdmin.from("users").select("id").eq("clerk_user_id", userId).single();
    if (adminUser) {
      await supabaseAdmin.from("admin_logs").insert([{
        admin_id: adminUser.id, action: "cod_payment_verified", entity: "food_orders",
        entity_id: orderId, metadata: { amount: order.total_amount },
      }]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
