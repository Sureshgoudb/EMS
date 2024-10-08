import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";

// Dummy data for dropdowns
const primaryCategories = ["Category1", "Category2"];
const secondaryCategories = ["SubCategory1", "SubCategory2"];
const terinaryCategories = ["TerinaryCategory1", "TerinaryCategory2"];
const scriptNames = ["Script1", "Script2"];
const terminalNames = ["Terminal1", "Terminal2"];

const ColumnCreationDialog = ({ open, onClose, onAddColumn }) => {
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [terinaryCategory, setTerinaryCategory] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [terminalName, setTerminalName] = useState("");
  const [areaGraph, setAreaGraph] = useState(false);

  const handleAddColumn = () => {
    const newColumn = {
      primaryCategory,
      secondaryCategory,
      terinaryCategory,
      scriptName,
      terminalName,
      areaGraph,
    };
    onAddColumn(newColumn);
    onClose();
  };

  // Function to handle the format dialog (place holder)
  const handleOpenFormatDialog = () => {
    // Logic to open format dialog
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Column</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              sx={{ mt: 2 }}
              select
              fullWidth
              label="Primary Category"
              value={primaryCategory}
              onChange={(e) => setPrimaryCategory(e.target.value)}
            >
              {primaryCategories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Secondary Category"
              value={secondaryCategory}
              onChange={(e) => setSecondaryCategory(e.target.value)}
            >
              {secondaryCategories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Terinary Category"
              value={terinaryCategory}
              onChange={(e) => setTerinaryCategory(e.target.value)}
            >
              {terinaryCategories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Script Name"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
            >
              {scriptNames.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Terminal Name"
              value={terminalName}
              onChange={(e) => setTerminalName(e.target.value)}
            >
              {terminalNames.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={areaGraph}
                  onChange={(e) => setAreaGraph(e.target.checked)}
                  sx={{ color: "#007c89" }}
                />
              }
              label={
                <Typography sx={{ color: "#007c89" }}>Area Graph</Typography>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                bgcolor: "white",
                borderRadius: 1,
                p: 2,
                border: "1px solid #007c89",
              }}
            >
              <Typography variant="subtitle1" sx={{ mr: 2, color: "#007c89" }}>
                Properties
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  mr: 1,
                  borderColor: "#007c89",
                  color: "#007c89",
                  "&:hover": {
                    borderColor: "#005f6a",
                    color: "#005f6a",
                  },
                }}
              >
                Default
              </Button>
              <Tooltip title="Change widget format">
                <Button
                  variant="outlined"
                  onClick={handleOpenFormatDialog}
                  sx={{
                    borderColor: "#007c89",
                    color: "#007c89",
                    "&:hover": {
                      borderColor: "#005f6a",
                      color: "#005f6a",
                    },
                  }}
                >
                  Change Format
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{
            borderColor: "rgba(255, 0, 0, 0.7)",
            color: "rgba(255, 0, 0, 0.7)",
            "&:hover": {
              borderColor: "red",
              color: "red",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddColumn}
          variant="contained"
          sx={{
            bgcolor: "#007c89",
            color: "white",
            "&:hover": { bgcolor: "#005f6a" },
          }}
        >
          Add Column
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnCreationDialog;
