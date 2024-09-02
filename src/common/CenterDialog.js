import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const CenterDialog = ({ open, onClose, title, children }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Dialog open={open} fullScreen={fullScreen} onClose={onClose}>
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

export default CenterDialog;
