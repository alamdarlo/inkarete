"use client";

import { useState } from "react";
import {
  Box,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/Delete";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

export default function TimeSelect({
  value,
  onChange,
}: Props) {
  const [anchorEl, setAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  const [newTime, setNewTime] = useState("");

  const open = Boolean(anchorEl);

  const handleOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const addTime = () => {
    if (!newTime) return;

    if (value.includes(newTime)) return;

    onChange(
      [...value, newTime].sort(),
    );

    setNewTime("");
  };

  const removeTime = (time: string) => {
    onChange(
      value.filter(
        (item) => item !== time,
      ),
    );
  };

  return (
    <>
      <IconButton
        type="button"
        onClick={handleOpen}
        aria-label="تنظیم زمان"
        title="تنظیم زمان"
        sx={{
          width: 40,
          height: 40,
          color: "grey.700",

          "&:hover": {
            color: "grey.800",
            backgroundColor: "action.hover",
          },

          ".dark &": {
            color: "grey.400",

            "&:hover": {
              color: "grey.300",
              backgroundColor: "rgba(255,255,255,0.08)",
            },
          },
        }}
      >
        <AccessTimeIcon fontSize="small" />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 280,
              borderRadius: 2,
              p: 2,

              backgroundColor: "#ffffff",
              color: "#0f172a",

              border: "1px solid #e2e8f0",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.12)",

              ".dark &": {
                backgroundColor: "#1e293b",
                color: "#f1f5f9",
                borderColor: "#475569",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.35)",
              },
            },
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1.5,
            fontWeight: 700,
            color: "#0f172a",

            ".dark &": {
              color: "#f1f5f9",
            },
          }}
        >
          زمان انجام کار
        </Typography>

        {value.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 1.5,
            }}
          >
            {value.map((time) => (
              <Box
                key={time}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.5,

                  backgroundColor: "#f1f5f9",

                  ".dark &": {
                    backgroundColor: "#334155",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    direction: "ltr",
                    color: "#334155",

                    ".dark &": {
                      color: "#e2e8f0",
                    },
                  }}
                >
                  {time}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() =>
                    removeTime(time)
                  }
                  aria-label={`حذف ساعت ${time}`}
                  sx={{
                    color: "#64748b",

                    "&:hover": {
                      color: "error.main",
                      backgroundColor:
                        "rgba(239,68,68,0.08)",
                    },

                    ".dark &": {
                      color: "#94a3b8",
                    },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TextField
            type="time"
            value={newTime}
            onChange={(event) =>
              setNewTime(event.target.value)
            }
            size="small"
            fullWidth
            sx={{
              "& input": {
                color: "#0f172a",
              },

              "& input::-webkit-calendar-picker-indicator": {
                cursor: "pointer",
              },

              "& .MuiOutlinedInput-root": {
                backgroundColor: "#ffffff",

                "& fieldset": {
                  borderColor: "#cbd5e1",
                },

                "&:hover fieldset": {
                  borderColor: "#94a3b8",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },

              ".dark &": {
                "& input": {
                  color: "#f1f5f9",
                },

                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#334155",

                  "& fieldset": {
                    borderColor: "#64748b",
                  },

                  "&:hover fieldset": {
                    borderColor: "#94a3b8",
                  },
                },

                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1)",
                },
              },
            }}
          />

          <IconButton
            onClick={addTime}
            disabled={!newTime}
            color="primary"
            aria-label="افزودن ساعت"
            title="افزودن ساعت"
          >
            <AddIcon />
          </IconButton>
        </Box>

        {value.length === 0 && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: "#64748b",

              ".dark &": {
                color: "#94a3b8",
              },
            }}
          >
            هنوز ساعتی برای این کار تعیین نشده است.
          </Typography>
        )}
      </Popover>
    </>
  );
}