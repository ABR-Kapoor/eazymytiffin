import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB not init" }, { status: 500 });

    const body = await req.json();
    const { addressId, timeSlot, paymentMethod, items, subtotal, notes } = body;

    if (!addressId || !timeSlot || !paymentMethod || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get user
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // Create food order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("food_orders")
      .insert([{
        user_id: userData.id,
        address_id: addressId,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "pending",
        status: "pending",
        subtotal: subtotal || totalAmount,
        total_amount: totalAmount,
        time_slot: timeSlot,
        notes: notes || null,
      }])
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      menu_id: item.menu_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("food_order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
    }

    // Create payment record
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert([{
        user_id: userData.id,
        order_id: order.id,
        payment_method: paymentMethod,
        payment_status: "pending",
        amount: totalAmount,
      }]);

    if (paymentError) {
      console.error("Payment record error:", paymentError);
    }

    // Create notification
    await supabaseAdmin.from("notifications").insert([{
      user_id: userData.id,
      title: "Order Placed! 🍱",
      body: `Your order of ₹${totalAmount} has been placed successfully. ${paymentMethod === "cod" ? "Pay on delivery." : "Payment pending."}`,
      type: "payment",
      channel: "in_app",
    }]);

    // If PhonePe, generate redirect URL directly
    if (paymentMethod === "phonepe") {
      const transactionId = `TX_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

      // Save transaction ID to payment record so callback can find it
      await supabaseAdmin
        .from("payments")
        .update({ transaction_id: transactionId })
        .eq("order_id", order.id);

      const redirectUrl = `/payments/phonepe-mock?transactionId=${transactionId}&amount=${totalAmount}&userId=${userData.id}&orderId=${order.id}&type=food_order`;
      return NextResponse.json({ success: true, redirectUrl, orderId: order.id });
    }

    return NextResponse.json({ success: true, orderId: order.id, order });
  } catch (err: any) {
    console.error("Food order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
