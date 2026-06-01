"use client";

import { useState, useEffect, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Best tiffin in Pune! Tastes just like home food. The menu changes daily so it never gets boring. Highly recommend the 6-month plan!",
    author: "Riya S.",
    sub: "Veg Plan Subscriber",
    initials: "RS",
    plan: "6-Month Veg Plan",
    color: "#1B5E30",
  },
  {
    quote: "Been subscribing for 8 months. Delivery is always on time and the food is fresh and hygienic. Worth every rupee!",
    author: "Arjun M.",
    sub: "Mix Plan Subscriber",
    initials: "AM",
    plan: "Mix Meal Plan",
    color: "#D35400",
  },
  {
    quote: "The Sunday special Paneer Puri is something I look forward to every week. Amazing quality and service.",
    author: "Priya D.",
    sub: "Veg Plan Subscriber",
    initials: "PD",
    plan: "Standard Veg Plan",
    color: "#1B5E30",
  },
  {
    quote: "Switched from cooking daily to EazyMyTiffin — best decision ever! The food is fresh, portions are generous and delivery is always on time.",
    author: "Suresh K.",
    sub: "Non-Veg Plan Subscriber",
    initials: "SK",
    plan: "Non-Veg Plan",
    color: "#E8392A",
  },
  {
    quote: "My kids love the Sunday special. The Jain option is a lifesaver for our family. Highly recommend to everyone!",
    author: "Meena P.",
    sub: "Jain Meal Subscriber",
    initials: "MP",
    plan: "Jain Veg Plan",
    color: "#1B5E30",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const total = testimonials.length;
  const visible = 3; 

  const goTo = useCallback(
    (idx: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(idx);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const prev = () => goTo((current - 1 + total) % total);
  const next = () => goTo((current + 1) % total);

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % total), 5000);
    return () => clearInterval(t);
  }, [current, goTo, total]);

  const visibleItems = Array.from({ length: visible }, (_, i) =>
    testimonials[(current + i) % total]
  );

  return (
    <section id="testimonials" className="pt-24 pb-48 relative overflow-hidden bg-white">
      <div className="mx-auto px-6 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2px] mb-4 bg-amber-50 text-amber-700 border border-amber-100">
              Community Love
            </span>
            <h2 className="leading-[1.1] mb-6" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "var(--text-primary)" }}>
              What Our <span style={{ color: "#E8392A" }}>Customers Say</span>
            </h2>
            <p className="text-[17px] font-normal opacity-60">
              Trusted by 5,000+ happy subscribers across the city.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleItems.map((t, i) => (
            <div
              key={`${t.author}-${i}`}
              className="btn-glare group relative flex flex-col p-8 rounded-[32px] border-2 bg-white transition-all duration-500 cursor-default h-full"
              style={{ 
                borderColor: "#E8392A",
              }}
            >
              <div className="mb-6 flex items-center justify-between">
                <StarRating />
                <Quote size={24} className="text-slate-100 group-hover:text-slate-200 transition-colors" />
              </div>

              <div className="flex">
                <span className="w-fit inline-block text-[10px] font-bold uppercase tracking-[1px] mb-4 px-3 py-1 rounded-full border" 
                  style={{ 
                    backgroundColor: `${t.color}15`,
                    borderColor: `${t.color}30`,
                    color: t.color
                  }}>
                  {t.plan}
                </span>
              </div>

              <p className="text-[16px] font-normal text-slate-600 leading-relaxed mb-8 flex-1 italic">
                "{t.quote}"
              </p>

              <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[14px] font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)` }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">{t.author}</p>
                  <p className="text-[12px] font-normal text-slate-400">{t.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Dot Indicators */}
        <div className="mt-12 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-slate-900" : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

