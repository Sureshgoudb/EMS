import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  useTheme,
  Paper,
  Typography,
} from "@mui/material";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

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

const EnhancedGraph = ({
  openGraph,
  handleCloseGraph,
  selectedTerminal,
  columns,
  selectedGraphScripts,
  handleScriptSelect,
  reversedGraphData,
  graphexportToPdf,
}) => {
  const theme = useTheme();
  const [zoomRange, setZoomRange] = useState({
    start: 0,
    end: 100,
    minPoints: 5,
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chartType, setChartType] = useState("area");
  const chartContainerRef = useRef(null);
  const containerRef = useRef(null);

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const getColor = (index) => {
    const colors = [
      "#2196F3",
      "#FF5722",
      "#4CAF50",
      "#9C27B0",
      "#FF9800",
      "#E91E63",
      "#00BCD4",
      "#3F51B5",
      "#F44336",
      "#009688",
    ];
    return colors[index % colors.length];
  };

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    const container = chartContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / rect.width;

    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;

    setZoomRange((prevRange) => {
      const currentRangeSize = prevRange.end - prevRange.start;
      const newRangeSize = Math.max(
        5,
        Math.min(100, currentRangeSize * zoomFactor)
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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const getZoomedData = useCallback(() => {
    const startIndex = Math.floor(
      (reversedGraphData.length * zoomRange.start) / 100
    );
    const endIndex = Math.ceil(
      (reversedGraphData.length * zoomRange.end) / 100
    );
    return reversedGraphData.slice(startIndex, endIndex);
  }, [reversedGraphData, zoomRange]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]);

  const renderChart = () => {
    const ChartComponent =
      chartType === "area"
        ? AreaChart
        : chartType === "line"
        ? LineChart
        : BarChart;
    const DataComponent =
      chartType === "area" ? Area : chartType === "line" ? Line : Bar;

    const zoomedData = getZoomedData();

    return (
      <ChartComponent
        data={zoomedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.palette.divider}
          opacity={0.5}
        />
        <XAxis
          dataKey="timestamp"
          stroke={theme.palette.text.primary}
          tickFormatter={formatTimestamp}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 10 }}
          angle={-45}
        />
        <YAxis
          stroke={theme.palette.text.primary}
          tick={{ fontSize: 12 }}
          width={60}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 8,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[3],
            padding: "10px",
          }}
          cursor={{ stroke: theme.palette.primary.main, strokeWidth: 1 }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            paddingBottom: "20px",
            fontSize: "14px",
          }}
        />
        {selectedGraphScripts.map((script, index) => (
          <DataComponent
            key={script}
            type="monotone"
            dataKey={script}
            name={script}
            stroke={getColor(index)}
            fill={chartType === "line" ? "none" : getColor(index)}
            strokeWidth={2}
            fillOpacity={chartType === "area" ? 0.4 : 0.8}
            dot={chartType === "line" ? { r: 0.1 } : false}
            activeDot={
              chartType !== "bar"
                ? {
                    r: 6,
                    stroke: theme.palette.background.paper,
                    strokeWidth: 0.1,
                  }
                : false
            }
          />
        ))}
      </ChartComponent>
    );
  };

  return (
    <Dialog
      open={openGraph}
      onClose={handleCloseGraph}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: theme.palette.primary.main,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          {selectedTerminal}
        </Typography>
        <Box>
          <IconButton
            onClick={() => handleZoomButton(true)}
            sx={{ color: "white", mr: 1 }}
            size="small"
          >
            <Tooltip title="Zoom In" arrow>
              <ZoomInIcon />
            </Tooltip>
          </IconButton>
          <IconButton
            onClick={() => handleZoomButton(false)}
            sx={{ color: "white", mr: 1 }}
            size="small"
          >
            <Tooltip title="Zoom Out" arrow>
              <ZoomOutIcon />
            </Tooltip>
          </IconButton>
          <IconButton
            onClick={handleResetZoom}
            sx={{ color: "white", mr: 1 }}
            size="small"
          >
            <Tooltip title="Reset Zoom" arrow>
              <RestartAltIcon />
            </Tooltip>
          </IconButton>
          <IconButton
            onClick={graphexportToPdf}
            sx={{ color: "white", mr: 1 }}
            size="small"
          >
            <Tooltip title="Export to PDF" arrow>
              <PictureAsPdfIcon />
            </Tooltip>
          </IconButton>
          <IconButton
            onClick={toggleFullScreen}
            sx={{ color: "white", mr: 1 }}
            size="small"
          >
            <Tooltip
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              arrow
            >
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </Tooltip>
          </IconButton>
          <IconButton
            onClick={handleCloseGraph}
            sx={{ color: "white" }}
            size="small"
          >
            <Tooltip title="Close" arrow>
              <CloseIcon />
            </Tooltip>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          <FormControl sx={{ minWidth: 200, flex: 1, mt: 2 }} size="small">
            <InputLabel id="script-select-label">Select Variables</InputLabel>
            <Select
              labelId="script-select-label"
              label="Select Variables"
              multiple
              value={selectedGraphScripts}
              onChange={handleScriptSelect}
              renderValue={(selected) => selected.join(", ")}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {columns
                .filter((col) => col.id !== "timestamp")
                .map((col) => (
                  <MenuItem key={col.id} value={col.id}>
                    <Checkbox
                      checked={selectedGraphScripts.indexOf(col.id) > -1}
                    />
                    <ListItemText primary={col.label} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100, mt: 2 }} size="small">
            <InputLabel id="chart-type-label">Chart Type</InputLabel>
            <Select
              labelId="chart-type-label"
              label="Chart Type"
              value={chartType}
              onChange={handleChartTypeChange}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <MenuItem value="area">Area</MenuItem>
              <MenuItem value="line">Line</MenuItem>
              <MenuItem value="bar">Bar</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Paper
          ref={containerRef}
          elevation={3}
          sx={{
            height: isFullScreen ? "100vh" : 500,
            borderRadius: 2,
            transition: "all 0.3s ease",
            overflow: "hidden",
            position: "relative",
            cursor: "zoom-in",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              opacity: 0.1,
              zIndex: 0,
            },
            "&:hover": {
              cursor: "zoom-in",
            },
          }}
        >
          <Box
            ref={chartContainerRef}
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedGraph;
