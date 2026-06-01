import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

type Option = {
  value: string;
  label: React.ReactNode;
};

type CustomSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  style?: React.CSSProperties;
  disabled?: boolean;
};

export function CustomSelect({ value, onChange, options, style, disabled }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      const updateCoords = () => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          setCoords({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      };
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("resize", updateCoords);
        window.removeEventListener("scroll", updateCoords, true);
      };
    }
  }, [open]);

  const selectedOption = options.find(o => o.value === value) || options[0] || { label: "" };

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      <div 
        onClick={() => { if (!disabled) setOpen(!open); }}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: "9px", 
          border: open ? "1px solid var(--emt-red)" : "1px solid rgba(212,184,150,0.3)", 
          fontSize: "13px", outline: "none", background: disabled ? "#f9fafb" : "white", 
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxSizing: "border-box", opacity: disabled ? 0.6 : 1
        }}
      >
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {selectedOption?.label}
        </span>
        <ChevronDown size={14} style={{ color: "#9CA3AF", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
      </div>
      
      {open && typeof document !== "undefined" && createPortal(
        <div 
           onMouseDown={(e) => e.stopPropagation()}
           style={{
            position: "absolute", top: coords.top + 4, left: coords.left, width: coords.width,
            background: "white", borderRadius: "9px", border: "1px solid rgba(212,184,150,0.3)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999, overflow: "hidden",
            maxHeight: "240px", overflowY: "auto"
          }}>
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={(e) => { 
                e.stopPropagation(); 
                onChange(opt.value); 
                setOpen(false); 
              }}
              style={{
                padding: "9px 12px", fontSize: "13px", cursor: "pointer",
                background: value === opt.value ? "rgba(232,57,42,0.05)" : "transparent",
                color: value === opt.value ? "var(--emt-red)" : "#1A1A1A",
                fontWeight: value === opt.value ? 700 : 500,
                transition: "background 0.1s"
              }}
              onMouseEnter={(e) => {
                 if (value !== opt.value) e.currentTarget.style.background = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                 if (value !== opt.value) e.currentTarget.style.background = "transparent";
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
