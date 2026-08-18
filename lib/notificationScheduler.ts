"use client";

import { db } from "@/lib/db";
import { showTaskNotification } from "@/lib/notifications";
import {
  computeTodaySchedule,
  getNotificationBody,
  getNotificationKey,
  isScheduleDue,
} from "@/lib/notificationSchedule";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

const notifiedTasks = new Set<string>();

async function checkNotifications() {
  const settings = await db.settings.get("app");

  if (!settings || !settings.notificationsEnabled) {
    return;
  }

  const tasks = await db.tasks.orderBy("order").toArray();

  const schedule = computeTodaySchedule(
    tasks,
    settings.notificationMinutesBefore,
  );

  const now = new Date();

  for (const item of schedule) {
    if (!isScheduleDue(item, now)) {
      continue;
    }

    const key = getNotificationKey(
      item.taskId,
      item.date,
      item.time,
    );

    if (notifiedTasks.has(key)) {
      continue;
    }

    notifiedTasks.add(key);

    await showTaskNotification(
      item.title,
      getNotificationBody(item.minutesBefore),
      key,
    );
  }
}

export function startNotificationScheduler() {
  if (typeof window === "undefined") {
    return;
  }

  if (schedulerInterval) {
    return;
  }

  void checkNotifications();

  schedulerInterval = setInterval(() => {
    void checkNotifications();
  }, 15000);
}

export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}