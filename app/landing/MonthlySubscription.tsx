"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Calendar, Leaf, Sprout, Utensils, Flame } from "lucide-react";

const plans = [
  {
    num: 1,
    name: "LIGHT MEAL PLAN",
    accent: "#E8392A",
    Icon: Leaf,
    image: "/eazymytiffin-light-meal-subscription.png",
    desc: "Perfect for weight management and light eaters.",
    oneTime: "₹1,499",
    both: "₹2,299",
    includes: ["2 Chapati", "Light Sabzi", "Fresh Salad", "Zero Oil Options"],
  },
  {
    num: 2,
    name: "VEG MEAL PLAN",
    accent: "#1B5E30",
    Icon: Sprout,
    image: "/eazymytiffin-veg-meal-plan.png",
    desc: "Our most popular balanced vegetarian subscription.",
    oneTime: "₹1,999",
    both: "₹3,199",
    includes: ["4 Chapati", "Daily Sabzi", "Protein Dal", "Steamed Rice", "Salad"],
  },
  {
    num: 3,
    name: "MIX MEAL PLAN",
    accent: "#D35400",
    Icon: Utensils,
    image: "/eazymytiffin-mix-meal-plan.png",
    desc: "The perfect variety of veg and non-veg delicacies.",
    oneTime: "₹2,499",
    both: "₹3,799",
    includes: ["Veg meals", "Special Non-Veg days", "Daily Menu Rotation"],
  },
  {
    num: 4,
    name: "PURE NON-VEG",
    accent: "#A02E23",
    Icon: Flame,
    image: "/eazymytiffin-non-veg-meal-plan.png",
    desc: "Dedicated high-protein non-vegetarian meal plan.",
    oneTime: "₹3,799",
    both: "₹4,399",
    includes: ["Regular Non-Veg", "Spicy Specials", "Premium Ingredients"],
  },
];

const benefits = [
  { 
    icon: "🎁", 
    label: "Weekly Special FREE", 
    sub: "Chef's surprise",
    detailTitle: "A Gourmet Surprise Every Week",
    description: "Every Friday, our master chefs prepare a unique, high-end special meal that isn't on the regular menu. From premium Paneer delicacies to special Biryanis, it's our gift to you.",
    points: ["Premium Ingredients", "Rotating Global Cuisines", "Exclusive to Members"],
    image: "/eazymytiffin-weekly-special-meal.png"
  },
  { 
    icon: "⚡", 
    label: "Priority Delivery", 
    sub: "First on route",
    detailTitle: "Lightning Fast Doorstep Service",
    description: "Subscription members are placed on our 'Express Route'. Your tiffin is handled with priority and delivered within a guaranteed 15-minute window every single day.",
    points: ["Guaranteed Time Slots", "Real-time Tracking", "Priority Dispatch"],
    image: "/eazymytiffin-priority-delivery.png"
  },
  { 
    icon: "📈", 
    label: "Maximum Savings", 
    sub: "Best monthly rate",
    detailTitle: "Save Big While Eating Healthy",
    description: "Monthly subscriptions are designed to be light on your pocket. Save up to 25% compared to daily ordering, making gourmet home-style food affordable.",
    points: ["Lowest Price per Meal", "No Daily Transaction Fees", "Monthly Budgeting"],
    image: "/eazymytiffin-savings-subscription.png"
  },
  { 
    icon: "📅", 
    label: "26 Days Service", 
    sub: "Fixed monthly plan",
    detailTitle: "Consistent Monthly Nutrition",
    description: "Your plan covers 26 days of fresh meals (Sundays off). This ensures you have a consistent healthy eating habit throughout the month without any daily hassle.",
    points: ["Auto-Renew Options", "Vacation Pausing", "Fixed Delivery Cycle"],
    image: "/eazymytiffin-monthly-meal-calendar.png"
  },
];

