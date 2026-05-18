"use client";

import { useState } from "react";
import { ShieldCheck, RefreshCw, Clock, Sparkles, CheckCircle2 } from "lucide-react";

const features = [
  {
    Icon: ShieldCheck,
    title: "Fresh & Hygienic",
    body: "Sourced daily, prepared with love in our FSSAI certified kitchen. Quality you can trust.",
    accent: "#E8392A",
    bgColor: "bg-red-50",
  },
  {
    Icon: RefreshCw,
    title: "Daily Menu Rotation",
    body: "Never the same meal twice. Our chefs curate a new, exciting menu every single day.",
    accent: "#D35400",
    bgColor: "bg-orange-50",
  },
  {
    Icon: Clock,
    title: "On-Time Delivery",
    body: "Punctuality is our priority. Your tiffin arrives hot and fresh, exactly when you need it.",
    accent: "#1B5E30",
    bgColor: "bg-emerald-50",
  },
  {
    Icon: Sparkles,
    title: "Customized & Satvik",
    body: "Jain, Satvik, or specific diet needs — we tailor your meals to your lifestyle.",
    accent: "#C27803",
    bgColor: "bg-amber-50",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-12 sm:py-24 bg-[#FAF6F0] relative overflow-hidden">
      {/* Editorial Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#F4EBE0]/60 to-transparent pointer-events-none" />
      
      <div className="mx-auto px-6 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        {/* Editorial Header */}
        <div className="max-w-3xl mb-16">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[1.5px] sm:tracking-[2px] mb-4 bg-[#F4EBE0]/50 border border-[#D4B896]/40 text-[#4A3A2A] shadow-sm">
            Our Core Values
          </span>
          <h2 className="leading-[1.1] mb-6" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "var(--text-primary)" }}>
            Built on <span className="text-[#E8392A]">4 Promises</span> <br />
            of Quality & Care.
          </h2>
          <p className="text-[17px] sm:text-[18px] text-slate-500 max-w-xl leading-relaxed">
            We don't just deliver food; we deliver peace of mind. Every meal is a commitment to your health and happiness.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div 
              key={f.title}
              className="group p-8 bg-white rounded-[32px] border border-[#D4B896]/20 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
              style={{ 
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${f.accent}05`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {/* Corner Accents */}
              <div 
                className="absolute -top-12 -right-12 w-24 h-24 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-100" 
                style={{ backgroundColor: `${f.accent}12` }} 
              />
              <div 
                className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-100" 
                style={{ backgroundColor: `${f.accent}12` }} 
              />
              
              <div className={`w-14 h-14 ${f.bgColor} rounded-2xl flex items-center justify-center mb-8 relative z-10`}>
                <f.Icon size={28} style={{ color: f.accent }} strokeWidth={1.5} />
              </div>

              <div className="relative z-10">
                <h3 className="text-[20px] font-bold text-slate-900 mb-4 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[15px] text-slate-500 leading-relaxed mb-6">
                  {f.body}
                </p>
                
                <div 
                  className="flex items-center gap-2 font-bold text-[12px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: f.accent }}
                >
                  <CheckCircle2 size={16} />
                  Verified Promise
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


