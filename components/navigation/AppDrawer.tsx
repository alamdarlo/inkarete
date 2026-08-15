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
            bgcolor: "background.paper",
            color: "text.primary",
          },
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
        }}
        role="presentation"
      >
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Box
            sx={{
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            این کارته
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="بستن منو"
          >
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Navigation */}

        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/")}
            >
              <ListItemIcon>
                <Home />
              </ListItemIcon>

              <ListItemText className="text-right"
                primary="کارهای امروز"
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                navigate("/categories")
              }
            >
              <ListItemIcon>
                <Category />
              </ListItemIcon>

              <ListItemText className="text-right"
                primary="دسته‌بندی‌ها"
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                navigate("/history")
              }
            >
              <ListItemIcon>
                <History />
              </ListItemIcon>

              <ListItemText className="text-right"
                primary="تاریخچه"
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}