"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

type Props = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
};

export default function CategorySelect({
  value,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const categories =
    useLiveQuery(
      () =>
        db.categories
          .orderBy("createdAt")
          .toArray(),
      [],
    ) || [];

  const selected = categories.find(
    (category) =>
      category.id === value,
  );

  // -----------------------------
  // Close on outside click
  // -----------------------------

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

  // -----------------------------
  // Select Category
  // -----------------------------

  const handleSelect = (
    categoryId: number,
  ) => {
    onChange(categoryId);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Selected Category */}

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
        <span>
          {selected?.name ?? "انتخاب دسته"}
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
            min-w-36
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
          {categories.length === 0 ? (
            <div
              className="
                px-3
                py-2
                text-center
                text-sm
                text-slate-400
                dark:text-slate-500
              "
            >
              دسته‌ای وجود ندارد
            </div>
          ) : (
            categories.map((category) => {
              if (!category.id) {
                return null;
              }

              const isSelected =
                category.id === value;

              return (
                <button
                  key={category.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() =>
                    handleSelect(
                      category.id!,
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    transition
                    ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}