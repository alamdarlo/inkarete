"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

type Props = {
  open: boolean;
  categoryName: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function EditCategoryDialog({
  open,
  categoryName,
  onChange,
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
        ویرایش دسته‌بندی
      </DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          value={categoryName}
          onChange={(event) =>
            onChange(event.target.value)
          }
          label="نام دسته‌بندی"
          margin="dense"
          variant="outlined"
        />
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
          disabled={!categoryName.trim()}
        >
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}