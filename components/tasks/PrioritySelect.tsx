"use client";

import { useEffect, useRef, useState } from "react";
import { Priority } from "@/lib/db";

type Props = {
  value: Priority;
  onChange: (value: Priority) => void;
  className?: string;
};

const priorityOptions: {
  value: Priority;
  label: string;
  color: string;
}[] = [
  {
    value: "low",
    label: "کم",
    color: "bg-green-500",
  },
  {
    value: "medium",
    label: "متوسط",
    color: "bg-yellow-400",
  },
  {
    value: "high",
    label: "زیاد",
    color: "bg-red-500",
  },
];

export default function PrioritySelect({
  value,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selected =
    priorityOptions.find(
      (item) => item.value === value,
    ) ?? priorityOptions[1];

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const handleSelect = (
    priority: Priority,
  ) => {
    onChange(priority);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Selected Value */}

      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-2
          rounded-lg
          border
          border-slate-200
          bg-white
          px-3
          py-2
          text-sm
          text-slate-700
          outline-none
          transition
          focus:ring-2
          focus:ring-indigo-500
          dark:border-slate-600
          dark:bg-slate-700
          dark:text-slate-100
        "
      >
        <span className="flex items-center gap-2">
          <span
            className={`
              h-3
              w-3
              shrink-0
              rounded-full
              ${selected.color}
            `}
          />

          <span>
            {selected.label}
          </span>
        </span>

        <span
          className={`
            text-xs
            text-slate-400
            transition-transform
            dark:text-slate-300
            ${open ? "rotate-180" : ""}
          `}
        >
          ▾
        </span>
      </button>

      {/* Dropdown */}

      {open && (
        <div
          role="listbox"
          className="
            absolute
            right-0
            z-50
            mt-1
            w-full
            min-w-28
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            p-1
            shadow-lg
            dark:border-slate-600
            dark:bg-slate-800
          "
        >
          {priorityOptions.map(
            (option) => {
              const isSelected =
                option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() =>
                    handleSelect(
                      option.value,
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    text-slate-700
                    transition
                    dark:text-slate-100
                    ${
                      isSelected
                        ? "bg-slate-100 dark:bg-slate-700"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  <span
                    className={`
                      h-3
                      w-3
                      shrink-0
                      rounded-full
                      ${option.color}
                    `}
                  />

                  <span>
                    {option.label}
                  </span>
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}