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

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function getNotificationSupportInfo(): NotificationSupportInfo {
  const permission = getNotificationPermission();
  const hasServiceWorker = typeof window !== "undefined" && "serviceWorker" in navigator;
  const isStandalone = isStandalonePwa();
  const isIOS = isIOSDevice();

  return {
    supported: permission !== "unsupported",
    permission,
    hasServiceWorker,
    isStandalone,
    isIOS,
    requiresInstall: isIOS && !isStandalone,
  };
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  return Notification.requestPermission();
}
