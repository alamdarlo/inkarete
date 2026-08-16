"use client";

import { useEffect, useRef, useState } from "react";
import { WeekDay } from "@/lib/db";
type Props = {
  value: WeekDay[];
  onChange: (value: WeekDay[]) => void;
  className?: string;
};

const days: { value: WeekDay; label: string }[] = [
  { value: 0, label: "شنبه" },
  { value: 1, label: "یکشنبه" },
  { value: 2, label: "دوشنبه" },
  { value: 3, label: "سه‌شنبه" },
  { value: 4, label: "چهارشنبه" },
  { value: 5, label: "پنجشنبه" },
  { value: 6, label: "جمعه" },
];

const evenDays: WeekDay[] = [0, 2, 4, 6];
const oddDays: WeekDay[] = [1, 3, 5];
const allDays: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

function getTodayIndex() {
  const day = new Date().getDay();
  return day === 6 ? 0 : day + 1;
}

export default function ScheduleSelect({
  value,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 const toggleDay = (day: WeekDay) => {
  if (value.includes(day)) {
    onChange(value.filter((item) => item !== day));
    return;
  }

  onChange([...value, day].sort((a, b) => a - b));
};

const selectDays = (selectedDays: WeekDay[]) => {
  onChange([...selectedDays].sort((a, b) => a - b));
};

  const isEvenSelected = evenDays.every((day) => value.includes(day)) && value.length === evenDays.length;

const isOddSelected = oddDays.every((day) => value.includes(day)) && value.length === oddDays.length;

const isAllSelected = value.length === allDays.length && allDays.every((day) => value.includes(day));

const selectedLabels = days.filter((day) => value.includes(day.value)).map((day) => day.label);

  const selectedText = value.length === 0 ? "انتخاب روز" : value.length === 7 ? "هر روز" : selectedLabels.join("، ");

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} aria-haspopup="listbox" aria-expanded={open} className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
        <span className="min-w-0 truncate">{selectedText}</span>

        <span className={`shrink-0 text-xs text-slate-400 transition-transform dark:text-slate-300 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div role="listbox" className="absolute right-0 z-50 mt-1 w-full min-w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-800">
          <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            روزهای هفته
          </div>

          <div className="grid grid-cols-2 gap-1">
            {days.map((day) => {
              const selected = value.includes(day.value);
              const today = getTodayIndex() === day.value;

              return (
                <button key={day.value} type="button" role="option" aria-selected={selected} onClick={() => toggleDay(day.value)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${selected ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700"}`}>
                  <span>{day.label}</span>

                  {today && <span className="text-[10px] text-emerald-500">امروز</span>}
                </button>
              );
            })}
          </div>

          <div className="my-2 border-t border-slate-100 dark:border-slate-700" />

          <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            انتخاب سریع
          </div>

        <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => selectDays(evenDays)} className={`rounded-lg py-2 text-sm transition ${isEvenSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"}`}>
            روزهای زوج
        </button>

        <button type="button" onClick={() => selectDays(oddDays)} className={`rounded-lg py-2 text-sm transition ${isOddSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"}`}>
            روزهای فرد
        </button>

        <button type="button" onClick={() => selectDays(allDays)} className={`rounded-lg py-2 text-sm transition ${isAllSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"}`}>
            همه روزها
        </button>
        </div>
        </div>
      )}
    </div>
  );
}