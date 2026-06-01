import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_EMAILS = [
  "eazygrace.ventures@gmail.com",
  "abrmkprm@gmail.com"
];

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Supabase service role client not initialized." },
        { status: 500 }
      );
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "CLERK_SECRET_KEY is not defined in environment variables." },
        { status: 500 }
      );
    }

    // 1. Initialize Clerk Client
    const clerk = createClerkClient({ secretKey });
    
    // 2. Fetch all users from Clerk (pagination limit up to 100)
    console.log("Fetching users list from Clerk...");
    const clerkUsersResponse = await clerk.users.getUserList({
      limit: 100,
    });

    const clerkUsers = Array.isArray(clerkUsersResponse) 
      ? clerkUsersResponse 
      : (clerkUsersResponse as any).data || [];

    if (!clerkUsers || clerkUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users found in Clerk to synchronize.",
        syncedCount: 0,
      });
    }

    console.log(`Retrieved ${clerkUsers.length} users from Clerk. Starting database synchronization...`);

    const syncedUsers = [];
    const skippedUsers = [];
    const errors = [];

    // 3. Loop through and upsert each user in Supabase
    for (const clerkUser of clerkUsers) {
      try {
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
        const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
        const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || email.split("@")[0] || "";
        
        // Determine role based on email matches
        const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "customer";

        // Query if user already exists
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("clerk_user_id", clerkUser.id)
          .maybeSingle();

        if (existingUser) {
          // Update existing user profile details
          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              email,
              full_name: fullName,
              phone,
              role,
              updated_at: new Date().toISOString(),
            })
            .eq("clerk_user_id", clerkUser.id);

          if (updateError) {
            console.error(`Failed to update user ${clerkUser.id}:`, updateError);
            errors.push({ clerkId: clerkUser.id, email, error: updateError.message });
          } else {
            syncedUsers.push({ clerkId: clerkUser.id, email, action: "updated", role });
          }
        } else {
          // Insert new user profile record
          const { error: insertError } = await supabaseAdmin
            .from("users")
            .insert([
              {
                clerk_user_id: clerkUser.id,
                email,
                full_name: fullName,
                phone,
                role,
                status: "active",
                city: "Bilaspur",
              },
            ]);

          if (insertError) {
            console.error(`Failed to insert user ${clerkUser.id}:`, insertError);
            errors.push({ clerkId: clerkUser.id, email, error: insertError.message });
          } else {
            syncedUsers.push({ clerkId: clerkUser.id, email, action: "created", role });
          }
        }
      } catch (err: any) {
        console.error(`Unexpected sync error for user ${clerkUser.id}:`, err);
        errors.push({ clerkId: clerkUser.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Clerk to Supabase database synchronization complete.",
      totalClerkUsers: clerkUsers.length,
      successfullySyncedCount: syncedUsers.length,
      errorsCount: errors.length,
      syncedUsers,
      errors,
    });
  } catch (error: any) {
    console.error("Batch synchronization crash error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
