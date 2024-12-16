import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Settings,
  OpenInFull,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  FileDownload,
  Close,
  FullscreenExit,
} from "@mui/icons-material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import TextFormatDialog from "./TextFormatDialog";
import SimpleGraph from "./SimpleGraph";
import MultiAxisGraph from "./MultiAxisGraph";
import html2canvas from "html2canvas";
import jsPdf from "jspdf";
import ConfirmationDialog from "./ConfirmationDialog";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

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

const Widget = ({
  widgetData,
  onDelete,
  style,
  className,
  isLayoutChanging,
}) => {
  const [currentValue, setCurrentValue] = useState(null);
  const [textFormatOpen, setTextFormatOpen] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const graphContainerRef = React.useRef(null);
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const REFRESH_INTERVAL = 30000;
  const [isHovered, setIsHovered] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchData = useCallback(async () => {
    if (!widgetData.terminalID) {
      return;
    }

    try {
      const currentResponse = await fetch(
        `${apiKey}terminal/${widgetData.terminalID}/script/${encodeURIComponent(
          widgetData.scriptName
        )}/currentValue`
      );

      if (!currentResponse.ok) {
        throw new Error(`HTTP error! status: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      if (currentData && currentData[widgetData.scriptName] !== undefined) {
        const newValue = Number(currentData[widgetData.scriptName]).toFixed(
          widgetData.decimalPlaces
        );
        setCurrentValue(newValue);
        const newTimestamp = currentData.timestamp;
        setTimestamp(newTimestamp);
      }

      setError(null);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error("Data fetch error:", err);
    }
  }, [widgetData, isExpanded, isDragging, isLayoutChanging]);

  useEffect(() => {
    let intervalId;

    const initializeAndStartPolling = async () => {
      if (widgetData.terminalID && !isDragging && !isLayoutChanging) {
        await fetchData();

        intervalId = setInterval(fetchData, REFRESH_INTERVAL);
      }
    };

    initializeAndStartPolling();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, widgetData.terminalID, isDragging, isLayoutChanging]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    if (widgetData.terminalID && !isDragging && !isLayoutChanging) {
      fetchData();
      console.log(widgetData, "Widget data");

      const intervalId = setInterval(fetchData, REFRESH_INTERVAL);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [fetchData, widgetData.terminalID, isDragging, isLayoutChanging]);

  useEffect(() => {
    const currentValueElement =
      graphContainerRef.current?.querySelector(".current-value");
    if (currentValueElement && widgetData.properties) {
      currentValueElement.style.fontFamily = widgetData.properties.fontFamily;
      currentValueElement.style.fontSize = `${widgetData.properties.fontSize}px`;
      currentValueElement.style.fontWeight = widgetData.properties.fontWeight;
      currentValueElement.style.color = widgetData.properties.fontColor;
    }
  }, [widgetData]);

  const isColorDark = (backgroundColor) => {
    if (!backgroundColor || backgroundColor === "transparent") return false;
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  const handleDeleteWidget = async () => {
    try {
      const confirmed = await new Promise((resolve) => {
        const handleConfirm = () => resolve(true);
        const handleCancel = () => resolve(false);
        setConfirmationDialog({
          open: true,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
        });
      });

      if (confirmed) {
        await onDelete(widgetData._id);
        console.log("Widget deleted successfully");
        setSnackbar({
          open: true,
          message: "Widget deleted successfully",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Failed to delete widget:", err);
    } finally {
      setConfirmationDialog({ open: false });
    }
  };

  //----------------- Icon Click Handlers ---------------
  const handleIconClick = (event, callback) => {
    event.stopPropagation();
    callback();
  };

  // ----------------- Handle graph expansion -----------------
  const handleExpandGraph = () => {
    setIsExpanded(true);
  };

  // ----------------- Handle fullscreen toggle -----------------
  const handleFullScreenToggle = useCallback(async () => {
    try {
      if (!isFullScreen) {
        const element = graphContainerRef.current;
        if (element?.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element?.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, [isFullScreen]);

  // ----------------- Handle PDF export -----------------
  const handleExportPDF = async () => {
    const graphElement = graphContainerRef.current?.querySelector(
      "#expanded-graph-content"
    );
    if (!graphElement) return;

    try {
      const canvas = await html2canvas(graphElement);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPdf("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${widgetData.scriptName}-graph.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  // ----------------- Handle zoom -----------------
  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? prev + 0.1 : prev - 0.1;
      return Math.max(0.5, Math.min(2, newZoom));
    });
  };

  // ----------------- Handle text properties format updates -----------------
  const handleTextFormatApply = async (newProperties) => {
    try {
      const response = await fetch(`${apiKey}terminal/widget/configure`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          widgetId: widgetData.id,

          properties: newProperties,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        widgetData.properties = newProperties;
        setTextFormatOpen(false);
        setSnackbar({
          open: true,
          message: "Widget updated successfully",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Failed to update widget");
      }
    } catch (err) {
      setError("Failed to update text format");
      setSnackbar({
        open: true,
        message: "Failed to update widget",
        severity: "error",
      });
      console.error("Text format update error:", err);
    }
  };

  // ----------------- Setup effects -----------------

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const GraphComponent =
    widgetData.graphType === "simple" ? SimpleGraph : MultiAxisGraph;

  const renderExpandedContent = () => (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          background: "linear-gradient(90deg, #f7f8fc, #e8eaf6)",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          sx={{
            fontFamily: widgetData.properties.fontFamily,
            fontSize: widgetData.properties.fontSize,
            fontWeight: widgetData.properties.fontWeight,

            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          {widgetData.dispalyName}
        </Typography>
        <Box>
          <IconButton
            onClick={handleExportPDF}
            sx={{
              color: "#ff5722",
              "&:hover": { backgroundColor: "rgba(255, 87, 34, 0.1)" },
            }}
          >
            <FileDownload />
          </IconButton>
          <IconButton
            onClick={handleFullScreenToggle}
            sx={{
              color: "#4caf50",
              "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.1)" },
            }}
          >
            {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <IconButton
            onClick={() => setIsExpanded(false)}
            sx={{
              color: "#f44336",
              "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        id="expanded-graph-content"
        sx={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          height: "calc(100% - 64px)",
          pt: 0,
          background: "#f5f5f5",
          overflow: "auto",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Box
          sx={{
            height: "calc(100% - 80px)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#ffffff",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <GraphComponent
            widgetData={widgetData}
            timestamp={timestamp}
            showXAxis={true}
            isExpanded={isExpanded}
            isRealTime={true}
          />
        </Box>
      </DialogContent>
    </>
  );
  return (
    <>
      <Card
        className={className}
        style={{
          ...style,
          backgroundColor: widgetData.properties?.backgroundColor || "#fff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            p: 1,
            mr: 3,
            borderBottom: "1px solid rgba(0,0,0,0.12)",
            backgroundColor: widgetData.properties.backgroundColor || "#fff",
            color: isColorDark(widgetData.properties.backgroundColor)
              ? "#fff"
              : "inherit",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: 30,
              display: "flex",
              alignItems: "center",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
              pointerEvents: isHovered ? "auto" : "none",
            }}
          >
            {widgetData.areaGraph && (
              <IconButton
                size="small"
                onClick={(event) => handleIconClick(event, handleExpandGraph)}
                sx={{
                  top: 1,
                  color: isColorDark(widgetData.properties.backgroundColor)
                    ? "#fff"
                    : "#000",
                }}
              >
                <OpenInFull sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={(event) =>
                handleIconClick(event, () => setTextFormatOpen(true))
              }
              sx={{
                top: 1,
                color: isColorDark(widgetData.properties.backgroundColor)
                  ? "#fff"
                  : "#000",
              }}
            >
              <Settings sx={{ fontSize: "1.2rem" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(event) => handleIconClick(event, handleDeleteWidget)}
              sx={{
                top: 1,
                color: isColorDark(widgetData.properties.backgroundColor)
                  ? "#fff"
                  : "#000",
              }}
            >
              <DeleteForeverIcon
                sx={{
                  fontSize: "1.2rem",
                  "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
                }}
              />
            </IconButton>
          </Box>

          <Tooltip title={`Last Sync: ${formatTimestamp(timestamp)}`}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: widgetData.properties.fontFamily,
                fontSize: "1.5rem",
                fontWeight: widgetData.properties.fontWeight,
                fontStyle: widgetData.properties.fontStyle,
                textAlign: "center",
                lineHeight: "1.5rem",
                color: widgetData.properties.fontColor,
              }}
            >
              {widgetData.dispalyName}
            </Typography>
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1, p: 2, overflow: "hidden" }}>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              {!widgetData.areaGraph ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title={`Last Sync: ${formatTimestamp(timestamp)}`}>
                    <Typography
                      variant="h4"
                      className="current-value"
                      sx={{
                        fontFamily: widgetData.properties?.fontFamily,
                        fontSize: `${widgetData.properties?.fontSize}px`,
                        fontWeight: widgetData.properties?.fontWeight,
                        color: widgetData.properties?.fontColor,
                        fontStyle: widgetData.properties?.fontStyle,
                      }}
                    >
                      {currentValue}
                      {widgetData.unit && (
                        <span
                          style={{
                            fontFamily: widgetData.properties?.fontFamily,
                            fontSize: `${widgetData.properties?.fontSize}px`,
                            fontWeight: widgetData.properties?.fontWeight,
                            color: widgetData.properties?.fontColor,
                            fontStyle: widgetData.properties?.fontStyle,
                          }}
                        >
                          {` ${widgetData.unit.toUpperCase()}`}
                        </span>
                      )}
                    </Typography>
                  </Tooltip>
                </Box>
              ) : (
                <Box sx={{ height: "100%" }}>
                  {/* <Tooltip title={`Last Sync: ${formatTimestamp(timestamp)}`}>
                    <Typography
                      className="current-value"
                      sx={{
                        fontFamily: widgetData.properties.fontFamily,
                        fontSize: `${widgetData.properties.fontSize}px`,
                        fontWeight: widgetData.properties.fontWeight,
                        fontStyle: widgetData.properties.fontStyle,

                        color: widgetData.properties.fontColor,
                        mb: 1,
                      }}
                    >
                      {currentValue}
                      {widgetData.unit && (
                        <span
                          style={{
                            fontFamily: widgetData.properties?.fontFamily,
                            fontSize: `${widgetData.properties?.fontSize}px`,
                            fontWeight: widgetData.properties?.fontWeight,
                            color: widgetData.properties?.fontColor,
                            fontStyle: widgetData.properties?.fontStyle,
                          }}
                        >
                          {` ${widgetData.unit.toUpperCase()}`}
                        </span>
                      )}
                    </Typography>
                  </Tooltip> */}
                  <Box sx={{ height: "calc(100% - 40px)" }}>
                    <GraphComponent
                      widgetData={widgetData}
                      currentValue={currentValue}
                      timestamp={timestamp}
                      showXAxis={false}
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
        <Dialog
          open={isExpanded}
          onClose={() => setIsExpanded(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            ref: graphContainerRef,
            sx: { height: "90vh" },
          }}
        >
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Typography
              sx={{
                fontFamily: widgetData.properties.fontFamily,
                fontSize: widgetData.properties.fontSize,
                fontWeight: widgetData.properties.fontWeight,
                color: isColorDark(widgetData.properties.backgroundColor)
                  ? "#fff"
                  : "inherit",
              }}
            >
              {widgetData.dispalyName}
            </Typography>
            <Box>
              <IconButton onClick={handleExportPDF}>
                <FileDownload />
              </IconButton>
              <IconButton onClick={handleFullScreenToggle}>
                {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
              <IconButton onClick={() => setIsExpanded(false)}>
                <DeleteForeverIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent
            id="expanded-graph-content"
            sx={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              height: "calc(100% - 64px)",
            }}
          >
            <GraphComponent
              widgetData={widgetData}
              currentValue={currentValue}
              timestamp={timestamp}
              showXAxis={true}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={isExpanded}
          onClose={() => {
            setIsExpanded(false);
          }}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            ref: graphContainerRef,
            sx: { height: "90vh" },
          }}
        >
          {renderExpandedContent()}
        </Dialog>
        <TextFormatDialog
          open={textFormatOpen}
          onClose={() => setTextFormatOpen(false)}
          initialProperties={widgetData.properties}
          onApply={handleTextFormatApply}
          mode="update"
        />
        <ConfirmationDialog
          open={confirmationDialog.open}
          onConfirm={confirmationDialog.onConfirm}
          onCancel={confirmationDialog.onCancel}
        >
          Are you sure you want to delete this widget?
        </ConfirmationDialog>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default Widget;
