import Dexie, { Table } from "dexie";

// -----------------------------
// Priority
// -----------------------------

export type Priority = "low" | "medium" | "high";

// -----------------------------
// Week Day
// -----------------------------

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// 0 = شنبه
// 1 = یکشنبه
// 2 = دوشنبه
// 3 = سه‌شنبه
// 4 = چهارشنبه
// 5 = پنجشنبه
// 6 = جمعه

// -----------------------------
// Task Schedule
// -----------------------------

export type TaskSchedule = {
  id: string;
  days: WeekDay[];
  time?: string;
  notification?: boolean;
};

// -----------------------------
// Category
// -----------------------------

export type Category =
  | "work"
  | "personal"
  | "study"
  | "shopping"
  | "custom";

// -----------------------------
// Category Model
// -----------------------------

export type CategoryItem = {
  id?: number;

  name: string;

  createdAt: number;
};

// -----------------------------
// Task Model
// -----------------------------

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

// -----------------------------
// History Model
// -----------------------------

export type HistoryItem = {
  id?: number;

  taskId?: number;

  title: string;

  action:
    | "created"
    | "completed"
    | "deleted"
    | "updated";

  date: string;

  createdAt: number;
};

// -----------------------------
// Database
// -----------------------------

export class AppDatabase extends Dexie {
  tasks!: Table<Task, number>;

  history!: Table<HistoryItem, number>;

  categories!: Table<CategoryItem, number>;

constructor() {
  super("taskDatabase");

  this.version(1).stores({
    tasks: "++id, completed, categoryId, order, createdAt",

    history: "++id, action, createdAt, taskId",

    categories: "++id, name, createdAt",
  });

  this.on("populate", async () => {
    await this.categories.bulkAdd([
      {
        name: "کاری",
        createdAt: Date.now(),
      },
      {
        name: "شخصی",
        createdAt: Date.now() + 1,
      },
      {
        name: "مطالعه",
        createdAt: Date.now() + 2,
      },
      {
        name: "خرید",
        createdAt: Date.now() + 3,
      },
      {
        name: "سفارشی",
        createdAt: Date.now() + 4,
      },
    ]);
  });
}
}

// -----------------------------
// Database Instance
// -----------------------------

export const db = new AppDatabase();