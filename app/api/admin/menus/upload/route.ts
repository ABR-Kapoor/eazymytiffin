import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) throw new Error("Admin client not initialized");
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");
    const arrayBuffer = await file.arrayBuffer();

    const ext = file.name.split(".").pop();
    const filename = `menu-${Date.now()}.${ext}`;

    const { error } = await supabaseAdmin.storage.from("menu-images").upload(filename, arrayBuffer, { 
      contentType: file.type,
      upsert: true 
    });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage.from("menu-images").getPublicUrl(filename);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
