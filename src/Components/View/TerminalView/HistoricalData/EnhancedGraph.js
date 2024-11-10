import React, { useState, useRef, useCallback } from "react";
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
} from "@mui/material";
import {
  AreaChart,
  Area,
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
  const [zoomDomain, setZoomDomain] = useState({
    start: 0,
    end: reversedGraphData.length - 1,
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  // ---------- - Full Screen -------------
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // ------------ Zoom In & Zoom Out -------------
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const { start, end } = zoomDomain;
      const range = end - start;
      const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95;
      const newRange = Math.max(
        10,
        Math.min(reversedGraphData.length, range * zoomFactor)
      );

      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const zoomCenter = start + (mouseX / containerRect.width) * range;

      let newStart = Math.max(0, zoomCenter - newRange / 2);
      let newEnd = Math.min(
        reversedGraphData.length - 1,
        zoomCenter + newRange / 2
      );

      if (newEnd - newStart < newRange) {
        if (newStart === 0) {
          newEnd = Math.min(reversedGraphData.length - 1, newRange);
        } else {
          newStart = Math.max(0, reversedGraphData.length - 1 - newRange);
        }
      }

      setZoomDomain({ start: newStart, end: newEnd });
    },
    [zoomDomain, reversedGraphData.length]
  );

  const formatXAxis = (timestamp) => {
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

  return (
    <Dialog
      open={openGraph}
      onClose={handleCloseGraph}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "#f5f5f5",
          borderRadius: "16px",
          boxShadow: "0 14px 45px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        style={{
          background: "linear-gradient(135deg, #3f51b5 30%, #5c6bc0 90%)",
          color: "white",
          textAlign: "center",
          position: "relative",
        }}
      >
        {selectedTerminal}
        <Tooltip title="Export to PDF" arrow>
          <IconButton
            style={{
              position: "absolute",
              right: "90px",
              top: "10px",
              color: "white",
            }}
            onClick={graphexportToPdf}
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"} arrow>
          <IconButton
            style={{
              position: "absolute",
              right: "50px",
              top: "10px",
              color: "white",
            }}
            onClick={toggleFullScreen}
          >
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Close" arrow>
          <IconButton
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              color: "white",
            }}
            onClick={handleCloseGraph}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        <Box mb={3} mt={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="script-select-label">Select Variable</InputLabel>
            <Select
              labelId="script-select-label"
              multiple
              value={selectedGraphScripts}
              onChange={handleScriptSelect}
              renderValue={(selected) => selected.join(", ")}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "16px",
                height: "40px",
                padding: "0 12px",
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  },
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
        </Box>

        <div
          id="graph-container"
          ref={containerRef}
          style={{
            background: "linear-gradient(white, #e3f2fd)",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            height: isFullScreen ? "100vh" : "400px",
          }}
          onWheel={handleWheel}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={reversedGraphData.slice(
                Math.floor(zoomDomain.start),
                Math.ceil(zoomDomain.end) + 1
              )}
              margin={{ top: 30, right: 40, left: 20, bottom: 20 }}
              ref={chartRef}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="timestamp"
                stroke="#555"
                style={{ fontSize: "12px" }}
                tickFormatter={formatXAxis}
                textAnchor="end"
                height={70}
              />
              <YAxis stroke="#555" style={{ fontSize: "13px" }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
                  padding: "10px",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {selectedGraphScripts.map((script, index) => (
                <Area
                  key={script}
                  type="monotone"
                  dataKey={script}
                  stroke={`hsl(${(index * 137) % 360}, 60%, 50%)`}
                  fill={`url(#gradient${index})`}
                  strokeWidth={2}
                  fillOpacity={0.6}
                />
              ))}
              {selectedGraphScripts.map((script, index) => (
                <defs key={`defs${index}`}>
                  <linearGradient
                    id={`gradient${index}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{
                        stopColor: `hsl(${(index * 137) % 360}, 60%, 50%)`,
                        stopOpacity: 1,
                      }}
                    />
                    <stop
                      offset="100%"
                      style={{
                        stopColor: `hsl(${(index * 137) % 360}, 60%, 80%)`,
                        stopOpacity: 0.5,
                      }}
                    />
                  </linearGradient>
                </defs>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedGraph;
