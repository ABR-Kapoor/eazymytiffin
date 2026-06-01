"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, CheckCircle2, Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const menuData = [
  { day: "Monday", color: "#1B5E30", image: "/eazymytiffin-veg-meal-plan.png", lunch: { dish: "Aloo Gobhi Masala", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Bhindi Fry Special", sides: "Dal + Rice + 4 Roti" } },
  { day: "Tuesday", color: "#D35400", image: "/eazymytiffin-light-meal-subscription.png", lunch: { dish: "Kadhi Pakora", sides: "Jeera Rice + 4 Roti" }, dinner: { dish: "Patta Gobhi Dal", sides: "Rice + 4 Roti" } },
  { day: "Wednesday", color: "#1B5E30", image: "/eazymytiffin-mix-meal-plan.png", lunch: { dish: "Lauki Chana Sabji", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Chole Masala", sides: "Rice + 4 Roti" } },
  { day: "Thursday", color: "#D35400", image: "/eazymytiffin-non-veg-meal-plan.png", lunch: { dish: "Baingan Aloo Masala", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Aloo Bhujiya Curry", sides: "Rice + 4 Roti" } },
  { day: "Friday", color: "#1B5E30", image: "/eazymytiffin-veg-menu-preview.png", lunch: { dish: "Barbatti Aloo", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Tamatar Ki Sabji", sides: "Rice + 4 Roti" } },
  { day: "Saturday", color: "#D35400", image: "/eazymytiffin-mix-menu-preview.png", lunch: { dish: "Kaddu Masala", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Soyabean Curry", sides: "Rice + 4 Roti" } },
  { day: "Sunday", color: "#F5A623", image: "/eazymytiffin-weekly-special-meal.png", special: true, lunch: { dish: "Paneer + Puri + Kheer", sides: "Special Sunday Meal" }, dinner: { dish: "Veg Pulao Special", sides: "Raita + Salad" } },
];

const badges = [
  { icon: <Leaf size={16} />, text: "100% Pure Veg" },
  { icon: <Clock size={16} />, text: "Daily Rotation" },
  { icon: <ShieldCheck size={16} />, text: "Hygienic Prep" },
  { icon: <Truck size={16} />, text: "Express Delivery" },
];

export default function WeeklyMenu() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [cycles, setCycles] = useState<any[]>([]);

  useEffect(() => {
    const fetchWeeklyMenu = async () => {
      try {
        const { data, error } = await supabase
          .from("weekly_menu_cycles")
          .select(`
            weekday,
            menus (
              id,
              title,
              description,
              meal_type,
              category,
              image_url,
              is_active
            )
          `);

        if (!error && data) {
          // Filter to only include active menus in our cycles list
          const activeCycles = data.filter((c: any) => c.menus && c.menus.is_active !== false);
          setCycles(activeCycles);
        }
      } catch (e) {
        console.error("Error fetching landing page weekly menu cycles:", e);
      }
    };
    fetchWeeklyMenu();
  }, []);

  const getWeeklyMenu = () => {
    if (cycles && cycles.length > 0) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const colors = ["#1B5E30", "#D35400", "#1B5E30", "#D35400", "#1B5E30", "#D35400", "#F5A623"];
      const fallbackImages = [
        "/eazymytiffin-veg-meal-plan.png",
        "/eazymytiffin-light-meal-subscription.png",
        "/eazymytiffin-mix-meal-plan.png",
        "/eazymytiffin-non-veg-meal-plan.png",
        "/eazymytiffin-veg-menu-preview.png",
        "/eazymytiffin-mix-menu-preview.png",
        "/eazymytiffin-weekly-special-meal.png",
      ];
      
      return days.map((dayName, index) => {
        const weekdayNum = index + 1; // 1-7
        const dayCycles = cycles.filter((c) => c.weekday === weekdayNum);
        
        // Find lunch and dinner dishes from the cycle
        const lunchCycle = dayCycles.find((c) => c.menus?.meal_type === "lunch" || c.menus?.meal_type === "both");
        const dinnerCycle = dayCycles.find((c) => c.menus?.meal_type === "dinner" || c.menus?.meal_type === "both");
        
        const lunchDish = lunchCycle?.menus?.title || "Chef's Veg Special";
        const lunchSides = lunchCycle?.menus?.description || "Dal + Rice + 4 Roti";
        
        const dinnerDish = dinnerCycle?.menus?.title || "Homestyle Seasonal Curry";
        const dinnerSides = dinnerCycle?.menus?.description || "Dal + Rice + 4 Roti";
        
        const isSunday = weekdayNum === 7;
        const bannerImage = lunchCycle?.menus?.image_url || fallbackImages[index];

        return {
          day: dayName,
          color: colors[index],
          image: bannerImage,
          special: isSunday,
          lunch: { dish: lunchDish, sides: lunchSides },
          dinner: { dish: dinnerDish, sides: dinnerSides },
        };
      });
    }
    
    return menuData;
  };

  return (
    <section id="weekly-menu" className="py-24 relative overflow-hidden" style={{ background: "#F4F9F4" }}>
      <div className="mx-auto px-6 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2px] mb-4 bg-[#1B5E30]/10 text-[#1B5E30]">
              The Weekly Routine
            </span>
            <h2 className="leading-[1.1] mb-4" style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Gourmet <span style={{ color: "#1B5E30" }}>Veg Menu</span>
            </h2>
            <p className="text-[17px] font-normal opacity-60">
              Balanced, healthy, and high-protein vegetarian meals prepared fresh in our state-of-the-art kitchen.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-300">
            <Leaf className="text-[#1B5E30]" size={20} />
            <span className="text-[14px] font-semibold text-slate-900 uppercase tracking-[1px]">7 Days Variety</span>
          </div>
        </div>

        {/* Menu Grid - Premium Gourmet Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getWeeklyMenu().map((row, i) => {
            const isHovered = hoveredRow === i;
            return (
              <div
                key={row.day}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`btn-glare group relative flex flex-col rounded-[32px] border-2 bg-white overflow-hidden transition-all duration-500 cursor-default ${
                  row.special ? "lg:col-span-2 md:col-span-2" : ""
                }`}
                style={{ 
                  borderColor: isHovered ? row.color : `${row.color}40`,
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: isHovered ? "0 30px 60px -20px rgba(0,0,0,0.12)" : "none"
                }}
              >
                {/* Visual Banner */}
                <div className="relative h-[120px] overflow-hidden">
                  <img 
                    src={row.image} 
                    alt={row.day} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Day Label Overlay */}
                  <div className="absolute bottom-4 left-6">
                    <span className="text-white text-[14px] font-semibold uppercase tracking-[2px]">
                      {row.day}
                    </span>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1">
                  {/* Meals Section */}
                  <div className={`grid ${row.special ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-8`}>
                    {/* Lunch */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400">Lunch</span>
                      </div>
                      <p className="text-[18px] font-semibold text-slate-900 mb-1 leading-tight">{row.lunch.dish}</p>
                      <p className="text-[12px] font-normal opacity-50">{row.lunch.sides}</p>
                    </div>

                    {/* Dinner */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400">Dinner</span>
                      </div>
                      <p className="text-[18px] font-semibold text-slate-900 mb-1 leading-tight">{row.dinner.dish}</p>
                      <p className="text-[12px] font-normal opacity-50">{row.dinner.sides}</p>
                    </div>
                  </div>

                  {/* Special Tag for Sunday */}
                  {row.special && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[1px] text-amber-600">
                        Chef's Selection Day
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div key={s} className="w-1 h-1 rounded-full bg-amber-400" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* High-End Badges Strip */}
        <div className="mt-16 pt-12 border-t border-slate-100 flex flex-wrap justify-center gap-12">
          {badges.map((b) => (
            <div key={b.text} className="flex items-center gap-3 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1B5E30] transition-transform duration-300 group-hover:scale-110 shadow-sm border border-slate-100">
                {b.icon}
              </div>
              <span className="text-[13px] font-semibold uppercase tracking-[1px] text-slate-900">{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
