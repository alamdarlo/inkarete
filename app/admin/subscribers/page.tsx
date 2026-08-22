"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

type Subscriber = {
  endpoint: string;
  notificationEnabled: boolean;
  subscriptionStatus: "active" | "unknown" | "invalid";
  createdAt: number;
  lastSeenAt: number;
  lastPushAt: number | null;
  lastPushSuccessAt: number | null;
  lastPushFailureAt: number | null;
};

function formatDate(value: number | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(value);
}

function endpointLabel(endpoint: string) {
  try {
    return new URL(endpoint).origin;
  } catch {
    return endpoint.slice(0, 48);
  }
}

export default function SubscribersAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/subscribers", { cache: "no-store" });
      if (!response.ok) throw new Error("خطا در دریافت Subscriberها");
      const data = (await response.json()) as { subscribers: Subscriber[] };
      setSubscribers(data.subscribers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای نامشخص");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscribers();
  }, [loadSubscribers]);

  const stats = useMemo(() => ({
    total: subscribers.length,
    enabled: subscribers.filter((item) => item.notificationEnabled).length,
    disabled: subscribers.filter((item) => !item.notificationEnabled).length,
    active: subscribers.filter((item) => item.subscriptionStatus === "active").length,
    unknown: subscribers.filter((item) => item.subscriptionStatus === "unknown").length,
    invalid: subscribers.filter((item) => item.subscriptionStatus === "invalid").length,
  }), [subscribers]);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 px-3 py-4 text-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:px-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">مدیریت Subscriberها</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">وضعیت Web Push و چرخه عمر Subscriberها</p>
          </div>
          <button type="button" onClick={() => void loadSubscribers()} disabled={loading} className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <RefreshIcon fontSize="small" />
            بروزرسانی
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="کل" value={stats.total} />
          <Stat label="اعلان روشن" value={stats.enabled} />
          <Stat label="اعلان خاموش" value={stats.disabled} />
          <Stat label="Active" value={stats.active} />
          <Stat label="Unknown" value={stats.unknown} />
          <Stat label="Invalid" value={stats.invalid} />
        </div>

        {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">در حال دریافت اطلاعات...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">هنوز Subscriberای ثبت نشده است.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {subscribers.map((subscriber) => (
                <article key={subscriber.endpoint} className="p-3 sm:p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="max-w-full truncate text-sm font-medium" title={subscriber.endpoint}>{endpointLabel(subscriber.endpoint)}</span>
                        <StatusBadge status={subscriber.subscriptionStatus} />
                        {subscriber.notificationEnabled ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><NotificationsActiveIcon sx={{ fontSize: 14 }} />اعلان روشن</span> : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500 dark:bg-slate-700 dark:text-slate-300"><NotificationsOffIcon sx={{ fontSize: 14 }} />اعلان خاموش</span>}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 sm:grid-cols-4">
                        <span>ثبت: {formatDate(subscriber.createdAt)}</span>
                        <span>آخرین مشاهده: {formatDate(subscriber.lastSeenAt)}</span>
                        <span>آخرین Push: {formatDate(subscriber.lastPushAt)}</span>
                        <span>آخرین موفق: {formatDate(subscriber.lastPushSuccessAt)}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 lg:text-left">
                      آخرین خطا: {formatDate(subscriber.lastPushFailureAt)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-3 text-[11px] text-slate-400">این پنل فعلاً عمومی است. در مرحله بعد Authorization، Role و Permission به آن اضافه می‌شود.</p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"><div className="text-[11px] text-slate-400">{label}</div><div className="mt-1 text-lg font-bold">{value}</div></div>;
}

function StatusBadge({ status }: { status: Subscriber["subscriptionStatus"] }) {
  const config = {
    active: { label: "Active", icon: CheckCircleOutlineIcon, className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
    unknown: { label: "Unknown", icon: HelpOutlineIcon, className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
    invalid: { label: "Invalid", icon: ErrorOutlineIcon, className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
  }[status];
  const Icon = config.icon;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${config.className}`}><Icon sx={{ fontSize: 14 }} />{config.label}</span>;
}
