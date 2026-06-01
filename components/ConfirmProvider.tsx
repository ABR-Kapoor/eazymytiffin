"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const ConfirmContext = createContext<{ confirm: (options: ConfirmOptions) => void } | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  const close = () => {
    if (opts?.onCancel) opts.onCancel();
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm: setOpts }}>
      {children}
      {opts && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "24px", boxSizing: "border-box"
        }}>
          <div style={{
            background: "white", borderRadius: "24px", padding: "24px",
            width: "100%", maxWidth: "400px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
            animation: "fadeUp 0.3s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(232,57,42,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle style={{ color: "#E8392A" }} size={24} />
              </div>
              <button onClick={close} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "#9CA3AF" }}>
                <X size={20} />
              </button>
            </div>
            
            <h3 style={{ fontWeight: 800, fontSize: "20px", color: "#1A1A1A", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{opts.title}</h3>
            <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: 1.5, margin: "0 0 24px" }}>{opts.message}</p>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={close} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid rgba(212,184,150,0.3)", background: "white", fontWeight: 700, cursor: "pointer", color: "#1A1A1A" }}>
                {opts.cancelText || "Cancel"}
              </button>
              <button onClick={() => { opts.onConfirm(); close(); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#E8392A", color: "white", fontWeight: 700, cursor: "pointer" }}>
                {opts.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
