"use client";

type Props = {
  onClose: () => void;
};

export default function IOSInstallGuide({
  onClose,
}: Props) {
  return (
    <div
      className="
      mb-4
      overflow-hidden
      rounded-2xl
      border
      border-amber-200
      bg-amber-50
      p-5
      shadow-lg
      "
    >
      <div
        className="
        flex
        items-start
        justify-between
        gap-4
        "
      >
        <div>

          <h2
            className="
            text-lg
            font-bold
            text-amber-900
            "
          >
            🍎 نصب برنامه روی آیفون
          </h2>

          <p
            className="
            mt-2
            text-sm
            leading-7
            text-amber-800
            "
          >
            برای نصب برنامه در Safari مراحل زیر را انجام دهید.
          </p>

        </div>

        <button
          onClick={onClose}
          aria-label="بستن"
          className="
          rounded-full
          p-2
          text-amber-700
          transition
          hover:bg-amber-100
          "
        >
          ✕
        </button>
      </div>

      <ol
        className="
        mt-5
        space-y-3
        pr-5
        text-sm
        text-amber-900
        list-decimal
        "
      >
        <li>
          پایین مرورگر روی دکمه
          <strong> Share </strong>
          بزن.
        </li>

        <li>
          گزینه
          <strong> Add to Home Screen </strong>
          را انتخاب کن.
        </li>

        <li>
          روی
          <strong> Add </strong>
          بزن تا برنامه روی صفحه اصلی نصب شود.
        </li>
      </ol>

      <div
        className="
        mt-6
        flex
        justify-end
        "
      >
        <button
          onClick={onClose}
          className="
          rounded-xl
          bg-amber-500
          px-5
          py-2
          text-sm
          font-medium
          text-white
          transition
          hover:bg-amber-600
          "
        >
          متوجه شدم
        </button>
      </div>
    </div>
  );
}