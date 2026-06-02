"use client";

import { SignIn } from "@clerk/nextjs";
import AuthMap from "@/components/AuthMap";

const TESTIMONIALS = [
  {
    quote: "It's fun, feels lightweight, and really quick to spin up user auth and a few tables. Almost too easy! Highly recommend.",
    name: "Rohan M.",
    initials: "RM",
    gradient: "from-[#374151] to-[#111827]",
    subtitle: "Developer",
  },
  {
    quote: "Fresh, delicious, and incredibly punctual. EazyMyTiffin keeps me going through those long coding sessions.",
    name: "Priya S.",
    initials: "PS",
    gradient: "from-[#F59E0B] to-[#D97706]",
    subtitle: "Software Engineer",
  },
  {
    quote: "The flexible meal plans are a lifesaver. Switching between veg and non-veg is seamless and tastes like home.",
    name: "Rahul K.",
    initials: "RK",
    gradient: "from-[#10B981] to-[#059669]",
    subtitle: "Product Manager",
  },
  {
    quote: "Finally a tiffin service that actually listens to feedback. The portions are perfect and the UI is so slick!",
    name: "Vikram J.",
    initials: "VJ",
    gradient: "from-[#3B82F6] to-[#2563EB]",
    subtitle: "UI/UX Designer",
  },
  {
    quote: "Healthy, homestyle food every single day. The delivery is seamless and always arrives exactly when I need it.",
    name: "Anjali D.",
    initials: "AD",
    gradient: "from-[#EC4899] to-[#BE185D]",
    subtitle: "Data Scientist",
  },
  {
    quote: "Finally a service that feels premium but is affordable. Highly recommend for any busy professional.",
    name: "Karan V.",
    initials: "KV",
    gradient: "from-[#8B5CF6] to-[#6D28D9]",
    subtitle: "Cloud Architect",
  },
  {
    quote: "The daily menu variety is incredible. I look forward to my lunch break every single day now!",
    name: "Meera T.",
    initials: "MT",
    gradient: "from-[#14B8A6] to-[#0F766E]",
    subtitle: "Frontend Dev",
  },
  {
    quote: "Super convenient and zero hassle. Pausing and resuming my subscription through the app is incredibly easy.",
    name: "Siddharth B.",
    initials: "SB",
    gradient: "from-[#F97316] to-[#C2410C]",
    subtitle: "Backend Engineer",
  },
];

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 w-full lg:flex-none lg:w-[35%] bg-white p-5 md:p-6 flex items-start pt-16 md:items-center md:pt-0 justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:mb-8 text-center lg:text-left">
            <h1 className="text-[26px] md:text-3xl text-[#1A1A1A] tracking-tight font-bold leading-tight">Welcome Back to<br />EazyMy<span className="text-[#E8392A]">Tiffin</span></h1>
            <p className="text-gray-600 text-sm mt-2">Sign in or create your account</p>
          </div>
          <div className="w-full bg-white md:rounded-[32px] md:shadow-[0_20px_80px_-32px_rgba(0,0,0,0.2)] md:border border-[rgba(212,184,150,0.1)] md:p-5">
            <SignIn 
              path="/sign-in" 
              routing="path" 
              signUpUrl="/sign-up" 
              appearance={{
                theme: 'simple',
                variables: {
                  colorBackground: 'white',
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-1 relative">
        <AuthMap testimonials={TESTIMONIALS} />
      </div>
    </div>
  );
}
