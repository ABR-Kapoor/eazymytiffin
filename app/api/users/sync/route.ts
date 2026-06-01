import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin client not initialized" }, { status: 500 });
    }

    // 1. Check if user already exists (using supabaseAdmin to bypass RLS)
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ success: true, user: existingUser });
    }

    // 2. If not, auto-create using clerk info and supabaseAdmin
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Clerk user data not found" }, { status: 404 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    const phone = clerkUser.phoneNumbers[0]?.phoneNumber || email.split("@")[0] || "";

    const { data: newUser, error: insertError } = await supabaseAdmin
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
      .select()
      .single();

    if (insertError) {
      console.error("User auto-sync insert error:", insertError);
      return NextResponse.json({ error: "Failed to create user record" }, { status: 500 });
    }

    console.log(`Successfully synced and created user record: ${newUser.id}`);
    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
