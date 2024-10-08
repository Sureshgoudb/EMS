import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Alert,
  TextField,
  Radio,
  RadioGroup,
  ThemeProvider,
  Paper,
  createTheme,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormatDialog from "./FormatDialog.js";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 200,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const WidgetCreationForm = ({ onCreate, onCancel, presetTerminal }) => {
  const [scriptName, setScriptName] = useState("");
  const [terminalName, setTerminalName] = useState(presetTerminal || "");
  const [areaGraph, setAreaGraph] = useState(false);
  const [properties, setProperties] = useState("");
  const [openFormatDialog, setOpenFormatDialog] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("14px");
  const [fontColor, setFontColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [fontStyle, setFontStyle] = useState("normal");
  const [terminals, setTerminals] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [scriptError, setScriptError] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [graphType, setGraphType] = useState("");
  const [xAxisType, setXAxisType] = useState("records");
  const [xAxisValue, setXAxisValue] = useState(90);
  const [refreshInterval, setRefreshInterval] = useState(60);

  // ---------- Fetch terminals ----------
  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        const response = await axios.get(apiKey + "terminal/list");
        setTerminals(response.data);
      } catch (error) {
        console.error("Error fetching terminals:", error);
      }
    };
    fetchTerminals();
  }, []);

  // ---------- Fetch scripts ----------
  useEffect(() => {
    const fetchScripts = async () => {
      if (terminalName) {
        try {
          const response = await axios.get(
            apiKey + `terminal/${terminalName}/scripts`
          );

          setScripts(response.data);
          setScriptError(false);
        } catch (error) {
          console.error("Error fetching scripts:", error);
        }
      } else {
        setScripts([]);
      }
    };
    fetchScripts();
  }, [terminalName]);

  // ---------- Handle decimal places change ----------
  const handleDecimalPlacesChange = (event) => {
    const value = parseInt(event.target.value);
    setDecimalPlaces(value >= 0 ? value : 0);
  };

  // ---------- Handle create widget ----------
  const handleCreate = () => {
    if (!terminalName) {
      toast.error("Please select a terminal.");
      return;
    }
    if (!scriptName) {
      toast.error("Please select a script.");
      return;
    }

    const widgetData = {
      scriptName,
      terminalName,
      areaGraph,
      properties,
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
      fontStyle,
      decimalPlaces,
    };

    if (areaGraph) {
      if (!graphType) {
        toast.error("Please select a graph type.");
        return;
      }

      widgetData.graphType = graphType;
      widgetData.xAxisConfiguration = {
        type: xAxisType,
        value: xAxisValue,
      };
      widgetData.refreshInterval = refreshInterval;
    }

    onCreate(widgetData);
  };
  const handleOpenFormatDialog = () => {
    setOpenFormatDialog(true);
  };

  const handleCloseFormatDialog = () => {
    setOpenFormatDialog(false);
  };

  const handleApplyFormat = (newFormat) => {
    setFontFamily(newFormat.fontFamily);
    setFontSize(newFormat.fontSize);
    setFontColor(newFormat.fontColor);
    setBackgroundColor(newFormat.backgroundColor);
    setFontStyle(newFormat.fontStyle);
    handleCloseFormatDialog();
  };

  const handleScriptSelection = (e) => {
    if (!terminalName) {
      setScriptError(true);
    } else {
      setScriptName(e.target.value);
      setScriptError(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 700, mx: "auto" }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, color: "primary.main", textAlign: "center" }}
        >
          Create New Widget
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Terminal Name</InputLabel>
            <Select
              value={terminalName}
              onChange={(e) => setTerminalName(e.target.value)}
              disabled={!!presetTerminal}
            >
              {terminals.map((terminal, index) => (
                <MenuItem key={index} value={terminal}>
                  {terminal}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Script Name</InputLabel>
            <Select
              value={scriptName}
              onChange={handleScriptSelection}
              disabled={!terminalName}
            >
              {scripts.map((script, index) => (
                <MenuItem key={index} value={script}>
                  {script}
                </MenuItem>
              ))}
            </Select>
            {scriptError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Please select a terminal before choosing a script.
              </Alert>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="Decimal Places"
              type="number"
              value={decimalPlaces}
              onChange={handleDecimalPlacesChange}
              inputProps={{ min: 0 }}
              helperText={`Displayed value: ${(123.456789).toFixed(
                decimalPlaces
              )}`}
            />
          </FormControl>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={areaGraph}
                  onChange={(e) => setAreaGraph(e.target.checked)}
                />
              }
              label="Area Graph"
            />
            <Tooltip
              title={
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li>You can select only one graph type.</li>
                  <li>
                    Specify either the number of records or the time in seconds,
                    not both.
                  </li>
                </ul>
              }
            >
              <InfoIcon
                sx={{ ml: 1, cursor: "pointer", color: "primary.main" }}
              />
            </Tooltip>
          </Box>

          {areaGraph && (
            <>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">Graph Type</Typography>
                <RadioGroup
                  value={graphType}
                  onChange={(e) => setGraphType(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="simple"
                    control={<Radio />}
                    label="Simple"
                  />
                  <FormControlLabel
                    value="multi-axis"
                    control={<Radio />}
                    label="Multi-axis"
                  />
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset">
                <Typography variant="subtitle1">
                  X-Axis Configuration
                </Typography>
                <RadioGroup
                  value={xAxisType}
                  onChange={(e) => setXAxisType(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="records"
                    control={<Radio />}
                    label="Number of Records"
                  />
                  <FormControlLabel
                    value="seconds"
                    control={<Radio />}
                    label="Time in Seconds"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                label={
                  xAxisType === "records"
                    ? "Number of Records"
                    : "Number of Seconds"
                }
                type="number"
                value={xAxisValue}
                onChange={(e) => setXAxisValue(parseInt(e.target.value))}
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Refresh Interval (seconds)"
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                inputProps={{ min: 1 }}
              />
            </>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleOpenFormatDialog}
            sx={{ flexGrow: 1 }}
          >
            Format Widget
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            sx={{ flexGrow: 1 }}
          >
            Create
          </Button>
          <Button variant="outlined" onClick={onCancel} sx={{ flexGrow: 1 }}>
            Cancel
          </Button>
        </Box>
        <ToastContainer />
        <FormatDialog
          open={openFormatDialog}
          onClose={handleCloseFormatDialog}
          onApply={handleApplyFormat}
          currentStyles={{
            fontFamily,
            fontSize,
            fontColor,
            backgroundColor,
            fontStyle,
          }}
        />
      </Paper>
    </ThemeProvider>
  );
};

export default WidgetCreationForm;
