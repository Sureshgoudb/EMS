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
import { styled } from "@mui/material/styles";
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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(0),
}));

const WidgetCreationForm = ({ onCreate, onCancel, presetTerminal }) => {
  const [scriptName, setScriptName] = useState("");
  const [terminalName, setTerminalName] = useState(presetTerminal || "");
  const [terminalId, setTerminalId] = useState("");
  const [areaGraph, setAreaGraph] = useState(false);
  const [properties, setProperties] = useState({
    fontFamily: "Arial",
    fontSize: "20px",
    fontColor: "#000000",
    backgroundColor: "#ffffff",
    fontStyle: "normal",
    fontWeight: "normal",
  });
  const [openFormatDialog, setOpenFormatDialog] = useState(false);
  const [terminals, setTerminals] = useState([]);
  const [scripts, setScripts] = useState({});
  const [scriptError, setScriptError] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [graphType, setGraphType] = useState("simple");
  const [xAxisType, setXAxisType] = useState("records");
  const [xAxisValue, setXAxisValue] = useState(100);
  const [refreshInterval, setRefreshInterval] = useState(60);

  // Fetch terminals
  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        const response = await axios.get(`${apiKey}terminal/list`);
        setTerminals(response.data);

        // If there's a presetTerminal, find its ID and set it
        if (presetTerminal) {
          const preset = response.data.find(
            (t) => t.terminalName === presetTerminal
          );
          if (preset) {
            setTerminalId(preset.terminalId);
          }
        }
      } catch (error) {
        console.error("Error fetching terminals:", error);
        toast.error("Failed to fetch terminals");
      }
    };
    fetchTerminals();
  }, [presetTerminal]);

  // Fetch scripts
  useEffect(() => {
    const fetchScripts = async () => {
      if (terminalId) {
        try {
          const response = await axios.get(
            `${apiKey}terminal/${terminalId}/scripts`
          );
          setScripts(response.data.scripts);
          setScriptError(false);
        } catch (error) {
          console.error("Error fetching scripts:", error);
          toast.error("Failed to fetch scripts");
        }
      } else {
        setScripts({});
      }
    };
    fetchScripts();
  }, [terminalId]);

  // Handle terminal selection
  const handleTerminalSelection = (event) => {
    const selectedTerminal = terminals.find(
      (t) => t.terminalName === event.target.value
    );
    if (selectedTerminal) {
      setTerminalName(selectedTerminal.terminalName);
      setTerminalId(selectedTerminal.terminalId);
    } else {
      setTerminalName("");
      setTerminalId("");
    }
    setScriptName("");
    console.log("Selected Terminal ID:", selectedTerminal.terminalId);
  };

  const handleOpenFormatDialog = () => {
    setOpenFormatDialog(true);
  };

  const handleCloseFormatDialog = () => {
    setOpenFormatDialog(false);
  };

  const handleApplyFormat = (newFormat) => {
    setProperties(newFormat);
    handleCloseFormatDialog();
  };

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
      terminal: {
        terminalID: terminalId,
        terminalName,
      },
      scripts: [
        {
          scriptName,
          areaGraph,
          properties,
          decimalPlaces,
          graphType,
          xAxisConfiguration: {
            type: xAxisType,
            value: xAxisValue,
          },
          refreshInterval,
        },
      ],
    };

    onCreate(widgetData);
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
          <StyledFormControl fullWidth>
            <InputLabel sx={{ color: "#424242" }}>Device</InputLabel>
            <Select
              label="Device"
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              value={terminalName}
              onChange={handleTerminalSelection}
              disabled={!!presetTerminal}
            >
              {terminals.map((terminal, index) => (
                <MenuItem key={index} value={terminal.terminalName}>
                  {terminal.terminalName}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
          <StyledFormControl fullWidth>
            <InputLabel>Variable Name</InputLabel>
            <Select
              label="VariableName"
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              value={scriptName}
              onChange={handleScriptSelection}
            >
              {Object.keys(scripts).map((script, index) => (
                <MenuItem key={index} value={script}>
                  {script}
                </MenuItem>
              ))}
            </Select>
            {scriptError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Please select a device before choosing a variable.
              </Alert>
            )}
          </StyledFormControl>
          <StyledFormControl fullWidth>
            <TextField
              label="Decimal Places"
              type="number"
              value={decimalPlaces}
              onChange={(e) =>
                setDecimalPlaces(Math.max(0, parseInt(e.target.value) || 0))
              }
              inputProps={{ min: 0 }}
              helperText={`Displayed value: ${(123.456789).toFixed(
                decimalPlaces
              )}`}
            />
          </StyledFormControl>
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
                onChange={(e) =>
                  setXAxisValue(Math.max(1, parseInt(e.target.value)))
                }
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Refresh Interval (seconds)"
                type="number"
                value={refreshInterval}
                onChange={(e) =>
                  setRefreshInterval(Math.max(1, parseInt(e.target.value)))
                }
                inputProps={{ min: 1 }}
              />
            </>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create Widget
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenFormatDialog}
            sx={{ alignSelf: "flex-start" }}
          >
            Set Text Format
          </Button>
        </Box>
      </Paper>
      <FormatDialog
        open={openFormatDialog}
        onClose={handleCloseFormatDialog}
        currentStyles={properties}
        setCurrentStyles={setProperties}
        terminalID={terminalId}
        scriptName={scriptName}
        isNewWidget={true}
        onStylesUpdate={handleApplyFormat}
      />
      <ToastContainer />
    </ThemeProvider>
  );
};

export default WidgetCreationForm;
