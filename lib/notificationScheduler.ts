"use client";

import { db, Task, WeekDay } from "@/lib/db";
import { showTaskNotification } from "@/lib/notifications";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

const notifiedTasks = new Set<string>();

function getTodayIndex(): WeekDay {
  const day = new Date().getDay();

  return day === 6 ? 0 : ((day + 1) as WeekDay);
}

function getNotificationKey(
  taskId: number,
  date: string,
  time: string,
) {
  return `${taskId}-${date}-${time}`;
}

function isTaskDue(
  task: Task,
  notificationMinutesBefore: number,
) {
  if (!task.id) return null;

  if (task.completed) return null;

  if (!task.scheduledTimes?.length) return null;

  const now = new Date();

  const today = getTodayIndex();

  if (!task.scheduledDays.includes(today)) {
    return null;
  }

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  for (const time of task.scheduledTimes) {
    const [hours, minutes] = time.split(":").map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      continue;
    }

    const taskMinutes =
      hours * 60 + minutes;

    const notificationMinutes =
      taskMinutes - notificationMinutesBefore;

    if (
      currentMinutes === notificationMinutes
    ) {
      return {
        time,
      };
    }
  }

  return null;
}

async function checkNotifications() {
  const settings = await db.settings.get("app");

  if (!settings) {
    return;
  }

  if (!settings.notificationsEnabled) {
    return;
  }

  const tasks = await db.tasks
    .orderBy("order")
    .toArray();

  const todayKey = new Date()
    .toISOString()
    .slice(0, 10);

  for (const task of tasks) {
    const due = isTaskDue(
      task,
      settings.notificationMinutesBefore,
    );

    if (!due || !task.id) {
      continue;
    }

    const key = getNotificationKey(
      task.id,
      todayKey,
      due.time,
    );

    if (notifiedTasks.has(key)) {
      continue;
    }

    notifiedTasks.add(key);

    const message =
      settings.notificationMinutesBefore > 0
        ? `${settings.notificationMinutesBefore} دقیقه تا زمان انجام کار باقی مانده`
        : "زمان انجام این کار رسیده است";

    showTaskNotification(
      task.title,
      message,
    );
  }
}

export function startNotificationScheduler() {
  if (typeof window === "undefined") {
    return;
  }

  if (schedulerInterval) {
    return;
  }

  checkNotifications();

  schedulerInterval = setInterval(
    checkNotifications,
    30000,
  );
}

export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}