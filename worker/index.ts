/// <reference lib="webworker" />

import type {
  ScheduledNotification,
  SwMessage,
} from "../lib/notificationTypes";
import {
  getNotificationBody,
  getNotificationKey,
  isScheduleDue,
} from "../lib/notificationSchedule";

declare const self: ServiceWorkerGlobalScope;

const DEFAULT_ICON = "/icons/icon-192.png";

let schedule: ScheduledNotification[] = [];
let schedulerEnabled = false;
let checkInterval: ReturnType<typeof setInterval> | null = null;
const notifiedKeys = new Set<string>();

function getIconUrl(): string {
  return new URL(DEFAULT_ICON, self.location.origin).href;
}

async function displayNotification(
  title: string,
  body: string,
  tag?: string,
): Promise<void> {
  await self.registration.showNotification(title, {
    body,
    icon: getIconUrl(),
    badge: getIconUrl(),
    dir: "rtl",
    lang: "fa",
    tag: tag ?? `inkarete-${Date.now()}`,
    //vibrate: [200, 100, 200],
    silent:false,
    data: {
      url: "/",
    },
  });
}

function stopBackgroundChecks(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

function startBackgroundChecks(): void {
  if (checkInterval) {
    return;
  }

  checkDueNotifications();

  checkInterval = setInterval(checkDueNotifications, 15000);
}

function checkDueNotifications(): void {
  if (!schedulerEnabled || !schedule.length) {
    return;
  }

  const now = new Date();

  for (const item of schedule) {
    if (!isScheduleDue(item, now)) {
      continue;
    }

    const key = getNotificationKey(item.taskId, item.date, item.time);

    if (notifiedKeys.has(key)) {
      continue;
    }

    notifiedKeys.add(key);

    void displayNotification(
      item.title,
      getNotificationBody(item.minutesBefore),
      key,
    );
  }
}

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const data = event.data as SwMessage | undefined;

  if (!data?.type) {
    return;
  }

  switch (data.type) {
    case "SHOW_NOTIFICATION":
      event.waitUntil(
        displayNotification(data.title, data.body, data.tag),
      );
      break;

    case "UPDATE_SCHEDULE":
      schedule = data.schedule;
      schedulerEnabled = data.enabled;

      if (schedulerEnabled) {
        startBackgroundChecks();
      } else {
        stopBackgroundChecks();
      }
      break;

    case "START_SCHEDULER":
      schedulerEnabled = true;
      startBackgroundChecks();
      break;

    case "STOP_SCHEDULER":
      schedulerEnabled = false;
      stopBackgroundChecks();
      break;

    default:
      break;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    (event.notification.data?.url as string | undefined) ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            void client.focus();
            return;
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});

export {};
