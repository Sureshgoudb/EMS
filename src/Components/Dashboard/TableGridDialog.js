import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const TableGridDialog = ({
  open,
  onClose,
  onCreateGrid,
  selectedDashBoard,
}) => {
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  const handleCreate = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${apiKey}widget/table-grid`, {
        rows,
        columns,
        dashboardId: selectedDashBoard.id,
      });

      if (response.data) {
        onCreateGrid({
          controlId: response.data.widgetid,
          controlType: "TableGrid",
          name: response.data.name,
          label: response.data.label,
          position: "[4,4,0,0]",
          rows: rows,
          columns: columns,
          cells: response.data.parameters.find((p) => p.name === "cells")
            .defaultvalue,
        });
      }
    } catch (error) {
      console.error("Error creating table grid:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create Table Grid
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Rows"
              type="number"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Columns"
              type="number"
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Grid"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableGridDialog;
