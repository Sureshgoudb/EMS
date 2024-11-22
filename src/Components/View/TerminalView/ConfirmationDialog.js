import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { styled } from "@mui/material/styles";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "12px",
    background: "linear-gradient(135deg, #ffffff, #f7f8fc)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    padding: theme.spacing(2),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1, 3),
  textTransform: "none",
  fontWeight: "bold",
  "&:hover": {
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
}));

const ConfirmationDialog = ({ open, onConfirm, onCancel, children }) => {
  return (
    <StyledDialog open={open} onClose={onCancel}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: "bold",
        }}
      >
        <WarningIcon color="error" />
        <Typography variant="h6" component="div">
          Confirmation
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          {children}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end" }}>
        <StyledButton onClick={onCancel} variant="outlined" color="primary">
          Cancel
        </StyledButton>
        <StyledButton onClick={onConfirm} variant="contained" color="error">
          Confirm
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ConfirmationDialog;
