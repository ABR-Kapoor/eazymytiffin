"use client";

import { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error";

export interface ToastState {
  msg: string;
  type: ToastType;
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type });
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, [duration]);

  return { toast, showToast };
}
