"use client";

import { WeekDay } from "@/lib/db";

type SelectedDay = WeekDay | "all";

type Props = {
  value: SelectedDay;
  onChange: (value: SelectedDay) => void;

  orientation?: "horizontal" | "vertical";
};

const days: {
  value: WeekDay;
  label: string;
  shortLabel: string;
}[] = [
  { value: 0, label: "شنبه", shortLabel: "ش" },
  { value: 1, label: "یکشنبه", shortLabel: "ی" },
  { value: 2, label: "دوشنبه", shortLabel: "د" },
  { value: 3, label: "سه‌شنبه", shortLabel: "س" },
  { value: 4, label: "چهارشنبه", shortLabel: "چ" },
  { value: 5, label: "پنجشنبه", shortLabel: "پ" },
  { value: 6, label: "جمعه", shortLabel: "ج" },
];

const getTodayIndex = (): WeekDay => {
  const day = new Date().getDay();

  return day === 6 ? 0 : ((day + 1) as WeekDay);
};

export default function WeekDayTabs({
  value,
  onChange,
  orientation = "horizontal",
}: Props) {
  const today = getTodayIndex();

  const isVertical = orientation === "vertical";

  return (
    <div
      dir="rtl"
      className={`
        shrink-0 overflow-hidden rounded-xl
        border border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-700
        dark:bg-slate-800

        ${
          isVertical
            ? "flex h-full w-10 flex-col"
            : "w-full"
        }
      `}
    >
      <div
        className={`
          flex
          ${
            isVertical
              ? "h-full flex-col"
              : "w-full flex-row"
          }
        `}
      >
        {/* همه */}
        <button
          type="button"
          onClick={() => onChange("all")}
          className={`
            relative flex items-center justify-center
            text-xs font-medium
            transition-colors
            ${
              isVertical
                ? "min-h-0 flex-1 px-0"
                : "min-w-0 flex-1 px-2 py-2"
            }

            ${
              value === "all"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
            }

            ${
              isVertical
                ? value === "all"
                  ? "border-r-2 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
                  : ""
                : value === "all"
                  ? "border-b-2 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
                  : ""
            }
          `}
        >
          <span
            className={
              isVertical
                ? "[writing-mode:vertical-rl] rotate-180"
                : ""
            }
          >
            همه
          </span>
        </button>

        {days.map((day) => {
          const selected = value === day.value;
          const isToday = day.value === today;

          return (
            <button
              key={day.value}
              type="button"
              onClick={() => onChange(day.value)}
              className={`
                relative flex items-center justify-center
                text-xs font-medium
                transition-colors
                ${
                  isVertical
                    ? "min-h-0 flex-1 px-0"
                    : "min-w-0 flex-1 px-1 py-2"
                }

                ${
                  selected
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                }

                ${
                  isVertical
                    ? selected
                      ? "border-r-2 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
                      : ""
                    : selected
                      ? "border-b-2 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
                      : ""
                }
              `}
            >
              {/* نشانگر امروز */}
              {isToday && (
                <span
                  className="
                    absolute
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-500
                    dark:bg-emerald-400
                  "
                  style={
                    isVertical
                      ? {
                          top: "6px",
                          right: "4px",
                        }
                      : {
                          top: "4px",
                          right: "6px",
                        }
                  }
                />
              )}

              <span
                className={`
                  ${
                    isVertical
                      ? "[writing-mode:vertical-rl] rotate-180"
                      : ""
                  }
                `}
              >
                {/* دسکتاپ افقی: نام کامل */}
                <span className="hidden sm:inline">
                  {day.label}
                </span>

                {/* موبایل افقی: مخفف */}
                <span className="sm:hidden">
                  {/* {day.shortLabel} */}
                  {day.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}