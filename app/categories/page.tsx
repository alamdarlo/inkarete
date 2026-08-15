"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import DeleteCategoryDialog from "@/components/categories/DeleteCategoryDialog";
import EditCategoryDialog from "@/components/categories/EditCategoryDialog";

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const categories =
    useLiveQuery(() => db.categories.orderBy("createdAt").toArray(), []) || [];

  const addCategory = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    const exists = categories.some(
      (category) =>
        category.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (exists) return;

    await db.categories.add({
      name: trimmedName,
      createdAt: Date.now(),
    });

    setName("");
  };

  // -----------------------------
  // Delete Category
  // -----------------------------

  const requestDeleteCategory = (id: number, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteId) return;

    const tasks = await db.tasks.where("categoryId").equals(deleteId).count();

    if (tasks > 0) {
      alert("این دسته‌بندی دارای کار است و نمی‌توان آن را حذف کرد.");

      setDeleteId(null);
      setDeleteName("");

      return;
    }

    await db.categories.delete(deleteId);

    setDeleteId(null);
    setDeleteName("");
  };

  const requestEditCategory = (id: number, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const confirmEditCategory = async () => {
    if (!editId) return;

    const trimmedName = editName.trim();

    if (!trimmedName) return;

    const exists = categories.some(
      (category) =>
        category.id !== editId &&
        category.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (exists) {
      alert("دسته‌بندی دیگری با این نام وجود دارد.");

      return;
    }

    await db.categories.update(editId, {
      name: trimmedName,
    });

    setEditId(null);
    setEditName("");
  };

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
        {/* Add Category */}

        <section
          className="
            mb-4
            rounded-xl
            bg-white
            p-3
            shadow-sm
          "
        >
          <div
            className="
              flex
              gap-2
            "
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCategory();
                }
              }}
              placeholder="نام دسته‌بندی جدید..."
              className="
                min-w-0
                flex-1
                rounded-lg
                border
                px-3
                py-2
                text-sm
                outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
            />

            <button
              type="button"
              onClick={addCategory}
              disabled={!name.trim()}
              className="
                shrink-0
                rounded-lg
                bg-indigo-600
                px-4
                py-2
                text-sm
                text-white
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              افزودن
            </button>
          </div>
        </section>

        {/* Categories */}

        <section
          className="
            overflow-hidden
            rounded-xl
            bg-white
            shadow-sm
          "
        >
          {categories.length === 0 ? (
            <div
              className="
                p-6
                text-center
                text-sm
                text-slate-400
              "
            >
              هنوز دسته‌بندی‌ای ایجاد نکرده‌ای.
            </div>
          ) : (
            <div>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="
      flex
      items-center
      justify-between
      gap-3
      border-b
      border-slate-100
      px-4
      py-3
      last:border-b-0
    "
                >
                  {/* Category Name */}

                  <span
                    className="
        min-w-0
        truncate
        text-sm
        font-medium
        text-slate-700
      "
                  >
                    {category.name}
                  </span>

                  {/* Actions */}

                  <div
                    className="
        flex
        shrink-0
        items-center
        gap-2
      "
                  >
                    {/* Edit */}

                    <button
                      type="button"
                      onClick={() =>
                        requestEditCategory(category.id!, category.name)
                      }
                      aria-label={`ویرایش دسته ${category.name}`}
                      title="ویرایش دسته"
                      className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-indigo-100
          text-indigo-600
          transition
          hover:bg-indigo-200
          active:scale-95
        "
                    >
                      ✏️
                    </button>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={() =>
                        requestDeleteCategory(category.id!, category.name)
                      }
                      aria-label={`حذف دسته ${category.name}`}
                      title="حذف دسته"
                      className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-red-100
          text-red-600
          transition
          hover:bg-red-200
          active:scale-95
        "
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <DeleteCategoryDialog
        open={deleteId !== null}
        categoryName={deleteName}
        onClose={() => {
          setDeleteId(null);
          setDeleteName("");
        }}
        onConfirm={confirmDeleteCategory}
      />
      <EditCategoryDialog
        open={editId !== null}
        categoryName={editName}
        onChange={setEditName}
        onClose={() => {
          setEditId(null);
          setEditName("");
        }}
        onConfirm={confirmEditCategory}
      />
    </main>
  );
}
