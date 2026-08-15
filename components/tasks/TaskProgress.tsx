"use client";

type Props = {
  completed: number;
  total: number;
};

export default function TaskProgress({
  completed,
  total,
}: Props) {
  const progress =
    total > 0
      ? (completed / total) * 100
      : 0;

  return (
    <section className="mb-4 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
      <div className="mb-2 flex justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>پیشرفت امروز</span>

        <span>
          {completed} / {total}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </section>
  );
}