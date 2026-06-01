import { ChefHat } from "lucide-react";

export default function Loading() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#FDF9F3",
      zIndex: 9999
    }}>
      <div style={{ position: "relative", marginBottom: "24px" }}>
        {/* Outer spinning ring */}
        <div style={{ 
          position: "absolute",
          inset: "-12px",
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#E8392A",
          borderRightColor: "#E8392A",
          animation: "spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite"
        }}></div>
        
        {/* Inner static background with pulsing icon */}
        <div style={{
          background: "white",
          borderRadius: "50%",
          padding: "20px",
          boxShadow: "0 8px 30px rgba(232,57,42,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse-scale 2s ease-in-out infinite"
        }}>
          <ChefHat size={40} color="#E8392A" />
        </div>
      </div>
      
      <h2 style={{
        fontWeight: 900,
        fontSize: "24px",
        color: "#1A1A1A",
        margin: "0 0 8px",
        letterSpacing: "-0.02em"
      }}>
        EazyMyTiffin
      </h2>
      
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <p style={{
          color: "#9CA3AF",
          fontWeight: 700,
          fontSize: "14px",
          margin: 0
        }}>
          Preparing your experience
        </p>
        <span style={{ display: "flex", gap: "2px" }}>
          <span className="dot" style={{ animationDelay: "0s" }}>.</span>
          <span className="dot" style={{ animationDelay: "0.2s" }}>.</span>
          <span className="dot" style={{ animationDelay: "0.4s" }}>.</span>
        </span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95); }
        }
        .dot {
          color: #E8392A;
          font-weight: 900;
          font-size: 16px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
