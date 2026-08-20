import type { SwMessage } from "@/lib/notificationTypes";

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function postMessageToServiceWorker(message: SwMessage): Promise<void> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) return;

  const target = registration.active ?? registration.waiting ?? registration.installing;
  target?.postMessage(message);
}
