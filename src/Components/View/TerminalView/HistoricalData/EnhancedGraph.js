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
  alpha,
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
import dayjs from "dayjs";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");
};

const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(4px)",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, color: theme.palette.text.primary }}
        >
          {formatTimestamp(label)}
        </Typography>
        {payload.map((entry, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: entry.color,
                mr: 1,
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {`${entry.name}: ${entry.value}`}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
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

  const handleResetZoom = () => {
    setZoomRange({
      start: 0,
      end: 100,
      minPoints: 5,
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

  const getColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.info.main,
      "#9C27B0",
      "#FF9800",
      "#00BCD4",
      "#795548",
    ];
    return colors[index % colors.length];
  };

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
          stroke={alpha(theme.palette.divider, 0.3)}
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
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            paddingBottom: "20px",
            fontSize: "14px",
          }}
        />
        {selectedGraphScripts.map((script, index) => {
          const color = getColor(index);
          if (chartType === "area") {
            return (
              <Area
                key={script}
                type="monotone"
                dataKey={script}
                name={script}
                stroke={color}
                fill={color}
                fillOpacity={0.3}
                strokeWidth={1.5}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 2,
                  fill: color,
                }}
              />
            );
          } else if (chartType === "line") {
            return (
              <Line
                key={script}
                type="monotone"
                dataKey={script}
                name={script}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 2,
                  fill: color,
                }}
              />
            );
          } else {
            return (
              <Bar
                key={script}
                dataKey={script}
                name={script}
                fill={color}
                fillOpacity={0.8}
              />
            );
          }
        })}
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
          backgroundImage: `linear-gradient(to bottom right, ${alpha(
            theme.palette.primary.main,
            0.05
          )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,

          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: "bold",
            textShadow: "0px 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {selectedTerminal}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {[
            {
              icon: <ZoomInIcon />,
              tooltip: "Zoom In",
              onClick: () => handleZoomButton(true),
            },
            {
              icon: <ZoomOutIcon />,
              tooltip: "Zoom Out",
              onClick: () => handleZoomButton(false),
            },
            {
              icon: <RestartAltIcon />,
              tooltip: "Reset Zoom",
              onClick: handleResetZoom,
            },
            {
              icon: <PictureAsPdfIcon />,
              tooltip: "Export to PDF",
              onClick: graphexportToPdf,
            },
            {
              icon: isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />,
              tooltip: isFullScreen ? "Exit Fullscreen" : "Fullscreen",
              onClick: toggleFullScreen,
            },
            {
              icon: <CloseIcon />,
              tooltip: "Close",
              onClick: handleCloseGraph,
            },
          ].map((button, index) => (
            <IconButton
              key={index}
              onClick={button.onClick}
              sx={{
                color: "white",
                "&:hover": {
                  bgcolor: alpha("#fff", 0.1),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease-in-out",
              }}
              size="small"
            >
              <Tooltip title={button.tooltip} arrow>
                {button.icon}
              </Tooltip>
            </IconButton>
          ))}
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
            mt: 2,
          }}
        >
          <FormControl sx={{ minWidth: 200, flex: 1 }} size="small">
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
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="chart-type-label">Chart Type</InputLabel>
            <Select
              labelId="chart-type-label"
              label="Chart Type"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
          elevation={4}
          sx={{
            height: isFullScreen ? "100vh" : 500,
            borderRadius: 2,
            transition: "all 0.3s ease",
            overflow: "hidden",
            position: "relative",
            cursor: "zoom-in",
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            ref={chartContainerRef}
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 1,
              p: 2,
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
