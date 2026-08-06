import Dexie, { Table } from "dexie";


export type Priority =
  | "low"
  | "medium"
  | "high";


export type Task = {
  id?: number;

  title: string;

  completed: boolean;

  priority: Priority;

  createdAt: string;

  completedAt?: string;
};



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

export class AppDatabase extends Dexie {
  tasks!: Table<Task, number>;
  history!: Table<HistoryItem, number>;
  constructor() {
    super("taskDatabase");
    this.version(2).stores({
      tasks:
        "++id, completed, priority, createdAt",
      history:
        "++id, action, createdAt, taskId"
    });
  }
}

export const db =  new AppDatabase();