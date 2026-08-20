/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const TASK_DB_NAME = "taskDatabase";
const NOTIFICATION_DB_NAME = "inkarete-notifications";
const NOTIFIED_STORE = "notified";
const WEEK_MINUTES = 7 * 24 * 60;
const LATE_WINDOW_MINUTES = 10;
const ICON = "/icons/icon-192.png";

type Task = {
  id?: number;
  title: string;
  completed: boolean;
  scheduledDays: number[];
  scheduledTimes: string[];
};

type Settings = {
  notificationsEnabled: boolean;
  notificationMinutesBefore: number;
};

type NotifiedRecord = { key: string; createdAt: number };

function openDatabase(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(`Failed to open ${name}`));
  });
}

async function readAppData(): Promise<{ tasks: Task[]; settings?: Settings }> {
  const database = await openDatabase(TASK_DB_NAME);
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(["tasks", "settings"], "readonly");
      const tasksRequest = transaction.objectStore("tasks").getAll();
      const settingsRequest = transaction.objectStore("settings").get("app");
      let tasks: Task[] = [];
      let settings: Settings | undefined;
      tasksRequest.onsuccess = () => { tasks = (tasksRequest.result ?? []) as Task[]; };
      settingsRequest.onsuccess = () => { settings = settingsRequest.result as Settings | undefined; };
      transaction.oncomplete = () => resolve({ tasks, settings });
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to read task data"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Task data transaction aborted"));
    });
  } finally {
    database.close();
  }
}

function openNotificationDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NOTIFICATION_DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(NOTIFIED_STORE)) {
        request.result.createObjectStore(NOTIFIED_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open notification database"));
  });
}

async function getNotifiedKeys(): Promise<Set<string>> {
  const database = await openNotificationDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(NOTIFIED_STORE, "readonly").objectStore(NOTIFIED_STORE).getAll();
      request.onsuccess = () => resolve(new Set((request.result as NotifiedRecord[]).map((item) => item.key)));
      request.onerror = () => reject(request.error ?? new Error("Failed to read notification history"));
    });
  } finally {
    database.close();
  }
}

async function rememberNotification(key: string): Promise<void> {
  const database = await openNotificationDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(NOTIFIED_STORE, "readwrite");
      transaction.objectStore(NOTIFIED_STORE).put({ key, createdAt: Date.now() } satisfies NotifiedRecord);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to save notification history"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Notification history transaction aborted"));
    });
  } finally {
    database.close();
  }
}

function parseTime(value: string): number | null {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function notificationKey(taskId: number, date: string, time: string): string {
  return `${taskId}:${date}:${time}`;
}

function getDueTimes(task: Task, now: Date, minutesBefore: number): string[] {
  if (!task.id || task.completed) return [];

  const nowWeekMinute = now.getDay() * 1440 + now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const due: string[] = [];

  for (const day of task.scheduledDays) {
    for (const time of task.scheduledTimes) {
      const taskMinute = parseTime(time);
      if (taskMinute === null) continue;

      const notificationMinute = (day * 1440 + taskMinute - minutesBefore + WEEK_MINUTES) % WEEK_MINUTES;
      const elapsed = (nowWeekMinute - notificationMinute + WEEK_MINUTES) % WEEK_MINUTES;
      if (elapsed <= LATE_WINDOW_MINUTES) due.push(time);
    }
  }

  return [...new Set(due)];
}

async function showDueTaskNotifications(): Promise<void> {
  const { tasks, settings } = await readAppData();
  if (!settings?.notificationsEnabled) return;

  const minutesBefore = Math.max(0, Number(settings.notificationMinutesBefore) || 0);
  const now = new Date();
  const date = localDateKey(now);
  const notified = await getNotifiedKeys();

  for (const task of tasks) {
    if (!task.id) continue;

    for (const time of getDueTimes(task, now, minutesBefore)) {
      const key = notificationKey(task.id, date, time);
      if (notified.has(key)) continue;

      const body = minutesBefore > 0
        ? `${minutesBefore} دقیقه تا زمان انجام کار باقی مانده`
        : "زمان انجام این کار رسیده است";

      await self.registration.showNotification(task.title, {
        body,
        icon: new URL(ICON, self.location.origin).href,
        badge: new URL(ICON, self.location.origin).href,
        dir: "rtl",
        lang: "fa",
        tag: `inkarete-task-${task.id}-${date}-${time}`,
        data: { url: "/" },
      });

      await rememberNotification(key);
      notified.add(key);
    }
  }
}

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let payload: { type?: string; title?: string; body?: string; tag?: string } = {};
    try {
      payload = event.data?.json() ?? {};
    } catch {
      payload = {};
    }

    if (payload.type === "WAKE_UP") {
      await showDueTaskNotifications();
      return;
    }

    await self.registration.showNotification(payload.title ?? "این کارته", {
      body: payload.body ?? "یک اعلان جدید دارید.",
      icon: new URL(ICON, self.location.origin).href,
      badge: new URL(ICON, self.location.origin).href,
      dir: "rtl",
      lang: "fa",
      tag: payload.tag ?? `inkarete-push-${Date.now()}`,
      data: { url: "/" },
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url as string | undefined) ?? "/";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if ("focus" in client) return client.focus();
    }
    return self.clients.openWindow?.(targetUrl);
  }));
});

export {};