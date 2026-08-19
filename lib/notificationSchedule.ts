import type { Task, WeekDay } from "@/lib/db";
import type { ScheduledNotification } from "@/lib/notificationTypes";

export function getTodayIndex(): WeekDay {
  const day = new Date().getDay();

  return day === 6 ? 0 : ((day + 1) as WeekDay);
}

export function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getNotificationKey(
  taskId: number,
  date: string,
  time: string,
): string {
  return `${taskId}-${date}-${time}`;
}

export function computeTodaySchedule(
  tasks: Task[],
  minutesBefore: number,
): ScheduledNotification[] {
  const today = getTodayIndex();
  const todayKey = getTodayKey();
  const schedule: ScheduledNotification[] = [];

  for (const task of tasks) {
    if (!task.id || task.completed) {
      continue;
    }

    if (!task.scheduledTimes?.length) {
      continue;
    }

    if (!task.scheduledDays.includes(today)) {
      continue;
    }

    for (const time of task.scheduledTimes) {
      const [hours, minutes] = time.split(":").map(Number);

      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        continue;
      }

      schedule.push({
        taskId: task.id,
        title: task.title,
        date: todayKey,
        time,
        minutesBefore,
      });
    }
  }

  return schedule;
}

export function getNotificationMinutes(item: ScheduledNotification): number | null {
  const [hours, minutes] = item.time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes - item.minutesBefore;
}

export function isScheduleDue(
  item: ScheduledNotification,
  now = new Date(),
): boolean {
  if (item.date !== getTodayKey(now)) {
    return false;
  }

  const notificationMinutes = getNotificationMinutes(item);
  if (notificationMinutes === null) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= notificationMinutes;
}

export function getNotificationBody(minutesBefore: number): string {
  if (minutesBefore > 0) {
    return `${minutesBefore} دقیقه تا زمان انجام کار باقی مانده`;
  }

  return "زمان انجام این کار رسیده است";
}
