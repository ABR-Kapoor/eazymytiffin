import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB not init" }, { status: 500 });

    const body = await req.json();
    const { id, markAll } = body;

    // Get the user's Supabase id
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (markAll) {
      await supabaseAdmin
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userData.id);
    } else if (id) {
      await supabaseAdmin
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", userData.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
