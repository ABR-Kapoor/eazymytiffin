"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

type Tab = "veg" | "mix" | "nonveg";

const tabs: { id: Tab; label: string; mobileLabel: string; gradient: string }[] = [
  { id: "veg",    label: "VEG MEALS",     mobileLabel: "VEG",     gradient: "linear-gradient(135deg,#1B5E30,#2D7A3A)" },
  { id: "mix",    label: "MIX MEALS",     mobileLabel: "MIX",     gradient: "linear-gradient(135deg,#D35400,#E8650A)" },
  { id: "nonveg", label: "NON-VEG MEALS", mobileLabel: "NON-VEG", gradient: "linear-gradient(135deg,#8B1A1A,#C0392B)" },
];

const tabConfig: Record<Tab, { cardGradient: string; glow: string; sectionGradient: string }> = {
  veg:    { cardGradient: "linear-gradient(160deg,#0D3D1E 0%,#1B5E30 100%)", glow: "rgba(27,94,48,0.3)",   sectionGradient: "linear-gradient(180deg,#F0FAF2 0%,#FDF5E6 100%)" },
  mix:    { cardGradient: "linear-gradient(160deg,#2A1200 0%,#3D1F0A 100%)", glow: "rgba(211,84,0,0.3)",   sectionGradient: "linear-gradient(180deg,#FFF3E8 0%,#FDF5E6 100%)" },
  nonveg: { cardGradient: "linear-gradient(160deg,#3D0000 0%,#8B1A1A 100%)", glow: "rgba(192,57,43,0.3)",  sectionGradient: "linear-gradient(180deg,#FFF0EE 0%,#FDF5E6 100%)" },
};

const planData: Record<Tab, {
  name: string;
  individual: { label: string; price: string; popular?: boolean }[];
}> = {
  veg: {
    name: "VEG MEALS",
    individual: [
      { label: "1 Meal Trial", price: "₹99",   popular: false },
      { label: "1 Meal",       price: "₹119",  popular: false },
      { label: "1 Day Meal",   price: "₹199",  popular: false },
      { label: "1 Month",      price: "₹3,199", popular: true },
    ],
  },
  mix: {
    name: "MIX MEALS",
    individual: [
      { label: "1 Meal Trial", price: "₹109",  popular: false },
      { label: "1 Meal",       price: "₹139",  popular: false },
      { label: "1 Day Meal",   price: "₹299",  popular: false },
      { label: "1 Month",      price: "₹3,599", popular: true },
    ],
  },
  nonveg: {
    name: "NON-VEG MEALS",
    individual: [
      { label: "1 Meal Trial", price: "₹129",  popular: false },
      { label: "1 Meal",       price: "₹159",  popular: false },
      { label: "1 Day Meal",   price: "₹259",  popular: false },
      { label: "1 Month",      price: "₹4,299", popular: true },
    ],
  },
};

