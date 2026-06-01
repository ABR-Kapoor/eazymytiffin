import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PhonePe mock callback — simulates what PhonePe's server sends after payment
// In production this would be at /api/payments/phonepe/callback and verify a HMAC SHA256 signature
// For now: called by /payments/phonepe-mock page after "user confirms payment"
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const body = await req.json();
    const { transactionId, success: paymentSuccess, subscriptionId, orderId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "transactionId required" }, { status: 400 });
    }

    // Find payment record
    const { data: payment, error: paymentFetchErr } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (paymentFetchErr || !payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    if (!paymentSuccess) {
      // Payment failed
      await supabaseAdmin
        .from("payments")
        .update({ payment_status: "failed" })
        .eq("id", payment.id);

      if (subscriptionId) {
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("id", subscriptionId);
      }
      if (orderId) {
        await supabaseAdmin
          .from("food_orders")
          .update({ status: "cancelled", payment_status: "failed" })
          .eq("id", orderId);
      }

      await supabaseAdmin.from("notifications").insert([{
        user_id: payment.user_id,
        title: "Payment Failed ",
        body: "Your payment could not be processed. Please try again.",
        type: "payment",
        channel: "in_app",
      }]);

      return NextResponse.json({ success: false, message: "Payment failed" });
    }

    // Payment successful — update payment record
    await supabaseAdmin
      .from("payments")
      .update({ payment_status: "paid", transaction_id: transactionId })
      .eq("id", payment.id);

    // Handle subscription payment
    if (subscriptionId || payment.subscription_id) {
      const subId = subscriptionId || payment.subscription_id;
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("id", subId)
        .single();

      if (sub) {
        const startsAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (sub.total_days || 26) + 6); // +6 grace days

        // Activate subscription
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            starts_at: startsAt.toISOString().split("T")[0],
            expires_at: expiresAt.toISOString().split("T")[0],
          })
          .eq("id", subId);

        // Generate subscription_days (skip Sundays)
        const days: any[] = [];
        const current = new Date(startsAt);
        let mealDaysGenerated = 0;
        const totalDays = sub.total_days || 26;

        while (mealDaysGenerated < totalDays) {
          if (current.getDay() !== 0) { // Skip Sundays
            const dateStr = current.toISOString().split("T")[0];
            if (sub.meal_type === "both") {
              days.push({ subscription_id: subId, meal_date: dateStr, meal_type: "lunch", status: "upcoming", deducted: false });
              days.push({ subscription_id: subId, meal_date: dateStr, meal_type: "dinner", status: "upcoming", deducted: false });
            } else {
              days.push({ subscription_id: subId, meal_date: dateStr, meal_type: sub.meal_type, status: "upcoming", deducted: false });
            }
            mealDaysGenerated++;
          }
          current.setDate(current.getDate() + 1);
        }

        if (days.length > 0) {
          await supabaseAdmin.from("subscription_days").insert(days);
        }

        // Mark trial used if trial plan
        if (sub.subscription_plans?.is_trial) {
          await supabaseAdmin
            .from("users")
            .update({ has_used_trial: true })
            .eq("id", payment.user_id);
        }

        // Notification
        await supabaseAdmin.from("notifications").insert([{
          user_id: payment.user_id,
          title: "Subscription Activated! 🎉",
          body: `Your ${sub.category === "veg" ? "Veg" : "Non-Veg"} tiffin plan is now active. Fresh meals start from tomorrow!`,
          type: "payment",
          channel: "in_app",
        }]);
      }
    }

    // Handle food order payment
    if (orderId || payment.order_id) {
      const oid = orderId || payment.order_id;
      await supabaseAdmin
        .from("food_orders")
        .update({ payment_status: "paid" })
        .eq("id", oid);

      await supabaseAdmin.from("notifications").insert([{
        user_id: payment.user_id,
        title: "Order Confirmed! 🍱",
        body: "Payment received. Your food order is confirmed and will be prepared soon.",
        type: "payment",
        channel: "in_app",
      }]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[PhonePe callback] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
