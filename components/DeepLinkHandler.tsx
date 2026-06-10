"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone } from "lucide-react";

type DeepLinkResult = "idle" | "installing" | "installed" | "unsupported";

export function DeepLinkHandler() {
  const attempted = useRef(false);
  const [pwaStatus, setPwaStatus] = useState<DeepLinkResult>("idle");
  const [showBanner, setShowBanner] = useState(false);
  const bannerDismissed = useRef(false);
  const isInstalledRef = useRef(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setPwaStatus("installed");
      return;
    }

    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isMobile = isAndroid || isIOS;
    if (!isMobile) return;

    // Check if PWA is likely installed by detecting beforeinstallprompt
    let promptReceived = false;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      promptReceived = true;
      setPwaStatus("installing");
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    const checkTimer = setTimeout(() => {
      if (promptReceived) {
        return;
      }

      // No beforeinstallprompt fired — PWA might already be installed
      if (isAndroid && /chrome/i.test(navigator.userAgent)) {
        const fallbackUrl = window.location.href;
        const intentUrl = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;

        let pageVisible = true;
        const onVisibility = () => {
          if (document.hidden) pageVisible = false;
        };
        document.addEventListener("visibilitychange", onVisibility);

        window.location.href = intentUrl;

        setTimeout(() => {
          document.removeEventListener("visibilitychange", onVisibility);
          if (pageVisible) {
            setShowBanner(true);
          }
        }, 2000);
      } else if (isIOS) {
        setShowBanner(true);
      }
    }, 500);

    return () => {
      clearTimeout(checkTimer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  useEffect(() => {
    const handleManualShow = () => {
      if (pwaStatus === "installed" || isInstalledRef.current) return;
      bannerDismissed.current = false;
      setShowBanner(true);
    };

    window.addEventListener("show-pwa-banner", handleManualShow);
    return () => {
      window.removeEventListener("show-pwa-banner", handleManualShow);
    };
  }, []);

  const isInstalled = pwaStatus === "installed";

  if (!showBanner || bannerDismissed.current || isInstalled) return null;

  return (
    <div className="fixed bottom-[104px] left-4 right-4 z-[300] animate-slide-up pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#FC8019]/10 flex items-center justify-center shrink-0">
          <Smartphone size={22} className="text-[#FC8019]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-[#1C1C1C] m-0">
            Install EazyMyTiffin
          </p>
        </div>
        <div className="flex gap-2 shrink-0 relative z-10">
          <button
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              bannerDismissed.current = true; 
              setShowBanner(false); 
            }}
            className="text-[12px] font-bold text-[#686B78] bg-gray-100 rounded-full px-3.5 py-2 border-none cursor-pointer hover:bg-gray-200 transition-colors pointer-events-auto"
          >
            Later
          </button>
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                if (deferredPromptRef.current) {
                  const prompt = deferredPromptRef.current as any;
                  prompt.prompt();
                  const { outcome } = await prompt.userChoice;
                  if (outcome === "accepted") {
                    isInstalledRef.current = true;
                    setPwaStatus("installed");
                    setShowBanner(false);
                  }
                  deferredPromptRef.current = null;
                } else {
                  // Fallback: show install instructions
                  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
                    alert('Tap Share → "Add to Home Screen" to install EazyMyTiffin.');
                  } else {
                    alert('Tap your browser menu → "Add to Home Screen" to install EazyMyTiffin.');
                  }
                  setShowBanner(false);
                }
              } catch (err) {
                console.warn(err);
                setShowBanner(false);
              }
            }}
            className="text-[12px] font-bold text-white bg-[#FC8019] rounded-full px-4 py-2 border-none cursor-pointer hover:bg-[#E67300] transition-colors shadow-sm pointer-events-auto"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
