"use client";

import { db, Task, WeekDay } from "@/lib/db";
import { showTaskNotification } from "@/lib/notifications";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

const notifiedTasks = new Set<string>();

function getTodayIndex(): WeekDay {
  const day = new Date().getDay();

  return day === 6 ? 0 : ((day + 1) as WeekDay);
}

function getTodayKey(): string {
  const date = new Date();

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

function isTaskDue(
  task: Task,
  notificationMinutesBefore: number,
) {
  if (!task.id) {
    alert("❌ Task ID ندارد");
    return null;
  }

  if (task.completed) {
    alert(`❌ Task تکمیل شده است: ${task.title}`);
    return null;
  }

  if (!task.scheduledTimes?.length) {
    alert(`❌ Task زمان ندارد: ${task.title}`);
    return null;
  }

  const today = getTodayIndex();

  alert(
    `🔎 بررسی روز\n` +
    `Task: ${task.title}\n` +
    `Today Index: ${today}\n` +
    `Scheduled Days: ${task.scheduledDays.join(", ")}`,
  );

  if (!task.scheduledDays.includes(today)) {
    alert(
      `❌ روز Task با امروز مطابقت ندارد\n` +
      `Today: ${today}\n` +
      `Task Days: ${task.scheduledDays.join(", ")}`,
    );

    return null;
  }

  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  alert(
    `⏰ زمان فعلی\n` +
    `Time: ${now.toLocaleTimeString("fa-IR")}\n` +
    `Current Minutes: ${currentMinutes}\n` +
    `Before: ${notificationMinutesBefore}`,
  );

  for (const time of task.scheduledTimes) {
    const [hours, minutes] = time.split(":").map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      alert(
        `❌ زمان نامعتبر\n` +
        `Task: ${task.title}\n` +
        `Time: ${time}`,
      );

      continue;
    }

    const taskMinutes =
      hours * 60 + minutes;

    const notificationMinutes =
      taskMinutes - notificationMinutesBefore;

    alert(
      `🕐 بررسی زمان Task\n` +
      `Task: ${task.title}\n` +
      `Task Time: ${time}\n` +
      `Task Minutes: ${taskMinutes}\n` +
      `Notification Minutes: ${notificationMinutes}\n` +
      `Current Minutes: ${currentMinutes}\n` +
      `Current >= Notification: ${
        currentMinutes >= notificationMinutes
      }`,
    );

    if (
      currentMinutes >= notificationMinutes
    ) {
      alert(
        `✅ موعد پیدا شد!\n` +
        `Task: ${task.title}\n` +
        `Time: ${time}`,
      );

      return {
        time,
        notificationMinutes,
      };
    }
  }

  alert(
    `❌ هیچ زمان موعدداری برای این Task پیدا نشد\n` +
    `Task: ${task.title}`,
  );

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

  /*
   * Alert موقت برای تست موبایل
   */
  alert(`1️⃣ Scheduler اجرا شد\nتعداد تسک‌ها: ${tasks.length}`);

  const todayKey = getTodayKey();

  for (const task of tasks) {
    const due = isTaskDue(
      task,
      settings.notificationMinutesBefore,
    );

    /*
     * Alert موقت برای بررسی هر Task
     */
    alert(
      `2️⃣ بررسی Task\n${task.title}\n` +
      `زمان‌ها: ${task.scheduledTimes?.join(", ") || "ندارد"}\n` +
      `زمان فعلی: ${new Date().toLocaleTimeString("fa-IR")}\n` +
      `زمان اعلان قبل از موعد: ${settings.notificationMinutesBefore}\n` +
      `موعد پیدا شد: ${due ? "بله" : "خیر"}`,
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

    /*
     * Alert نهایی؛ یعنی دقیقاً قبل از ارسال Notification
     */
    alert(
      `3️⃣ ارسال اعلان\n` +
      `Task: ${task.title}\n` +
      `زمان Task: ${due.time}\n` +
      `پیام: ${message}`,
    );

    await showTaskNotification(
      task.title,
      message,
      key,
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