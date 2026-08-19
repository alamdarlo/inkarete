import Dexie, { Table } from "dexie";

export type Priority = "low" | "medium" | "high";

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TaskSchedule = {
  id: string;
  days: WeekDay[];
  time?: string;
  notification?: boolean;
};

export type Category =
  | "work"
  | "personal"
  | "study"
  | "shopping"
  | "custom";

export type CategoryItem = {
  id?: number;
  name: string;
  createdAt: number;
};

export type Task = {
  id?: number;
  title: string;
  completed: boolean;
  categoryId?: number;
  order: number;
  scheduledDays: WeekDay[];
  scheduledTimes: string[];
  createdAt: string;
  completedAt?: string;
};

export type HistoryItem = {
  id?: number;
  taskId?: number;
  title: string;
  action: "created" | "completed" | "deleted" | "updated";
  date: string;
  createdAt: number;
};

export type AppSettings = {
  id: "app";
  showWeekDayTabs: boolean;
  weekDayOrientation: "horizontal" | "vertical";
  showTaskProgress: boolean;
  showTaskTimes: boolean;
  notificationsEnabled: boolean;
  notificationMinutesBefore: number;
  timeZone: string;
};

export class AppDatabase extends Dexie {
  tasks!: Table<Task, number>;
  history!: Table<HistoryItem, number>;
  categories!: Table<CategoryItem, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("taskDatabase");

    this.version(3).stores({
      tasks: "++id, completed, priority, createdAt, order",
      history: "++id, action, createdAt, taskId",
      categories: "++id, name, createdAt",
      settings: "id",
    });

    this.version(4)
      .stores({
        tasks: "++id, completed, priority, createdAt, order",
        history: "++id, action, createdAt, taskId",
        categories: "++id, name, createdAt",
        settings: "id",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<AppSettings, string>("settings")
          .toCollection()
          .modify((settings) => {
            settings.timeZone ??= "Asia/Tehran";
          });
      });

    this.on("populate", async () => {
      await this.categories.bulkAdd([
        { name: "کاری", createdAt: Date.now() },
        { name: "شخصی", createdAt: Date.now() + 1 },
        { name: "مطالعه", createdAt: Date.now() + 2 },
        { name: "خرید", createdAt: Date.now() + 3 },
        { name: "سفارشی", createdAt: Date.now() + 4 },
      ]);
    });
  }
}

export const db = new AppDatabase();
