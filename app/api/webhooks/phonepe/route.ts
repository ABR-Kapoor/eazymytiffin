import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Verify basic auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
    const [username, password] = credentials.split(":");

    if (username !== "eazymytiffin") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { transactionId, orderId, amount, status, eventType } = body;

    // Verify checksum
    const saltKey = process.env.PHONEPE_SALT_KEY || "";
    const saltIndex = parseInt(process.env.PHONEPE_SALT_INDEX || "1");
    
    const checksumString = `${orderId}${amount}${status}${saltKey}${saltIndex}`;
    const expectedChecksum = crypto
      .createHash("sha256")
      .update(checksumString)
      .digest("hex");

    if (body.checksum !== expectedChecksum) {
      console.error("Checksum mismatch");
      return NextResponse.json({ error: "Invalid checksum" }, { status: 400 });
    }

    // Handle payment events
    if (eventType === "pg.order.completed" || status === "PAYMENT_SUCCESS") {
      // Update food_orders payment status
      const { error: orderError } = await supabase
        .from("food_orders")
        .update({
          payment_status: "paid",
          status: "preparing",
        })
        .eq("id", orderId);

      if (orderError) {
        console.error("Order update error:", orderError);
        return NextResponse.json(
          { error: "Failed to update order" },
          { status: 500 }
        );
      }

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert([
        {
          order_id: orderId,
          payment_method: "phonepe",
          payment_status: "paid",
          transaction_id: transactionId,
          amount,
        },
      ]);

      if (paymentError) {
        console.error("Payment record error:", paymentError);
      }

      console.log(`Payment success for order: ${orderId}`);
      return NextResponse.json({ success: true });
    }

    if (eventType === "pg.order.failed" || status === "PAYMENT_FAILED") {
      // Update food_orders payment status
      const { error } = await supabase
        .from("food_orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
        })
        .eq("id", orderId);

      if (error) {
        console.error("Order update error:", error);
        return NextResponse.json(
          { error: "Failed to update order" },
          { status: 500 }
        );
      }

      console.log(`Payment failed for order: ${orderId}`);
      return NextResponse.json({ success: true });
    }

    // Handle subscription events
    if (
      eventType === "subscription.redemption.order.completed" ||
      eventType === "subscription.paused"
    ) {
      // Handle subscription updates as needed
      console.log(`Subscription event: ${eventType}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET (PhonePe validation)
export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true }, { status: 200 });
}
