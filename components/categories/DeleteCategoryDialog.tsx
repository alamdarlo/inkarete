"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

type Props = {
  open: boolean;

  categoryName: string;

  onClose: () => void;

  onConfirm: () => void;
};

export default function DeleteCategoryDialog({
  open,
  categoryName,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dir="rtl"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        حذف دسته‌بندی
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          آیا مطمئنی می‌خواهی دسته‌بندی{" "}
          <strong>
            «{categoryName}»
          </strong>{" "}
          را حذف کنی؟
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          انصراف
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          autoFocus
        >
          حذف
        </Button>
      </DialogActions>
    </Dialog>
  );
}