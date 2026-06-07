"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface PWAInstallContextType {
  triggerInstall: () => Promise<void>;
  isInstallable: boolean;
  isInstalled: boolean;
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  triggerInstall: async () => {},
  isInstallable: false,
  isInstalled: false,
});

export function usePWAInstall() {
  return useContext(PWAInstallContext);
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const deferredPrompt = useRef<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    }

    // Check if already installed (standalone mode)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Capture beforeinstallprompt and immediately show it
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setIsInstallable(true);

      // We cannot auto-trigger the install prompt without a user gesture.
      // It must be called from a button click via triggerInstall().
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect when app is installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPrompt.current = null;
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt.current) return;
    try {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") {
        deferredPrompt.current = null;
        setIsInstallable(false);
        setIsInstalled(true);
      }
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  };

  return (
    <PWAInstallContext.Provider value={{ triggerInstall, isInstallable, isInstalled }}>
      {children}
    </PWAInstallContext.Provider>
  );
}
