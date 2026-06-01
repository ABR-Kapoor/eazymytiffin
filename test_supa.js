require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, user:users!subscriptions_user_id_fkey(full_name)');
  console.log('Error:', error);
  console.log('Data count:', data ? data.length : 0);
}

test();
