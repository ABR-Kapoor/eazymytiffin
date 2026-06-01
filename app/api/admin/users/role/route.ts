import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyAdmin(userId: string) {
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin.from("users").select("role").eq("clerk_user_id", userId).single();
  return data?.role === "admin";
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await verifyAdmin(userId))) return NextResponse.json({ error: "Admin only" }, { status: 403 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { userId: targetUserId, role } = await req.json();
    if (!["customer", "delivery_boy", "admin"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    const { error } = await supabaseAdmin.from("users").update({ role }).eq("id", targetUserId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log
    const { data: adminUser } = await supabaseAdmin.from("users").select("id").eq("clerk_user_id", userId).single();
    if (adminUser) {
      await supabaseAdmin.from("admin_logs").insert([{
        admin_id: adminUser.id, action: "role_changed", entity: "users",
        entity_id: targetUserId, metadata: { new_role: role },
      }]);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
