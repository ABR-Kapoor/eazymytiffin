"use client";

import { useState } from "react";
import { Phone, MessageSquare, CheckCircle2 } from "lucide-react";

export default function CTABanner() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="bg-white pb-24">
      <section id="contact" className="mx-auto -mt-32 py-10 bg-white relative overflow-hidden rounded-[48px] border border-slate-200 shadow-2xl shadow-slate-900/10 z-20" style={{ maxWidth: "var(--max-width)", width: "calc(100% - 48px)" }}>
        {/* Cinematic Background Element */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full pointer-events-none hidden lg:block">
          <img 
            src="/eazymytiffin-veg-meal-plan.png" 
            alt="Premium Food" 
            className="w-full h-full object-contain object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 via-white/80 to-white" />
        </div>

        <div className="mx-auto px-10 md:px-16 lg:px-24 relative z-10" style={{ maxWidth: "var(--max-width)" }}>
          <div className="max-w-3xl">
            {/* Badge */}
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2px] mb-4 bg-red-50 text-[#E8392A] border border-red-100">
              Final Step to Health
            </span>

            <h2 className="leading-[1.1] mb-3" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "var(--text-primary)" }}>
              Ready to Order <br />
              <span style={{ color: "#E8392A" }}>Your Tiffin?</span>
            </h2>

            <p className="text-[18px] font-normal text-slate-500 leading-relaxed mb-6 max-w-xl">
              Join 10,000+ happy customers eating fresh daily. <br className="hidden md:block" />
              Starting from just <span className="font-bold text-slate-900 underline decoration-[#E8392A] decoration-2 underline-offset-4">₹99 per meal.</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <a
                href="tel:9770144899"
                onMouseEnter={() => setHovered("phone")}
                onMouseLeave={() => setHovered(null)}
                className="btn-glare flex items-center gap-2.5 px-5 py-2.5 bg-[#E8392A] text-white rounded-[16px] font-bold uppercase tracking-[1.5px] text-[12px] shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
              >
                <Phone size={16} className={hovered === "phone" ? "animate-bounce" : ""} />
                Call 9770144899
              </a>
              
              <a
                href="https://wa.me/919770144899"
                onMouseEnter={() => setHovered("wa")}
                onMouseLeave={() => setHovered(null)}
                className="btn-glare flex items-center gap-3 px-5 py-2.5 bg-white border-2 border-[#25D366] text-[#25D366] rounded-[16px] font-bold uppercase tracking-[1.5px] text-[12px] hover:bg-[#25D366]/5 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </div>
                WhatsApp Us
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {["No hidden charges", "Cancel anytime", "First meal trial"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 transition-colors duration-300">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-900 uppercase tracking-[1px]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
