"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type") || "subscription";

  useEffect(() => {
    const timer = setTimeout(() => router.push("/home"), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--emt-cream)",
        padding: "24px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "440px",
          animation: "fadeUp 0.5s ease",
        }}
      >
        {/* Success animation */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1B5E30, #2D7A3A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            margin: "0 auto 24px",
            boxShadow: "0 16px 48px rgba(27,94,48,0.3)",
            animation: "countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          
        </div>

        <h1
          style={{
            fontWeight: 900,
            fontSize: "28px",
            color: "#1A1A1A",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Payment Successful!
        </h1>
        <p style={{ color: "#6B7280", fontSize: "15px", lineHeight: 1.6, marginBottom: "8px" }}>
          {type === "subscription"
            ? "Your tiffin subscription is now active. Fresh meals will be delivered to your doorstep!"
            : "Your order has been placed successfully!"}
        </p>
        <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "32px" }}>
          Redirecting to dashboard in 5 seconds…
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/home"
            style={{
              background: "linear-gradient(135deg, #E8392A, #B91C1C)",
              color: "white",
              borderRadius: "14px",
              padding: "12px 28px",
              fontWeight: 800,
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(232,57,42,0.3)",
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/subscription"
            style={{
              background: "white",
              color: "#1A1A1A",
              borderRadius: "14px",
              padding: "12px 28px",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              border: "1px solid rgba(212,184,150,0.3)",
            }}
          >
            View Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
