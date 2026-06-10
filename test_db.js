const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("food_orders")
    .select(`
      id, status, assigned_delivery_boy, eta, created_at, total_amount, time_slot,
      delivery_boy:users!food_orders_assigned_delivery_boy_fkey(full_name, phone),
      user:users!food_orders_user_id_fkey(full_name, phone),
      address:addresses(area, city, google_map_link),
      delivery_assignments(proof_image)
    `)
    .limit(5);

  console.log("Food Orders Data:", JSON.stringify(data, null, 2));
  console.log("Food Orders Error:", error);
}

test();
