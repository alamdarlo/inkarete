"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import {
  startNotificationScheduler,
  stopNotificationScheduler,
} from "@/lib/notificationScheduler";

export default function NotificationScheduler() {
  const notificationsEnabled = useSettingsStore(
    (state) => state.notificationsEnabled,
  );

  const initialized = useSettingsStore(
    (state) => state.initialized,
  );

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (notificationsEnabled) {
      startNotificationScheduler();
    } else {
      stopNotificationScheduler();
    }

    return () => {
      stopNotificationScheduler();
    };
  }, [
    initialized,
    notificationsEnabled,
  ]);

  return null;
}