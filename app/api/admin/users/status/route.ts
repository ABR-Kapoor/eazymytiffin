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

    const { userId: targetUserId, status } = await req.json();
    if (!["active", "blocked"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const { error } = await supabaseAdmin.from("users").update({ status }).eq("id", targetUserId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: adminUser } = await supabaseAdmin.from("users").select("id").eq("clerk_user_id", userId).single();
    if (adminUser) {
      await supabaseAdmin.from("admin_logs").insert([{
        admin_id: adminUser.id, action: status === "blocked" ? "user_blocked" : "user_unblocked",
        entity: "users", entity_id: targetUserId, metadata: { new_status: status },
      }]);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
