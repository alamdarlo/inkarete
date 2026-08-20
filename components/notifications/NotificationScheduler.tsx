"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { syncNotificationSchedule } from "@/lib/notificationSync";
import { useSettingsStore } from "@/store/settingsStore";

export default function NotificationScheduler() {
  const tasks = useLiveQuery(() => db.tasks.orderBy("order").toArray(), []) ?? [];
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const notificationMinutesBefore = useSettingsStore((state) => state.notificationMinutesBefore);
  const timeZone = useSettingsStore((state) => state.timeZone);
  const initialized = useSettingsStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) return;
    void syncNotificationSchedule();
  }, [initialized, tasks, notificationsEnabled, notificationMinutesBefore, timeZone]);

  return null;
}
