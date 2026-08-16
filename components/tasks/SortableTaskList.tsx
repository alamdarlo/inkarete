"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { DragIndicator, DeleteOutlined } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Task, CategoryItem } from "@/lib/db";

type Props = {
  tasks: Task[];

  categories: CategoryItem[];

  onToggle: (task: Task) => void;

  onDelete: (task: Task) => void;

  onReorder: (activeId: number, overId: number) => void;
};

type SortableTaskProps = {
  task: Task;

  category?: CategoryItem;

  onToggle: (task: Task) => void;

  onDelete: (task: Task) => void;
};

// -----------------------------
// Swipe Threshold
// -----------------------------

const SWIPE_DELETE_THRESHOLD = 100;

// -----------------------------
// Sortable Task
// -----------------------------

function SortableTask({
  task,
  category,
  onToggle,
  onDelete,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id!,
  });

  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const pointerStart = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const pointerDirection = useRef<"horizontal" | "vertical" | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    pointerDirection.current = null;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!pointerStart.current) {
      return;
    }

    const deltaX = event.clientX - pointerStart.current.x;

    const deltaY = event.clientY - pointerStart.current.y;

    if (!pointerDirection.current) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
        return;
      }

      pointerDirection.current =
        Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    if (pointerDirection.current !== "horizontal") {
      return;
    }

    if (deltaX < 0) {
      setSwiping(true);
      setSwipeX(Math.max(deltaX, -SWIPE_DELETE_THRESHOLD));
    }
  };

  const handlePointerUp = async (event: React.PointerEvent<HTMLElement>) => {
    if (!pointerStart.current) {
      return;
    }

    const deltaX = event.clientX - pointerStart.current.x;

    if (
      pointerDirection.current === "horizontal" &&
      deltaX <= -SWIPE_DELETE_THRESHOLD
    ) {
      setSwipeX(-500);

      await new Promise((resolve) => setTimeout(resolve, 180));

      onDelete(task);
    } else {
      setSwipeX(0);
    }

    setSwiping(false);
    pointerStart.current = null;
    pointerDirection.current = null;
  };

  const handlePointerCancel = () => {
    setSwipeX(0);
    setSwiping(false);
    pointerStart.current = null;
    pointerDirection.current = null;
  };

  const style = {
    transform:
      swipeX !== 0
        ? `translateX(${swipeX}px)`
        : CSS.Transform.toString(transform),
    transition: swiping ? "none" : transition,
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete Background */}

      {swiping && swipeX < 0 && (
        <div className="absolute inset-0 flex items-center justify-start rounded-xl bg-red-500 px-5 text-white">
          <DeleteOutlined />
        </div>
      )}

      {/* Task */}

      <article
        ref={setNodeRef}
        style={style}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`relative rounded-xl bg-white p-3 text-slate-800 shadow-sm transition dark:bg-slate-800 dark:text-slate-100 ${
          isDragging ? "z-10 opacity-70 shadow-lg" : "hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle */}

          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="جابجایی کار"
            title="جابجایی کار"
            className="
              flex
              h-8
              w-8
              shrink-0
              cursor-grab
              touch-none
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-600
              active:cursor-grabbing
              dark:text-slate-500
              dark:hover:bg-slate-700
              dark:hover:text-slate-300
            "
          >
            <DragIndicator fontSize="small" />
          </button>

          {/* Checkbox */}

          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task)}
            className="h-4 w-4 shrink-0 accent-emerald-500"
          />

          {/* Task Content */}

          <div className="min-w-0 flex-1">
            {/* Title + Category */}

            <div className="flex min-w-0 items-center justify-between gap-3">
              <span
                className={`min-w-0 truncate text-sm ${
                  task.completed
                    ? "text-slate-400 line-through dark:text-slate-500"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {task.title}
              </span>

              {category && (
                <span className="shrink-0 truncate text-xs text-slate-400 dark:text-slate-500">
                  {category.name}
                </span>
              )}
            </div>

            {/* Scheduled Times */}

            {task.scheduledTimes?.length > 0 && (
              <div
                dir="ltr"
                className="mt-1 flex flex-wrap items-center justify-start gap-1"
              >
                <AccessTimeIcon
                  sx={{
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                />

                {task.scheduledTimes.map((time) => (
                  <span
                    key={time}
                    className="
                    inline-flex
                    items-center
                    rounded-md
                    border
                    border-slate-200
                    bg-slate-50
                    px-1.5
                    py-0.5
                    text-[11px]
                    font-medium
                    text-slate-500
                    dark:border-slate-600
                    dark:bg-slate-700/70
                    dark:text-slate-300
                  "
                  >
                    {time}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

// -----------------------------
// Sortable Task List
// -----------------------------

export default function SortableTaskList({
  tasks,
  categories,
  onToggle,
  onDelete,
  onReorder,
}: Props) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) {
      return;
    }

    onReorder(Number(active.id), Number(over.id));
  };

  if (tasks.length === 0) {
    return (
      <div
        className="
          rounded-xl
          bg-white
          p-6
          text-center
          text-sm
          text-slate-400
          shadow-sm
          dark:bg-slate-800
          dark:text-slate-500
        "
      >
        هنوز کاری اضافه نکردی 🙂
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((task) => task.id!)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tasks.map((task) => {
            const category = categories.find(
              (item) => item.id === task.categoryId,
            );

            return (
              <SortableTask
                key={task.id}
                task={task}
                category={category}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
