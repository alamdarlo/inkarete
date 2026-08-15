"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

type ActionFilter = "all" | "created" | "completed" | "deleted" | "updated";

type DateFilter = "all" | "today" | "week" | "month";

const actionLabels = {
  created: "ساخته شد",

  completed: "انجام شد",

  deleted: "حذف شد",

  updated: "ویرایش شد",
};

export default function HistoryPage() {
  const [actionFilter, setActionFilter] = useState<ActionFilter>("created");

  const [dateFilter, setDateFilter] = useState<DateFilter>("today");

  const history =
    useLiveQuery(
      () => db.history.orderBy("createdAt").reverse().toArray(),

      [],
    ) || [];

  const checkDate = (time: number) => {
    if (dateFilter === "all") return true;

    const now = Date.now();

    const day = 24 * 60 * 60 * 1000;

    if (dateFilter === "today") {
      return new Date(time).toDateString() === new Date().toDateString();
    }

    if (dateFilter === "week") {
      return time > now - 7 * day;
    }

    if (dateFilter === "month") {
      return time > now - 30 * day;
    }

    return true;
  };

  const filtered = history.filter((item) => {
    const actionOk = actionFilter === "all" || item.action === actionFilter;

    return actionOk && checkDate(item.createdAt);
  });

  return (
    <main
      dir="rtl"
      className="
min-h-screen
bg-slate-100
px-3
py-5
sm:px-5
"
    >
      <div
        className="
mx-auto
max-w-xl
"
      >
        <section
          className="
mb-3
rounded-xl
bg-white
p-3
shadow-sm
"
        >
          <h2
            className="
mb-2
text-sm
font-bold
text-slate-700
"
          >
            نوع فعالیت
          </h2>

          <div
            className="
flex
flex-wrap
gap-2
"
          >
            {[
              ["all", "همه"],
              ["created", "ساخته"],
              ["completed", "انجام"],
              ["updated", "ویرایش"],
              ["deleted", "حذف"],
            ].map(([id, title]) => (
              <button
                key={id}
                onClick={() => setActionFilter(id as ActionFilter)}
                className={`
rounded-lg
px-3
py-1.5
text-xs
transition

${
  actionFilter === id
    ? "bg-indigo-600 text-white"
    : "bg-slate-100 text-slate-700"
}

`}
              >
                {title}
              </button>
            ))}
          </div>
        </section>

        <section
          className="
mb-4
rounded-xl
bg-white
p-3
shadow-sm
"
        >
          <h2
            className="
mb-2
text-sm
font-bold
text-slate-700
"
          >
            بازه زمانی
          </h2>

          <div
            className="
flex
flex-wrap
gap-2
"
          >
            {[
              ["all", "همه"],
              ["today", "امروز"],
              ["week", "۷ روز"],
              ["month", "۳۰ روز"],
            ].map(([id, title]) => (
              <button
                key={id}
                onClick={() => setDateFilter(id as DateFilter)}
                className={`
rounded-lg
px-3
py-1.5
text-xs

${
  dateFilter === id
    ? "bg-emerald-600 text-white"
    : "bg-slate-100 text-slate-700"
}

`}
              >
                {title}
              </button>
            ))}
          </div>
        </section>

        <section
          className="
space-y-2
"
        >
          {filtered.length === 0 && (
            <div
              className="
rounded-xl
bg-white
p-6
text-center
text-sm
text-slate-400
shadow-sm
"
            >
              تاریخی پیدا نشد 🙂
            </div>
          )}

          {filtered.map((item) => (
            <div
              key={item.id}
              className="
rounded-xl
bg-white
p-3
shadow-sm
"
            >
              <div
                className="
flex
items-center
justify-between
gap-3
"
              >
                <span
                  className="
truncate
text-sm
text-slate-700
"
                >
                  {item.title}
                </span>

                <span
                  className="
shrink-0
rounded-full
bg-slate-100
px-2
py-1
text-xs
text-slate-600
"
                >
                  {actionLabels[item.action]}
                </span>
              </div>

              <div
                className="
mt-2
text-xs
text-slate-400
"
              >
                {item.date}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
