"use client";

import { db } from "@/lib/db";
import { computeTodaySchedule } from "@/lib/notificationSchedule";
import { postMessageToServiceWorker } from "@/lib/notifications";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

async function updateNotificationSchedule() {
  const settings = await db.settings.get("app");

  if (!settings) {
    return;
  }

  if (!settings.notificationsEnabled) {
    await postMessageToServiceWorker({
      type: "UPDATE_SCHEDULE",
      schedule: [],
      enabled: false,
    });

    return;
  }

  const tasks = await db.tasks.orderBy("order").toArray();

  const schedule = computeTodaySchedule(
    tasks,
    settings.notificationMinutesBefore,
  );

  await postMessageToServiceWorker({
    type: "UPDATE_SCHEDULE",
    schedule,
    enabled: true,
  });
}

export async function startNotificationScheduler() {
  if (typeof window === "undefined") {
    return;
  }

  if (schedulerInterval) {
    return;
  }

  await updateNotificationSchedule();

  schedulerInterval = setInterval(() => {
    void updateNotificationSchedule();
  }, 30000);
}

export async function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }

  await postMessageToServiceWorker({
    type: "UPDATE_SCHEDULE",
    schedule: [],
    enabled: false,
  });
}