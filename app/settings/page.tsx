"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowBack, Check, ViewWeek, ViewSidebar } from "@mui/icons-material";
import { FormControl, InputLabel, MenuItem, Select, Switch } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { useSettingsStore } from "@/store/settingsStore";
import { showTaskNotification } from "@/lib/notifications";
import { requestNotificationPermission } from "@/lib/notificationSupport";
import { setPushNotificationPreference, subscribeToPush } from "@/lib/push";
import { subscribeToPush } from "@/lib/push";

export default function SettingsPage() {
  const {
    showWeekDayTabs,
    weekDayOrientation,
    showTaskProgress,
    showTaskTimes,
    showCategories,
    initialize,
    setShowWeekDayTabs,
    setWeekDayOrientation,
    setShowTaskProgress,
    setShowTaskTimes,
    setShowCategories,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationMinutesBefore,
    setNotificationMinutesBefore,
  } = useSettingsStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const enableNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      await setNotificationsEnabled(false);
      return;
    }

    const subscribed = await subscribeToPush();
    if (!subscribed) {
      await setNotificationsEnabled(false);
      return;
    }

    await setNotificationsEnabled(true);
    await setPushNotificationPreference(true);
  };

  const disableNotifications = async () => {
    await setNotificationsEnabled(false);
    await setPushNotificationPreference(false);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 px-3 py-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:px-5">
      <div className="mx-auto max-w-xl">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">تنظیمات</h1>
          <Link href="/" aria-label="بازگشت" title="بازگشت" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
            <ArrowBack fontSize="small" />
          </Link>
        </div>

        <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 text-sm font-bold">نمایش صفحه اصلی</h2>
          <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-700">
            <div><div className="text-sm">نمایش روزهای هفته</div><div className="mt-0.5 text-xs text-slate-400">نمایش تب روزهای هفته در صفحه اصلی</div></div>
            <Switch checked={showWeekDayTabs} onChange={(event) => setShowWeekDayTabs(event.target.checked)} />
          </div>
          {showWeekDayTabs && (
            <div className="py-3">
              <div className="mb-2 text-sm">جهت نمایش روزهای هفته</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setWeekDayOrientation("horizontal")} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${weekDayOrientation === "horizontal" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                  <ViewWeek fontSize="small" /><span>افقی</span>{weekDayOrientation === "horizontal" && <Check fontSize="small" />}
                </button>
                <button type="button" onClick={() => setWeekDayOrientation("vertical")} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${weekDayOrientation === "vertical" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                  <ViewSidebar fontSize="small" /><span>عمودی</span>{weekDayOrientation === "vertical" && <Check fontSize="small" />}
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 py-2 dark:border-slate-700">
            <div><div className="text-sm">نمایش پیشرفت کارها</div><div className="mt-0.5 text-xs text-slate-400">نمایش نوار پیشرفت روز</div></div>
            <Switch checked={showTaskProgress} onChange={(event) => setShowTaskProgress(event.target.checked)} />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 py-2 dark:border-slate-700">
            <div><div className="text-sm">نمایش زمان کارها</div><div className="mt-0.5 text-xs text-slate-400">نمایش ساعت تعیین‌شده برای هر کار</div></div>
            <Switch checked={showTaskTimes} onChange={(event) => setShowTaskTimes(event.target.checked)} />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 py-2 dark:border-slate-700">
            <div><div className="text-sm">نمایش دسته‌بندی‌ها</div><div className="mt-0.5 text-xs text-slate-400">نمایش انتخاب دسته‌بندی هنگام ایجاد کار و دسته‌بندی روی کارها</div></div>
            <Switch checked={showCategories} onChange={(event) => setShowCategories(event.target.checked)} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              {notificationsEnabled ? <NotificationsActiveIcon fontSize="small" /> : <NotificationsOffIcon fontSize="small" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">اعلان‌ها</div>
              <div className="mt-1 text-xs text-slate-400">{notificationsEnabled ? "اعلان‌های کارها فعال است." : "برای دریافت یادآوری کارها اعلان‌ها را فعال کنید."}</div>
            </div>
            {!notificationsEnabled && <button type="button" onClick={enableNotifications} className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700">فعال کردن</button>}
            {notificationsEnabled && <button type="button" onClick={disableNotifications} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">خاموش کردن</button>}
          </div>

          {notificationsEnabled && (
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
              <div className="mb-2"><div className="text-sm font-bold">زمان یادآوری</div><div className="mt-1 text-xs text-slate-400">مشخص کنید چند دقیقه قبل از زمان انجام کار اعلان نمایش داده شود.</div></div>
              <FormControl fullWidth size="small">
                <InputLabel id="notification-minutes-label">زمان یادآوری</InputLabel>
                <Select labelId="notification-minutes-label" value={notificationMinutesBefore} label="زمان یادآوری" onChange={(event) => setNotificationMinutesBefore(Number(event.target.value))}>
                  <MenuItem value={0}>هنگام رسیدن زمان</MenuItem><MenuItem value={5}>۵ دقیقه قبل</MenuItem><MenuItem value={10}>۱۰ دقیقه قبل</MenuItem><MenuItem value={15}>۱۵ دقیقه قبل</MenuItem><MenuItem value={30}>۳۰ دقیقه قبل</MenuItem><MenuItem value={60}>۱ ساعت قبل</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}

          <button type="button" onClick={() => showTaskNotification("کار جدید", "این یک اعلان آزمایشی از این کارته است.")} className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">ارسال اعلان آزمایشی</button>
        </section>
      </div>
    </main>
  );
}
