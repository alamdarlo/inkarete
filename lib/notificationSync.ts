"use client";

import { db } from "@/lib/db";
import { postMessageToServiceWorker } from "@/lib/notifications";
import { computeTodaySchedule } from "@/lib/notificationSchedule";

export async function syncNotificationSchedule() {
  const settings = await db.settings.get("app");

  if (!settings) {
    return;
  }

  if (!settings.notificationsEnabled) {
    await postMessageToServiceWorker({
      type: "STOP_SCHEDULER",
    });
    return;
  }

  const tasks = await db.tasks.orderBy("order").toArray();
  const schedule = computeTodaySchedule(tasks, settings.notificationMinutesBefore);

  await postMessageToServiceWorker({
    type: "UPDATE_SCHEDULE",
    schedule,
    enabled: true,
  });

  await postMessageToServiceWorker({
    type: "START_SCHEDULER",
  });
}
