"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Leaf } from "lucide-react";
import Link from "next/link";
const AuthMap = dynamic(() => import("@/components/AuthMap"), { ssr: false });

const TESTIMONIALS = [
  {
    quote: "Fresh, delicious, and incredibly punctual. EazyMyTiffin keeps me going through long workdays with healthy homely meals.",
    name: "Priya S.",
    initials: "PS",
    gradient: "from-[#1B5E30] to-[#0D3D1E]",
    subtitle: "Software Engineer",
  },
  {
    quote: "The flexible meal plans are a lifesaver. Switching between veg and non-veg is seamless and tastes just like home.",
    name: "Rahul K.",
    initials: "RK",
    gradient: "from-[#D35400] to-[#8B1A1A]",
    subtitle: "Product Manager",
  },
  {
    quote: "Finally a tiffin service that actually listens. The portions are perfect, menu rotates daily, and the app experience is incredibly smooth.",
    name: "Vikram J.",
    initials: "VJ",
    gradient: "from-[#E8392A] to-[#A02E23]",
    subtitle: "UI/UX Designer",
  },
  {
    quote: "Healthy, homestyle food delivered every single day without fail. The 26-day subscription model fits perfectly into my routine.",
    name: "Anjali D.",
    initials: "AD",
    gradient: "from-[#10B981] to-[#059669]",
    subtitle: "Data Scientist",
  },
  {
    quote: "Premium quality at an affordable price. The daily menu variety is incredible — I look forward to every meal.",
    name: "Karan V.",
    initials: "KV",
    gradient: "from-[#F59E0B] to-[#D97706]",
    subtitle: "Cloud Architect",
  },
  {
    quote: "The delivery is always on time and the food tastes freshly made. This is the best tiffin service I've used.",
    name: "Meera T.",
    initials: "MT",
    gradient: "from-[#3B82F6] to-[#1D4ED8]",
    subtitle: "Frontend Developer",
  },
  {
    quote: "Super convenient subscription management. Pausing, resuming, and changing plans through the app is effortless.",
    name: "Siddharth B.",
    initials: "SB",
    gradient: "from-[#8B5CF6] to-[#6D28D9]",
    subtitle: "Backend Engineer",
  },
  {
    quote: "Zero preservatives, zero compromise. Real homestyle cooking with professional delivery standards — best of both worlds.",
    name: "Ananya P.",
    initials: "AP",
    gradient: "from-[#EC4899] to-[#BE185D]",
    subtitle: "Marketing Lead",
  },
];

export function AuthLayout({
  heading,
  subtitle,
  children,
}: {
  heading: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-x-hidden overflow-y-auto bg-white">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 wave-bg-1 opacity-60" />
        <div className="absolute inset-0 wave-bg-2 opacity-40" />
        <div className="absolute inset-0 wave-bg-3 opacity-50" />
        <div className="absolute top-[10%] -left-[8%] w-[300px] h-[300px] rounded-full bg-[#E8392A]/5 blur-[100px]" style={{ animation: "orbPulse1 12s ease-in-out infinite" }} />
        <div className="absolute bottom-[20%] -right-[5%] w-[250px] h-[250px] rounded-full bg-[#F5A623]/5 blur-[80px]" style={{ animation: "orbPulse2 15s ease-in-out infinite" }} />
        <div className="absolute top-[50%] left-[40%] w-[200px] h-[200px] rounded-full bg-[#1B5E30]/5 blur-[60px]" style={{ animation: "orbPulse3 10s ease-in-out infinite" }} />
      </div>

      {/* Left Panel - Form */}
      <div 
        className="relative flex-1 w-full lg:flex-none lg:w-[34%] backdrop-blur-xl p-6 md:p-8 flex flex-col items-center justify-center min-h-screen"
        style={{ background: "url('/food-pattern.png') repeat, rgba(255,255,255,0.92)" }}
      >
        <div className="w-full max-w-[400px] animate-fade-up mx-auto my-auto py-8">
          {/* Heading */}
          <div className="mb-6 text-center lg:text-left flex flex-col items-center lg:items-start justify-center lg:justify-start lg:pl-[16px]">
            <h1 className="text-[28px] md:text-[34px] tracking-tight font-black leading-[1.2] text-[#1A1A1A] text-center lg:text-left">
              {heading} <br />
              EazyMy<span className="text-[#E8392A]">Tiffin</span>
            </h1>
            <p className="text-[16px] md:text-[18px] font-medium mt-2 text-[#666666] text-center lg:text-left">
              {subtitle}
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full flex justify-center lg:justify-start">
            <div className="w-full">
              {children}
            </div>
          </div>

          {/* Trust Footer */}
          <div className="mt-6 text-center">
            <p className="text-[12px] font-medium" style={{ color: "rgba(74, 58, 42, 0.6)" }}>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="hover:underline" style={{ color: "var(--emt-red)" }}>Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="hover:underline" style={{ color: "var(--emt-red)" }}>Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Map with Testimonials */}
      <div className="hidden lg:flex lg:flex-1 relative z-10">
        <AuthMap testimonials={TESTIMONIALS} />
      </div>
    </div>
  );
}
