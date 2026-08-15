"use client";

import { useState } from "react";
import { Menu } from "@mui/icons-material";
import AppDrawer from "@/components/navigation/AppDrawer";

export default function AppMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="باز کردن منو"
        title="منو"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Menu fontSize="small" />
      </button>

      <AppDrawer
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}