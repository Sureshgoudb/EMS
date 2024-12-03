import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Typography,
  CircularProgress,
  Box,
  FormHelperText,
  Alert,
  Snackbar,
} from "@mui/material";
import { FormatColorText, Save, Close } from "@mui/icons-material";
import TextFormatDialog from "./TextFormatDialog";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const CreateWidgetDialog = ({
  open,
  onClose,
  existingWidgets = [],
  initialTerminalData = null,
}) => {
  const [formData, setFormData] = useState({
    terminal: "",
    script: "",
    displayName: "",

    decimalPlaces: "2",
    isAreaGraph: false,
    graphType: "simple",
    xAxisConfig: "records",
    number: "100",
    refreshInterval: "60",
  });

  useEffect(() => {
    if (initialTerminalData?.TerminalId) {
      setFormData((prev) => ({
        ...prev,
        terminal: initialTerminalData.TerminalId,
      }));
    }
  }, [initialTerminalData]);
  const [terminals, setTerminals] = useState([]);
  const [scripts, setScripts] = useState({});
  const [scriptTimestamp, setScriptTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [textFormatOpen, setTextFormatOpen] = useState(false);
  const [textProperties, setTextProperties] = useState({
    fontFamily: "Arial",
    fontSize: "40px",
    fontColor: "#FF0000",
    backgroundColor: "#ffffff",
    fontStyle: "normal",
    fontWeight: "400",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getUserData = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const user = getUserData();

  useEffect(() => {
    const fetchTerminals = async () => {
      if (!user) return;

      try {
        setLoading(true);
        let response;

        if (user.user_Type === "Admin") {
          response = await fetch(`${apiKey}terminal/list`);
        } else {
          response = await fetch(`${apiKey}terminal/list/${user.customerID}`);
        }

        const data = await response.json();

        if (response.ok) {
          const terminalData =
            user.user_Type === "Admin" ? data : data.terminals;
          const formattedTerminals = terminalData.map((terminal) => ({
            TerminalId: terminal.terminalId,
            TerminalName: terminal.terminalName,
          }));

          setTerminals(formattedTerminals);
        } else {
          throw new Error(data.message || "Failed to fetch terminals");
        }
      } catch (err) {
        setError("Failed to load terminals. Please try again later.");
        console.error("Error fetching terminals:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open && terminals.length === 0) {
      fetchTerminals();
    }
  }, [open, user, terminals.length]);

  // ------------------ Script Fetching ------------------
  useEffect(() => {
    const fetchScripts = async () => {
      if (!formData.terminal) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${apiKey}terminal/${formData.terminal}/scripts`
        );
        const data = await response.json();

        if (response.ok) {
          setScripts(data.scripts || {});
          setScriptTimestamp(data.timestamp);
        } else {
          throw new Error(data.message || "Failed to fetch scripts");
        }
      } catch (err) {
        setError("Failed to load scripts. Please try again later.");
        console.error("Error fetching scripts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, [formData.terminal]);

  const validate = () => {
    let tempErrors = {};

    if (!formData.terminal) {
      tempErrors.terminal = "Terminal is required";
    }

    if (!formData.script) {
      tempErrors.script = "Script is required";
    }
    if (!formData.displayName) {
      tempErrors.displayName = "Display Name is required";
    }
    const decimalPlacesNum = Number(formData.decimalPlaces);
    if (
      isNaN(decimalPlacesNum) ||
      decimalPlacesNum < 0 ||
      decimalPlacesNum > 10
    ) {
      tempErrors.decimalPlaces = "Must be between 0 and 10";
    }

    if (formData.isAreaGraph) {
      const numberValue = Number(formData.number);
      if (isNaN(numberValue) || numberValue <= 0) {
        tempErrors.number = `${
          formData.xAxisConfig === "records" ? "Records" : "Seconds"
        } must be greater than 0`;
      }
      if (numberValue > 1000) {
        tempErrors.number = `${
          formData.xAxisConfig === "records" ? "Records" : "Seconds"
        } must not exceed 1000`;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "terminal") {
      setFormData((prev) => ({
        ...prev,
        script: "",
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const calculatePosition = () => {
    const defaultSizes = {
      withGraph: { width: 300, height: 250 },
      withoutGraph: { width: 200, height: 100 },
    };

    const { width, height } = formData.isAreaGraph
      ? defaultSizes.withGraph
      : defaultSizes.withoutGraph;

    const containerWidth = 1200 - 40;
    const marginBetweenWidgets = 20;

    if (!existingWidgets?.length) {
      return { x: 0, y: 0, width, height };
    }

    const sortedWidgets = [...existingWidgets].sort((a, b) => {
      if (a.position?.y === b.position?.y) {
        return a.position?.x - b.position?.x;
      }
      return a.position?.y - b.position?.y;
    });

    const rows = [];
    let currentRow = [];
    let currentY = 0;

    sortedWidgets.forEach((widget) => {
      if (!widget.position) return;

      if (Math.abs(widget.position.y - currentY) < 20) {
        currentRow.push(widget);
      } else {
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [widget];
        currentY = widget.position.y;
      }
    });
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const rowY = row[0].position.y;

      row.sort((a, b) => a.position.x - b.position.x);

      if (row[0].position.x >= width + marginBetweenWidgets) {
        return { x: 0, y: rowY, width, height };
      }

      for (let i = 0; i < row.length - 1; i++) {
        const currentWidget = row[i];
        const nextWidget = row[i + 1];
        const availableSpace =
          nextWidget.position.x -
          (currentWidget.position.x + currentWidget.position.width);

        if (availableSpace >= width + marginBetweenWidgets) {
          return {
            x:
              currentWidget.position.x +
              currentWidget.position.width +
              marginBetweenWidgets,
            y: rowY,
            width,
            height,
          };
        }
      }

      const lastWidget = row[row.length - 1];
      const endSpace =
        containerWidth - (lastWidget.position.x + lastWidget.position.width);

      if (endSpace >= width + marginBetweenWidgets) {
        return {
          x:
            lastWidget.position.x +
            lastWidget.position.width +
            marginBetweenWidgets,
          y: rowY,
          width,
          height,
        };
      }
    }

    const lastRow = rows[rows.length - 1];
    const newRowY = lastRow
      ? lastRow[0].position.y +
        Math.max(...lastRow.map((w) => w.position.height)) +
        marginBetweenWidgets
      : 0;

    return { x: 0, y: newRowY, width, height };
  };

  const handleTextFormatApply = (newProperties) => {
    setTextProperties(newProperties);
    setTextFormatOpen(false);
    setSnackbar({
      open: true,
      message: "Text format updated successfully",
      severity: "success",
    });
  };

  const handleCreateWidget = async () => {
    if (!validate()) {
      setShowAlert(true);
      setShowAlert(true);
      setSnackbar({
        open: true,
        message: "Please correct the form errors before creating the widget.",
        severity: "warning",
      });
      return;
    }

    try {
      const selectedTerminal = terminals.find(
        (t) => t.TerminalId === formData.terminal
      );

      if (!selectedTerminal) {
        throw new Error("Selected terminal not found");
      }

      const position = calculatePosition();

      const widgetData = {
        terminal: {
          terminalID: selectedTerminal.TerminalId.toString(),
          terminalName: selectedTerminal.TerminalName,
        },
        scripts: [
          {
            scriptName: formData.script,
            displayName: formData.displayName,

            areaGraph: formData.isAreaGraph,
            properties: textProperties,
            position,
            decimalPlaces: parseInt(formData.decimalPlaces),
            graphType: formData.graphType,
            xAxisConfiguration: {
              type: formData.xAxisConfig,
              value: parseInt(formData.number),
            },
            refreshInterval: parseInt(formData.refreshInterval),
          },
        ],
      };

      const response = await fetch(`${apiKey}terminal/createWidget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(widgetData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create widget");
      }

      setSnackbar({
        open: true,
        message: "Widget created successfully!",
        severity: "success",
      });

      setTimeout(() => {
        onClose(true);
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to create widget");
      setSnackbar({
        open: true,
        message: err.message || "Failed to create widget",
        severity: "error",
      });
      setShowAlert(true);
      console.error("Error creating widget:", err);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4A4A4A",
          color: "#ffffff",
          fontWeight: "600",
          padding: "16px 24px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography
          variant="h6"
          style={{ fontSize: "1.25rem", letterSpacing: "0.5px" }}
        >
          Create a New Widget
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.terminal}>
          <InputLabel>Terminal *</InputLabel>
          <Select
            value={formData.terminal}
            onChange={handleChange("terminal")}
            label="Terminal *"
            disabled={!!initialTerminalData}
          >
            {terminals.map((terminal) => (
              <MenuItem
                key={terminal.TerminalId}
                value={terminal.TerminalId}
                selected={
                  terminal.TerminalId === initialTerminalData?.TerminalId
                }
              >
                {terminal.TerminalName}
              </MenuItem>
            ))}
          </Select>
          {errors.terminal && (
            <FormHelperText>{errors.terminal}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.script}>
          <InputLabel>Variable *</InputLabel>
          <Select
            value={formData.script}
            onChange={handleChange("script")}
            label="Variable *"
          >
            {Object.keys(scripts).map((scriptId) => (
              <MenuItem key={scriptId} value={scriptId}>
                {scriptId}
              </MenuItem>
            ))}
          </Select>
          {errors.script && <FormHelperText>{errors.script}</FormHelperText>}
        </FormControl>
        <TextField
          label="Display Name *"
          value={formData.displayName}
          onChange={handleChange("displayName")}
          fullWidth
          sx={{ mt: 2 }}
          error={!!errors.displayName}
          helperText={errors.displayName}
        />
        <TextField
          label="Decimal Places"
          type="number"
          value={formData.decimalPlaces}
          onChange={handleChange("decimalPlaces")}
          fullWidth
          sx={{ mt: 2 }}
          error={!!errors.decimalPlaces}
          helperText={errors.decimalPlaces || "Enter a value between 0 and 10"}
          inputProps={{ min: 0, max: 10 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isAreaGraph}
              onChange={handleChange("isAreaGraph")}
            />
          }
          label="Enable Area Graph"
          sx={{ mt: 2 }}
        />

        {formData.isAreaGraph && (
          <Box
            sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Graph Configuration
            </Typography>

            <RadioGroup
              value={formData.graphType}
              onChange={handleChange("graphType")}
              row
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="simple"
                control={<Radio />}
                label="Simple Graph"
              />
              <FormControlLabel
                value="multi-axis"
                control={<Radio />}
                label="Multi-Axis Graph"
              />
            </RadioGroup>

            <RadioGroup
              value={formData.xAxisConfig}
              onChange={handleChange("xAxisConfig")}
              row
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="records"
                control={<Radio />}
                label="Number of Records"
              />
              <FormControlLabel
                value="seconds"
                control={<Radio />}
                label="Number of Seconds"
              />
            </RadioGroup>

            <TextField
              label={
                formData.xAxisConfig === "records"
                  ? "Number of Records"
                  : "Number of Seconds"
              }
              type="number"
              value={formData.number}
              onChange={handleChange("number")}
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.number}
              helperText={
                errors.number ||
                `Enter a value between 1 and 1000 ${formData.xAxisConfig}`
              }
              inputProps={{ min: 1, max: 1000 }}
            />

            {/* <TextField
              label="Refresh Interval (Seconds)"
              type="number"
              value={formData.refreshInterval}
              onChange={handleChange("refreshInterval")}
              fullWidth
              error={!!errors.refreshInterval}
              helperText={
                errors.refreshInterval ||
                "Enter a value between 1 and 3600 seconds"
              }
              inputProps={{ min: 1, max: 3600 }}
            /> */}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button
          onClick={() => setTextFormatOpen(true)}
          variant="outlined"
          color="primary"
          startIcon={<FormatColorText />}
        >
          Text Format
        </Button>
        <TextFormatDialog
          open={textFormatOpen}
          onClose={() => setTextFormatOpen(false)}
          initialProperties={textProperties}
          onApply={handleTextFormatApply}
          mode="create"
        />
        <Button
          onClick={handleCreateWidget}
          variant="contained"
          color="primary"
          startIcon={<Save />}
        >
          Create Widget
        </Button>
      </DialogActions>{" "}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CreateWidgetDialog;
