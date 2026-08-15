"use client";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { DeleteOutlined } from "@mui/icons-material";

import { CSS } from "@dnd-kit/utilities";

import { Task, CategoryItem, Priority } from "@/lib/db";
import { IconButton } from "@mui/material";

type Props = {
  tasks: Task[];

  categories: CategoryItem[];

  onToggle: (task: Task) => void;

  onDelete: (task: Task) => void;

  onReorder: (
    activeId: number,
    overId: number,
  ) => void;
};

type SortableTaskProps = {
  task: Task;

  category?: CategoryItem;

  onToggle: (task: Task) => void;

  onDelete: (task: Task) => void;
};

// -----------------------------
// Priority Color
// -----------------------------

const priorityColor = (
  priority: Priority,
) => {
  if (priority === "high") {
    return "bg-red-500";
  }

  if (priority === "medium") {
    return "bg-yellow-400";
  }

  return "bg-green-500";
};

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

  const style = {
    transform: CSS.Transform.toString(
      transform,
    ),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`
        rounded-xl
        bg-white
        p-3
        shadow-sm
        transition
        ${
          isDragging
            ? "z-10 opacity-70 shadow-lg"
            : "hover:shadow-md"
        }
      `}
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        {/* Drag Handle */}

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="جابجایی کار"
          className="
            flex
            h-8
            w-8
            shrink-0
            cursor-grab
            items-center
            justify-center
            rounded-lg
            text-slate-400
            hover:bg-slate-100
            active:cursor-grabbing
          "
        >
          ⋮⋮
        </button>

        {/* Checkbox */}

        <input
          type="checkbox"
          checked={task.completed}
          onChange={() =>
            onToggle(task)
          }
          className="
            h-4
            w-4
            shrink-0
            accent-emerald-500
          "
        />

        {/* Task Content */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            {/* Priority */}

            <span
              title={
                task.priority === "high"
                  ? "اولویت زیاد"
                  : task.priority ===
                      "medium"
                    ? "اولویت متوسط"
                    : "اولویت کم"
              }
              className={`
                h-2.5
                w-2.5
                shrink-0
                rounded-full
                ${priorityColor(
                  task.priority,
                )}
              `}
            />

            {/* Title */}

            <span
              className={`
                truncate
                text-sm
                ${
                  task.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-700"
                }
              `}
            >
              {task.title}
            </span>
          </div>

          {/* Category */}

          {category && (
            <span
              className="
                mt-1
                inline-block
                max-w-full
                truncate
                text-xs
                text-slate-400
              "
            >
              {category.name}
            </span>
          )}
        </div>

        {/* Delete */}

<button
  type="button"
  onClick={() => onDelete(task)}
  aria-label={`حذف ${task.title}`}
  title="حذف"
  className="
    flex
    h-8
    w-8
    shrink-0
    items-center
    justify-center
    rounded-lg
    transition
    active:scale-95
  "
>
  <IconButton aria-label="edit" color="error">

  <DeleteOutlined fontSize="small" />
  </IconButton>
</button>
      </div>
    </article>
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
  const handleDragEnd = (
    event: DragEndEvent,
  ) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) {
      return;
    }

    onReorder(
      Number(active.id),
      Number(over.id),
    );
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
        "
      >
        هنوز کاری اضافه نکردی 🙂
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map(
          (task) => task.id!,
        )}
        strategy={
          verticalListSortingStrategy
        }
      >
        <div className="space-y-2">
          {tasks.map((task) => {
            const category =
              categories.find(
                (item) =>
                  item.id ===
                  task.categoryId,
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