export default function MealPlans() {
  const [active, setActive] = useState<Tab>("veg");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const plan = planData[active];
  const cfg = tabConfig[active];

  // Map active tab to banner image
  const bannerMap: Record<Tab, string> = {
    veg: "/eazymytiffin-veg-menu-preview.png",
    mix: "/eazymytiffin-mix-menu-preview.png",
    nonveg: "/eazymytiffin-non-veg-menu-preview.png",
  };

  return (
    <section
      id="meal-plans"
      className="py-12 sm:py-24 relative overflow-hidden"
      style={{ background: "#FAF9F6" }}
      aria-labelledby="meal-plans-heading"
    >
      <div className="mx-auto px-6 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span
              className="inline-block px-4 py-1 rounded-full text-[12px] font-bold uppercase tracking-[2px] mb-4"
              style={{ background: "rgba(232,57,42,0.1)", color: "var(--emt-red)" }}
            >
              PREMIUM MEAL PLANS
            </span>
            <h2
              id="meal-plans-heading"
              className="leading-[1.1] mb-6"
              style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "var(--text-primary)" }}
            >
              Choose Your <span style={{ color: "var(--emt-red)" }}>Perfect Plan</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <p className="text-[15px] font-semibold text-left md:text-right" style={{ color: "var(--text-secondary)" }}>
              Only 26 days a month · Sundays Closed
            </p>
            <p className="text-[14px] font-medium opacity-60 text-left md:text-right">Fresh daily delivery to your doorstep</p>
          </div>
        </div>

        {/* Tab Switcher — Premium Warm Segmented Controls */}
        <div
          className="flex gap-1 sm:gap-2 mb-14 p-1.5 rounded-full w-full sm:w-fit border"
          style={{ 
            background: "rgba(244, 235, 224, 0.5)", 
            borderColor: "rgba(212, 184, 150, 0.4)" 
          }}
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            const themeColors: Record<Tab, { text: string; border: string }> = {
              veg:    { text: "#1B5E30", border: "#1B5E30" },
              mix:    { text: "#D35400", border: "#D35400" },
              nonveg: { text: "#E8392A", border: "#E8392A" },
            };

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className="flex-1 sm:flex-initial flex items-center justify-center px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[12px] sm:text-[13px] font-extrabold uppercase tracking-[0.5px] sm:tracking-[1.5px] transition-all duration-300 whitespace-nowrap"
                style={
                  isActive
                    ? {
                        background: "#FFFFFF",
                        color: themeColors[tab.id].text,
                        boxShadow: "0 6px 16px rgba(61, 31, 10, 0.08)",
                        border: `2px solid ${themeColors[tab.id].border}`,
                        transform: "translateY(-1px)",
                      }
                    : {
                        background: "transparent",
                        color: "#4A3A2A",
                        opacity: 0.75,
                        border: "2px solid transparent",
                      }
                }
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel - Balanced 2-Column Structured Dashboard */}
        <div className="tab-active grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Column 1: Vertical Plan Banner - Glare applied here */}
          <div className="relative rounded-[32px] overflow-hidden group min-h-[500px] btn-glare">
            <img
              src={bannerMap[active]}
              alt={plan.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            <div className="absolute bottom-10 left-8 right-8">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[2px] mb-4 bg-white/20 text-white backdrop-blur-md border border-white/30">
                Premium Choice
              </span>
              <h3 className="text-white text-5xl font-black tracking-tighter mb-4">
                {active === "nonveg" ? "NON-VEG" : active.toUpperCase()} <br />
                <span style={{ color: "var(--emt-red)" }}>MEALS</span>
              </h3>
              <p className="text-white/70 text-[15px] font-medium leading-relaxed">
                Authentic flavors, zero preservatives, and fresh delivery every single day to your doorstep.
              </p>
            </div>
          </div>

          {/* Column 2: Individual Plans Table */}
          <div className="flex flex-col">
            <div 
              className="flex-1 rounded-[32px] border-2 p-8 flex flex-col shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]"
              style={{ 
                background: "linear-gradient(180deg, #ffffff 0%, #F9F7F4 100%)",
                borderColor: "rgba(212, 184, 150, 0.4)" 
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[13px] font-bold uppercase tracking-[2px] opacity-40">
                  Individual
                </h4>
              </div>
              
              <div className="flex flex-col gap-2 flex-1">
                {plan.individual.map((item, i) => {
                  const isHovered = hoveredRow === i;
                  return (
                    <div
                      key={item.label}
                      className="group flex items-center justify-between p-4 rounded-2xl transition-all duration-300"
                      style={{ 
                        background: isHovered ? "rgba(232,57,42,0.04)" : "transparent",
                        border: isHovered ? "1px solid rgba(232,57,42,0.1)" : "1px solid transparent"
                      }}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-black">
                          {item.label}
                        </span>
                        {item.popular && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[1px] bg-[var(--emt-red)] text-white">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[18px] font-semibold text-black">{item.price}</span>
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{ 
                            background: isHovered ? "var(--emt-red)" : "rgba(0,0,0,0.05)",
                            color: isHovered ? "#fff" : "#000"
                          }}
                        >
                          <ArrowUpRight size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <a
                href="tel:9770144899"
                className="btn-glare mt-8 flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[14px] font-bold uppercase tracking-[1px] transition-all duration-300 text-white"
                style={{ background: "var(--emt-red)" }}
              >
                Order Daily <ArrowUpRight size={18} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
