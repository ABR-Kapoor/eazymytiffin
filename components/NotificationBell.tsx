"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Bell, Check, CheckCheck, CreditCard, Truck, ClipboardList } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";

const typeColors: Record<string, string> = {
  payment: "#E8392A",
  delivery: "#1B5E30",
  subscription: "#F5A623",
  system: "#6366F1",
};

const typeIcons: Record<string, any> = {
  payment: <CreditCard size={18} style={{ color: typeColors.payment }} />,
  delivery: <Truck size={18} style={{ color: typeColors.delivery }} />,
  subscription: <ClipboardList size={18} style={{ color: typeColors.subscription }} />,
  system: <Bell size={18} style={{ color: typeColors.system }} />,
};

export const NotificationBell = forwardRef<{ toggle: () => void }, { compact?: boolean; iconColor?: string }>(({ compact, iconColor }, ref) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();

  useImperativeHandle(ref, () => ({ toggle: handleOpen }));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = async (e?: any) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setOpen((v) => !v);
  };

  const handleMarkAll = async () => {
    markAllRead();
    // Persist to DB
    await fetch("/api/notifications/mark-read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  };

  const handleMarkOne = async (id: string) => {
    markRead(id);
    await fetch("/api/notifications/mark-read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const count = unreadCount();
  const recentNotifs = notifications.slice(0, 12);

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        id="notification-bell"
        onClick={handleOpen}
        className={`relative rounded-[12px] flex items-center justify-center transition-all duration-200 cursor-pointer ${open ? "text-emt-red" : ""} ${compact ? "w-full h-full" : "w-[34px] h-[34px] shadow-sm hover:scale-105 bg-white border border-[#D4B896]/30 text-[#1A1A1A]"} ${!compact && (open ? "bg-emt-red/15 border border-emt-red/20" : "")}`}
        style={{ color: iconColor || (compact ? "inherit" : undefined) }}
        aria-label="Notifications"
      >
        <Bell size={compact ? 20 : 20} strokeWidth={1.8} />
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "var(--emt-red)",
              color: "white",
              borderRadius: "999px",
              fontSize: "9px",
              fontWeight: 800,
              minWidth: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              lineHeight: 1,
              animation: "countUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
              border: "2px solid white",
            }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="w-[280px] sm:w-[340px]"
          style={{
            position: "absolute",
            top: "calc(100% + 16px)",
            right: "-46px",
            maxHeight: "480px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 20px 64px rgba(61,31,10,0.18)",
            border: "1px solid rgba(212,184,150,0.2)",
            overflow: "hidden",
            zIndex: 9999,
            animation: "fadeUp 0.22s ease both",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid rgba(212,184,150,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontWeight: 800, fontSize: "15px", color: "#1A1A1A", margin: 0 }}>
                Notifications
              </h3>
              {count > 0 && (
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0" }}>
                  {count} unread
                </p>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--emt-red)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ overflowY: "auto", maxHeight: "380px" }}>
            {recentNotifs.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#9CA3AF",
                }}
              >
                <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}><Bell size={32} /></div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>No notifications yet</p>
              </div>
            ) : (
              recentNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkOne(n.id)}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(212,184,150,0.1)",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    background: n.is_read ? "transparent" : "rgba(232,57,42,0.03)",
                    cursor: n.is_read ? "default" : "pointer",
                    transition: "background 200ms",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${typeColors[n.type || "system"]}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "18px",
                    }}
                  >
                    {typeIcons[n.type || "system"]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: n.is_read ? 500 : 700,
                        fontSize: "13px",
                        color: "#1A1A1A",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6B7280",
                        margin: "3px 0 0",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {n.body}
                    </p>
                    <p style={{ fontSize: "10px", color: "#9CA3AF", margin: "4px 0 0" }}>
                      {new Date(n.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--emt-red)",
                        flexShrink: 0,
                        marginTop: "4px",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});
