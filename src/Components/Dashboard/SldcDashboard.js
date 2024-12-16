import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import {
  TextFields as TextFieldsIcon,
  Numbers as NumbersIcon,
  BarChart as BarChartIcon,
  GridView as GridViewIcon,
} from "@mui/icons-material";
import axios from "axios";

const SldcDashboard = () => {
  const [open, setOpen] = useState(false);
  const [widgetType, setWidgetType] = useState("");
  const [formData, setFormData] = useState({
    type: "",
    terminal: { terminalId: "", terminalName: "" },
    customText: "",
    script: [
      {
        scriptName: "",
        decimalPlaces: 2,
        displayName: "",
        unit: "",
        properties: {
          fontFamily: "Arial",
          fontWeight: "normal",
          fontColor: "#000000",
          backgroundColor: "#FFFFFF",
        },
        position: {
          x: 0,
          y: 0,
          width: 100,
          height: 50,
        },
      },
    ],
    graphType: "",
    xAxisConfig: "",
    resetInterval: 0,
    columns: [{ name: "", field: "" }],
    profile: "",
  });

  const handleOpen = (type) => {
    setWidgetType(type);
    setFormData((prevData) => ({
      ...prevData,
      type,
      terminal: { terminalId: "", terminalName: "" },
      customText: "",
      script: [
        {
          scriptName: "",
          decimalPlaces: 2,
          displayName: "",
          unit: "",
          properties: {
            fontFamily: "Arial",
            fontWeight: "normal",
            fontColor: "#000000",
            backgroundColor: "#FFFFFF",
          },
          position: {
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
        },
      ],
      graphType: "",
      xAxisConfig: "",
      resetInterval: 0,
      columns: [{ name: "", field: "" }],
      profile: "",
    }));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setWidgetType("");
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    // Handle nested object updates
    const updateNestedState = (prevState, path, newValue) => {
      const keys = path.split(".");
      const newState = { ...prevState };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = newValue;
      return newState;
    };

    setFormData((prevData) => {
      // Handle array-based fields like script and columns
      if (index !== null) {
        if (name.startsWith("script.")) {
          const newScript = [...prevData.script];
          const scriptField = name.split(".")[1];
          newScript[index] = {
            ...newScript[index],
            [scriptField]: value,
          };
          return { ...prevData, script: newScript };
        }
        if (name.startsWith("columns.")) {
          const newColumns = [...prevData.columns];
          const columnField = name.split(".")[1];
          newColumns[index] = {
            ...newColumns[index],
            [columnField]: value,
          };
          return { ...prevData, columns: newColumns };
        }
      }

      // Handle nested objects
      if (name.includes(".")) {
        return updateNestedState(prevData, name, value);
      }

      // Default case for top-level fields
      return { ...prevData, [name]: value };
    });
  };

  const handleAddScript = () => {
    setFormData((prevData) => ({
      ...prevData,
      script: [
        ...prevData.script,
        {
          scriptName: "",
          decimalPlaces: 2,
          displayName: "",
          unit: "",
          properties: {
            fontFamily: "Arial",
            fontWeight: "normal",
            fontColor: "#000000",
            backgroundColor: "#FFFFFF",
          },
          position: {
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
        },
      ],
    }));
  };

  const handleAddColumn = () => {
    setFormData((prevData) => ({
      ...prevData,
      columns: [...prevData.columns, { name: "", field: "" }],
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4001/sldscreatewidget",
        formData
      );
      alert("Widget created successfully!");
      console.log(response.data);
      handleClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create widget.");
    }
  };

  const renderFormFields = () => {
    switch (widgetType) {
      case "plain_text":
        return (
          <TextField
            label="Custom Text"
            name="customText"
            fullWidth
            value={formData.customText}
            onChange={handleChange}
            required
            margin="dense"
          />
        );

      case "number_widget":
      case "graph_widget":
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Terminal ID"
                  name="terminal.terminalId"
                  fullWidth
                  value={formData.terminal.terminalId}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Terminal Name"
                  name="terminal.terminalName"
                  fullWidth
                  value={formData.terminal.terminalName}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
            </Grid>

            {formData.script.map((scriptItem, index) => (
              <Box key={index} sx={{ border: "1px solid #ddd", p: 2, mt: 2 }}>
                <Typography variant="subtitle1">Script {index + 1}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Script Name"
                      name={`script.scriptName`}
                      fullWidth
                      value={scriptItem.scriptName}
                      onChange={(e) => handleChange(e, index)}
                      required
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Display Name"
                      name={`script.displayName`}
                      fullWidth
                      value={scriptItem.displayName}
                      onChange={(e) => handleChange(e, index)}
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Decimal Places"
                      name={`script.decimalPlaces`}
                      type="number"
                      fullWidth
                      value={scriptItem.decimalPlaces}
                      onChange={(e) => handleChange(e, index)}
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Unit"
                      name={`script.unit`}
                      fullWidth
                      value={scriptItem.unit}
                      onChange={(e) => handleChange(e, index)}
                      margin="dense"
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button onClick={handleAddScript} variant="outlined" sx={{ mt: 2 }}>
              Add Another Script
            </Button>

            {widgetType === "graph_widget" && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Graph Type"
                    name="graphType"
                    select
                    fullWidth
                    value={formData.graphType}
                    onChange={handleChange}
                    margin="dense"
                  >
                    <MenuItem value="line">Line</MenuItem>
                    <MenuItem value="bar">Bar</MenuItem>
                    <MenuItem value="pie">Pie</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="X-Axis Configuration"
                    name="xAxisConfig"
                    fullWidth
                    value={formData.xAxisConfig}
                    onChange={handleChange}
                    margin="dense"
                  />
                </Grid>
              </Grid>
            )}
          </>
        );

      case "data_grid":
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Terminal ID"
                  name="terminal.terminalId"
                  fullWidth
                  value={formData.terminal.terminalId}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Terminal Name"
                  name="terminal.terminalName"
                  fullWidth
                  value={formData.terminal.terminalName}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Profile"
                  name="profile"
                  fullWidth
                  value={formData.profile}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
            </Grid>

            {formData.columns.map((column, index) => (
              <Box key={index} sx={{ border: "1px solid #ddd", p: 2, mt: 2 }}>
                <Typography variant="subtitle1">Column {index + 1}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Column Name"
                      name={`columns.name`}
                      fullWidth
                      value={column.name}
                      onChange={(e) => handleChange(e, index)}
                      required
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Field"
                      name={`columns.field`}
                      fullWidth
                      value={column.field}
                      onChange={(e) => handleChange(e, index)}
                      required
                      margin="dense"
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button onClick={handleAddColumn} variant="outlined" sx={{ mt: 2 }}>
              Add Another Column
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Widget Manager
          </Typography>
          <IconButton color="inherit" onClick={() => handleOpen("plain_text")}>
            <TextFieldsIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => handleOpen("number_widget")}
          >
            <NumbersIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => handleOpen("graph_widget")}
          >
            <BarChartIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => handleOpen("data_grid")}>
            <GridViewIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          Create {widgetType ? widgetType.replace("_", " ") : ""} Widget
        </DialogTitle>
        <DialogContent>{renderFormFields()}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SldcDashboard;
