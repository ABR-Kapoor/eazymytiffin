"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
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
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9F3]">
        <div className="w-8 h-8 border-4 border-[#E8392A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/home");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthGoogle = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/home",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      <div className="w-full md:w-[35%] flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <div className="max-w-[380px] mx-auto">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl text-[#1A1A1A] tracking-tight font-bold">Welcome Back to<br />EazyMy<span className="text-[#E8392A]">Tiffin</span></h1>
            <p className="text-gray-600 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-700 text-[#4A3A2A] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2 bg-white border border-[rgba(212,184,150,0.4)] rounded-[12px] text-[#1A1A1A] text-sm outline-none focus:outline-2 focus:outline-[#E8392A] focus:outline-offset-2"
              />
            </div>

            <div>
              <label className="block text-xs font-700 text-[#4A3A2A] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 bg-white border border-[rgba(212,184,150,0.4)] rounded-[12px] text-[#1A1A1A] text-sm outline-none focus:outline-2 focus:outline-[#E8392A] focus:outline-offset-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-3.5 py-2 bg-[#E8392A] text-white font-700 uppercase rounded-[12px] shadow-[0_16px_32px_rgba(232,57,42,0.18)] hover:bg-[#C72E1F] disabled:opacity-60 transition-colors cursor-pointer text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(212,184,150,0.35)]" />
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-[rgba(212,184,150,0.35)]" />
          </div>

          <button
            onClick={handleOAuthGoogle}
            className="w-full px-3.5 py-2 border border-[rgba(212,184,150,0.4)] bg-white text-[#1A1A1A] text-sm rounded-[999px] font-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#E8392A] hover:text-[#C72E1F] font-600">
              Sign Up
            </Link>
          </p>

          <p className="mt-8 text-center text-[11px] text-slate-500 leading-relaxed max-w-[320px] mx-auto">
            By continuing, you agree to EazyMyTiffin's{" "}
            <Link href="/terms" className="underline hover:text-slate-800 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-800 transition-colors">
              Privacy Policy
            </Link>
            , and to receive periodic emails with updates.
          </p>
        </div>
      </div>

      <AuthMap testimonials={TESTIMONIALS} />
    </div>
  );
}
