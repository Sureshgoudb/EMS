import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const LeftDrawerDialog = ({ open, onClose, title, children }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      transitionDuration={{ enter: 500, exit: 500 }}
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      onClose={onClose}
      PaperProps={{
        sx: {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          height: "100vh",
          margin: 0,
          padding: 0,
          maxHeight: "100%",
          maxWidth: "49%",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#007c89",
          color: "#fff",
          borderBottom: "1px solid gainsboro",
          padding: "8px 16px",
          marginBottom: "10px",
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1, marginBottom: 0 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: "16px" }}>{children}</DialogContent>
    </Dialog>
  );
};

export default LeftDrawerDialog;
