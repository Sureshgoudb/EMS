import React, { useState, useEffect, useCallback, useReducer } from "react";
import MultiAxisGraph from "./MultiAxisGraph";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import LineGraph from "./LineGraph";
import FormatDialog from "./FormatDialog";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// -------------- Fetch Current Data and Historical Data --------------
const fetchScriptData = async (terminalName, scriptName, limit = 90) => {
  try {
    const currentDataResponse = await fetch(
      `${apiKey}terminal/${encodeURIComponent(
        terminalName
      )}/script/${encodeURIComponent(scriptName)}/currentValue`
    );
    const currentData = await currentDataResponse.json();

    const historicalDataResponse = await fetch(
      `${apiKey}terminal/${encodeURIComponent(
        terminalName
      )}/script/${encodeURIComponent(scriptName)}/history?limit=${limit}`
    );
    const historicalData = await historicalDataResponse.json();

    return {
      value: currentData[scriptName].value,
      timestamp: currentData[scriptName].timestamp,
      data: historicalData || [],
    };
  } catch (error) {
    console.error("Error fetching script data:", error);
    return {
      value: null,
      timestamp: "",
      data: [],
    };
  }
};

// -------------- Fetch Scripts --------------
const fetchScripts = async (terminalName) => {
  try {
    const response = await fetch(apiKey + `terminal/${terminalName}/scripts`);
    const scripts = await response.json();
    return scripts;
  } catch (error) {
    console.error("Error fetching scripts:", error);
    return [];
  }
};

// -------------- Expand graph plotting --------------
const transformDataForGraph = (data) => {
  return data
    .map((item) => {
      const scriptData = item[Object.keys(item)[0]];
      if (
        isNaN(scriptData.value) ||
        scriptData.value === null ||
        scriptData.value === undefined
      ) {
        return null;
      }
      return {
        x: new Date(scriptData.timestamp),
        y: parseFloat(scriptData.value),
      };
    })
    .filter((item) => item !== null);
};

