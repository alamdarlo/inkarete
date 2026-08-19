"use client";

import { db } from "@/lib/db";
import { postMessageToServiceWorker } from "@/lib/notifications";
import { computeUpcomingSchedule } from "@/lib/notificationSchedule";

export async function syncNotificationSchedule() {
  const settings = await db.settings.get("app");

  if (!settings) return;

  if (!settings.notificationsEnabled) {
    await postMessageToServiceWorker({ type: "STOP_SCHEDULER" });
    return;
  }

  const tasks = await db.tasks.orderBy("order").toArray();
  const schedule = computeUpcomingSchedule(
    tasks,
    settings.notificationMinutesBefore,
    30,
    settings.timeZone,
  );

  await postMessageToServiceWorker({
    type: "UPDATE_SCHEDULE",
    schedule,
    enabled: true,
  });
}
