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

  for (const time of task.scheduledTimes) {
    const [hours, minutes] = time.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      continue;
    }

    const target = new Date(now);

    target.setHours(
      hours,
      minutes,
      0,
      0,
    );

    target.setMinutes(
      target.getMinutes() - notificationMinutesBefore,
    );

    const difference = now.getTime() - target.getTime();

    /*
     * اعلان در بازه 0 تا 60 ثانیه بعد از زمان تعیین‌شده
     * ارسال می‌شود.
     *
     * این کار باعث می‌شود اگر Scheduler دقیقاً در
     * ابتدای دقیقه اجرا نشد، اعلان از دست نرود.
     */
    if (
      difference >= 0 &&
      difference < 60 * 1000
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
    alert("1️⃣ checkNotifications اجرا شد");

    const settings = await db.settings.get("app");

    alert(
      settings
        ? `2️⃣ Settings پیدا شد\nnotificationsEnabled: ${settings.notificationsEnabled}\nminutesBefore: ${settings.notificationMinutesBefore}`
        : "2️⃣ ❌ Settings پیدا نشد",
    );

    if (!settings) {
      return;
    }

    if (!settings.notificationsEnabled) {
      alert("3️⃣ ❌ notificationsEnabled = false");
      return;
    }

    alert("3️⃣ ✅ اعلان‌ها فعال هستند");

    if (Notification.permission !== "granted") {
      alert(
        `4️⃣ ❌ Permission مشکل دارد\nPermission: ${Notification.permission}`,
      );
      return;
    }

    alert("4️⃣ ✅ Notification permission = granted");

    const tasks = await db.tasks
      .orderBy("order")
      .toArray();

    alert(
      `5️⃣ تعداد Taskها: ${tasks.length}`,
    );

    const today = getTodayIndex();

    alert(
      `6️⃣ امروز index = ${today}`,
    );

    const todayKey = getTodayKey();

    alert(
      `7️⃣ todayKey = ${todayKey}`,
    );

    for (const task of tasks) {
      alert(
        `8️⃣ بررسی Task:\n${task.title}\nID: ${task.id}\ncompleted: ${task.completed}\nscheduledDays: ${JSON.stringify(task.scheduledDays)}\nscheduledTimes: ${JSON.stringify(task.scheduledTimes)}`,
      );

      const due = getDueTime(
        task,
        settings.notificationMinutesBefore,
      );

      alert(
        due
          ? `9️⃣ ✅ Task موعد دارد\nزمان: ${due.time}`
          : "9️⃣ ❌ این Task فعلاً موعد اعلان ندارد",
      );

      if (!due || !task.id) {
        continue;
      }

      const key = getNotificationKey(
        task.id,
        todayKey,
        due.time,
      );

      alert(
        `🔟 Notification Key:\n${key}`,
      );

      if (notifiedTasks.has(key)) {
        alert("1️⃣1️⃣ این اعلان قبلاً ارسال شده");
        continue;
      }

      notifiedTasks.add(key);

      const message =
        settings.notificationMinutesBefore > 0
          ? `${settings.notificationMinutesBefore} دقیقه تا زمان انجام کار باقی مانده`
          : "زمان انجام این کار رسیده است";

      alert(
        `1️⃣2️⃣ قرار است اعلان ارسال شود\n\nعنوان: ${task.title}\nپیام: ${message}`,
      );

      await showTaskNotification(
        task.title,
        message,
        key,
      );

      alert("1️⃣3️⃣ showTaskNotification اجرا شد");
    }

    alert("1️⃣4️⃣ checkNotifications تمام شد");
  } catch (error) {
    alert(
      `❌ ERROR در Scheduler:\n${String(error)}`,
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