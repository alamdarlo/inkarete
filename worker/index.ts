/// <reference lib="webworker" />

import type { ScheduledNotification, SwMessage } from "../lib/notificationTypes";
import { getNotificationBody, getNotificationKey, isScheduleDue } from "../lib/notificationSchedule";
import { DEFAULT_TIME_ZONE } from "../lib/timezone";

declare const self: ServiceWorkerGlobalScope;

const DEFAULT_ICON = "/icons/icon-192.png";
const NOTIFIED_DB_NAME = "inkarete-notifications";
const NOTIFIED_DB_VERSION = 1;
const NOTIFIED_STORE_NAME = "notified";
const SCHEDULE_STORE_NAME = "schedule";
const NOTIFIED_RETENTION_DAYS = 31;

let schedule: ScheduledNotification[] = [];
let schedulerEnabled = false;
let checkInterval: ReturnType<typeof setInterval> | null = null;
let notifiedKeys = new Set<string>();
let notifiedKeysLoaded = false;
let scheduleLoaded = false;
let checkInProgress = false;

function normalizeSchedule(items: ScheduledNotification[]): ScheduledNotification[] {
  return items.map((item) => ({ ...item, timeZone: item.timeZone || DEFAULT_TIME_ZONE }));
}

function getIconUrl(): string {
  return new URL(DEFAULT_ICON, self.location.origin).href;
}

function openNotificationDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NOTIFIED_DB_NAME, NOTIFIED_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(NOTIFIED_STORE_NAME)) database.createObjectStore(NOTIFIED_STORE_NAME, { keyPath: "key" });
      if (!database.objectStoreNames.contains(SCHEDULE_STORE_NAME)) database.createObjectStore(SCHEDULE_STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open notification database"));
  });
}

async function loadNotifiedKeys(): Promise<void> {
  if (notifiedKeysLoaded) return;
  const database = await openNotificationDatabase();
  try {
    const records = await new Promise<Array<{ key: string; createdAt: number }>>((resolve, reject) => {
      const transaction = database.transaction(NOTIFIED_STORE_NAME, "readonly");
      const request = transaction.objectStore(NOTIFIED_STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as Array<{ key: string; createdAt: number }>);
      request.onerror = () => reject(request.error ?? new Error("Failed to load notification keys"));
    });
    const cutoff = Date.now() - NOTIFIED_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const freshRecords = records.filter((record) => record.createdAt >= cutoff);
    notifiedKeys = new Set(freshRecords.map((record) => record.key));
    const staleKeys = records.filter((record) => record.createdAt < cutoff).map((record) => record.key);
    if (staleKeys.length) await deleteNotifiedKeys(staleKeys);
    notifiedKeysLoaded = true;
  } finally {
    database.close();
  }
}

async function saveNotifiedKey(key: string): Promise<void> {
  const database = await openNotificationDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(NOTIFIED_STORE_NAME, "readwrite");
      transaction.objectStore(NOTIFIED_STORE_NAME).put({ key, createdAt: Date.now() });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to save notification key"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Notification key transaction aborted"));
    });
  } finally {
    database.close();
  }
}

async function deleteNotifiedKeys(keys: string[]): Promise<void> {
  if (!keys.length) return;
  const database = await openNotificationDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(NOTIFIED_STORE_NAME, "readwrite");
      const store = transaction.objectStore(NOTIFIED_STORE_NAME);
      for (const key of keys) store.delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to delete notification keys"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Notification key transaction aborted"));
    });
  } finally {
    database.close();
  }
}

async function clearAllNotifiedKeys(): Promise<void> {
  notifiedKeys.clear();
  const database = await openNotificationDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(NOTIFIED_STORE_NAME, "readwrite");
      transaction.objectStore(NOTIFIED_STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to clear notification keys"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Notification key transaction aborted"));
    });
  } finally {
    database.close();
  }
}

async function saveSchedule(nextSchedule: ScheduledNotification[], enabled: boolean): Promise<void> {
  const database = await openNotificationDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(SCHEDULE_STORE_NAME, "readwrite");
      const store = transaction.objectStore(SCHEDULE_STORE_NAME);
      store.clear();
      store.put({ id: "current", schedule: nextSchedule, enabled });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to save notification schedule"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Notification schedule transaction aborted"));
    });
  } finally {
    database.close();
  }
}

