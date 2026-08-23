"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button, IconButton } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { db, Task, WeekDay } from "@/lib/db";
import CategorySelect from "@/components/categories/CategorySelect";
import SortableTaskList from "@/components/tasks/SortableTaskList";
import TaskProgress from "@/components/tasks/TaskProgress";
import ScheduleSelect from "@/components/tasks/ScheduleSelect";
import TimeSelect from "@/components/tasks/TimeSelect";
import WeekDayTabs from "@/components/tasks/WeekDayTabs";
import { useSettingsStore } from "@/store/settingsStore";

const getTodayIndex = (): WeekDay => {
  const day = new Date().getDay();
  return day === 6 ? 0 : ((day + 1) as WeekDay);
};

export default function Home() {
  const [task, setTask] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [scheduledDays, setScheduledDays] = useState<WeekDay[]>([getTodayIndex()]);
  const [selectedDay, setSelectedDay] = useState<WeekDay | "all">(getTodayIndex());
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([]);

  const tasks = useLiveQuery(() => db.tasks.orderBy("order").toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.orderBy("createdAt").toArray(), []) ?? [];

  const { showWeekDayTabs, weekDayOrientation, showTaskProgress, showTaskTimes, showCategories } = useSettingsStore();
  const initialize = useSettingsStore((state) => state.initialize);

  const visibleTasks = selectedDay === "all" ? tasks : tasks.filter((item) => item.scheduledDays.includes(selectedDay));

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (showCategories && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id!);
    }
  }, [showCategories, categoryId, categories]);

  const addHistory = async (taskId: number, title: string, action: "created" | "completed" | "deleted") => {
    await db.history.add({ taskId, title, action, date: new Date().toLocaleString("fa-IR"), createdAt: Date.now() });
  };

  const addTask = async () => {
    const title = task.trim();
    if (!title || (showCategories && !categoryId)) return;

    const order = tasks.length > 0 ? Math.max(...tasks.map((item) => item.order)) + 1 : 0;
    const id = await db.tasks.add({ title, completed: false, ...(showCategories && categoryId ? { categoryId } : {}), order, scheduledDays, scheduledTimes, createdAt: new Date().toISOString() });

    await addHistory(id, title, "created");
    setTask("");
    setScheduledDays([getTodayIndex()]);
    setScheduledTimes([]);
  };

  const toggleTask = async (item: Task) => {
    if (!item.id) return;
    const completed = !item.completed;
    await db.tasks.update(item.id, { completed, completedAt: completed ? new Date().toISOString() : undefined });
    if (completed) await addHistory(item.id, item.title, "completed");
  };

  const deleteTask = async (item: Task) => {
    if (!item.id) return;
    await addHistory(item.id, item.title, "deleted");
    await db.tasks.delete(item.id);
  };

  const reorderTasks = async (activeId: number, overId: number) => {
    const oldIndex = tasks.findIndex((item) => item.id === activeId);
    const newIndex = tasks.findIndex((item) => item.id === overId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);

    await db.transaction("rw", db.tasks, async () => {
      await Promise.all(reorderedTasks.map((item, index) => db.tasks.update(item.id!, { order: index })));
    });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 px-3 py-3 text-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:px-5">
      <div className="mx-auto max-w-xl">
        <div className="mb-3 flex items-center gap-2">
          <input value={task} onChange={(event) => setTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void addTask(); }} placeholder="کار جدید..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <IconButton color="primary" onClick={() => void addTask()} disabled={!task.trim() || (showCategories && !categoryId)} aria-label="افزودن کار" title="افزودن کار" className="h-10 w-10 shrink-0 rounded-lg">
            <AddCircleIcon />
          </IconButton>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-2">
          {showCategories && <CategorySelect value={categoryId || undefined} onChange={(value) => setCategoryId(value ?? 0)} />}
          <ScheduleSelect value={scheduledDays} onChange={setScheduledDays} />
          <TimeSelect value={scheduledTimes} onChange={setScheduledTimes} />
        </div>

        {showWeekDayTabs && <div className="mb-3"><WeekDayTabs value={selectedDay} onChange={setSelectedDay} orientation={weekDayOrientation} /></div>}

        {showTaskProgress && <TaskProgress tasks={visibleTasks} />}

        <SortableTaskList tasks={visibleTasks} categories={categories} showTaskTimes={showTaskTimes} showCategories={showCategories} onToggle={toggleTask} onDelete={deleteTask} onReorder={reorderTasks} />
      </div>
    </main>
  );
}