export default function MonthlySubscription() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeBenefit, setActiveBenefit] = useState(0);

  return (
    <section id="subscription-plans" className="py-24 relative overflow-hidden" style={{ background: "#F9F9EF" }}>
      <div className="mx-auto px-6 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2px] mb-4"
              style={{ background: "rgba(232,57,42,0.1)", color: "var(--emt-red)" }}
            >
              Subscription Plans
            </span>
            <h2 id="subscription-heading" className="leading-[1.1] mb-6" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Monthly <span style={{ color: "var(--emt-red)" }}>Commitment</span>
            </h2>
            <p className="text-[17px] font-normal opacity-60">
              Unlock the best value with our 30-day fixed meal subscriptions. Delivered fresh, every single day.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-300">
            <Calendar className="text-emerald-600" size={20} />
            <span className="text-[14px] font-semibold text-slate-900 uppercase tracking-[1px]">30 Days Plan</span>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, i) => {
            const isHovered = hovered === i;
            return (
              <div
                key={plan.name}
                className="group relative flex flex-col rounded-[32px] border-2 bg-white overflow-hidden transition-all duration-500 cursor-default"
                style={{ 
                  borderColor: isHovered ? plan.accent : `${plan.accent}40`,
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)"
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Visual Banner - Glare applied here only */}
                <div className="btn-glare relative h-[140px] overflow-hidden">
                  <img 
                    src={plan.image} 
                    alt={plan.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-7 pt-0 flex flex-col flex-1">
                  {/* Plan Icon & Name */}
                  <div className="mb-6 -mt-7 relative z-10">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-xl transition-transform duration-500 group-hover:scale-110 border-4 border-white"
                      style={{ background: `linear-gradient(135deg, white, #f8f8f8)` }}
                    >
                      <plan.Icon size={24} style={{ color: plan.accent }} />
                    </div>
                    <div className="mb-4 flex">
                      <span className="w-fit inline-block text-[12px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-full border" 
                        style={{ 
                          backgroundColor: `${plan.accent}15`,
                          borderColor: `${plan.accent}30`,
                          color: plan.accent
                        }}>
                        {plan.name}
                      </span>
                    </div>
                    <p className="text-[13px] font-normal opacity-50 leading-relaxed">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Pricing Rows */}
                  <div className="flex flex-col gap-3 mb-8">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-transparent transition-all">
                      <div>
                        <p className="text-[10px] font-semibold opacity-40 uppercase tracking-[1px]">Daily Once</p>
                        <p className="text-[20px] font-semibold text-slate-900">{plan.oneTime}</p>
                      </div>
                      <span className="text-[11px] font-normal opacity-40">/mo</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-transparent transition-all">
                      <div>
                        <p className="text-[10px] font-semibold opacity-40 uppercase tracking-[1px]">Lunch + Dinner</p>
                        <p className="text-[20px] font-semibold" style={{ color: plan.accent }}>{plan.both}</p>
                      </div>
                      <span className="text-[11px] font-normal opacity-40">/mo</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[1px] mb-4 opacity-30">Plan Details</p>
                    <ul className="flex flex-col gap-3 mb-8">
                      {plan.includes.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[13px] font-normal text-slate-700">
                          <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: plan.accent }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <a
                    href="tel:9770144899"
                    className="btn-glare flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[13px] font-semibold uppercase tracking-[1.5px] transition-all duration-300"
                    style={{ 
                      background: isHovered ? plan.accent : "var(--text-primary)", 
                      color: "white" 
                    }}
                  >
                    Subscribe <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Condensed Subscriber Advantage Tabs */}
        <div className="mt-16 max-w-[900px] mx-auto">
          {/* Compact Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {benefits.map((b, i) => {
              const isActive = activeBenefit === i;
              return (
                <button
                  key={b.label}
                  onClick={() => setActiveBenefit(i)}
                  className={`px-5 py-2.5 rounded-full text-[12px] font-semibold uppercase tracking-[1px] transition-all duration-300 border ${
                    isActive 
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Compact Content Card */}
          <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-48 h-48 shrink-0 overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100">
              <img 
                src={benefits[activeBenefit].image} 
                alt={benefits[activeBenefit].label} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-[20px] font-semibold text-slate-900 mb-3">
                {benefits[activeBenefit].detailTitle}
              </h4>
              <p className="text-[14px] font-normal text-slate-600 leading-relaxed mb-4">
                {benefits[activeBenefit].description}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {benefits[activeBenefit].points.map((point) => (
                  <div key={point} className="flex items-center gap-2 text-[12px] font-semibold text-slate-800">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
