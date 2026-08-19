import { create } from "zustand";
import { db, AppSettings } from "@/lib/db";
import { DEFAULT_TIME_ZONE, isValidTimeZone } from "@/lib/timezone";

type SettingsState = AppSettings & {
  initialized: boolean;
  initialize: () => Promise<void>;
  setShowWeekDayTabs: (value: boolean) => Promise<void>;
  setWeekDayOrientation: (value: "horizontal" | "vertical") => Promise<void>;
  setShowTaskProgress: (value: boolean) => Promise<void>;
  setShowTaskTimes: (value: boolean) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  setNotificationMinutesBefore: (value: number) => Promise<void>;
  setTimeZone: (value: string) => Promise<void>;
};

const defaultSettings: AppSettings = {
  id: "app",
  showWeekDayTabs: true,
  weekDayOrientation: "horizontal",
  showTaskProgress: true,
  showTaskTimes: true,
  notificationsEnabled: false,
  notificationMinutesBefore: 0,
  timeZone: DEFAULT_TIME_ZONE,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,
  initialized: false,

  initialize: async () => {
    const saved = await db.settings.get("app");

    if (saved) {
      const timeZone = isValidTimeZone(saved.timeZone)
        ? saved.timeZone
        : DEFAULT_TIME_ZONE;

      if (saved.timeZone !== timeZone) {
        await db.settings.update("app", { timeZone });
      }

      set({ ...saved, timeZone, initialized: true });
      return;
    }

    await db.settings.put(defaultSettings);
    set({ ...defaultSettings, initialized: true });
  },

  setShowWeekDayTabs: async (value) => {
    await db.settings.update("app", { showWeekDayTabs: value });
    set({ showWeekDayTabs: value });
  },

  setWeekDayOrientation: async (value) => {
    await db.settings.update("app", { weekDayOrientation: value });
    set({ weekDayOrientation: value });
  },

  setShowTaskProgress: async (value) => {
    await db.settings.update("app", { showTaskProgress: value });
    set({ showTaskProgress: value });
  },

  setShowTaskTimes: async (value) => {
    await db.settings.update("app", { showTaskTimes: value });
    set({ showTaskTimes: value });
  },

  setNotificationsEnabled: async (value) => {
    await db.settings.update("app", { notificationsEnabled: value });
    set({ notificationsEnabled: value });
  },

  setNotificationMinutesBefore: async (value) => {
    await db.settings.update("app", { notificationMinutesBefore: value });
    set({ notificationMinutesBefore: value });
  },

  setTimeZone: async (value) => {
    if (!isValidTimeZone(value)) {
      throw new Error(`Invalid time zone: ${value}`);
    }

    await db.settings.update("app", { timeZone: value });
    set({ timeZone: value });
  },
}));
