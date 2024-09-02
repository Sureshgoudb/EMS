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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const RightDrawerDialog = ({
  open,
  onClose,
  title,
  children,
  isChatDialog,
}) => {
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
          right: 0,
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
        {isChatDialog && (
          <IconButton
            onClick={onClose}
            sx={{ color: "#fff", marginLeft: "-15px" }}
          >
            <ChevronLeftIcon n sx={{ fontSize: 30 }} />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1, marginBottom: 0 }}>
          {title}
        </Typography>
        {!isChatDialog && (
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ px: "16px" }}>{children}</DialogContent>
    </Dialog>
  );
};

export default RightDrawerDialog;
