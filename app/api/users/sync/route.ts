import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin client not initialized" }, { status: 500 });
    }

    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (existingError) {
      console.error("User sync lookup error:", existingError);
      return NextResponse.json({ error: "Failed to lookup existing user" }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ success: true, user: existingUser });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Clerk user data not found" }, { status: 404 });
    }

    const email =
      clerkUser.emailAddresses[0]?.emailAddress ||
      clerkUser.phoneNumbers[0]?.phoneNumber ||
      `${userId}@clerk.local`;

    const fullName =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") ||
      clerkUser.username ||
      "Customer";

    const phone =
      clerkUser.phoneNumbers[0]?.phoneNumber ||
      email.split("@")[0] ||
      userId;

    const { data: existingByEmailOrPhone, error: conflictLookupError } = await supabaseAdmin
      .from("users")
      .select("*")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (conflictLookupError) {
      console.error("User sync conflict lookup error:", conflictLookupError);
      return NextResponse.json({ error: "Failed to lookup user conflict" }, { status: 500 });
    }

    if (existingByEmailOrPhone) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({ clerk_user_id: userId })
        .eq("id", existingByEmailOrPhone.id)
        .select()
        .single();

      if (updateError) {
        console.error("User sync update error:", updateError);
        return NextResponse.json({ error: "Failed to update existing user record" }, { status: 500 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

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
      return NextResponse.json({ error: insertError.message || "Failed to create user record" }, { status: 500 });
    }

    console.log(`Successfully synced and created user record: ${newUser.id}`);
    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
