"use client";

import { usePathname } from "next/navigation";
import AppMenu from "@/components/navigation/AppMenu";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";
import {
  AssignmentOutlined,
  CategoryOutlined,
  HistoryOutlined,
} from "@mui/icons-material";

const pageConfig = {
  "/": {
    title: "این کارته",
    subtitle: "مدیریت کارها",
    icon: AssignmentOutlined,
  },

  "/categories": {
    title: "دسته‌بندی‌ها",
    subtitle: "مدیریت دسته‌بندی‌های کارها",
    icon: CategoryOutlined,
  },

  "/history": {
    title: "تاریخچه کارها",
    subtitle: "فعالیت‌های انجام‌شده",
    icon: HistoryOutlined,
  },
};

export default function AppHeader() {
  const pathname = usePathname();

  const config =
    pageConfig[pathname as keyof typeof pageConfig] ??
    pageConfig["/"];

  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      {/* Menu - Right */}

      <div className="shrink-0">
        <AppMenu />
              <div className="mt-2 flex items-center justify-end">
                <Link
                  href="/settings"
                  aria-label="تنظیمات"
                  title="تنظیمات"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-500
                    transition
                    hover:bg-white
                    hover:text-slate-700
                    dark:text-slate-400
                    dark:hover:bg-slate-800
                    dark:hover:text-slate-200
                  "
                >
                  <SettingsIcon fontSize="small" />
                </Link>
              </div>
      </div>

      {/* Title - Left */}

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-left">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">
            {config.title}
          </h1>

          <p className="mt-0.5 truncate text-center text-xs text-slate-500 dark:text-slate-400">
            {config.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}