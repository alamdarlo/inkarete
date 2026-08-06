import Dexie, { Table } from "dexie";


// -----------------------------
// Priority
// -----------------------------

export type Priority =
  | "low"
  | "medium"
  | "high";



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
// Task Model
// -----------------------------

export type Task = {

  id?: number;

  title: string;

  completed: boolean;

  priority: Priority;

  category: Category;

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



  constructor() {


    super("taskDatabase");



    // Version 2
    this.version(2).stores({

      tasks:
        "++id, completed, priority, createdAt",

      history:
        "++id, action, createdAt, taskId"

    });



    // Version 3
    // Add category field safely

    this.version(3)
      .stores({

        tasks:
          "++id, completed, priority, category, createdAt",

        history:
          "++id, action, createdAt, taskId"

      })

      .upgrade(async tx => {


        await tx
          .table("tasks")
          .toCollection()
          .modify(task => {


            if (!task.category) {

              task.category = "personal";

            }


          });


      });


  }


}



export const db =
  new AppDatabase();