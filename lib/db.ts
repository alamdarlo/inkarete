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

  priority: Priority;

  categoryId?: number;

  order: number;

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

    // -----------------------------
    // Version 2
    // -----------------------------

    this.version(2).stores({
      tasks:
        "++id, completed, priority, createdAt",

      history:
        "++id, action, createdAt, taskId",
    });

    // -----------------------------
    // Version 3
    // Add category field
    // -----------------------------

    this.version(3)
      .stores({
        tasks:
          "++id, completed, priority, category, createdAt",

        history:
          "++id, action, createdAt, taskId",
      })
      .upgrade(async (tx) => {
        await tx
          .table("tasks")
          .toCollection()
          .modify((task) => {
            if (!task.category) {
              task.category = "personal";
            }
          });
      });

    // -----------------------------
    // Version 4
    // Add categories table
    // -----------------------------

    this.version(4).stores({
      tasks:
        "++id, completed, priority, category, createdAt",

      history:
        "++id, action, createdAt, taskId",

      categories:
        "++id, name, createdAt",
    });

    // -----------------------------
    // Version 5
    // Convert category to categoryId
    // Add task order
    // -----------------------------

    this.version(5)
      .stores({
        tasks:
          "++id, completed, priority, categoryId, order, createdAt",

        history:
          "++id, action, createdAt, taskId",

        categories:
          "++id, name, createdAt",
      })
      .upgrade(async (tx) => {
        const categoriesTable =
          tx.table("categories");

        const tasksTable =
          tx.table("tasks");

        // -----------------------------
        // Create default categories
        // -----------------------------

        const defaultCategories = [
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
        ];

        const existingCategories =
          await categoriesTable
            .toArray();

        if (
          existingCategories.length ===
          0
        ) {
          await categoriesTable.bulkAdd(
            defaultCategories,
          );
        }

        // -----------------------------
        // Get categories
        // -----------------------------

        const categories =
          await categoriesTable.toArray();

        const personalCategory =
          categories.find(
            (category) =>
              category.name === "شخصی",
          );

        // -----------------------------
        // Convert old tasks
        // -----------------------------

        let order = 0;

        await tasksTable
          .toCollection()
          .modify((task) => {
            // -----------------------------
            // Convert old category
            // -----------------------------

            if (
              task.categoryId ===
              undefined
            ) {
              let categoryId =
                personalCategory?.id;

              if (task.category) {
                const categoryMap: Record<
                  Category,
                  string
                > = {
                  work: "کاری",
                  personal: "شخصی",
                  study: "مطالعه",
                  shopping: "خرید",
                  custom: "سفارشی",
                };

                const categoryName =
                  categoryMap[
                    task.category as Category
                  ];

                const category =
                  categories.find(
                    (item) =>
                      item.name ===
                      categoryName,
                  );

                if (category?.id) {
                  categoryId =
                    category.id;
                }
              }

              task.categoryId =
                categoryId;
            }

            // -----------------------------
            // Add order
            // -----------------------------

            if (
              task.order === undefined
            ) {
              task.order = order;
            }

            order++;
          });
      });
  }
}

// -----------------------------
// Database Instance
// -----------------------------

export const db =
  new AppDatabase();