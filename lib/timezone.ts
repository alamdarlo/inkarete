export const DEFAULT_TIME_ZONE = "Asia/Tehran";

export const TIME_ZONE_OPTIONS = [
  { value: "Asia/Tehran", label: "ایران (تهران)" },
  { value: "Asia/Baku", label: "آذربایجان (باکو)" },
  { value: "Asia/Dubai", label: "امارات (دبی)" },
  { value: "Europe/Istanbul", label: "ترکیه (استانبول)" },
  { value: "UTC", label: "UTC" },
] as const;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function getParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
}

export function getDateKeyInTimeZone(
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): string {
  const parts = getParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getTimeInTimeZone(
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): { hours: number; minutes: number } {
  const parts = getParts(date, timeZone);
  return {
    hours: Number(parts.hour),
    minutes: Number(parts.minute),
  };
}

export function getWeekDayInTimeZone(
  date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const weekday = getParts(date, timeZone).weekday;
  const map: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
    Sat: 0,
    Sun: 1,
    Mon: 2,
    Tue: 3,
    Wed: 4,
    Thu: 5,
    Fri: 6,
  };

  return map[weekday];
}

export function getDateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function addCalendarDays(dateKey: string, days: number): string {
  const date = getDateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