async function loadSchedule(): Promise<void> {
  if (scheduleLoaded) return;
  const database = await openNotificationDatabase();
  try {
    const record = await new Promise<{ schedule: ScheduledNotification[]; enabled: boolean } | undefined>((resolve, reject) => {
      const transaction = database.transaction(SCHEDULE_STORE_NAME, "readonly");
      const request = transaction.objectStore(SCHEDULE_STORE_NAME).get("current");
      request.onsuccess = () => resolve(request.result as { schedule: ScheduledNotification[]; enabled: boolean } | undefined);
      request.onerror = () => reject(request.error ?? new Error("Failed to load notification schedule"));
    });
    if (record) {
      schedule = normalizeSchedule(record.schedule);
      schedulerEnabled = record.enabled;
    }
    scheduleLoaded = true;
  } finally {
    database.close();
  }
}

async function displayNotification(title: string, body: string, tag?: string): Promise<void> {
  await self.registration.showNotification(title, {
    body,
    icon: getIconUrl(),
    badge: getIconUrl(),
    dir: "rtl",
    lang: "fa",
    tag: tag ?? `inkarete-${Date.now()}`,
    silent: false,
    data: { url: "/" },
  });
}

function stopBackgroundChecks(): void {
  if (!checkInterval) return;
  clearInterval(checkInterval);
  checkInterval = null;
}

function startBackgroundChecks(): void {
  if (checkInterval) return;
  void checkDueNotifications();
  checkInterval = setInterval(() => void checkDueNotifications(), 15000);
}

async function checkDueNotifications(): Promise<void> {
  if (!schedulerEnabled || !schedule.length || checkInProgress) return;
  checkInProgress = true;
  try {
    await Promise.all([loadNotifiedKeys(), loadSchedule()]);
    if (!schedulerEnabled || !schedule.length) return;
    const now = new Date();
    for (const item of schedule) {
      if (!isScheduleDue(item, now)) continue;
      const key = getNotificationKey(item.taskId, item.date, item.time);
      if (notifiedKeys.has(key)) continue;
      try {
        await displayNotification(item.title, getNotificationBody(item.minutesBefore), key);
        notifiedKeys.add(key);
        await saveNotifiedKey(key);
      } catch (error) {
        console.error("Failed to display scheduled notification:", error);
      }
    }
  } finally {
    checkInProgress = false;
  }
}

async function restoreScheduler(): Promise<void> {
  await Promise.all([loadNotifiedKeys(), loadSchedule()]);
  if (schedulerEnabled && schedule.length) startBackgroundChecks();
}

self.addEventListener("install", (event) => {
  event.waitUntil(loadNotifiedKeys().catch((error) => console.error("Failed to initialize notification storage:", error)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(restoreScheduler().catch((error) => console.error("Failed to restore notification scheduler:", error)));
});

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const data = event.data as SwMessage | undefined;
  if (!data?.type) return;

  switch (data.type) {
    case "SHOW_NOTIFICATION":
      event.waitUntil(displayNotification(data.title, data.body, data.tag));
      break;
    case "UPDATE_SCHEDULE":
      event.waitUntil((async () => {
        await loadNotifiedKeys();
        const nextSchedule = normalizeSchedule(data.schedule);
        const nextKeys = new Set(nextSchedule.map((item) => getNotificationKey(item.taskId, item.date, item.time)));
        const keysToDelete = [...notifiedKeys].filter((key) => !nextKeys.has(key));
        if (keysToDelete.length) {
          for (const key of keysToDelete) notifiedKeys.delete(key);
          await deleteNotifiedKeys(keysToDelete);
        }
        schedule = nextSchedule;
        schedulerEnabled = data.enabled;
        scheduleLoaded = true;
        await saveSchedule(schedule, schedulerEnabled);
        if (schedulerEnabled && schedule.length) startBackgroundChecks();
        else stopBackgroundChecks();
      })());
      break;
    case "START_SCHEDULER":
      event.waitUntil((async () => {
        schedulerEnabled = true;
        scheduleLoaded = true;
        await saveSchedule(schedule, true);
        startBackgroundChecks();
      })());
      break;
    case "STOP_SCHEDULER":
      schedulerEnabled = false;
      stopBackgroundChecks();
      event.waitUntil(Promise.all([clearAllNotifiedKeys(), saveSchedule([], false)]));
      break;
    default:
      break;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url as string | undefined) ?? "/";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if ("focus" in client) {
        void client.focus();
        return;
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
  }));
});

export {};