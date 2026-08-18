"use client";

import { useEffect, useState } from "react";
import { db, Task, WeekDay } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import CategorySelect from "@/components/categories/CategorySelect";
import TaskProgress from "@/components/tasks/TaskProgress";
import SortableTaskList from "@/components/tasks/SortableTaskList";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Button, IconButton } from "@mui/material";
import ScheduleSelect from "@/components/tasks/ScheduleSelect";
import WeekDayTabs from "@/components/tasks/WeekDayTabs";
import TimeSelect from "@/components/tasks/TimeSelect";
import { useSettingsStore } from "@/store/settingsStore";
import NotificationScheduler from "@/components/notifications/NotificationScheduler";

export default function Home() {
  const today = new Date().getDay();
  const todayIndex: WeekDay = today === 6 ? 0 : ((today + 1) as WeekDay);

  const [task, setTask] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [scheduledDays, setScheduledDays] = useState<WeekDay[]>([todayIndex]);
  const [selectedDay, setSelectedDay] = useState<WeekDay | "all">(todayIndex);
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([]);
  const tasks =
    useLiveQuery(() => db.tasks.orderBy("order").toArray(), []) || [];

  const {
  showWeekDayTabs,
  weekDayOrientation,
  showTaskProgress,
  showTaskTimes,
} = useSettingsStore();

const initialize = useSettingsStore(
  (state) => state.initialize,
);

const visibleTasks =
    selectedDay === "all"
      ? tasks
      : tasks.filter((item) => item.scheduledDays.includes(selectedDay));

  const categories =
    useLiveQuery(() => db.categories.orderBy("createdAt").toArray(), []) || [];

  const completed = tasks.filter((item) => item.completed).length;


useEffect(() => {
  initialize();
}, [initialize]);

useEffect(() => {
  if (categoryId === 0 && categories.length > 0) {
    setCategoryId(categories[0].id!);
  }
}, [categoryId, categories.length]);

  
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
      categoryId,
      order: maxOrder + 1,
      scheduledDays,
      scheduledTimes,
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
    setScheduledDays([todayIndex]);
    setScheduledTimes([]);
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
          db.tasks.update(item.id!, { order: index }),
        ),
      );
    });
  };

  
  return (
    <main
      dir="rtl"
      className="h-[calc(100vh-100px)] overflow-hidden bg-slate-100 px-3 text-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:px-5"
    >
      <NotificationScheduler />
      <div className="mx-auto flex h-full max-w-xl flex-col">
        {/* Add Task */}

        <section className="mb-1 shrink-0 rounded-xl bg-white p-3 text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
         
          <div className="flex flex-col gap-2">
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="کار جدید..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-1">
                

                <ScheduleSelect
                  value={scheduledDays}
                  onChange={setScheduledDays}
                  className="flex-1"
                />

                <TimeSelect
                  value={scheduledTimes}
                  onChange={setScheduledTimes}
                />

                <CategorySelect
                  value={categoryId}
                  onChange={setCategoryId}
                  className="flex-1"
                />
              </div>

              <Button
                type="button"
                onClick={addTask}
                disabled={!categories.length}
                color="success"
                aria-label="افزودن کار"
                title="افزودن کار"
                sx={{
                  display: { xs: "flex", sm: "none" },
                  minWidth: "auto",
                  height: 40,
                  px: 2,
                  borderRadius: 2,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "success.main",
                  "&:hover": { backgroundColor: "action.hover" },
                  "&.Mui-disabled": { color: "text.disabled" },
                }}
              >
                افزودن
              </Button>

              <IconButton
                type="button"
                onClick={addTask}
                disabled={!categories.length}
                color="success"
                aria-label="افزودن کار"
                title="افزودن کار"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  width: 40,
                  height: 40,
                }}
              >
                <AddCircleIcon fontSize="medium" />
              </IconButton>
            </div>
          </div>
        </section>

        {/* Progress */}
        {showTaskProgress && (
          <div className="shrink-0">
            <TaskProgress
              completed={visibleTasks.filter((item) => item.completed).length}
              total={visibleTasks.length}
            />
          </div>
        )}

      {/* Tasks + Week Days */}

      <div
        className={
          weekDayOrientation === "horizontal"
            ? "flex min-h-0 flex-1 flex-col gap-2"
            : "flex min-h-0 flex-1 flex-row-reverse gap-2"
        }
      >
        {/* Week Days */}

        {showWeekDayTabs && (
          <WeekDayTabs
            value={selectedDay}
            onChange={setSelectedDay}
            orientation={weekDayOrientation}
          />
        )}

        {/* Tasks */}

        <div className="tasks-scroll min-h-0 flex-1 overflow-y-auto pb-4">
          <SortableTaskList
            tasks={visibleTasks}
            categories={categories}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onReorder={reorderTasks}
            showTaskTimes={showTaskTimes}
          />
        </div>
      </div>
      </div>
    </main>
  );
}
