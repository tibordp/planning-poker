import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export function useConfirmationDialog({ onConfirm, title, description, confirmText, cancelText }) {
  const [open, setOpen] = React.useState(false);

  function handleClose(confirmed) {
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
