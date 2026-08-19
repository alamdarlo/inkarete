export type ScheduledNotification = {
  taskId: number;
  title: string;
  date: string;
  time: string;
  minutesBefore: number;
  timeZone: string;
};

export type SwMessage =
  | {
      type: "SHOW_NOTIFICATION";
      title: string;
      body: string;
      tag?: string;
    }
  | {
      type: "UPDATE_SCHEDULE";
      schedule: ScheduledNotification[];
      enabled: boolean;
    }
  | {
      type: "START_SCHEDULER";
    }
  | {
      type: "STOP_SCHEDULER";
    };

export const NOTIFIED_STORAGE_KEY = "inkarete-notified-keys";
