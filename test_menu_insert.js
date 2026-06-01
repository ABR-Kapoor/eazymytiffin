require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from("menus").insert([{
    title: "Test Meal",
    category: "veg",
    meal_type: "lunch"
  }]);
  console.log("Insert result:", error ? error.message : "Success");
}
test();
