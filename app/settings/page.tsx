"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowBack,
  Check,
  ViewWeek,
  ViewSidebar,
} from "@mui/icons-material";
import {
  FormControlLabel,
  Switch,
} from "@mui/material";

import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsPage() {
  const {
    showWeekDayTabs,
    weekDayOrientation,
    showTaskProgress,
    showTaskTimes,

    initialize,

    setShowWeekDayTabs,
    setWeekDayOrientation,
    setShowTaskProgress,
    setShowTaskTimes,
  } = useSettingsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-slate-100
        px-3
        py-4
        text-slate-800
        dark:bg-slate-900
        dark:text-slate-100
        sm:px-5
      "
    >
      <div className="mx-auto max-w-xl">

        {/* Header */}

        <div className="mb-3 flex items-center justify-between">

          <h1 className="text-lg font-bold">
            تنظیمات
          </h1>

          <Link
            href="/"
            aria-label="بازگشت"
            title="بازگشت"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition
              hover:bg-slate-200
              hover:text-slate-800
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-slate-100
            "
          >
            <ArrowBack fontSize="small" />
          </Link>

        </div>

        {/* Appearance */}

        <section
          className="
            mb-3
            rounded-lg
            border
            border-slate-200
            bg-white
            p-3
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          <h2 className="mb-3 text-sm font-bold">
            نمایش صفحه اصلی
          </h2>

          {/* WeekDayTabs */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              py-2
              dark:border-slate-700
            "
          >
            <div>
              <div className="text-sm">
                نمایش روزهای هفته
              </div>

              <div className="mt-0.5 text-xs text-slate-400">
                نمایش تب روزهای هفته در صفحه اصلی
              </div>
            </div>

            <Switch
              checked={showWeekDayTabs}
              onChange={(event) =>
                setShowWeekDayTabs(event.target.checked)
              }
            />
          </div>

          {/* Orientation */}

          {showWeekDayTabs && (
            <div className="py-3">

              <div className="mb-2 text-sm">
                جهت نمایش روزهای هفته
              </div>

              <div className="grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setWeekDayOrientation("horizontal")
                  }
                  className={`
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-sm
                    transition
                    ${
                      weekDayOrientation === "horizontal"
                        ? `
                          border-indigo-500
                          bg-indigo-50
                          text-indigo-700
                          dark:border-indigo-500
                          dark:bg-indigo-950/40
                          dark:text-indigo-300
                        `
                        : `
                          border-slate-200
                          text-slate-600
                          hover:bg-slate-50
                          dark:border-slate-600
                          dark:text-slate-300
                          dark:hover:bg-slate-700
                        `
                    }
                  `}
                >
                  <ViewWeek fontSize="small" />

                  <span>
                    افقی
                  </span>

                  {weekDayOrientation === "horizontal" && (
                    <Check fontSize="small" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setWeekDayOrientation("vertical")
                  }
                  className={`
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-sm
                    transition
                    ${
                      weekDayOrientation === "vertical"
                        ? `
                          border-indigo-500
                          bg-indigo-50
                          text-indigo-700
                          dark:border-indigo-500
                          dark:bg-indigo-950/40
                          dark:text-indigo-300
                        `
                        : `
                          border-slate-200
                          text-slate-600
                          hover:bg-slate-50
                          dark:border-slate-600
                          dark:text-slate-300
                          dark:hover:bg-slate-700
                        `
                    }
                  `}
                >
                  <ViewSidebar fontSize="small" />

                  <span>
                    عمودی
                  </span>

                  {weekDayOrientation === "vertical" && (
                    <Check fontSize="small" />
                  )}
                </button>

              </div>
            </div>
          )}

          {/* Task Progress */}

          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-slate-100
              py-2
              dark:border-slate-700
            "
          >
            <div>
              <div className="text-sm">
                نمایش پیشرفت کارها
              </div>

              <div className="mt-0.5 text-xs text-slate-400">
                نمایش نوار پیشرفت روز
              </div>
            </div>

            <Switch
              checked={showTaskProgress}
              onChange={(event) =>
                setShowTaskProgress(event.target.checked)
              }
            />
          </div>

          {/* Task Times */}

          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-slate-100
              py-2
              dark:border-slate-700
            "
          >
            <div>
              <div className="text-sm">
                نمایش زمان کارها
              </div>

              <div className="mt-0.5 text-xs text-slate-400">
                نمایش ساعت تعیین‌شده برای هر کار
              </div>
            </div>

            <Switch
              checked={showTaskTimes}
              onChange={(event) =>
                setShowTaskTimes(event.target.checked)
              }
            />
          </div>

        </section>

        {/* Notifications - Coming Soon */}

        <section
          className="
            rounded-lg
            border
            border-slate-200
            bg-white
            p-3
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-sm font-bold">
                اعلان‌ها
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                به‌زودی امکان تنظیم اعلان و یادآوری کارها اضافه می‌شود.
              </p>
            </div>

            <span
              className="
                rounded-md
                bg-slate-100
                px-2
                py-1
                text-[11px]
                text-slate-500
                dark:bg-slate-700
                dark:text-slate-400
              "
            >
              به‌زودی
            </span>

          </div>
        </section>

      </div>
    </main>
  );
}