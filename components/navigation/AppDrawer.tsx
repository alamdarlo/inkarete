"use client";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
} from "@mui/material";

import {
  Close,
  Home,
  Category,
  History,
} from "@mui/icons-material";

import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AppDrawer({
  open,
  onClose,
}: Props) {
  const router = useRouter();

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            backgroundColor: "var(--drawer-bg)",
            color: "var(--drawer-text)",
          },
          className:
            "bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100",
        },
      }}
    >
      <Box
        className="w-full"
        role="presentation"
      >
        {/* Header */}

        <Box className="flex items-center justify-between px-4 py-3">
          <Box className="text-lg font-bold text-slate-800 dark:text-slate-100">
            این کارته
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="بستن منو"
            className="text-slate-600 dark:text-slate-300"
          >
            <Close />
          </IconButton>
        </Box>

        <Divider className="border-slate-300 dark:border-s-taupe-50" />

        {/* Navigation */}

        <List className="px-2">
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/")}
              className="rounded-lg"
            >
              <ListItemIcon className="min-w-10 text-slate-600 dark:text-slate-300">
                <Home />
              </ListItemIcon>

              <ListItemText
                className="text-right"
                primary="کارهای امروز"
                slotProps={{
                  primary: {
                    className:
                      "text-slate-800 dark:text-slate-200",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/categories")}
              className="rounded-lg"
            >
              <ListItemIcon className="min-w-10 text-slate-600 dark:text-slate-300">
                <Category />
              </ListItemIcon>

              <ListItemText
                className="text-right"
                primary="دسته‌بندی‌ها"
                slotProps={{
                  primary: {
                    className:
                      "text-slate-800 dark:text-slate-200",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/history")}
              className="rounded-lg"
            >
              <ListItemIcon className="min-w-10 text-slate-600 dark:text-slate-300">
                <History />
              </ListItemIcon>

              <ListItemText
                className="text-right"
                primary="تاریخچه"
                slotProps={{
                  primary: {
                    className:
                      "text-slate-800 dark:text-slate-200",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}