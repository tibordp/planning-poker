import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface ConfirmationDialogOptions {
  onConfirm: () => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmationDialog({
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
}: ConfirmationDialogOptions): [() => void, React.ReactElement] {
  const [open, setOpen] = React.useState(false);

  function handleClose(confirmed: boolean) {
    setOpen(false);
    if (confirmed) {
      onConfirm();
    }
  }

  const callback = () => setOpen(true);
  const element = (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)} color="primary">
          {cancelText || "Cancel"}
        </Button>
        <Button onClick={() => handleClose(true)} color="primary" autoFocus>
          {confirmText || "Ok"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return [callback, element];
}
