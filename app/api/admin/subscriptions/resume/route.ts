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

    const { subscriptionId } = await req.json();
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "active", paused_until: null })
      .eq("id", subscriptionId)
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.user_id) {
      await supabaseAdmin.from("notifications").insert([{
        user_id: data.user_id, title: "Subscription Resumed ",
        body: "Your subscription has been resumed by the admin. Fresh meals coming soon!", type: "subscription", channel: "in_app",
      }]);
    }
    
    // Admin log
    const { data: adminUser } = await supabaseAdmin.from("users").select("id").eq("clerk_user_id", userId).single();
    if (adminUser) {
      await supabaseAdmin.from("admin_logs").insert([{
        admin_id: adminUser.id, action: "subscription_resumed", entity: "subscriptions",
        entity_id: subscriptionId, metadata: {},
      }]);
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
