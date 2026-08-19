"use client";

import { useEffect } from "react";
import { syncNotificationSchedule } from "@/lib/notificationSync";
import { useSettingsStore } from "@/store/settingsStore";

export default function NotificationScheduler() {
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const initialized = useSettingsStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    void syncNotificationSchedule();
  }, [initialized, notificationsEnabled]);

  return null;
}
