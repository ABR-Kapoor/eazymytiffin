"use client";

export function postAuthSync(user: { id: string; email: string; full_name: string } | null) {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({
    type: user ? "AUTH_SYNC" : "CLEAR_AUTH",
    payload: user,
  });
}
