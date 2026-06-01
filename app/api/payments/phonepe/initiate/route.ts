import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

const DEFAULT_PLANS = [
  {
    id: "veg-weekly",
    title: "Veg Weekly",
    description: "Pure vegetarian meals",
    category: "veg" as const,
    meal_type: "both" as const,
    duration_days: 7,
    price: 560,
  },
  {
    id: "nonveg-weekly",
    title: "Non-Veg Weekly",
    description: "Chicken & meat specials",
    category: "non_veg" as const,
    meal_type: "both" as const,
    duration_days: 7,
    price: 700,
  },
  {
    id: "veg-monthly",
    title: "Veg Monthly",
    description: "Pure vegetarian meals",
    category: "veg" as const,
    meal_type: "both" as const,
    duration_days: 26,
    price: 2490,
  },
  {
    id: "nonveg-monthly",
    title: "Non-Veg Monthly",
    description: "Chicken & meat specials",
    category: "non_veg" as const,
    meal_type: "both" as const,
    duration_days: 26,
    price: 3490,
  },
];

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    // 2. Fetch User from Supabase with auto-sync fallback (using supabaseAdmin to bypass RLS)
    let { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("id, email, phone, full_name")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (userError || !userData) {
      console.log(`User not found in Supabase during payment. Auto-syncing Clerk user: ${userId}`);
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      if (clerkUser && supabaseAdmin) {
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
        const phone = clerkUser.phoneNumbers[0]?.phoneNumber || email.split("@")[0] || "";

        const { data: syncedUser, error: insertError } = await supabaseAdmin
          .from("users")
          .insert([
            {
              clerk_user_id: userId,
              email,
              full_name: fullName,
              phone,
              role: "customer",
              status: "active",
              city: "Bilaspur",
            },
          ])
          .select("id, email, phone, full_name")
          .single();

        if (!insertError && syncedUser) {
          userData = syncedUser;
          userError = null;
        } else {
          console.error("Auto-sync insert failed:", insertError);
        }
      }
    }

    if (userError || !userData) {
      console.error("User lookup and auto-sync failed:", userError);
      return NextResponse.json(
        { success: false, message: "User profile could not be synced in database." },
        { status: 500 }
      );
    }

    // 3. Extract request body params
    const body = await req.json();
    const { planId } = body;
    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Missing planId parameter." },
        { status: 400 }
      );
    }

    const planIdAliases: Record<string, string> = {
      "veg-w": "veg-weekly",
      "nv-w": "nonveg-weekly",
      "veg-m": "veg-monthly",
      "nv-m": "nonveg-monthly",
    };
    const normalizedPlanId = planIdAliases[planId] || planId;

    // 4. Retrieve Plan Details (DB first, fallback to hardcoded defaults)
    let plan: any = null;
    try {
      const { data: dbPlan } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", normalizedPlanId)
        .eq("is_active", true)
        .single();
      
      if (dbPlan) {
        plan = dbPlan;
      }
    } catch (e) {
      console.warn("DB plan lookup failed, checking static defaults:", e);
    }

    if (!plan) {
      plan = DEFAULT_PLANS.find((p) => p.id === normalizedPlanId);
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Invalid subscription plan selected." },
        { status: 400 }
      );
    }

    // 5. Create a cancelled/pending subscription record in the database
    // We create it with status "cancelled" first so we don't have active subscriptions without payments.
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userData.id,
          plan_id: plan.id.includes("-") ? null : plan.id, // Set plan_id if it is a real DB uuid, otherwise null
          category: plan.category,
          meal_type: plan.meal_type || "both",
          remaining_days: plan.duration_days,
          total_days: plan.duration_days,
          status: "cancelled", // Inactive until payment success
          starts_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (subError || !subData) {
      console.error("Subscription database insertion error:", subError);
      return NextResponse.json(
        { success: false, message: "Failed to initialize checkout subscription." },
        { status: 500 }
      );
    }

    // 6. Generate unique Transaction ID & create pending Payment Record
    const transactionId = `TX_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const { error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          user_id: userData.id,
          subscription_id: subData.id,
          payment_method: "phonepe",
          payment_status: "pending",
          transaction_id: transactionId,
          amount: plan.price,
        },
      ]);

    if (paymentError) {
      console.error("Payment insertion error:", paymentError);
      // Clean up orphaned subscription
      await supabase.from("subscriptions").delete().eq("id", subData.id);
      return NextResponse.json(
        { success: false, message: "Failed to initialize checkout transaction." },
        { status: 500 }
      );
    }

    // 7. Generate redirect URL for local high-fidelity PhonePe simulator
    // In production, this would make an HTTPS call to PhonePe APIs and return PhonePe's merchant redirect URL.
    const redirectUrl = `/payments/phonepe-mock?transactionId=${transactionId}&amount=${plan.price}&userId=${userData.id}&subscriptionId=${subData.id}&planTitle=${encodeURIComponent(plan.title)}`;

    return NextResponse.json({
      success: true,
      redirectUrl,
      transactionId,
      subscriptionId: subData.id,
    });
  } catch (error: any) {
    console.error("Initiate payment server error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
