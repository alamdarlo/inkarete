"use client";

import { useCallback, useEffect, useState } from "react";
import { BeforeInstallPromptEvent, PwaContextType } from "./types";
import { PWA_INSTALLED_KEY } from "./constants";
import { usePwaStore } from "@/store/pwaStore";

export function usePwa(): PwaContextType {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const installSeen = usePwaStore((state) => state.installSeen);
  const hydrate = usePwaStore((state) => state.hydrate);
  const markSeen = usePwaStore((state) => state.markSeen);
  const clearSeen = usePwaStore((state) => state.clearSeen);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    const desktop = !ios && !android;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const testMode = new URLSearchParams(window.location.search).get("pwa-test") === "true";

    setIsIOS(ios);
    setIsAndroid(android);
    setIsDesktop(desktop);
    setIsInstalled(standalone);

    if (standalone && !testMode) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (localStorage.getItem(PWA_INSTALLED_KEY) === "1") {
        localStorage.removeItem(PWA_INSTALLED_KEY);
        clearSeen();
      }

      if (!testMode && usePwaStore.getState().installSeen) {
        return;
      }

      setPromptEvent(event as BeforeInstallPromptEvent);
      setCanInstall(true);
      setShowBanner(true);
    };

    const handleInstalled = () => {
      localStorage.setItem(PWA_INSTALLED_KEY, "1");
      markSeen();
      setIsInstalled(true);
      setPromptEvent(null);
      setCanInstall(false);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if (testMode) {
      // Test mode intentionally bypasses the one-time banner suppression.
      // On iOS the install guide is shown; on Chromium browsers the native
      // prompt is shown when beforeinstallprompt becomes available.
      setShowBanner(true);
      if (localStorage.getItem(PWA_INSTALLED_KEY) === "1") {
        localStorage.removeItem(PWA_INSTALLED_KEY);
      }
    } else if (ios && !installSeen) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [clearSeen, installSeen, markSeen]);

  const install = useCallback(async () => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    const result = await promptEvent.userChoice;

    setPromptEvent(null);
    setCanInstall(false);
    setShowBanner(false);

    if (result.outcome === "accepted") {
      localStorage.setItem(PWA_INSTALLED_KEY, "1");
      markSeen();
      setIsInstalled(true);
    } else {
      markSeen();
    }
  }, [markSeen, promptEvent]);

  const dismiss = useCallback(() => {
    markSeen();
    setShowBanner(false);
  }, [markSeen]);

  const permanentlyDismiss = useCallback(() => {
    markSeen();
    setShowBanner(false);
  }, [markSeen]);

  return {
    canInstall,
    isIOS,
    isAndroid,
    isDesktop,
    isInstalled,
    showBanner,
    install,
    dismiss,
    permanentlyDismiss,
  };
}
