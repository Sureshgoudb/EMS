import React, { useState, useEffect, useCallback, useRef } from "react";
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
  RadioGroup,
  FormControl,
  FormControlLabel,
  Radio,
  Select,
  InputLabel,
} from "@mui/material";
import {
  TextFields as TextFieldsIcon,
  Numbers as NumbersIcon,
  BarChart as BarChartIcon,
  GridView as GridViewIcon,
  FormatColorText,
  AccountTree,
  DeviceHub,
  Assessment
} from "@mui/icons-material";
import axios from "axios";
import TextFormatDialog from "../View/TerminalView/TextFormatDialog";
import PlainTextWidget from "./PlainTextWidget";
import NumberWidget from "./NumberWidget";
import GraphWidget from "./GraphWidget";
import DataGridWidget from "./DataGridWidget";
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const SldcDashboard = () => {
  const [open, setOpen] = useState(false);
  const [widgetType, setWidgetType] = useState("");
  const [formData, setFormData] = useState({
    customerID: "",
    type: "",
    terminal: { terminalId: "", terminalName: "" },
    customText: "",
    properties: {
      fontFamily: "Arial",
      fontSize: "40px",
      fontColor: "#FF0000",
      backgroundColor: "#ffffff",
      fontStyle: "normal",
      fontWeight: "400",
    },
    script: [
      {
        scriptName: "",
        decimalPlaces: 2,
        displayName: "",
        unit: "",
        properties: {
          fontFamily: "Arial",
          fontSize: "40px",
          fontColor: "#FF0000",
          backgroundColor: "#ffffff",
          fontStyle: "normal",
          fontWeight: "400",
        },
      },
    ],
    xAxisConfig: { type: "records", value: "" },
    resetInterval: "15 minutes",
    columns: [{ name: "", field: "" }],
    profile: "",
    graphType: "simple",
  });
  const [terminals, setTerminals] = useState([]);
  const [scriptNames, setScriptNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordOrSeconds, setRecordOrSeconds] = useState("records");
  const [graphType, setGraphType] = useState("simple");
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

  const [graphProfiles] = useState([
    { value: "trend", label: "Trend", icon: <AccountTree /> },
    { value: "block", label: "Block", icon: <DeviceHub /> },
    { value: "daily", label: "Daily", icon: <Assessment /> }
  ]);
  const [graphTerminals, setGraphTerminals] = useState([]);
  const [graphVariables, setGraphVariables] = useState([]);
  const [selectedGraphProfile, setSelectedGraphProfile] = useState("");
  const [graphTerminalLoading, setGraphTerminalLoading] = useState(false);
  const [graphVariableLoading, setGraphVariableLoading] = useState(false);
  const [graphError, setGraphError] = useState(null)
  const [widgets, setWidgets] = useState([]);
  const layoutChangeRef = useRef(false);

  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  const getUserData = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  useEffect(() => {
    const fetchTerminals = async () => {
      const user = getUserData();
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
            terminalId: terminal.terminalId,
            terminalName: terminal.terminalName,
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
  }, [open]);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const response = await axios.get(`${apiKey}sldcwidgets`);
        setWidgets(response.data);
      } catch (error) {
        console.error('Error fetching widgets:', error);
      }
    };
    fetchWidgets();
  }, []);

  const fetchScriptNames = async (terminalId) => {
    try {
      const response = await axios.get(`${apiKey}terminal/${terminalId}/scripts`);

      if (response.data && response.data.scripts) {
        const scriptsObject = response.data.scripts;
        const scriptsArray = Object.keys(scriptsObject).map((key) => ({
          value: key,
          label: key,
        }));

        setScriptNames(scriptsArray);
      } else {
        console.error("Expected an object with a 'scripts' property, but got:", response.data);
        setScriptNames([]);
      }
    } catch (error) {
      console.error("Error fetching script names:", error);
      setScriptNames([]);
    }
  };

  const fetchGraphTerminals = async (profile) => {
    const userInfo = JSON.parse(localStorage.getItem("user")) || {};
    const isAdmin = userInfo.user_Type === "Admin";

    setGraphTerminalLoading(true);
    setGraphError(null);

    try {
      const response = await axios.get(
        isAdmin
          ? `${apiKey}terminals/${profile}`
          : `${apiKey}terminals/${profile}/${userInfo.customerID}`
      );

      const formattedTerminals = (Array.isArray(response.data) ? response.data : []).map(terminal => ({
        terminalId: terminal.terminalId,
        terminalName: terminal.terminalName
      }));

      setGraphTerminals(formattedTerminals);
    } catch (error) {
      setGraphError("Failed to fetch terminals");
      console.error("Terminal fetch error:", error);
    } finally {
      setGraphTerminalLoading(false);
    }
  };

  const fetchGraphVariables = async (profile, terminal) => {
    setGraphVariableLoading(true);
    setGraphError(null);

    try {
      const response = await axios.get(
        `${apiKey}variables/${profile}/${terminal.terminalName || terminal}`
      );

      const formattedVariables = (Array.isArray(response.data) ? response.data : []).map(variable => ({
        value: variable.scriptName || variable,
        label: variable.displayName || variable
      }));

      setGraphVariables(formattedVariables);
    } catch (error) {
      setGraphError("Failed to fetch variables");
      console.error("Variables fetch error:", error);
    } finally {
      setGraphVariableLoading(false);
    }
  };

  const handleOpen = (type) => {
    setWidgetType(type);
    setFormData((prevData) => ({
      ...prevData,
      type,
      terminal: { terminalId: "", terminalName: "" },
      customText: "",
      properties: {
        fontFamily: "Arial",
        fontSize: "40px",
        fontColor: "#FF0000",
        backgroundColor: "#ffffff",
        fontStyle: "normal",
        fontWeight: "400",
      },
      script: [
        {
          scriptName: "",
          decimalPlaces: 2,
          displayName: "",
          unit: "",
          properties: {
            fontFamily: "Arial",
            fontSize: "40px",
            fontColor: "#FF0000",
            backgroundColor: "#ffffff",
            fontStyle: "normal",
            fontWeight: "400",
          },
        },
      ],
      xAxisConfig: { type: "records", value: "" },
      resetInterval: "15 minutes",
      columns: [{ name: "", field: "" }],
      profile: "",
      graphType: "simple",
    }));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setWidgetType("");
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

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

      if (name.includes(".")) {
        return updateNestedState(prevData, name, value);
      }

      return { ...prevData, [name]: value };
    });
  };

  const handleTerminalChange = (e) => {
    const selectedTerminal = terminals.find(
      (terminal) => terminal.terminalId === e.target.value
    );
    setFormData((prevData) => ({
      ...prevData,
      terminal: {
        terminalId: selectedTerminal.terminalId,
        terminalName: selectedTerminal.terminalName,
      },
    }));
    fetchScriptNames(selectedTerminal.terminalId);
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
            fontSize: "40px",
            fontColor: "#FF0000",
            backgroundColor: "#ffffff",
            fontStyle: "normal",
            fontWeight: "400",
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
      const userInfo = JSON.parse(localStorage.getItem("user")) || {};
      const customerID = userInfo.customerID;

      const dataToSubmit = {
        ...formData,
        customerID,
        // Add layout properties
        x: (widgets.length * 2) % 12, // Calculate initial x position
        y: Math.floor(widgets.length / 6), // Calculate initial y position
        w: 4, // Default width
        h: 2, // Default height
      };

      const response = await axios.post(
        "http://localhost:4001/sldscreatewidget",
        dataToSubmit,
      );
      
      // Update widgets state with the new widget
      setWidgets(prev => [...prev, response.data]);
      handleClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create widget.");
    }
  };
  const handleGraphTypeChange = (event) => {
    const selectedGraphType = event.target.value;
    setGraphType(selectedGraphType);
    setFormData((prevData) => ({
      ...prevData,
      graphType: selectedGraphType,
    }));
  };

  const handleRadioChange = (event) => {
    const selectedValue = event.target.value;
    setRecordOrSeconds(selectedValue);
    setFormData((prevData) => ({
      ...prevData,
      xAxisConfig: {
        ...prevData.xAxisConfig,
        type: selectedValue,
        value: prevData.xAxisConfig.value || 0,
      },
    }));
  };

  const handleTextFormatApply = (newProperties) => {
    setTextProperties(newProperties);
    setFormData((prevData) => ({
      ...prevData,
      properties: newProperties,
      script: prevData.script.map((s) => ({
        ...s,
        properties: newProperties, // Apply new properties to each script
      })),
    }));
    setTextFormatOpen(false);
    setSnackbar({
      open: true,
      message: "Text format updated successfully",
      severity: "success",
    });
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
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Terminal"
                  name="terminal.terminalId"
                  select
                  fullWidth
                  value={formData.terminal.terminalId}
                  onChange={handleTerminalChange}
                  required
                  margin="dense"
                >
                  {loading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : (
                    terminals.map((terminal) => (
                      <MenuItem key={terminal.terminalId} value={terminal.terminalId}>
                        {terminal.terminalName}
                      </MenuItem>
                    ))
                  )}
                </TextField>
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
                      select
                      fullWidth
                      value={scriptItem.scriptName}
                      onChange={(e) => handleChange(e, index)}
                      required
                      margin="dense"
                    >
                      {scriptNames.map((script) => (
                        <MenuItem key={script.value} value={script.value}>
                          {script.label}
                        </MenuItem>
                      ))}
                    </TextField>
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
          </>
        );

      case "graph_widget":
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Profile"
                  name="graph_profile"
                  select
                  fullWidth
                  value={selectedGraphProfile}
                  onChange={(e) => {
                    const profile = e.target.value;
                    setSelectedGraphProfile(profile);
                    fetchGraphTerminals(profile);
                    // Reset dependent fields
                    setFormData(prevData => ({
                      ...prevData,
                      profile: profile,
                      terminal: { terminalId: "", terminalName: "" },
                      script: [{ scriptName: "", displayName: "", decimalPlaces: 2, unit: "", properties: { fontFamily: "Arial", fontSize: "40px", fontColor: "#FF0000", backgroundColor: "#ffffff", fontStyle: "normal", fontWeight: "400" } }]
                    }));
                  }}
                  required
                  margin="dense"
                >
                  {graphProfiles.map((profile) => (
                    <MenuItem key={profile.value} value={profile.value}>
                      {profile.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {selectedGraphProfile && (
                <Grid item xs={12}>
                  <TextField
                    label="Terminal"
                    name="terminal.terminalId"
                    select
                    fullWidth
                    value={formData.terminal.terminalId}
                    onChange={(e) => {
                      const selectedTerminal = graphTerminals.find(
                        (terminal) => terminal.terminalId === e.target.value
                      );
                      setFormData((prevData) => ({
                        ...prevData,
                        terminal: {
                          terminalId: selectedTerminal.terminalId,
                          terminalName: selectedTerminal.terminalName,
                        },
                      }));
                      fetchGraphVariables(selectedGraphProfile, selectedTerminal);
                    }}
                    required
                    margin="dense"
                    disabled={graphTerminalLoading}
                  >
                    {graphTerminalLoading ? (
                      <MenuItem disabled>Loading Terminals...</MenuItem>
                    ) : (
                      graphTerminals.map((terminal) => (
                        <MenuItem
                          key={terminal.terminalId}
                          value={terminal.terminalId}
                        >
                          {terminal.terminalName}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>
              )}
            </Grid>
            {formData.script.map((scriptItem, index) => (
              <Box key={index} sx={{ border: "1px solid #ddd", p: 2, mt: 2 }}>
                <Typography variant="subtitle1">Script {index + 1}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Script Name"
                      name={`script.scriptName`}
                      select
                      fullWidth
                      value={scriptItem.scriptName}
                      onChange={(e) => handleChange(e, index)}
                      required
                      margin="dense"
                    >
                      {graphVariables.map((variable) => (
                        <MenuItem key={variable.value} value={variable.value}>
                          {variable.label}
                        </MenuItem>
                      ))}
                    </TextField>
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
            < Button onClick={handleAddScript} variant="outlined" sx={{ mt: 2 }
            }>
              Add Another Script
            </Button >

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Box
                sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}
              >
                <RadioGroup
                  row
                  value={graphType}
                  onChange={handleGraphTypeChange}
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
                  row
                  value={recordOrSeconds}
                  onChange={handleRadioChange}
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

                {recordOrSeconds === "records" && (
                  <TextField
                    label="Number of Records"
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{ min: 1, max: 1000 }}
                    onChange={(e) => handleChange({ target: { name: "xAxisConfig.value", value: e.target.value } })}
                  />
                )}
                {recordOrSeconds === "seconds" && (
                  <TextField
                    label="Number of Seconds"
                    type="number"
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{ min: 1, max: 1000 }}
                    onChange={(e) => handleChange({ target: { name: "xAxisConfig.value", value: e.target.value } })}
                  />
                )}

                <FormControl fullWidth margin="dense">
                  <InputLabel label="Reset Interval">Reset Interval</InputLabel>
                  <Select
                    label="Reset Interval"
                    required
                    value={formData.resetInterval}
                    onChange={(e) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        resetInterval: e.target.value,
                      }));
                    }}
                  >
                    <MenuItem value="15 minutes">15 minutes</MenuItem>
                    <MenuItem value="30 minutes">30 minutes</MenuItem>
                    <MenuItem value="1 hour">1 hour</MenuItem>
                    <MenuItem value="8 hours">8 hours</MenuItem>
                    <MenuItem value="24 hours">24 hours</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
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
                  on Change={handleChange}
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

  const generateLayout = useCallback(() => {
    return widgets.map((widget) => ({
      i: widget._id,
      x: widget.position?.x || 0,
      y: widget.position?.y || 0,
      w: widget.position?.w || 4,
      h: widget.position?.h || 2,
    }));
  }, [widgets]);

  const onLayoutChange = useCallback((newLayout) => {
    if (layoutChangeRef.current) return;
    layoutChangeRef.current = true;

    try {
      // Update local state first
      const updatedWidgets = widgets.map(widget => {
        const layoutItem = newLayout.find(item => item.i === widget._id);
        if (layoutItem) {
          return {
            ...widget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h
            }
          };
        }
        return widget;
      });

      setWidgets(updatedWidgets);

      // Send updates to backend
      const updates = newLayout.map(layout => ({
        widgetId: layout.i,
        position: {
          x: layout.x,
          y: layout.y,
          w: layout.w,
          h: layout.h
        }
      }));

      axios.patch(`${apiKey}sldcwidgets/positions`, { updates })
        .catch(error => {
          console.error('Error updating positions:', error);
        });

    } catch (error) {
      console.error('Error in layout change:', error);
    } finally {
      layoutChangeRef.current = false;
    }
  }, [widgets]);

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
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)', height: 'auto', overflow: 'auto' }}>
        <GridLayout
          className="layout"
          layout={generateLayout()}
          cols={12}
          rowHeight={100}
          maxRows={100}
          width={window.innerWidth - 48}
          onLayoutChange={onLayoutChange}
          isDraggable={true}
          isResizable={true}
          margin={[10, 10]}
          containerPadding={[0, 0]}
          verticalCompact={false}
        >
          {widgets.map((widget) => (
            <div key={widget._id}>
              {widget.type === "plain_text" && <PlainTextWidget widget={widget} />}
              {widget.type === "number_widget" && <NumberWidget widget={widget} />}
              {widget.type === "graph_widget" && <GraphWidget widget={widget} />}
              {widget.type === "data_grid" && <DataGridWidget widget={widget} />}
            </div>
          ))}
        </GridLayout>
      </Box>
    </div>
  );
};

export default SldcDashboard;
