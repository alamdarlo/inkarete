"use client";

import { useCallback, useEffect, useState } from "react";
import { BeforeInstallPromptEvent, PwaContextType } from "./types";
import { PWA_INSTALL_SEEN_KEY } from "./constants";

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

    if (standalone || localStorage.getItem(PWA_INSTALL_SEEN_KEY) === "1") {
      return;
    }

    const markInstallSeen = () => {
      localStorage.setItem(PWA_INSTALL_SEEN_KEY, "1");
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setCanInstall(true);
      setShowBanner(true);
    };

    const handleInstalled = () => {
      markInstallSeen();
      setIsInstalled(true);
      setPromptEvent(null);
      setCanInstall(false);
      setShowBanner(false);
    };

    if (ios) {
      markInstallSeen();
      setShowBanner(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

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
