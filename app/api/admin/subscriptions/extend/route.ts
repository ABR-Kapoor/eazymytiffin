import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyAdmin(userId: string) {
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin.from("users").select("role").eq("clerk_user_id", userId).single();
  return data?.role === "admin";
}

// Extend subscription by N days
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyAdmin(userId))) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { subscriptionId, days } = await req.json();
    if (!subscriptionId || !days || days < 1) return NextResponse.json({ error: "subscriptionId and days required" }, { status: 400 });

    const { data: sub } = await supabaseAdmin.from("subscriptions").select("remaining_days, total_days, user_id, meal_type").eq("id", subscriptionId).single();
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ remaining_days: (sub.remaining_days || 0) + days, total_days: (sub.total_days || 0) + days, status: "active" })
      .eq("id", subscriptionId)
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Generate new subscription_days for the extended period
    // Find the last meal_date for this subscription
    const { data: lastDay } = await supabaseAdmin
      .from("subscription_days")
      .select("meal_date")
      .eq("subscription_id", subscriptionId)
      .order("meal_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const startFrom = lastDay ? new Date(lastDay.meal_date) : new Date();
    startFrom.setDate(startFrom.getDate() + 1);

    const newDays: any[] = [];
    let generated = 0;
    const cur = new Date(startFrom);

    while (generated < days) {
      if (cur.getDay() !== 0) {
        const dateStr = cur.toISOString().split("T")[0];
        if (sub.meal_type === "both") {
          newDays.push({ subscription_id: subscriptionId, meal_date: dateStr, meal_type: "lunch", status: "upcoming", deducted: false });
          newDays.push({ subscription_id: subscriptionId, meal_date: dateStr, meal_type: "dinner", status: "upcoming", deducted: false });
        } else {
          newDays.push({ subscription_id: subscriptionId, meal_date: dateStr, meal_type: sub.meal_type, status: "upcoming", deducted: false });
        }
        generated++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (newDays.length > 0) await supabaseAdmin.from("subscription_days").insert(newDays);

    // Admin log
    const { data: adminUser } = await supabaseAdmin.from("users").select("id").eq("clerk_user_id", userId).single();
    if (adminUser) {
      await supabaseAdmin.from("admin_logs").insert([{
        admin_id: adminUser.id, action: "subscription_extended", entity: "subscriptions",
        entity_id: subscriptionId, metadata: { days_added: days },
      }]);
    }

    if (sub.user_id) {
      await supabaseAdmin.from("notifications").insert([{
        user_id: sub.user_id, title: `+${days} Days Added! 🎁`,
        body: `Your tiffin subscription has been extended by ${days} days.`, type: "subscription", channel: "in_app",
      }]);
    }

    return NextResponse.json({ success: true, subscription: data });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
