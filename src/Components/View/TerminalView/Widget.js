import React, { useState, useEffect, useCallback, useReducer } from "react";
import MultiAxisGraph from "./MultiAxisGraph";
import EnhancedDialog from "./EnhancedDialog";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import LineGraph from "./LineGraph";
import FormatDialog from "./FormatDialog";
import { useParams } from "react-router";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const Widget = ({
  widgetData,
  onResize,
  onDelete,
  onDragStart,
  onDrop,
  terminalName,
}) => {
  const { terminalID } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormatDialog, setIsFormatDialog] = useState(false);
  const [availableScripts, setAvailableScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState("");
  const [scriptName, setScriptName] = useState(widgetData.scriptName || "");
  const [comparisonScriptName, setComparisonScriptName] = useState("");
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonScripts, setComparisonScripts] = useState([]);
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [graphType, setGraphType] = useState(widgetData.graphType || "simple");
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const properties = widgetData.properties || {};

  const [backgroundColor, setBackgroundColor] = useState(
    properties.backgroundColor || "#ffffff"
  );
  const [textStyle, setTextStyle] = useState({
    fontFamily: properties.fontFamily || "Arial",
    fontSize: properties.fontSize || "40px",
    fontColor: properties.fontColor || "#FF0000",
    fontStyle: properties.fontStyle || "normal",
  });

  const [currentStyles, setCurrentStyles] = useState({
    fontFamily: widgetData.properties?.fontFamily || "Arial",
    fontSize: widgetData.properties?.fontSize || "40px",
    fontColor: widgetData.properties?.fontColor || "#FF0000",
    fontStyle: widgetData.properties?.fontStyle || "normal",
    fontWeight: widgetData.properties?.fontWeight || "normal",
    backgroundColor: widgetData.properties?.backgroundColor || "#ffffff",
  });

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

  // ----------- Fetch scripts current & hisrory values -----------
  const fetchScriptData = async (terminalID, scriptName) => {
    try {
      const currentDataResponse = await fetch(
        `${apiKey}terminal/${terminalID}/script/${scriptName}/currentValue`
      );
      const currentData = await currentDataResponse.json();

      const historicalDataResponse = await fetch(
        `${apiKey}terminal/${terminalID}/script/${scriptName}/history`
      );
      const historicalData = await historicalDataResponse.json();

      return {
        value: currentData[scriptName],
        timestamp: currentData.timestamp,
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

  // ----------- Drag and Drop -----------
  const handleDragStart = (e) => {
    onDragStart(e, terminalID);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop(terminalID);
  };

  // ----------- Fetch available scripts -----------
  const fetchScripts = async (terminalID) => {
    try {
      const response = await fetch(`${apiKey}terminal/${terminalID}/scripts`);
      const data = await response.json();

      if (data && data.scripts) {
        return Object.keys(data.scripts);
      } else {
        console.error("Unexpected response structure:", data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching scripts:", error);
      return [];
    }
  };
  // ------------ Trasform data for graph -----------
  const transformDataForGraph = (data) => {
    return data.map((item) => ({
      x: new Date(item.timestamp),
      y: parseFloat(item[Object.keys(item)[0]]),
    }));
  };

  const actions = {
    UPDATE_CURRENT_DATA: "UPDATE_CURRENT_DATA",
    UPDATE_HISTORICAL_DATA: "UPDATE_HISTORICAL_DATA",
    UPDATE_EXPANDED_DATA: "UPDATE_EXPANDED_DATA",
    SET_ERROR: "SET_ERROR",
    CLEAR_HISTORICAL_DATA: "CLEAR_HISTORICAL_DATA",
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
      case actions.CLEAR_HISTORICAL_DATA:
        return {
          ...state,
          scriptData: [],
          detailedData: [],
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(dataReducer, {
    value: widgetData.currentValue,
    timestamp: "",
    scriptData: [],
    detailedData: [],
    error: null,
  });

  const EXPANDED_LIMIT = 900;
  const LIVE_UPDATE_INTERVAL = 20000;

  const fetchData = useCallback(
    async (isExpanded = false) => {
      if (terminalName && scriptName) {
        try {
          // Fetch current value
          const currentDataResponse = await fetch(
            `${apiKey}terminal/${terminalID}/script/${scriptName}/currentValue`
          );
          const currentData = await currentDataResponse.json();

          dispatch({
            type: actions.UPDATE_CURRENT_DATA,
            payload: {
              value: parseFloat(currentData[scriptName]),
              timestamp: currentData.timestamp,
            },
          });

          // Fetch historical data
          const historicalDataResponse = await fetch(
            `${apiKey}terminal/${terminalID}/script/${scriptName}/history`
          );
          const historicalData = await historicalDataResponse.json();

          // Sort data by timestamp
          const sortedData = historicalData.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          // Transform and update both expanded and regular views
          const expandedData = getLatestData(sortedData, EXPANDED_LIMIT);
          const regularData = getLatestData(
            sortedData,
            widgetData.xAxisConfiguration?.value || 100
          );

          const transformedExpandedData = transformDataForGraph(expandedData);
          const transformedRegularData = transformDataForGraph(regularData);

          // Always update both datasets
          dispatch({
            type: actions.UPDATE_EXPANDED_DATA,
            payload: transformedExpandedData,
          });
          dispatch({
            type: actions.UPDATE_HISTORICAL_DATA,
            payload: transformedRegularData,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          dispatch({
            type: actions.SET_ERROR,
            payload: "Failed to fetch data",
          });
        }
      }
    },
    [terminalName, scriptName, terminalID, widgetData.xAxisConfiguration]
  );

  useEffect(() => {
    fetchData();

    const liveUpdateInterval = setInterval(() => {
      fetchData();
    }, LIVE_UPDATE_INTERVAL);

    return () => clearInterval(liveUpdateInterval);
  }, [fetchData]);

  // Effect for handling refresh interval (complete data refresh)
  useEffect(() => {
    if (widgetData.refreshInterval && widgetData.refreshInterval > 0) {
      const refreshInterval = setInterval(() => {
        dispatch({ type: actions.CLEAR_HISTORICAL_DATA });
        fetchData();
      }, widgetData.refreshInterval * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [widgetData.refreshInterval, fetchData]);
  const limitDataPoints = (data, limit) => {
    if (!Array.isArray(data) || data.length <= limit) return data;

    const step = Math.ceil(data.length / limit);
    return data.filter((_, index) => index % step === 0).slice(0, limit);
  };

  const getLatestData = (data, limit) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return data
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  };

  useEffect(() => {
    if (isGraphExpanded && comparisonScripts.length > 0) {
      const updateComparisonData = async () => {
        const newComparisonData = {};
        for (const script of comparisonScripts) {
          const data = await fetchScriptData(terminalID, script);
          const transformedData = transformDataForGraph(data.data || []);
          const limitedData = limitDataPoints(transformedData, EXPANDED_LIMIT);
          newComparisonData[script] = limitedData;
        }
        setComparisonData(newComparisonData);
      };

      updateComparisonData();

      const comparisonUpdateInterval = setInterval(() => {
        updateComparisonData();
      }, LIVE_UPDATE_INTERVAL);

      return () => clearInterval(comparisonUpdateInterval);
    }
  }, [isGraphExpanded, comparisonScripts, terminalID]);
  const handleExpandClick = () => {
    setIsGraphExpanded(true);
    setIsDialogOpen(true);
    fetchData(true);
  };

  // ------------ Delete Widget -----------
  const handleDeleteWidget = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (!widgetData.scriptId) {
        throw new Error("Script ID not found");
      }

      // Call the parent component's delete function with scriptId
      await onDelete(widgetData.scriptId);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting widget:", error);
      setDeleteError(
        error.message || "Failed to delete widget. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsGraphExpanded(false);
    setComparisonScriptName("");
    setComparisonData([]);
    setComparisonScripts([]);
  };

  const handleConfirmDelete = () => {
    handleDeleteWidget();
    setIsConfirmDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  const defaultSize = widgetData.areaGraph
    ? { width: 310, height: 310 }
    : { width: 200, height: 125 };
  const minConstraints = widgetData.areaGraph ? [310, 310] : [200, 125];
  const maxConstraints = widgetData.areaGraph ? [620, 400] : [300, 200];

  const handleResize = (event, { size }) => {
    onResize(terminalID, size);
  };

  // ------------ Compare Widget -----------
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

  useEffect(() => {
    const fetchComparisonData = async () => {
      const newComparisonData = {};
      for (const script of comparisonScripts) {
        const data = await fetchScriptData(terminalID, script);
        const transformedData = transformDataForGraph(data.data || []);
        // Apply the same limiting logic to comparison data
        const limitedData = limitDataPoints(transformedData, EXPANDED_LIMIT);
        newComparisonData[script] = limitedData;
      }
      setComparisonData(newComparisonData);
    };

    if (comparisonScripts.length > 0) {
      fetchComparisonData();
    } else {
      setComparisonData({});
    }
  }, [comparisonScripts, terminalID]);
  useEffect(() => {
    if (isGraphExpanded) {
      fetchScripts(terminalID).then((scripts) => {
        setAvailableScripts(scripts);
        setSelectedScript(scriptName);
      });
    }
  }, [isGraphExpanded, terminalID, scriptName]);

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

  const iconSize = widgetData.areaGraph ? "extra-small" : "extra-small";
  const iconStyle = {
    color: iconColor,
    fontSize: "16px",
    padding: "2px",
    borderRadius: "50%",
    transition: "background-color 0.2s ease, transform 0.2s",
    textShadow: `0 0 3px ${iconColor === "#ffffff" ? "#000000" : "#ffffff"}`,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transform: "scale(1.05)",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
    },
  };
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const handleEdit = () => {
    setIsFormatDialog(true);
  };

  const handleStylesUpdate = (newStyles) => {
    setCurrentStyles(newStyles);
    setBackgroundColor(newStyles.backgroundColor || backgroundColor);
    setTextStyle({
      fontFamily: newStyles.fontFamily || textStyle.fontFamily,
      fontSize: newStyles.fontSize || textStyle.fontSize,
      fontColor: newStyles.fontColor || textStyle.fontColor,
      fontStyle: newStyles.fontStyle || textStyle.fontStyle,
      fontWeight: newStyles.fontWeight || textStyle.fontWeight,
    });
  };

  return (
    <>
      <ResizableBox
        draggable
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        width={defaultSize.width || widgetData.width}
        height={defaultSize.height || widgetData.height}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        onResize={handleResize}
        resizeHandles={["se"]}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
                position: "relative",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: textStyle.fontFamily,
                    fontSize: 20,
                    color: autoTextColor,
                    fontStyle: textStyle.fontStyle,
                  }}
                  onClick={() => handleEdit("scriptName")}
                >
                  {scriptName}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: textStyle.fontFamily,
                    fontSize: textStyle.fontSize,
                    color: textStyle.fontColor || autoTextColor,
                    fontStyle: textStyle.fontStyle,
                    fontWeight: "bold",
                  }}
                  onClick={() => handleEdit("value")}
                >
                  {Number(state.value).toFixed(widgetData.decimalPlaces)}
                </Typography>
              </Box>
              {isHovered && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <IconButton
                    aria-label="Refresh widget"
                    size={iconSize}
                    sx={iconStyle}
                    onClick={() => fetchData()}
                  >
                    <RefreshIcon fontSize={iconSize} />
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
              )}
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography color={autoTextColor} fontSize="small">
                    Last Sync {formatTimestamp(state.timestamp)}
                  </Typography>
                </Box>
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
        currentStyles={currentStyles}
        setCurrentStyles={setCurrentStyles}
        terminalID={terminalID}
        scriptName={scriptName}
        isNewWidget={false}
        onStylesUpdate={handleStylesUpdate}
      />
      <Dialog open={isConfirmDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this widget?
          {deleteError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="primary"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <EnhancedDialog
        isDialogOpen={isDialogOpen}
        isGraphExpanded={isGraphExpanded}
        handleCloseDialog={handleCloseDialog}
        terminalName={terminalName}
        selectedScript={selectedScript}
        comparisonScripts={comparisonScripts}
        handleComparisonScriptChange={handleComparisonScriptChange}
        availableScripts={availableScripts}
        graphType={graphType}
        state={state}
        comparisonData={comparisonData}
        refreshInterval={widgetData.refreshInterval} // Pass refreshInterval to EnhancedDialog
      />
    </>
  );
};

export default Widget;
