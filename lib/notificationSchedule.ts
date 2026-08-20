import type { Task, WeekDay } from "@/lib/db";
import type { ScheduledNotification } from "@/lib/notificationTypes";
import {
  addCalendarDays,
  getDateKeyInTimeZone,
  getDateFromKey,
  getTimeInTimeZone,
  getWeekDayInTimeZone,
} from "@/lib/timezone";

export function getTodayIndex(date = new Date(), timeZone: string): WeekDay {
  return getWeekDayInTimeZone(date, timeZone);
}

export function getTodayKey(date = new Date(), timeZone: string): string {
  return getDateKeyInTimeZone(date, timeZone);
}

export function getNotificationKey(taskId: number, date: string, time: string): string {
  return `${taskId}-${date}-${time}`;
}

export function computeScheduleForDate(
  tasks: Task[],
  minutesBefore: number,
  date: Date,
  timeZone: string,
): ScheduledNotification[] {
  const day = getWeekDayInTimeZone(date, timeZone);
  const dateKey = getDateKeyInTimeZone(date, timeZone);
  const schedule: ScheduledNotification[] = [];

  for (const task of tasks) {
    if (!task.id || task.completed || !task.scheduledTimes?.length) continue;
    if (!task.scheduledDays.includes(day)) continue;

    for (const time of task.scheduledTimes) {
      const [hours, minutes] = time.split(":").map(Number);
      if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) continue;

      schedule.push({
        taskId: task.id,
        title: task.title,
        date: dateKey,
        time,
        minutesBefore,
        timeZone,
      });
    }
  }

  return schedule;
}

export function computeTodaySchedule(
  tasks: Task[],
  minutesBefore: number,
  timeZone: string,
): ScheduledNotification[] {
  return computeScheduleForDate(tasks, minutesBefore, new Date(), timeZone);
}

export function computeUpcomingSchedule(
  tasks: Task[],
  minutesBefore: number,
  days: number,
  timeZone: string,
  startDate = new Date(),
): ScheduledNotification[] {
  const schedule: ScheduledNotification[] = [];
  const startKey = getDateKeyInTimeZone(startDate, timeZone);

  for (let offset = 0; offset < days; offset += 1) {
    const dateKey = addCalendarDays(startKey, offset);
    schedule.push(
      ...computeScheduleForDate(
        tasks,
        minutesBefore,
        getDateFromKey(dateKey),
        timeZone,
      ),
    );
  }

  return schedule;
}

export function getNotificationMinutes(item: ScheduledNotification): number | null {
  const [hours, minutes] = item.time.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) return null;

  return hours * 60 + minutes - item.minutesBefore;
}

export function getNotificationDueDate(item: ScheduledNotification): { date: string; minutes: number } | null {
  const notificationMinutes = getNotificationMinutes(item);
  if (notificationMinutes === null) return null;

  const dayOffset = Math.floor(notificationMinutes / 1440);
  return {
    date: addCalendarDays(item.date, dayOffset),
    minutes: notificationMinutes - dayOffset * 1440,
  };
}

export function isScheduleDue(item: ScheduledNotification, now = new Date()): boolean {
  const due = getNotificationDueDate(item);
  if (!due || getDateKeyInTimeZone(now, item.timeZone) !== due.date) return false;

  const { hours, minutes } = getTimeInTimeZone(now, item.timeZone);
  return hours * 60 + minutes >= due.minutes;
}

export function getNotificationBody(minutesBefore: number): string {
  if (minutesBefore > 0) return `${minutesBefore} دقیقه تا زمان انجام کار باقی مانده`;
  return "زمان انجام این کار رسیده است";
}