const actions = {
  UPDATE_CURRENT_DATA: "UPDATE_CURRENT_DATA",
  UPDATE_HISTORICAL_DATA: "UPDATE_HISTORICAL_DATA",
  UPDATE_EXPANDED_DATA: "UPDATE_EXPANDED_DATA",
  SET_ERROR: "SET_ERROR",
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case actions.UPDATE_CURRENT_DATA:
      return {
        ...state,
        value: action.payload.value,
        timestamp: action.payload.timestamp,
        error: null,
      };
    case actions.UPDATE_HISTORICAL_DATA:
      return {
        ...state,
        scriptData: action.payload,
        error: null,
      };
    case actions.UPDATE_EXPANDED_DATA:
      return {
        ...state,
        detailedData: action.payload,
        error: null,
      };
    case actions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

const Widget = ({ widgetData, onResize, onDelete, index }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormatDialog, setIsFormatDialog] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [availableScripts, setAvailableScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState("");
  const [scriptName, setScriptName] = useState(widgetData.scriptName || "");
  const [comparisonScriptName, setComparisonScriptName] = useState("");
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonScripts, setComparisonScripts] = useState([]);
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [graphType, setGraphType] = useState(widgetData.graphType || "simple");
  const [backgroundColor, setBackgroundColor] = useState(
    localStorage.getItem(`widgetBackgroundColor_${widgetData.id}`) || "#f0f0f0"
  );
  const [terminalName, setTerminalName] = useState(
    widgetData.terminalName || ""
  );
  const [categoryStyle, setCategoryStyle] = useState({
    fontFamily: widgetData.fontFamily || "Arial",
    fontSize: "18px",
    fontColor: "#000000",
    fontStyle: "normal",
  });
  const [terminalStyle, setTerminalStyle] = useState({
    fontFamily: widgetData.fontFamily || "Arial",
    fontSize: "18px",
    fontColor: "#000000",
    fontStyle: "normal",
  });
  const [valueStyle, setValueStyle] = useState({
    fontFamily: widgetData.fontFamily || "Arial",
    fontSize: "30px",
    fontColor: "#FF0000",
    fontStyle: "normal",
  });
  const [state, dispatch] = useReducer(dataReducer, {
    value: widgetData.value,
    timestamp: "",
    scriptData: [],
    detailedData: [],
    error: null,
  });

  // -------------- Fetch data with hook --------------
  const fetchData = useCallback(
    async (isExpanded = false) => {
      if (terminalName && scriptName) {
        try {
          const limit = isExpanded ? 900 : 90;
          const data = await fetchScriptData(terminalName, scriptName, limit);
          dispatch({
            type: actions.UPDATE_CURRENT_DATA,
            payload: {
              value: parseFloat(data.value),
              timestamp: data.timestamp,
            },
          });
          const transformedData = transformDataForGraph(data.data);
          if (isExpanded) {
            dispatch({
              type: actions.UPDATE_EXPANDED_DATA,
              payload: transformedData,
            });
          } else {
            dispatch({
              type: actions.UPDATE_HISTORICAL_DATA,
              payload: transformedData,
            });
          }
        } catch (error) {
          dispatch({
            type: actions.SET_ERROR,
            payload: "Failed to fetch data",
          });
        }
      }
    },
    [terminalName, scriptName]
  );

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData(), 30000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleExpandClick = () => {
    setIsGraphExpanded(true);
    setIsDialogOpen(true);
    fetchData(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsGraphExpanded(false);
    setComparisonScriptName("");
    setComparisonData([]);
    setComparisonScripts([]);
  };

  const handleEdit = (textType) => {
    setSelectedText(textType);
    setIsFormatDialog(true);
  };

  const handleDeleteWidget = (widgetId) => {
    const terminals = JSON.parse(localStorage.getItem("terminals"));
    Object.keys(terminals).forEach((terminalId) => {
      const widgets = terminals[terminalId];
      const index = widgets.findIndex((widget) => widget.id === widgetId);
      if (index !== -1) {
        widgets.splice(index, 1);
        localStorage.setItem("terminals", JSON.stringify(terminals));
        onDelete(widgetId);
      }
    });
  };

  const handleConfirmDelete = () => {
    handleDeleteWidget(widgetData.id);
    setIsConfirmDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  const defaultSize = widgetData.areaGraph
    ? { width: 300, height: 300 }
    : { width: 250, height: 150 };
  const minConstraints = widgetData.areaGraph ? [300, 300] : [250, 150];
  const maxConstraints = widgetData.areaGraph ? [620, 600] : [400, 300];

  const handleResize = (event, { size }) => {
    onResize(widgetData.id, size);
  };

  // -------------- Script Comparison --------------
  const handleComparisonScriptChange = (event) => {
    const {
      target: { value },
    } = event;
    if (value.includes("none")) {
      setComparisonScripts([]);
    } else {
      setComparisonScripts(
        typeof value === "string" ? value.split(",") : value
      );
    }
  };

  // -------------- Script Comparison data --------------
  useEffect(() => {
    const fetchComparisonData = async () => {
      const newComparisonData = {};
      for (const script of comparisonScripts) {
        const data = await fetchScriptData(terminalName, script, 900);
        newComparisonData[script] = transformDataForGraph(data.data || []);
      }
      setComparisonData(newComparisonData);
    };

    if (comparisonScripts.length > 0) {
      fetchComparisonData();
    } else {
      setComparisonData({});
    }
  }, [comparisonScripts, terminalName]);

  useEffect(() => {
    if (isGraphExpanded) {
      fetchScripts(terminalName).then((scripts) => {
        setAvailableScripts(scripts);
        setSelectedScript(scriptName);
      });
    }
  }, [isGraphExpanded, terminalName, scriptName]);

  const isBackgroundDark = (color = "#ffffff") => {
    if (!color || typeof color !== "string") {
      console.error("Invalid color value:", color);
      return false;
    }

    const hex = color.replace("#", "");
    if (hex.length !== 6) {
      console.error("Invalid hex color format:", color);
      return false;
    }

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const getAutoTextColor = (bgColor) => {
    return isBackgroundDark(bgColor) ? "#ffffff" : "#000000";
  };

  const iconColor = isBackgroundDark(backgroundColor) ? "#ffffff" : "#000000";
  const autoTextColor = getAutoTextColor(backgroundColor);
  const handleDeleteClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const iconSize = widgetData.areaGraph ? "medium" : "small";
  const iconStyle = {
    color: iconColor,
    textShadow: `0 0 5px ${iconColor === "#ffffff" ? "#000000" : "#ffffff"}`,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    padding: widgetData.areaGraph ? "8px" : "4px",
  };

  return (
    <>
      <ResizableBox
        width={defaultSize.width || widgetData.width}
        height={defaultSize.height || widgetData.height}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        onResize={handleResize}
        resizeHandles={["se"]}
      >
        <Tooltip title={formatTimestamp(state.timestamp)}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              border: "1px solid #007c89",
              borderRadius: "8px",
              padding: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: backgroundColor,
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                flexShrink: 0,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: categoryStyle.fontFamily,
                    fontSize: categoryStyle.fontSize,
                    color: autoTextColor,
                    fontStyle: categoryStyle.fontStyle,
                  }}
                  onClick={() => handleEdit("category")}
                >
                  {widgetData.primaryCategory}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: terminalStyle.fontFamily,
                    fontSize: terminalStyle.fontSize,
                    color: autoTextColor,
                    fontStyle: terminalStyle.fontStyle,
                  }}
                  onClick={() => handleEdit("scriptName")}
                >
                  {scriptName || widgetData.scriptName}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: valueStyle.fontFamily,
                    fontSize: valueStyle.fontSize,
                    color: valueStyle.fontColor || autoTextColor,
                    fontStyle: valueStyle.fontStyle,
                    fontWeight: "bold",
                  }}
                  onClick={() => handleEdit("value")}
                >
                  {Number(state.value).toFixed(widgetData.decimalPlaces)}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => fetchData()}>
                  <RefreshIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleEdit("value")}
                  aria-label="Edit widget"
                  size={iconSize}
                  sx={iconStyle}
                >
                  <EditIcon fontSize={iconSize} />
                </IconButton>
                <IconButton
                  onClick={handleDeleteClick}
                  aria-label="Delete widget"
                  size={iconSize}
                  sx={iconStyle}
                >
                  <DeleteIcon fontSize={iconSize} />
                </IconButton>
              </Box>
            </Box>

            {widgetData.areaGraph && (
              <Box
                sx={{
                  flex: 1,
                  mt: 2,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {state.scriptData.length > 0 &&
                  (graphType === "simple" ? (
                    <LineGraph
                      data={state.scriptData}
                      expanded={false}
                      backgroundColor={backgroundColor}
                      hideXAxis={true}
                      scriptName={scriptName}
                    />
                  ) : (
                    <MultiAxisGraph
                      data={state.scriptData}
                      expanded={false}
                      backgroundColor={backgroundColor}
                      hideXAxis={true}
                      scriptName={scriptName}
                    />
                  ))}
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                flexShrink: 0,
              }}
            >
              {widgetData.areaGraph && (
                <Typography color={autoTextColor}>
                  Last Sync {formatTimestamp(state.timestamp)}
                </Typography>
              )}
              {widgetData.areaGraph && (
                <Tooltip title="Expand graph">
                  <IconButton
                    onClick={handleExpandClick}
                    aria-label="Expand graph"
                    sx={{
                      mt: 1,
                      color: iconColor,
                      textShadow: `0 0 5px ${
                        iconColor === "#ffffff" ? "#000000" : "#ffffff"
                      }`,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    <KeyboardArrowDown />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Tooltip>
      </ResizableBox>
      <FormatDialog
        open={isFormatDialog}
        onClose={() => setIsFormatDialog(false)}
        currentStyles={
          selectedText === "category"
            ? categoryStyle
            : selectedText === "terminalName"
            ? terminalStyle
            : selectedText === "value"
            ? valueStyle
            : {}
        }
        setCurrentStyles={(styles) => {
          if (selectedText === "category") {
            setCategoryStyle(styles);
          } else if (selectedText === "terminalName") {
            setTerminalStyle(styles);
          } else if (selectedText === "value") {
            setValueStyle(styles);
          }

          if (styles.backgroundColor) {
            setBackgroundColor(styles.backgroundColor);
            localStorage.setItem(
              `widgetBackgroundColor_${widgetData.id}`,
              styles.backgroundColor
            );
          }
        }}
        backgroundColor={backgroundColor}
      />
      <Dialog open={isConfirmDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this widget?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDialogOpen && isGraphExpanded}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiDialogTitle-root": {
            backgroundColor: "#1976d2",
            color: "#fff",
            padding: "16px",
          },
          "& .MuiDialogContent-root": {
            backgroundColor: "#f5f5f5",
            padding: "24px",
          },
          "& .MuiButton-contained": {
            backgroundColor: "#1976d2",
            color: "#fff",
            width: "100%",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          },
        }}
      >
        <DialogTitle>
          {terminalName + " " + selectedScript}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Grid item xs={2}>
            <FormControl size="small" sx={{ mb: 2, width: 250 }}>
              <InputLabel>Compare with</InputLabel>
              <Select
                multiple
                value={comparisonScripts}
                onChange={handleComparisonScriptChange}
                renderValue={(selected) => selected.join(", ")}
                sx={{ width: "100%" }}
              >
                <MenuItem value="none">None</MenuItem>
                {availableScripts.map((script) => (
                  <MenuItem key={script} value={script}>
                    {script}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 450, marginBottom: 2 }}>
            {graphType === "simple" ? (
              <LineGraph
                data={state.detailedData}
                comparisonData={comparisonData}
                expanded={true}
                scriptName={selectedScript}
              />
            ) : (
              <MultiAxisGraph
                data={state.detailedData}
                comparisonData={comparisonData}
                expanded={true}
                scriptName={selectedScript}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Widget;
