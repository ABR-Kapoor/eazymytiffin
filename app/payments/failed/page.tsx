"use client";

import Link from "next/link";
import { RefreshCw, X } from "lucide-react";

export default function PaymentFailedPage() {
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
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #E8392A, #B91C1C)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            margin: "0 auto 24px",
            boxShadow: "0 16px 48px rgba(232,57,42,0.3)",
          }}
        >
          <X size={48} color="white" />
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
          Payment Failed
        </h1>
        <p style={{ color: "#6B7280", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
          Something went wrong with your payment. No amount has been deducted. Please try again.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/subscription"
            style={{
              background: "linear-gradient(135deg, #E8392A, #B91C1C)",
              color: "white",
              borderRadius: "14px",
              padding: "12px 28px",
              fontWeight: 800,
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(232,57,42,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <RefreshCw size={14} /> Try Again
          </Link>
          <Link
            href="/home"
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
            Go Home
          </Link>
        </div>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "#9CA3AF" }}>
          Need help?{" "}
          <a href="tel:9770144899" style={{ color: "var(--emt-red)", fontWeight: 700 }}>
            Call 9770144899
          </a>
        </p>
      </div>
    </div>
  );
}
