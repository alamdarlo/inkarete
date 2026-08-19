"use client";

import { useEffect } from "react";
import { syncNotificationSchedule } from "@/lib/notificationSync";
import { useSettingsStore } from "@/store/settingsStore";

export default function NotificationScheduler() {
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const notificationMinutesBefore = useSettingsStore((state) => state.notificationMinutesBefore);
  const timeZone = useSettingsStore((state) => state.timeZone);
  const initialized = useSettingsStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) return;
    void syncNotificationSchedule();
  }, [initialized, notificationsEnabled, notificationMinutesBefore, timeZone]);

  return null;
}
