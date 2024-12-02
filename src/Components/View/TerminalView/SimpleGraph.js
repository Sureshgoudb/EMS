import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  Bar,
  ComposedChart,
} from "recharts";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  IconButton,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
} from "@mui/material";
import { ZoomIn, ZoomOut, RestartAlt } from "@mui/icons-material";

import {
  BarChart as GraphTypeIcon,
  CompareArrows as CompareScriptsIcon,
} from "@mui/icons-material";

const apiUrl = process.env.REACT_APP_API_LOCAL_URL;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")} ${String(
    date.getUTCHours()
  ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(
    date.getUTCSeconds()
  ).padStart(2, "0")}`;
};

const SimpleGraph = ({ widgetData, showXAxis = true, isExpanded = false }) => {
  const [error, setError] = useState(null);
  const [availableScripts, setAvailableScripts] = useState([]);
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [chartType, setChartType] = useState("Area");
  const [zoomRange, setZoomRange] = useState({
    start: 0,
    end: 100,
    minPoints: 5,
  });
  const [displayData, setDisplayData] = useState([]);
  const [isGraphTypeDialogOpen, setIsGraphTypeDialogOpen] = useState(false);
  const [isCompareScriptsDialogOpen, setIsCompareScriptsDialogOpen] =
    useState(false);
  const chartRef = useRef(null);
  const colors = [
    "#2196f3",
    "#f44336",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#795548",
  ];

  // Filter data based on configuration and zoom state
  const filterDataByConfig = useCallback(
    (data) => {
      if (!data || data.length === 0) return [];

      let filteredData = data;

      if (isExpanded) {
        filteredData = data.slice(-900);
      } else if (!widgetData.xAxisConfiguration) {
        filteredData = data.slice(-10);
      } else if (widgetData.xAxisConfiguration.type === "records") {
        filteredData = data.slice(-widgetData.xAxisConfiguration.value);
      } else if (widgetData.xAxisConfiguration.type === "seconds") {
        const cutoffTime = new Date(
          Date.now() - widgetData.xAxisConfiguration.value * 1000
        );
        filteredData = data.filter(
          (item) => new Date(item.timestamp) > cutoffTime
        );
      }

      // Apply zoom range
      const startIdx = Math.floor(
        filteredData.length * (zoomRange.start / 100)
      );
      const endIdx = Math.ceil(filteredData.length * (zoomRange.end / 100));
      return filteredData.slice(startIdx, endIdx);
    },
    [widgetData.xAxisConfiguration, isExpanded, zoomRange]
  );

  // Fetch available scripts only when expanded
  useEffect(() => {
    if (!isExpanded && !isCompareScriptsDialogOpen) return;

    const fetchAvailableScripts = async () => {
      try {
        const response = await fetch(
          `${apiUrl}terminal/${widgetData.terminalID}/scripts`
        );
        if (!response.ok) throw new Error("Failed to fetch scripts");
        const data = await response.json();
        const scriptNames = Object.keys(data.scripts).filter(
          (script) => script !== widgetData.scriptName
        );
        setAvailableScripts(scriptNames);
      } catch (err) {
        console.error("Error fetching scripts:", err);
        setError("Failed to load available scripts");
      }
    };

    fetchAvailableScripts();
  }, [
    widgetData.terminalID,
    widgetData.scriptName,
    isExpanded,
    isCompareScriptsDialogOpen,
  ]);

  const fetchScriptData = async (scriptName) => {
    try {
      const response = await fetch(
        `${apiUrl}terminal/${widgetData.terminalID}/script/${encodeURIComponent(
          scriptName
        )}/history`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch data for ${scriptName}`);
      const data = await response.json();
      return [...data].map((item) => ({
        timestamp: formatTimestamp(item.timestamp),
        [scriptName]: item[scriptName],
      }));
    } catch (err) {
      console.error(`Error fetching data for ${scriptName}:`, err);
      return [];
    }
  };

  // Update data without loading state
  useEffect(() => {
    let isMounted = true;

    const updateData = async () => {
      try {
        const mainData = await fetchScriptData(widgetData.scriptName);
        if (!isMounted) return;

        let allData = [...mainData].reverse().map((item) => ({
          ...item,
          [widgetData.scriptName]: item[widgetData.scriptName],
        }));

        for (const script of selectedScripts) {
          const scriptData = await fetchScriptData(script);
          const reversedScriptData = [...scriptData].reverse();
          allData = allData.map((item, index) => ({
            ...item,
            [script]: reversedScriptData[index]?.[script],
          }));
        }

        if (!isMounted) return;

        setMergedData(allData);
        const filteredData = filterDataByConfig(allData);
        setDisplayData(filteredData);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          setError("Failed to load comparison data");
        }
      }
    };

    updateData();
    const interval = setInterval(updateData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedScripts, widgetData.scriptName, filterDataByConfig]);

  const handleScriptChange = (event) => {
    setSelectedScripts(event.target.value);
  };

  // Zoom handling
  const handleWheel = useCallback((event) => {
    event.preventDefault();

    if (!chartRef.current) return;

    const zoomSensitivity = 1.5;
    const zoomDirection = event.deltaY > 0 ? 1 : -1;

    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / rect.width;

    setZoomRange((prevRange) => {
      const currentRangeSize = prevRange.end - prevRange.start;
      const newRangeSize = Math.max(
        5,
        Math.min(
          100,
          currentRangeSize * (1 + zoomDirection * 0.1 * zoomSensitivity)
        )
      );

      const rangeCenter = prevRange.start + mouseX * currentRangeSize;
      let newStart = rangeCenter - newRangeSize * mouseX;
      let newEnd = newStart + newRangeSize;

      if (newStart < 0) {
        newStart = 0;
        newEnd = newRangeSize;
      }
      if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - newRangeSize;
      }

      return {
        start: Math.max(0, newStart),
        end: Math.min(100, newEnd),
        minPoints: prevRange.minPoints,
      };
    });
  }, []);

  const handleResetZoom = () => {
    setZoomRange({
      start: 0,
      end: 100,
      minPoints: 5,
    });
  };

  const handleZoomButton = (zoomIn) => {
    setZoomRange((prevRange) => {
      const currentRangeSize = prevRange.end - prevRange.start;
      const rangeCenter = prevRange.start + currentRangeSize / 2;
      const newRangeSize = Math.max(
        5,
        Math.min(100, currentRangeSize * (zoomIn ? 0.8 : 1.2))
      );

      let newStart = rangeCenter - newRangeSize / 2;
      let newEnd = rangeCenter + newRangeSize / 2;

      if (newStart < 0) {
        newStart = 0;
        newEnd = newRangeSize;
      }
      if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - newRangeSize;
      }

      return {
        start: Math.max(0, newStart),
        end: Math.min(100, newEnd),
        minPoints: prevRange.minPoints,
      };
    });
  };

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.addEventListener("wheel", handleWheel, { passive: false });
      return () => chartElement.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    const filteredData = filterDataByConfig(mergedData);
    setDisplayData(filteredData);
  }, [mergedData, filterDataByConfig]);

  useEffect(() => {
    const chartNode = chartRef.current;
    if (!chartNode) return;

    chartNode.addEventListener("wheel", handleWheel, { passive: false });
    return () => chartNode.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1, backgroundColor: "white" }}>
          <Box sx={{ mb: 1 }}>{label}</Box>
          {payload.map((entry, index) => (
            <Box key={entry.name} sx={{ color: colors[index % colors.length] }}>
              {entry.name}:{" "}
              {entry.value?.toFixed(widgetData.decimalPlaces || 2)}
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };
  const isColorDark = (backgroundColor) => {
    if (!backgroundColor || backgroundColor === "transparent") return false;
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  const renderChartType = (dataKey, color) => {
    switch (chartType) {
      case "Line":
        return (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            dot={false}
            isAnimationActive={false}
          />
        );
      case "Area":
        return (
          <Area
            type="monotone"
            dataKey={dataKey}
            fill={color}
            stroke={color}
            fillOpacity={0.3}
            isAnimationActive={false}
          />
        );
      case "Bar":
        return <Bar dataKey={dataKey} fill={color} isAnimationActive={false} />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleCompareScriptsDialog = () => {
    setIsCompareScriptsDialogOpen(true);
  };

  const handleCompareScriptsClose = () => {
    setIsCompareScriptsDialogOpen(false);
  };

  const handleCompareScriptsConfirm = () => {
    // Confirm selected scripts
    setIsCompareScriptsDialogOpen(false);
  };

  const handleScriptToggle = (script) => {
    setSelectedScripts((prev) =>
      prev.includes(script)
        ? prev.filter((s) => s !== script)
        : [...prev, script]
    );
  };

  const handleGraphTypeDialog = () => {
    setIsGraphTypeDialogOpen(true);
  };

  const handleGraphTypeClose = () => {
    setIsGraphTypeDialogOpen(false);
  };

  const handleGraphTypeChange = (type) => {
    setChartType(type);
    setIsGraphTypeDialogOpen(false);
  };

  // Render additional icons for non-expanded view
  const renderNonExpandedIcons = () => {
    if (isExpanded) return null;

    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 85,
          zIndex: 10,
          display: "flex",
          p: 1,
        }}
      >
        <MuiTooltip title="Change Graph Type">
          <IconButton
            size="small"
            sx={{
              color: isColorDark(widgetData.properties.backgroundColor)
                ? "#fff"
                : "#000",
            }}
            onClick={handleGraphTypeDialog}
          >
            <GraphTypeIcon fontSize="small" />
          </IconButton>
        </MuiTooltip>
        <MuiTooltip title="Compare Scripts">
          <IconButton
            size="small"
            sx={{
              color: isColorDark(widgetData.properties.backgroundColor)
                ? "#fff"
                : "#000",
            }}
            onClick={handleCompareScriptsDialog}
          >
            <CompareScriptsIcon fontSize="small" />
          </IconButton>
        </MuiTooltip>
      </Box>
    );
  };

  // Graph Type Selection Dialog
  const renderGraphTypeDialog = () => (
    <Dialog open={isGraphTypeDialogOpen} onClose={handleGraphTypeClose}>
      <DialogTitle>Select Graph Type</DialogTitle>
      <DialogContent>
        <List>
          {["Line", "Area", "Bar"].map((type) => (
            <ListItem
              key={type}
              button
              onClick={() => handleGraphTypeChange(type)}
            >
              <ListItemText primary={type} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );

  // Compare Scripts Dialog
  const renderCompareScriptsDialog = () => (
    <Dialog
      open={isCompareScriptsDialogOpen}
      onClose={handleCompareScriptsClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Compare Scripts</DialogTitle>
      <DialogContent>
        <List>
          {availableScripts.map((script) => (
            <ListItem
              key={script}
              button
              onClick={() => handleScriptToggle(script)}
              dense
            >
              <Checkbox
                edge="start"
                checked={selectedScripts.includes(script)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={script} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={handleCompareScriptsClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleCompareScriptsConfirm}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ width: "100%", height: "100%" }} ref={chartRef}>
      {renderNonExpandedIcons()}
      {renderGraphTypeDialog()}
      {renderCompareScriptsDialog()}
      {isExpanded && (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, ml: 2 }}
        >
          <FormControl sx={{ flex: 1, mt: 2, ml: 8 }} size="small">
            <InputLabel>Compare Scripts</InputLabel>
            <Select
              multiple
              value={selectedScripts}
              onChange={handleScriptChange}
              input={<OutlinedInput label="Compare Scripts" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {availableScripts.map((script) => (
                <MenuItem key={script} value={script}>
                  {script}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120, mt: 2, mr: 2 }} size="small">
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              label="Chart Type"
            >
              <MenuItem value="Line">Line</MenuItem>
              <MenuItem value="Area">Area</MenuItem>
              <MenuItem value="Bar">Bar</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ minWidth: 120, mt: 2, mr: 2 }}>
            <MuiTooltip title="Zoom In">
              <IconButton onClick={() => handleZoomButton(true)} size="small">
                <ZoomIn />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Zoom Out">
              <IconButton onClick={() => handleZoomButton(false)} size="small">
                <ZoomOut />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Reset Zoom">
              <IconButton onClick={handleResetZoom} size="small">
                <RestartAlt />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>
      )}
      <Box
        ref={chartRef}
        sx={{
          height: showXAxis ? "calc(100% - 80px)" : "100%",
          cursor: "zoom-in",
        }}
      >
        <ResponsiveContainer>
          <ComposedChart
            data={displayData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" hide={!showXAxis} />
            <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {renderChartType(widgetData.scriptName, colors[0])}
            {selectedScripts.map((script, index) =>
              renderChartType(script, colors[(index + 1) % colors.length])
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default SimpleGraph;
