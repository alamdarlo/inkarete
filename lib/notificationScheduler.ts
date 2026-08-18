"use client";

import { db, Task, WeekDay } from "@/lib/db";
import { showTaskNotification } from "@/lib/notifications";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

const notifiedTasks = new Set<string>();

function getTodayIndex(): WeekDay {
  const day = new Date().getDay();

  return day === 6 ? 0 : ((day + 1) as WeekDay);
}

function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNotificationKey(
  taskId: number,
  date: string,
  time: string,
) {
  return `${taskId}-${date}-${time}`;
}


function getDueTime(
  task: Task,
  notificationMinutesBefore: number,
) {
  if (!task.id) return null;

  if (task.completed) return null;

  if (!task.scheduledTimes?.length) return null;

  const today = getTodayIndex();

  if (!task.scheduledDays.includes(today)) {
    return null;
  }

  const now = new Date();

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
      currentMinutes >= notificationMinutes
    ) {
      return {
        time,
      };
    }
  }

  return null;
}


async function checkNotifications() {
  try {
    const settings = await db.settings.get("app");

    if (!settings) {
      alert("❌ Settings پیدا نشد");
      return;
    }

    if (!settings.notificationsEnabled) {
      alert("❌ اعلان‌ها خاموش هستند");
      return;
    }

    if (Notification.permission !== "granted") {
      alert(`❌ Permission: ${Notification.permission}`);
      return;
    }

    const tasks = await db.tasks.orderBy("order").toArray();

    alert(`📋 تعداد Taskها: ${tasks.length}`);

    const todayKey = getTodayKey();

    for (const task of tasks) {
      const due = getDueTime(
        task,
        settings.notificationMinutesBefore,
      );

      if (!due || !task.id) {
        continue;
      }

      alert(
        `✅ Task موعد دارد\n\n${task.title}\nزمان: ${due.time}`,
      );

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

      alert(
        `🔔 ارسال اعلان\n\n${task.title}\n${message}`,
      );

      await showTaskNotification(
        task.title,
        message,
        key,
      );

      alert("✅ showTaskNotification اجرا شد");
    }
  } catch (error) {
    alert(`❌ ERROR:\n${String(error)}`);
  }
}

export function startNotificationScheduler() {
  if (typeof window === "undefined") {
    return;
  }

  if (schedulerInterval) {
    return;
  }

  alert("Scheduler شروع شد");

  void checkNotifications();

  schedulerInterval = setInterval(
    () => {
      void checkNotifications();
    },
    5000,
  );
}

export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);

    schedulerInterval = null;

    console.log(
      "[NotificationScheduler] Stopped",
    );
  }
}