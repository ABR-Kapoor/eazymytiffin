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
      console.log(`Processing successful payment webhook for order/tx: ${orderId || transactionId}`);

      // 1. Try to find an initialized payment record linked to a subscription
      const { data: paymentRecord, error: payRecordError } = await supabase
        .from("payments")
        .select("*, subscriptions(*)")
        .or(`transaction_id.eq.${transactionId},subscription_id.eq.${orderId}`)
        .maybeSingle();

      if (paymentRecord && paymentRecord.subscription_id) {
        console.log(`Found subscription payment record: ${paymentRecord.id}`);

        // Update payment record to PAID
        const { error: payUpdateError } = await supabase
          .from("payments")
          .update({
            payment_status: "paid",
            transaction_id: transactionId || paymentRecord.transaction_id,
          })
          .eq("id", paymentRecord.id);

        if (payUpdateError) {
          console.error("Failed to update payment record status:", payUpdateError);
        }

        // Activate the subscription
        const durationDays = paymentRecord.subscriptions?.total_days || 7;
        const startsAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        const { error: subUpdateError } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            starts_at: startsAt.toISOString(),
            expires_at: expiresAt.toISOString(),
            remaining_days: durationDays,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentRecord.subscription_id);

        if (subUpdateError) {
          console.error("Failed to activate subscription:", subUpdateError);
          return NextResponse.json(
            { error: "Failed to activate subscription" },
            { status: 500 }
          );
        }

        console.log(`Subscription ${paymentRecord.subscription_id} activated successfully!`);
        return NextResponse.json({ success: true, message: "Subscription activated successfully." });
      }

      // 2. Fall back to food orders logic
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

      // Create or update payment record for food order
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
      return NextResponse.json({ success: true, message: "Order payment verified." });
    }

    if (eventType === "pg.order.failed" || status === "PAYMENT_FAILED") {
      console.log(`Processing failed payment webhook for order/tx: ${orderId || transactionId}`);

      // Try to find if it is a subscription transaction
      const { data: paymentRecord } = await supabase
        .from("payments")
        .select("id, subscription_id")
        .or(`transaction_id.eq.${transactionId},subscription_id.eq.${orderId}`)
        .maybeSingle();

      if (paymentRecord && paymentRecord.subscription_id) {
        // Mark payment as failed
        await supabase
          .from("payments")
          .update({
            payment_status: "failed",
            transaction_id: transactionId,
          })
          .eq("id", paymentRecord.id);

        // Set subscription status to cancelled
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentRecord.subscription_id);

        console.log(`Subscription payment failed. Subscription marked cancelled.`);
        return NextResponse.json({ success: true, message: "Subscription payment marked failed." });
      }

      // Fall back to food orders update
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
      return NextResponse.json({ success: true, message: "Order payment marked failed." });
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
