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

export default function Home() {
  const todayIndex: WeekDay = new Date().getDay() as WeekDay;
  const [task, setTask] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [scheduledDays, setScheduledDays] = useState<WeekDay[]>([todayIndex]);
  const [selectedDay, setSelectedDay] = useState<WeekDay | "all">(todayIndex);
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([]);

  const tasks = useLiveQuery(() => db.tasks.orderBy("order").toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.orderBy("createdAt").toArray(), []) ?? [];

  const {
    showWeekDayTabs,
    weekDayOrientation,
    showTaskProgress,
    showTaskTimes,
    showCategories,
  } = useSettingsStore();
  const initialize = useSettingsStore((state) => state.initialize);

  const visibleTasks = selectedDay === "all"
    ? tasks
    : tasks.filter((item) => item.scheduledDays.includes(selectedDay));

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (showCategories && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id!);
    }
  }, [showCategories, categoryId, categories]);

  const addHistory = async (
    taskId: number,
    title: string,
    action: "created" | "completed" | "deleted",
  ) => {
    await db.history.add({
      taskId,
      title,
      action,
      date: new Date().toLocaleString("fa-IR"),
      createdAt: Date.now(),
    });
  };

  const addTask = async () => {
    const title = task.trim();
    if (!title || (showCategories && !categoryId)) return;

    const order = tasks.length > 0
      ? Math.max(...tasks.map((item) => item.order)) + 1
      : 0;

    const id = await db.tasks.add({
      title,
      completed: false,
      ...(showCategories && categoryId ? { categoryId } : {}),
      order,
      scheduledDays,
      scheduledTimes,
      createdAt: new Date().toISOString(),
    });

    await addHistory(id, title, "created");
    setTask("");
    setScheduledDays([todayIndex]);
    setScheduledTimes([]);
  };

  const toggleTask = async (item: Task) => {
    if (!item.id) return;
    const completed = !item.completed;
    await db.tasks.update(item.id, {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });
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
      await Promise.all(
        reorderedTasks.map((item, index) => db.tasks.update(item.id!, { order: index })),
      );
    });
  };

  return (
    <main dir="rtl" className="h-[calc(100vh-100px)] overflow-hidden bg-slate-100 px-3 text-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:px-5">
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <section className="mb-1 shrink-0 rounded-xl bg-white p-3 text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
          <div className="flex flex-col gap-2">
            <input
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="کار جدید..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-1">
                <ScheduleSelect value={scheduledDays} onChange={setScheduledDays} className="flex-1" />
                <TimeSelect value={scheduledTimes} onChange={setScheduledTimes} />
                {showCategories && (
                  <CategorySelect value={categoryId} onChange={setCategoryId} className="flex-1" />
                )}
              </div>
              <Button type="button" onClick={addTask} disabled={showCategories && !categories.length} color="success" aria-label="افزودن کار" title="افزودن کار" sx={{ display: { xs: "flex", sm: "none" }, minWidth: "auto", height: 40, px: 2, borderRadius: 2, fontSize: 14, fontWeight: 500, color: "success.main", "&:hover": { backgroundColor: "action.hover" }, "&.Mui-disabled": { color: "text.disabled" } }}>
                افزودن
              </Button>
              <IconButton type="button" onClick={addTask} disabled={showCategories && !categories.length} color="success" aria-label="افزودن کار" title="افزودن کار" sx={{ display: { xs: "none", sm: "inline-flex" }, width: 40, height: 40 }}>
                <AddCircleIcon fontSize="medium" />
              </IconButton>
            </div>
          </div>
        </section>

        {showTaskProgress && (
          <div className="shrink-0">
            <TaskProgress completed={visibleTasks.filter((item) => item.completed).length} total={visibleTasks.length} />
          </div>
        )}

        <div className={weekDayOrientation === "horizontal" ? "flex min-h-0 flex-1 flex-col gap-2" : "flex min-h-0 flex-1 flex-row-reverse gap-2"}>
          {showWeekDayTabs && <WeekDayTabs value={selectedDay} onChange={setSelectedDay} orientation={weekDayOrientation} />}
          <div className="tasks-scroll min-h-0 flex-1 overflow-y-auto pb-4">
            <SortableTaskList tasks={visibleTasks} categories={categories} onToggle={toggleTask} onDelete={deleteTask} onReorder={reorderTasks} showTaskTimes={showTaskTimes} />
          </div>
        </div>
      </div>
    </main>
  );
}
