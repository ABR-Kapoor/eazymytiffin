"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, CheckCircle2, Clock, Leaf, ShieldCheck, Truck } from "lucide-react";

const menuData = [
  { day: "Monday", color: "#1B5E30", image: "/eazymytiffin-veg-meal-plan.png", lunch: { dish: "Aloo Gobhi Masala", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Bhindi Fry Special", sides: "Dal + Rice + 4 Roti" } },
  { day: "Tuesday", color: "#D35400", image: "/eazymytiffin-light-meal-subscription.png", lunch: { dish: "Kadhi Pakora", sides: "Jeera Rice + 4 Roti" }, dinner: { dish: "Patta Gobhi Dal", sides: "Rice + 4 Roti" } },
  { day: "Wednesday", color: "#1B5E30", image: "/eazymytiffin-mix-meal-plan.png", lunch: { dish: "Lauki Chana Sabji", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Chole Masala", sides: "Rice + 4 Roti" } },
  { day: "Thursday", color: "#D35400", image: "/eazymytiffin-non-veg-meal-plan.png", lunch: { dish: "Baingan Aloo Masala", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Aloo Bhujiya Curry", sides: "Rice + 4 Roti" } },
  { day: "Friday", color: "#1B5E30", image: "/eazymytiffin-veg-menu-preview.png", lunch: { dish: "Barbatti Aloo", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Tamatar Ki Sabji", sides: "Rice + 4 Roti" } },
  { day: "Saturday", color: "#D35400", image: "/eazymytiffin-mix-menu-preview.png", lunch: { dish: "Kaddu Masala", sides: "Dal + Rice + 4 Roti" }, dinner: { dish: "Soyabean Curry", sides: "Rice + 4 Roti" } },
  { day: "Sunday ⭐", color: "#F5A623", image: "/eazymytiffin-weekly-special-meal.png", special: true, lunch: { dish: "Paneer + Puri + Kheer", sides: "Special Sunday Meal" }, dinner: { dish: "Veg Pulao Special", sides: "Raita + Salad" } },
];

const badges = [
  { icon: <Leaf size={16} />, text: "100% Pure Veg" },
  { icon: <Clock size={16} />, text: "Daily Rotation" },
  { icon: <ShieldCheck size={16} />, text: "Hygienic Prep" },
  { icon: <Truck size={16} />, text: "Express Delivery" },
];

export default function WeeklyMenu() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Autoplay Timer - resets on manual select/swipe for perfect UX
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDay((prev) => (prev + 1) % menuData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeDay]);

  // Synchronize carousel scroll position whenever activeDay changes
  useEffect(() => {
    const container = document.getElementById("mobile-days-carousel");
    if (container) {
      container.scrollTo({
        left: activeDay * container.clientWidth,
        behavior: "smooth"
      });
    }
  }, [activeDay]);


  return (
    <section id="weekly-menu" className="py-12 sm:py-24 relative overflow-hidden" style={{ background: "#F4F9F4" }}>
      <div className="mx-auto px-6 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[1.5px] sm:tracking-[2px] mb-4 bg-[#1B5E30]/10 text-[#1B5E30]">
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

        {/* Custom App-Themed mobile Dropdown Selector */}
        <div className="md:hidden mb-8 w-full relative z-30">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white border border-[#1B5E30]/20 rounded-2xl px-4 py-2.5 text-[14px] font-extrabold uppercase tracking-[1px] text-slate-850 shadow-sm focus:outline-none transition-all duration-300"
            style={{
              boxShadow: "0 4px 12px rgba(27, 94, 48, 0.05)"
            }}
          >
            <span>{menuData[activeDay].day}</span>
            <div className={`transition-transform duration-300 text-[#1B5E30] ${isDropdownOpen ? "rotate-180" : ""}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isDropdownOpen && (
            <>
              {/* Tap-away overlay to dismiss list */}
              <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsDropdownOpen(false)} />
              
              {/* Floating Menu List */}
              <div 
                className="absolute left-0 right-0 mt-2 bg-white border border-[#1B5E30]/20 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
                style={{
                  boxShadow: "0 12px 30px -10px rgba(27, 94, 48, 0.15)"
                }}
              >
                {menuData.map((row, i) => {
                  const isSelected = activeDay === i;
                  return (
                    <button
                      key={row.day}
                      onClick={() => {
                        setActiveDay(i);
                        setIsDropdownOpen(false);
                        const container = document.getElementById("mobile-days-carousel");
                        if (container) {
                          container.scrollTo({
                            left: i * container.clientWidth,
                            behavior: "smooth"
                          });
                        }
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.5px] transition-all duration-200 flex items-center justify-between border-b border-slate-50 last:border-0 ${
                        isSelected 
                          ? "bg-[#1B5E30] text-white" 
                          : "text-slate-800 hover:bg-[#FAF6F0]"
                      }`}
                    >
                      <span>{row.day}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>



        {/* Menu Grid (Desktop & Tablet) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {menuData.map((row, i) => {
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

        {/* Menu Cards Carousel (Mobile Only) */}
        <div className="w-full md:hidden relative mb-12">
          <div 
            className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
            id="mobile-days-carousel"
            onScroll={(e) => {
              const container = e.currentTarget;
              const scrollPosition = container.scrollLeft;
              const cardWidth = container.clientWidth;
              if (cardWidth > 0) {
                const newIndex = Math.round(scrollPosition / cardWidth);
                if (newIndex >= 0 && newIndex < menuData.length && newIndex !== activeDay) {
                  const exactPosition = newIndex * cardWidth;
                  if (Math.abs(scrollPosition - exactPosition) < 10) {
                    setActiveDay(newIndex);
                  }
                }
              }
            }}
          >
            {menuData.map((row, i) => (
              <div
                key={row.day}
                className="w-full shrink-0 snap-center"
              >
                <div
                  className="group relative flex flex-col rounded-[32px] border-2 bg-white overflow-hidden transition-all duration-500 cursor-default"
                  style={{ 
                    borderColor: row.color,
                    boxShadow: "0 15px 30px -10px rgba(0,0,0,0.06)"
                  }}
                >
                  {/* Visual Banner */}
                  <div className="relative h-[160px] overflow-hidden">
                    <img 
                      src={row.image} 
                      alt={row.day} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Day Label Overlay */}
                    <div className="absolute bottom-4 left-6">
                      <span className="text-white text-[16px] font-bold uppercase tracking-[2px]">
                        {row.day}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Meals Section */}
                    <div className="grid grid-cols-1 gap-6">
                      {/* Lunch */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400">Lunch</span>
                        </div>
                        <p className="text-[18px] font-semibold text-slate-900 mb-1 leading-tight">{row.lunch.dish}</p>
                        <p className="text-[12px] font-normal opacity-50">{row.lunch.sides}</p>
                      </div>

                      {/* Dinner */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
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
              </div>
            ))}
          </div>

          {/* Dots indicator for the carousel */}
          <div className="flex justify-center gap-1.5 mt-4">
            {menuData.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const container = document.getElementById("mobile-days-carousel");
                  if (container) {
                    container.scrollTo({
                      left: i * container.clientWidth,
                      behavior: "smooth"
                    });
                    setActiveDay(i);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeDay === i ? "bg-[#1B5E30] w-4" : "bg-slate-300"
                }`}
                aria-label={`Go to day ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* High-End Badges Strip */}
        <div className="mt-8 sm:mt-16 grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 sm:gap-6 md:gap-12">
          {badges.map((b) => (
            <div key={b.text} className="flex items-center gap-3 group cursor-default justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1B5E30] transition-transform duration-300 group-hover:scale-110 shadow-sm shrink-0">
                {b.icon}
              </div>
              <span className="text-[11px] sm:text-[13px] font-semibold uppercase tracking-[1px] text-slate-900">{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
