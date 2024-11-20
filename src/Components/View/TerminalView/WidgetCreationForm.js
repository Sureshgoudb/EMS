import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
    fontSize: "40px",
    fontColor: "#FF0000",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyFetchTimer, setHistoryFetchTimer] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedTerminalData, setSelectedTerminalData] = useState(null);

  useEffect(() => {
    if (selectedTerminalData) {
      console.log("Selected terminal data:", selectedTerminalData);
    }
  }, [selectedTerminalData]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserType(parsedUser.user_Type);
      } else {
        toast.error("User data not found");
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      toast.error("Error loading user data");
    }
  }, []);

  // ------------- Fetch terminals -------------
  useEffect(() => {
    const fetchTerminals = async () => {
      if (!userType) return;
      setLoading(true);
      setError(null);

      try {
        let response;
        const userData = JSON.parse(localStorage.getItem("user"));

        if (userType === "Admin") {
          response = await axios.get(`${apiKey}terminal/list`);
          setTerminals(response.data || []);
        } else {
          response = await axios.get(
            `${apiKey}terminal/list/${userData.customerID}`
          );
          setTerminals(response.data.terminals || []);
        }

        if (presetTerminal) {
          const terminalList =
            userType === "Admin" ? response.data : response.data.terminals;
          const preset = terminalList.find(
            (t) => t.terminalName === presetTerminal
          );
          if (preset) {
            setTerminalId(preset.terminalId);
            setTerminalName(preset.terminalName);
            setSelectedTerminalData(preset);
          }
        }
      } catch (error) {
        console.error("Error fetching terminals:", error);
        setError(error.response?.data?.message || "Failed to fetch terminals");
        toast.error(
          error.response?.data?.message || "Failed to fetch terminals"
        );
        setTerminals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminals();
  }, [userType, presetTerminal]);

  // ------------- Fetch scripts -------------
  useEffect(() => {
    const fetchScripts = async () => {
      if (!terminalId) {
        setScripts({});
        return;
      }

      try {
        const response = await axios.get(
          `${apiKey}terminal/${terminalId}/scripts`
        );
        setScripts(response.data.scripts || {});
        setScriptError(false);
      } catch (error) {
        console.error("Error fetching scripts:", error);
        toast.error("Failed to fetch scripts");
        setScripts({});
      }
    };

    fetchScripts();
  }, [terminalId]);

  const handleOpenFormatDialog = () => setOpenFormatDialog(true);
  const handleCloseFormatDialog = () => setOpenFormatDialog(false);
  const handleApplyFormat = (newFormat) => {
    setProperties(newFormat);
    handleCloseFormatDialog();
  };

  // ------------- Create widget -------------
  const handleCreate = async () => {
    if (!terminalName || !scriptName || !selectedTerminalData) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const widgetData = {
      terminal: {
        terminalID: selectedTerminalData.terminalId,
        terminalName: selectedTerminalData.terminalName,
      },
      scripts: [
        {
          scriptName,
          areaGraph,
          properties,
          decimalPlaces,
          graphType: areaGraph ? graphType : undefined,
          xAxisConfiguration: areaGraph
            ? {
                type: xAxisType,
                value: xAxisValue,
              }
            : undefined,
          refreshInterval: areaGraph ? refreshInterval : undefined,
        },
      ],
    };

    try {
      const response = await axios.post(
        `${apiKey}terminal/createWidget`,
        widgetData
      );

      if (response.data && areaGraph) {
        response.data.initialHistory = historyData;
      }

      toast.success(response.data.message);
      onCreate(response.data);
    } catch (error) {
      console.error("Error creating widget:", error);
      toast.error(error.response?.data?.message || "Failed to create widget");
    }
  };

  const handleTerminalSelection = (event) => {
    const selectedTerminal = terminals.find(
      (t) => t.terminalName === event.target.value
    );

    if (selectedTerminal) {
      setTerminalName(selectedTerminal.terminalName);
      setTerminalId(selectedTerminal.terminalId);
      setSelectedTerminalData(selectedTerminal);

      setHistoryData([]);
      if (historyFetchTimer) {
        clearInterval(historyFetchTimer);
        setHistoryFetchTimer(null);
      }
    } else {
      setTerminalName("");
      setTerminalId("");
      setSelectedTerminalData(null);
    }

    setScriptName("");
    setScriptError(false);
  };

  const handleScriptSelection = (e) => {
    if (!terminalName) {
      setScriptError(true);
    } else {
      setScriptName(e.target.value);
      setScriptError(false);

      setHistoryData([]);
      if (historyFetchTimer) {
        clearInterval(historyFetchTimer);
        setHistoryFetchTimer(null);
      }
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Terminal Selection */}
          <StyledFormControl fullWidth disabled={loading}>
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
              disabled={!!presetTerminal || loading}
            >
              {terminals.map((terminal) => (
                <MenuItem
                  key={terminal.terminalId}
                  value={terminal.terminalName}
                >
                  {terminal.terminalName}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

          {/* Script Selection */}
          <StyledFormControl fullWidth disabled={!terminalId || loading}>
            <InputLabel>Variable Name</InputLabel>
            <Select
              label="Variable Name"
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
              value={scriptName}
              onChange={handleScriptSelection}
            >
              {Object.keys(scripts).map((script) => (
                <MenuItem key={script} value={script}>
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

          {/* Decimal Places */}
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

          {/* Area Graph Checkbox */}
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

          {/* Graph Options (visible only when Area Graph is selected) */}
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
                  setXAxisValue(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Refresh Interval (seconds)"
                type="number"
                value={refreshInterval}
                onChange={(e) =>
                  setRefreshInterval(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1 }}
              />
            </>
          )}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            disabled={loading || !terminalName || !scriptName}
          >
            Create Widget
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenFormatDialog}
            disabled={loading}
          >
            Set Text Format
          </Button>
        </Box>
      </Paper>

      {/* Format Dialog */}
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

WidgetCreationForm.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  presetTerminal: PropTypes.string,
};

export default WidgetCreationForm;
