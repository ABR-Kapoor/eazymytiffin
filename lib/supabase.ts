import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export type Tables = {
  users: {
    id: string;
    clerk_user_id: string;
    full_name: string;
    email: string;
    phone: string;
    profile_image: string | null;
    role: "customer" | "delivery_boy" | "admin";
    status: "active" | "blocked";
    city: string;
    is_phone_verified: boolean;
    has_used_trial: boolean;
    created_at: string;
    updated_at: string;
  };
  addresses: {
    id: string;
    user_id: string;
    type: "home" | "hostel" | "office";
    house_flat_no: string;
    landmark: string;
    hostel_company_name: string;
    floor: string;
    area: string;
    city: string;
    google_map_link: string;
    is_default: boolean;
    created_at: string;
  };
  subscription_plans: {
    id: string;
    title: string;
    description: string | null;
    meal_type: "lunch" | "dinner" | "both";
    category: "veg" | "non_veg";
    duration_days: number;
    price: number;
    is_trial: boolean;
    is_active: boolean;
    created_at: string;
  };
  subscriptions: {
    id: string;
    user_id: string;
    plan_id: string | null;
    category: "veg" | "non_veg";
    meal_type: "lunch" | "dinner" | "both";
    remaining_days: number;
    total_days: number;
    status: "active" | "paused" | "expired" | "cancelled";
    starts_at: string;
    expires_at: string | null;
    paused_until: string | null;
    assigned_delivery_boy: string | null;
    created_at: string;
    updated_at: string;
  };
  subscription_days: {
    id: string;
    subscription_id: string;
    meal_date: string;
    meal_type: "lunch" | "dinner" | "both";
    status: string;
    deducted: boolean;
    created_at: string;
  };
  menus: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    badge: string | null;
    category: "veg" | "non_veg";
    meal_type: "lunch" | "dinner" | "both";
    is_active: boolean;
    created_at: string;
  };
  weekly_menu_cycles: {
    id: string;
    menu_id: string;
    weekday: number;
    created_at: string;
  };
  food_orders: {
    id: string;
    user_id: string;
    address_id: string | null;
    assigned_delivery_boy: string | null;
    status: "pending" | "preparing" | "assigned" | "out_for_delivery" | "delivered" | "cancelled";
    payment_status: "pending" | "paid" | "failed" | "refunded";
    payment_method: "phonepe" | "cod";
    subtotal: number;
    total_amount: number;
    notes: string | null;
    eta: string | null;
    time_slot: "lunch" | "dinner" | "both" | null;
    created_at: string;
    updated_at: string;
  };
  food_order_items: {
    id: string;
    order_id: string;
    menu_id: string | null;
    quantity: number;
    price: number;
    created_at: string;
  };
  delivery_assignments: {
    id: string;
    order_id: string;
    delivery_boy_id: string;
    status: "assigned" | "on_the_way" | "arriving" | "delivered" | "failed";
    eta: string | null;
    proof_image: string | null;
    created_at: string;
    updated_at: string;
  };
  payments: {
    id: string;
    user_id: string | null;
    order_id: string | null;
    subscription_id: string | null;
    payment_method: "phonepe" | "cod" | null;
    payment_status: "pending" | "paid" | "failed" | "refunded";
    transaction_id: string | null;
    amount: number;
    created_at: string;
  };
  notifications: {
    id: string;
    user_id: string;
    title: string;
    body: string;
    type: "system" | "payment" | "delivery" | "subscription" | null;
    channel: "in_app" | "email" | "whatsapp" | null;
    is_read: boolean;
    created_at: string;
  };
  admin_logs: {
    id: string;
    admin_id: string | null;
    action: string;
    entity: string | null;
    entity_id: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
  };
};
