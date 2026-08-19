import type { Task, WeekDay } from "@/lib/db";
import type { ScheduledNotification } from "@/lib/notificationTypes";
import {
  addCalendarDays,
  getDateKeyInTimeZone,
  getDateFromKey,
  getTimeInTimeZone,
  getWeekDayInTimeZone,
} from "@/lib/timezone";

export function getTodayIndex(date = new Date(), timeZone = "Asia/Tehran"): WeekDay {
  return getWeekDayInTimeZone(date, timeZone);
}

export function getTodayKey(date = new Date(), timeZone = "Asia/Tehran"): string {
  return getDateKeyInTimeZone(date, timeZone);
}

export function getNotificationKey(taskId: number, date: string, time: string): string {
  return `${taskId}-${date}-${time}`;
}

export function computeScheduleForDate(tasks: Task[], minutesBefore: number, date: Date, timeZone: string): ScheduledNotification[] {
  const day = getWeekDayInTimeZone(date, timeZone);
  const dateKey = getDateKeyInTimeZone(date, timeZone);
  const schedule: ScheduledNotification[] = [];

  for (const task of tasks) {
    if (!task.id || task.completed || !task.scheduledTimes?.length) continue;
    if (!task.scheduledDays.includes(day)) continue;

    for (const time of task.scheduledTimes) {
      const [hours, minutes] = time.split(":").map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) continue;

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

export function computeTodaySchedule(tasks: Task[], minutesBefore: number, timeZone = "Asia/Tehran"): ScheduledNotification[] {
  return computeScheduleForDate(tasks, minutesBefore, new Date(), timeZone);
}

export function computeUpcomingSchedule(tasks: Task[], minutesBefore: number, days = 30, timeZone = "Asia/Tehran", startDate = new Date()): ScheduledNotification[] {
  const schedule: ScheduledNotification[] = [];
  const startKey = getDateKeyInTimeZone(startDate, timeZone);

  for (let offset = 0; offset < days; offset += 1) {
    const dateKey = addCalendarDays(startKey, offset);
    schedule.push(...computeScheduleForDate(tasks, minutesBefore, getDateFromKey(dateKey), timeZone));
  }

  return schedule;
}

export function getNotificationMinutes(item: ScheduledNotification): number | null {
  const [hours, minutes] = item.time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes - item.minutesBefore;
}

export function isScheduleDue(item: ScheduledNotification, now = new Date()): boolean {
  if (item.date !== getDateKeyInTimeZone(now, item.timeZone)) return false;

  const notificationMinutes = getNotificationMinutes(item);
  if (notificationMinutes === null) return false;

  const { hours, minutes } = getTimeInTimeZone(now, item.timeZone);
  return hours * 60 + minutes >= notificationMinutes;
}

export function getNotificationBody(minutesBefore: number): string {
  if (minutesBefore > 0) return `${minutesBefore} دقیقه تا زمان انجام کار باقی مانده`;
  return "زمان انجام این کار رسیده است";
}
