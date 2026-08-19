"use client";

import { useEffect } from "react";
import { syncNotificationSchedule } from "@/lib/notificationSync";
import { useSettingsStore } from "@/store/settingsStore";
import {
  startNotificationScheduler,
  stopNotificationScheduler,
} from "@/lib/notificationScheduler";

export default function NotificationScheduler() {
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const initialized = useSettingsStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (notificationsEnabled) {
      void syncNotificationSchedule();
      startNotificationScheduler();
    } else {
      stopNotificationScheduler();
      void syncNotificationSchedule();
    }

    return () => {
      stopNotificationScheduler();
    };
  }, [initialized, notificationsEnabled]);

  return null;
}