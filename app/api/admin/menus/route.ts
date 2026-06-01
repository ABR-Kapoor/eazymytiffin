import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error("Admin client not initialized");
    const body = await req.json();
    const { error } = await supabaseAdmin.from("menus").insert([body]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error("Admin client not initialized");
    const body = await req.json();
    const { id, ...updates } = body;
    const { error } = await supabaseAdmin.from("menus").update(updates).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error("Admin client not initialized");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("Missing ID");
    const { error } = await supabaseAdmin.from("menus").delete().eq("id", id);
    if (error) {
      if (error.message.includes("violates foreign key constraint")) {
        throw new Error("This food item is linked to past orders and cannot be deleted. Please deactivate it instead.");
      }
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
