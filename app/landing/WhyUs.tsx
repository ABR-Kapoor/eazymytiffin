"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, Clock, Utensils, Home, Settings2, Users, Star, PieChart, Activity } from "lucide-react";

const reasons = [
  { 
    icon: <Utensils size={20} />, 
    title: "Quality Food", 
    body: "Fresh, high-quality ingredients sourced and cooked daily in our premium kitchens.",
    image: "/eazymytiffin-veg-meal-plan.png",
    accent: "#1B5E30"
  },
  { 
    icon: <Clock size={20} />, 
    title: "Fast Delivery", 
    body: "Priority logistics ensure your tiffin arrives hot and fresh, exactly when you need it.",
    image: "/eazymytiffin-priority-delivery.png",
    accent: "#E8392A"
  },
  { 
    icon: <PieChart size={20} />, 
    title: "Daily Rotation", 
    body: "Enjoy 26 unique days of meals every month. Our menu rotates so you never get bored.",
    image: "/eazymytiffin-monthly-meal-calendar.png",
    accent: "#D35400"
  },
  { 
    icon: <Home size={20} />, 
    title: "Home-Style Taste", 
    body: "Authentic family recipes that taste just like your mother's cooking — simple and soul-filling.",
    image: "/eazymytiffin-veg-menu-preview.png",
    accent: "#1B5E30"
  },
  { 
    icon: <ShieldCheck size={20} />, 
    title: "Hygienic Kitchen", 
    body: "FSSAI compliant, high-end sanitization, and professional food preparation standards.",
    image: "/eazymytiffin-weekly-special-meal.png",
    accent: "#E8392A"
  },
  { 
    icon: <Settings2 size={20} />, 
    title: "Customizable", 
    body: "Options for no onion/garlic, Jain meals, or specific dietary preferences available on request.",
    image: "/eazymytiffin-savings-subscription.png",
    accent: "#D35400"
  },
];

const stats = [
  { icon: <Users size={20} />, value: "10K+", label: "Happy Families" },
  { icon: <Clock size={20} />, value: "26 Days", label: "Monthly Service" },
  { icon: <Star size={20} />, value: "4.8★", label: "Avg Rating" },
  { icon: <Activity size={20} />, value: "99%", label: "On-Time Rate" },
];

export default function WhyUs() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="why-us" className="py-24 relative overflow-hidden" style={{ background: "#F0F4F8" }}>
      <div className="mx-auto px-6 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2px] mb-4 bg-emerald-50 text-[#1B5E30] border border-emerald-100">
              Our Commitment
            </span>
            <h2 className="leading-[1.1] mb-6" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Why Choose <span style={{ color: "#1B5E30" }}>EazyMyTiffin?</span>
            </h2>
            <p className="text-[17px] font-normal opacity-60">
              We don't just deliver food; we deliver health, tradition, and peace of mind to your doorstep.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-[14px] font-bold text-slate-900 leading-none">10,000+</p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[1px] mt-1">Active Users</p>
            </div>
          </div>
        </div>

        {/* Stats Strip - Minimalist & Premium */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="group flex flex-col items-center justify-center p-8 rounded-[32px] border border-slate-200 bg-[#F8FAFC] transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1B5E30] mb-4 shadow-sm border border-slate-100 transition-transform group-hover:scale-110">
                {s.icon}
              </div>
              <p className="text-[28px] font-semibold text-slate-900 mb-1 leading-none">{s.value}</p>
              <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-[1px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reasons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => {
            const isHovered = hovered === i;
            return (
              <div
                key={r.title}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="btn-glare group relative flex flex-col rounded-[32px] border-2 bg-white overflow-hidden transition-all duration-500 cursor-default"
                style={{ 
                  borderColor: isHovered ? r.accent : `${r.accent}20`,
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: isHovered ? "0 30px 60px -20px rgba(0,0,0,0.12)" : "none"
                }}
              >
                {/* Visual Banner */}
                <div className="relative h-[160px] overflow-hidden">
                  <img 
                    src={r.image} 
                    alt={r.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Icon Overlay */}
                  <div className="absolute top-6 left-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xl transition-transform group-hover:scale-110">
                      {r.icon}
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-[20px] font-semibold text-slate-900 mb-3 group-hover:text-emerald-800 transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-[15px] font-normal text-slate-500 leading-relaxed">
                    {r.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
