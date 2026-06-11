import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (!user || user.role !== "delivery_boy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: assignments, error } = await supabaseAdmin
      .from("delivery_assignments")
      .select("id, order_id, status, eta, proof_image, created_at, updated_at")
      .eq("delivery_boy_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch assignments error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let data: any[] = assignments || [];

    // Always check for orphaned food_orders (assigned to this boy but missing a delivery_assignments row)
    const coveredOrderIds = new Set(data.map((a: any) => a.order_id));

    const { data: fbOrders } = await supabaseAdmin
      .from("food_orders")
      .select("id, status, created_at, updated_at")
      .eq("assigned_delivery_boy", user.id)
      .in("status", ["assigned", "out_for_delivery"])
      .order("created_at", { ascending: false });

    if (fbOrders) {
      // Only add orders that don't already have a delivery_assignment row
      const orphans = fbOrders
        .filter((o: any) => !coveredOrderIds.has(o.id))
        .map((o: any) => ({
          id: o.id,          // use order_id as synthetic assignment id for UI
          order_id: o.id,
          status: o.status === "out_for_delivery" ? "on_the_way" : "assigned",
          eta: null,
          proof_image: null,
          created_at: o.created_at,
          updated_at: o.updated_at,
        }));
      data = [...data, ...orphans];
    }

    // Fetch order details (addresses + users) and items separately
    const orderIds = data.map((a: any) => a.order_id).filter(Boolean);

    if (orderIds.length > 0) {
      const { data: orders } = await supabaseAdmin
        .from("food_orders")
        .select("id, user_id, address_id, time_slot, total_amount, notes, payment_status, payment_method")
        .in("id", orderIds);

      const orderMap: Record<string, any> = {};
      if (orders) for (const o of orders) orderMap[o.id] = o;

      const userIds = [...new Set((orders || []).map((o) => o.user_id))];
      const { data: orderUsers } = await supabaseAdmin
        .from("users")
        .select("id, full_name, phone")
        .in("id", userIds);
      const userMap: Record<string, any> = {};
      if (orderUsers) for (const u of orderUsers) userMap[u.id] = u;

      const addressIds = [...new Set((orders || []).map((o) => o.address_id).filter(Boolean))];
      const { data: addresses } = await supabaseAdmin
        .from("addresses")
        .select("id, type, house_flat_no, area, landmark, city, google_map_link")
        .in("id", addressIds);
      const addrMap: Record<string, any> = {};
      if (addresses) for (const a of addresses) addrMap[a.id] = a;

      const { data: items } = await supabaseAdmin
        .from("food_order_items")
        .select("id, order_id, menu_id, quantity, price, menu:menus(title, category, image_url)")
        .in("order_id", orderIds);

      const itemsByOrder: Record<string, any[]> = {};
      if (items) for (const item of items) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      }

      for (const a of data) {
        const order = orderMap[a.order_id];
        if (order) {
          a.order = {
            user_id: order.user_id,
            time_slot: order.time_slot,
            total_amount: order.total_amount,
            notes: order.notes,
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            address: addrMap[order.address_id] || null,
            user: userMap[order.user_id] || null,
            items: itemsByOrder[a.order_id] || [],
          };
        } else {
          a.order = null;
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Delivery assignments API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!supabaseAdmin) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (!user || user.role !== "delivery_boy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { assignmentId, updates, orderId, orderUpdates } = body;

    const { data: assignment } = await supabaseAdmin
      .from("delivery_assignments")
      .select("id")
      .eq("id", assignmentId)
      .eq("delivery_boy_id", user.id)
      .single();

    if (!assignment) {
      // Handle "orphan" assignments where assignmentId is actually the orderId
      const { data: orphanOrder } = await supabaseAdmin
        .from("food_orders")
        .select("id")
        .eq("id", assignmentId)
        .eq("assigned_delivery_boy", user.id)
        .single();

      if (!orphanOrder) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

      // Create the missing assignment row
      const { error: insertErr } = await supabaseAdmin
        .from("delivery_assignments")
        .insert({
          order_id: assignmentId,
          delivery_boy_id: user.id,
          ...updates
        });

      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
      
      if (orderId && orderUpdates) {
        await supabaseAdmin.from("food_orders").update(orderUpdates).eq("id", orderId);
      }
      return NextResponse.json({ success: true });
    }

    const { error } = await supabaseAdmin
      .from("delivery_assignments")
      .update(updates)
      .eq("id", assignmentId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (orderId && orderUpdates) {
      await supabaseAdmin.from("food_orders").update(orderUpdates).eq("id", orderId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delivery PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
