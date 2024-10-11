import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info"; // Importing the Info icon

const TableGridDialog = ({
  open,
  onClose,
  onSave,
  dashboardId,
  existingControl,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    terminals: [],
    scripts: [],
    ...existingControl, // Spread existing control data if editing
  });

  const handleSave = () => {
    const controlData = {
      controlId: existingControl
        ? existingControl.controlId
        : `grid-${Date.now()}`,
      controlType: "table-grid",
      name: formData.name,
      label: formData.label,
      terminals: formData.terminals,
      scripts: formData.scripts,
      bgcolor: formData.bgcolor || "#ffffff",
    };
    onSave(controlData);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#3f51b5",
          color: "#fff",
          textAlign: "center",
        }}
      >
        {existingControl ? "Edit" : "Create"} Table Grid
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: "#e0f7fa", // Light cyan background
                borderRadius: 1,
                border: "1px solid #00796b", // Darker border color
                display: "flex",
                alignItems: "center",
              }}
            >
              <Chip
                icon={<InfoIcon />}
                label="Note"
                sx={{
                  backgroundColor: "#00796b",
                  color: "#fff",
                  mr: 1,
                }}
              />
              <Typography variant="body2" color="textPrimary">
                All terminals and variables are pre-selected for the table grid
                view by default.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {existingControl ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableGridDialog;
