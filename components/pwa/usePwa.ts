"use client";

import { useCallback, useEffect, useState } from "react";
import { BeforeInstallPromptEvent, PwaContextType } from "./types";
import { PWA_INSTALL_SEEN_KEY, PWA_INSTALLED_KEY } from "./constants";

export function usePwa(): PwaContextType {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    const desktop = !ios && !android;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true);

    setIsIOS(ios);
    setIsAndroid(android);
    setIsDesktop(desktop);
    setIsInstalled(standalone);

    const wasInstalled = localStorage.getItem(PWA_INSTALLED_KEY) === "1";
    if (standalone) {
      localStorage.setItem(PWA_INSTALLED_KEY, "1");
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      // If the app was installed before, receiving this event means the
      // browser considers it installable again (for example after uninstall).
      if (wasInstalled) {
        localStorage.removeItem(PWA_INSTALLED_KEY);
        localStorage.removeItem(PWA_INSTALL_SEEN_KEY);
      }

      if (localStorage.getItem(PWA_INSTALL_SEEN_KEY) === "1") {
        return;
      }

      setPromptEvent(event as BeforeInstallPromptEvent);
      setCanInstall(true);
      setShowBanner(true);
    };

    const handleInstalled = () => {
      localStorage.setItem(PWA_INSTALLED_KEY, "1");
      localStorage.setItem(PWA_INSTALL_SEEN_KEY, "1");
      setIsInstalled(true);
      setPromptEvent(null);
      setCanInstall(false);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if (ios && localStorage.getItem(PWA_INSTALL_SEEN_KEY) !== "1") {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    const result = await promptEvent.userChoice;

    setPromptEvent(null);
    setCanInstall(false);
    setShowBanner(false);

    if (result.outcome === "accepted") {
      localStorage.setItem(PWA_INSTALLED_KEY, "1");
      localStorage.setItem(PWA_INSTALL_SEEN_KEY, "1");
      setIsInstalled(true);
    }
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  const permanentlyDismiss = useCallback(() => {
    localStorage.setItem(PWA_INSTALL_SEEN_KEY, "1");
    setShowBanner(false);
  }, []);

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
