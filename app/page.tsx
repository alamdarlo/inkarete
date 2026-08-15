"use client";

import { useState } from "react";
import { db, Task, Priority } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import CategorySelect from "@/components/categories/CategorySelect";
import TaskProgress from "@/components/tasks/TaskProgress";
import SortableTaskList from "@/components/tasks/SortableTaskList";
import PrioritySelect from "@/components/tasks/PrioritySelect";

export default function Home() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [categoryId, setCategoryId] = useState<number>(0);

  const tasks =
    useLiveQuery(() => db.tasks.orderBy("order").toArray(), []) || [];

  const categories =
    useLiveQuery(() => db.categories.orderBy("createdAt").toArray(), []) || [];

  const completed = tasks.filter((item) => item.completed).length;

  // -----------------------------
  // Set Default Category
  // -----------------------------

  if (categoryId === 0 && categories.length > 0) {
    setCategoryId(categories[0].id!);
  }

  // -----------------------------
  // Add Task
  // -----------------------------

  const addTask = async () => {
    if (!task.trim()) return;
    if (!categoryId) return;

    const title = task.trim();
    const now = new Date().toISOString();

    const maxOrder =
      tasks.length > 0 ? Math.max(...tasks.map((item) => item.order)) : -1;

    const id = await db.tasks.add({
      title,
      completed: false,
      priority,
      categoryId,
      order: maxOrder + 1,
      createdAt: now,
    });

    await db.history.add({
      taskId: id,
      title,
      action: "created",
      date: new Date().toLocaleString("fa-IR"),
      createdAt: Date.now(),
    });

    setTask("");
  };

  // -----------------------------
  // Toggle Complete
  // -----------------------------

  const toggleTask = async (item: Task) => {
    if (!item.id) return;

    const completed = !item.completed;

    await db.tasks.update(item.id, {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });

    if (completed) {
      await db.history.add({
        taskId: item.id,
        title: item.title,
        action: "completed",
        date: new Date().toLocaleString("fa-IR"),
        createdAt: Date.now(),
      });
    }
  };

  // -----------------------------
  // Delete Task
  // -----------------------------

  const deleteTask = async (item: Task) => {
    if (!item.id) return;

    await db.history.add({
      taskId: item.id,
      title: item.title,
      action: "deleted",
      date: new Date().toLocaleString("fa-IR"),
      createdAt: Date.now(),
    });

    await db.tasks.delete(item.id);
  };

  // -----------------------------
  // Reorder Tasks
  // -----------------------------

  const reorderTasks = async (activeId: number, overId: number) => {
    const oldIndex = tasks.findIndex((item) => item.id === activeId);
    const newIndex = tasks.findIndex((item) => item.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);

    reorderedTasks.splice(newIndex, 0, movedTask);

    await db.transaction("rw", db.tasks, async () => {
      await Promise.all(
        reorderedTasks.map((item, index) =>
          db.tasks.update(item.id!, {
            order: index,
          }),
        ),
      );
    });
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 px-3 py-5 dark:bg-slate-900 sm:px-5"
    >
      <div className="mx-auto max-w-xl">
        {/* Add Task */}

        <section className="mb-4 rounded-xl bg-white p-3 text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="کار جدید..."
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />

            <PrioritySelect
              value={priority}
              onChange={setPriority}
              className="sm:w-32"
            />

            <CategorySelect
              value={categoryId}
              onChange={setCategoryId}
            />

            <button
              onClick={addTask}
              disabled={!categories.length}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              افزودن
            </button>
          </div>
        </section>

        {/* Progress */}

        <TaskProgress
          completed={completed}
          total={tasks.length}
        />

        {/* Tasks */}

        <SortableTaskList
          tasks={tasks}
          categories={categories}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onReorder={reorderTasks}
        />
      </div>
    </main>
  );
}