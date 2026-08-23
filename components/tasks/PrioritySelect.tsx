"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { Priority } from "@/lib/db";

type Props = {
  value: Priority;
  onChange: (value: Priority) => void;
  className?: string;
};

const options: { value: Priority; label: string; className: string }[] = [
  { value: "low", label: "کم", className: "bg-emerald-500" },
  { value: "medium", label: "متوسط", className: "bg-amber-500" },
  { value: "high", label: "زیاد", className: "bg-red-500" },
];

export default function PrioritySelect({ value, onChange, className }: Props) {
  const selected = options.find((item) => item.value === value) ?? options[1];

  return (
    <FormControl size="small" className={className} fullWidth>
      <InputLabel id="task-priority-label">اولویت</InputLabel>
      <Select
        labelId="task-priority-label"
        value={value}
        label="اولویت"
        onChange={(event) => onChange(event.target.value as Priority)}
        renderValue={() => (
          <span className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${selected.className}`} />
            <span>{selected.label}</span>
          </span>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${option.className}`} />
              <span>{option.label}</span>
            </span>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
