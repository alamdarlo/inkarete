import { getServiceWorkerRegistration } from "@/lib/notificationServiceWorker";

const DEFAULT_ICON = "/icons/icon-192.png";

function buildNotificationOptions(body: string, tag?: string): NotificationOptions {
  return {
    body,
    icon: DEFAULT_ICON,
    badge: DEFAULT_ICON,
    dir: "rtl",
    lang: "fa",
    tag: tag ?? `inkarete-${Date.now()}`,
    silent: false,
    requireInteraction: false,
  };
}

export async function showTaskNotification(
  title: string,
  body: string,
  tag?: string,
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const registration = await getServiceWorkerRegistration();
  if (!registration) return false;

  try {
    await registration.showNotification(title, buildNotificationOptions(body, tag));
    return true;
  } catch (error) {
    console.error("Notification failed:", error);
    return false;
  }
}
