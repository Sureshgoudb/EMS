import React, { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

const NestedModal = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <div>
      <button onClick={handleOpen}>Open Parent Modal</button>
      <Dialog
        open={open}
        maxWidth="md"
        onClose={handleClose}
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            position: "absolute",
            top: 0,
            right: 0,
            margin: 0,
          },
        }}
      >
        <DialogTitle>
          Parent Modal Title
          <IconButton edge="end" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent></DialogContent>
      </Dialog>
    </div>
  );
};

export default NestedModal;
