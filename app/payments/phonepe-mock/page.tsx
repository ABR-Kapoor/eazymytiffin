"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Check } from "lucide-react";

function MockPaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const transactionId = params.get("transactionId");
  const amount = params.get("amount");
  const subscriptionId = params.get("subscriptionId");
  const orderId = params.get("orderId");
  const planTitle = params.get("planTitle") || "Plan";
  const type = params.get("type") || (subscriptionId ? "subscription" : "food_order");

  const handlePayment = async (success: boolean) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/payments/phonepe/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, success, subscriptionId, orderId }),
      });
      const result = await res.json();
      if (success && result.success) {
        setCountdown(3);
      } else {
        router.push("/payments/failed");
      }
    } catch {
      router.push("/payments/failed");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.push(`/payments/success?type=${type}`);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown, router, type]);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "380px", width: "100%" }}>
        {/* PhonePe header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, #5F259F, #8B3FC4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "28px" }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ color: "white", fontWeight: 800, fontSize: "22px", margin: 0 }}>PhonePe</h1>
          <p style={{ color: "#9CA3AF", fontSize: "12px", margin: "4px 0 0" }}>Development Simulator</p>
        </div>

        {/* Payment card */}
        <div style={{ background: "#1A1A1A", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "16px" }}>
            <p style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px" }}>Paying to</p>
            <p style={{ color: "white", fontWeight: 800, fontSize: "16px", margin: 0 }}>EazyGrace</p>
            <p style={{ color: "#6B7280", fontSize: "11px", margin: "2px 0 0" }}>{planTitle}</p>
          </div>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <p style={{ color: "#9CA3AF", fontSize: "12px", margin: "0 0 4px" }}>Amount to Pay</p>
            <p style={{ color: "white", fontWeight: 900, fontSize: "42px", margin: 0, letterSpacing: "-0.02em" }}>₹{amount}</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px" }}>
            <p style={{ color: "#6B7280", fontSize: "10px", margin: "0 0 2px", fontWeight: 700 }}>TXN ID</p>
            <p style={{ color: "#9CA3AF", fontSize: "11px", margin: 0, fontFamily: "monospace" }}>{transactionId}</p>
          </div>

          {countdown !== null ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "24px" }}>
                <Check size={32} color="#22C55E" />
              </div>
              <p style={{ color: "#22C55E", fontWeight: 800, fontSize: "16px", margin: "0 0 4px" }}>Payment Successful!</p>
              <p style={{ color: "#6B7280", fontSize: "13px", margin: 0 }}>Redirecting in {countdown}s…</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => handlePayment(true)}
                disabled={processing}
                style={{ padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #5F259F, #8B3FC4)", color: "white", border: "none", fontWeight: 800, fontSize: "15px", cursor: processing ? "not-allowed" : "pointer", opacity: processing ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {processing ? (
                  <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Processing…</>
                ) : (
                  "Pay ₹" + amount
                )}
              </button>
              <button
                onClick={() => handlePayment(false)}
                disabled={processing}
                style={{ padding: "12px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 700, fontSize: "13px", cursor: processing ? "not-allowed" : "pointer", opacity: processing ? 0.6 : 1 }}
              >
                Simulate Failure
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#374151", fontSize: "11px", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <Lock size={12} /> This is a development simulator. No real payments are processed.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PhonePeMockPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "white" }}>Loading…</p></div>}>
      <MockPaymentContent />
    </Suspense>
  );
}
