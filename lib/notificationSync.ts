import { db } from "@/lib/db";
import { postMessageToServiceWorker } from "@/lib/notificationServiceWorker";
import { computeUpcomingSchedule } from "@/lib/notificationSchedule";

const SCHEDULE_DAYS = 30;

export async function syncNotificationSchedule(): Promise<void> {
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
    SCHEDULE_DAYS,
    settings.timeZone,
  );

  await postMessageToServiceWorker({
    type: "UPDATE_SCHEDULE",
    schedule,
    enabled: true,
  });
}
