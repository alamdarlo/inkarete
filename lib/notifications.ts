import type { SwMessage } from "@/lib/notificationTypes";

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

export type NotificationSupportInfo = {
  supported: boolean;
  permission: NotificationPermissionState;
  hasServiceWorker: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  requiresInstall: boolean;
};

const DEFAULT_ICON = "/icons/icon-192.png";

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined") {
    return "unsupported";
  }

  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isIOSDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function getNotificationSupportInfo(): NotificationSupportInfo {
  const permission = getNotificationPermission();
  const hasServiceWorker = typeof window !== "undefined" && "serviceWorker" in navigator;
  const isStandalone = isStandalonePwa();
  const isIOS = isIOSDevice();
  const requiresInstall = isIOS && !isStandalone;

  return {
    supported: permission !== "unsupported",
    permission,
    hasServiceWorker,
    isStandalone,
    isIOS,
    requiresInstall,
  };
}

export async function requestNotificationPermission(): Promise<
  NotificationPermissionState
> {
  if (typeof window === "undefined") {
    return "unsupported";
  }

  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  const permission = await Notification.requestPermission();

  return permission;
}

async function getServiceWorkerRegistration(): Promise<
  ServiceWorkerRegistration | null
> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

function buildNotificationOptions(
  body: string,
  tag?: string,
): NotificationOptions {
  return {
    body,
    icon: DEFAULT_ICON,
    badge: DEFAULT_ICON,
    dir: "rtl",
    lang: "fa",
    tag: tag ?? `inkarete-${Date.now()}`,
    //vibrate: [200, 100, 200],
    silent:false,
    requireInteraction: false,
  };
}

export async function showTaskNotification(
  title: string,
  body: string,
  tag?: string,
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const options = buildNotificationOptions(body, tag);

  const registration = await getServiceWorkerRegistration();

  if (registration) {
    try {
      await registration.showNotification(title, options);
      return true;
    } catch (error) {
      console.error("Service worker notification failed:", error);
    }
  }

  try {
    new Notification(title, options);
    return true;
  } catch (error) {
    console.error("Page notification failed:", error);
    return false;
  }
}

export async function postMessageToServiceWorker(
  message: SwMessage,
): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const target =
      registration.active ??
      registration.waiting ??
      registration.installing;

    target?.postMessage(message);
  } catch (error) {
    console.error("Failed to post message to service worker:", error);
  }
}
