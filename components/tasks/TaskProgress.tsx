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
    <section className="mb-1 rounded-lg bg-white px-3 py-1.5 shadow-sm dark:bg-slate-800">
      <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {/* Progress */}
        <div
          className="absolute inset-y-0 right-0 rounded-full bg-emerald-500 transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />

        {/* Counter */}
        <div className="relative z-10 flex h-full items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-100">
            {completed} / {total}
          </span>
        </div>
      </div>
    </section>
  );
}