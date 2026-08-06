"use client";

import { useCallback, useEffect, useState } from "react";

import {
  BeforeInstallPromptEvent,
  PwaContextType,
} from "./types";

import {
  PWA_DISMISS_KEY,
  PWA_NEVER_SHOW_KEY,
  DISMISS_DURATION,
  NEVER_SHOW_DURATION,
} from "./constants";

export function usePwa(): PwaContextType {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [canInstall, setCanInstall] =
    useState(false);

  const [isIOS, setIsIOS] =
    useState(false);

  const [isAndroid, setIsAndroid] =
    useState(false);

  const [isDesktop, setIsDesktop] =
    useState(false);

  const [isInstalled, setIsInstalled] =
    useState(false);

  const [showBanner, setShowBanner] =
    useState(false);

useEffect(() => {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const debugMode =
    params.get("pwa-test") === "true";

  const ua =
    navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(ua);

    const android =
      /android/.test(ua);

    const desktop =
      !ios && !android;

    setIsIOS(ios);
    setIsAndroid(android);
    setIsDesktop(desktop);

    const standalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      (
        "standalone" in navigator &&
        (
          navigator as Navigator & {
            standalone?: boolean;
          }
        ).standalone === true
      );

    setIsInstalled(standalone);

    if (standalone)
      return;

    if (!debugMode) {

  const now =
    Date.now();


  const dismiss =
    Number(
      localStorage.getItem(
        PWA_DISMISS_KEY
      )
    ) || 0;


  const never =
    Number(
      localStorage.getItem(
        PWA_NEVER_SHOW_KEY
      )
    ) || 0;



  if (
    dismiss &&
    now - dismiss <
      DISMISS_DURATION
  ) {
    return;
  }



  if (
    never &&
    now - never <
      NEVER_SHOW_DURATION
  ) {
    return;
  }

}

    if (ios) {
      setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (
      event: Event
    ) => {
      event.preventDefault();

      setPromptEvent(
        event as BeforeInstallPromptEvent
      );

      setCanInstall(true);

      setShowBanner(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);

      setPromptEvent(null);

      setCanInstall(false);

      setShowBanner(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  const install =
    useCallback(async () => {
      if (!promptEvent)
        return;

      await promptEvent.prompt();

      const result =
        await promptEvent.userChoice;

      if (
        result.outcome ===
        "accepted"
      ) {
        setPromptEvent(null);

        setCanInstall(false);

        setShowBanner(false);
      }
    }, [promptEvent]);

  const dismiss =
    useCallback(() => {
      localStorage.setItem(
        PWA_DISMISS_KEY,
        Date.now().toString()
      );

      setShowBanner(false);
    }, []);

  const permanentlyDismiss =
    useCallback(() => {
      localStorage.setItem(
        PWA_NEVER_SHOW_KEY,
        Date.now().toString()
      );

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