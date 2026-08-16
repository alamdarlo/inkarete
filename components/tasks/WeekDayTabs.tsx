"use client";

import { WeekDay } from "@/lib/db";
import { Box, Tab, Tabs } from "@mui/material";

type SelectedDay = WeekDay | "all";

type Props = {
  value: SelectedDay;
  onChange: (value: SelectedDay) => void;
};

const days: {
  value: WeekDay;
  label: string;
  shortLabel: string;
}[] = [
  { value: 0, label: "شنبه", shortLabel: "ش" },
  { value: 1, label: "یکشنبه", shortLabel: "ی" },
  { value: 2, label: "دوشنبه", shortLabel: "د" },
  { value: 3, label: "سه‌شنبه", shortLabel: "س" },
  { value: 4, label: "چهارشنبه", shortLabel: "چ" },
  { value: 5, label: "پنجشنبه", shortLabel: "پ" },
  { value: 6, label: "جمعه", shortLabel: "ج" },
];

const getTodayIndex = (): WeekDay => {
  const day = new Date().getDay();

  return day === 6 ? 0 : ((day + 1) as WeekDay);
};

export default function WeekDayTabs({
  value,
  onChange,
}: Props) {
  const today = getTodayIndex();

  return (
    <Box
      sx={{
    width: { xs: 44, sm: 52 },
    flexShrink: 0,
    borderRadius: 2,
    backgroundColor: "rgb(248 250 252)",
    border: "1px solid rgb(226 232 240)",

    "@media (prefers-color-scheme: dark)": {
      backgroundColor: "rgb(30 41 59)",
      borderColor: "rgb(51 65 85)",
    },
  }}
    >
      <Tabs
        orientation="vertical"
        value={value}
        onChange={(_, newValue) =>
          onChange(newValue as SelectedDay)
        }
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: "auto",

          "& .MuiTabs-indicator": {
            right: 0,
            left: "auto",
            width: 3,
            borderRadius: "3px 0 0 3px",
            backgroundColor: "rgb(79 70 229)",
          },

          "& .MuiTab-root": {
            minWidth: 0,
            width: "100%",
            minHeight: 44,
            padding: 0,
            fontSize: { xs: 12, sm: 13 },
            fontWeight: 500,
            color: "rgb(100 116 139)",
            transition: "all 0.2s ease",

            "@media (prefers-color-scheme: dark)": {
              color: "rgb(236 238 241);",
            },

            "&:hover": {
              color: "rgb(51 65 85)",
              backgroundColor: "rgb(248 250 252)",

              "@media (prefers-color-scheme: dark)": {
                color: "rgb(226 232 240)",
                backgroundColor: "rgb(51 65 85)",
              },
            },

            "&.Mui-selected": {
              color: "rgb(79 70 229)",
              fontWeight: 700,

              "@media (prefers-color-scheme: dark)": {
                color: "rgb(129 140 248)",
              },
            },
          },
        }}
      >
        <Tab value="all" label="همه" />

        {days.map((day) => (
          <Tab
            key={day.value}
            value={day.value}
            label={
              <>
                <Box
                  component="span"
                  sx={{
                    display: { xs: "inline", sm: "none" },
                  }}
                >
                  {day.shortLabel}
                </Box>

                <Box
                  component="span"
                  sx={{
                    display: { xs: "none", sm: "inline" },
                  }}
                >
                  {day.label}
                </Box>
              </>
            }
            sx={{
              position: "relative",

              "&::after":
                day.value === today
                  ? {
                      content: '""',
                      position: "absolute",
                      top: 7,
                      left: 7,
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: "rgb(16 185 129)",
                    }
                  : undefined,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}