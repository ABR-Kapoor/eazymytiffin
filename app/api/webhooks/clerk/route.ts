import { Webhook } from "svix";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const headers = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt;
  try {
    evt = wh.verify(JSON.stringify(payload), headers) as any;
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!supabaseAdmin) {
      console.error("supabaseAdmin not initialized");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

      await supabaseAdmin.from("users").insert([
        {
          clerk_user_id: id,
          email: email_addresses?.[0]?.email_address || "",
          full_name: `${first_name || ""} ${last_name || ""}`.trim(),
          phone: phone_numbers?.[0]?.phone_number || "",
          role: "customer",
          status: "active",
          city: "Bilaspur",
        },
      ]);

      console.log(`User created: ${id}`);
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;

      await supabaseAdmin.from("users").delete().eq("clerk_user_id", id);

      console.log(`User deleted: ${id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
