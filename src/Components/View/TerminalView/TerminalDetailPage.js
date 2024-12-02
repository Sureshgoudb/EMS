import React, { useState, useEffect, useRef } from "react";
import Clock from "react-live-clock";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Alert,
  Button,
  Tooltip,
  Snackbar,
  Stack,
} from "@mui/material";
import { ArrowBack, Add, Refresh } from "@mui/icons-material";
import { Responsive, WidthProvider } from "react-grid-layout";
import CreateWidgetDialog from "./CreateWidgetDialog";
import Widget from "./Widget";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TerminalDetailPage = () => {
  const { terminalId } = useParams();
  const navigate = useNavigate();
  const [terminal, setTerminal] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [isLayoutChanging, setIsLayoutChanging] = useState(false);
  const layoutChangeTimeout = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const convertPositionToLayout = (position, index, areaGraph) => {
    const defaultWidth = areaGraph ? 9 : 2;
    const defaultHeight = areaGraph ? 5 : 2;

    const w = Math.max(2, Math.round(position.width / 100)) || defaultWidth;
    const h = Math.max(1, Math.round(position.height / 100)) || defaultHeight;
    const x = Math.round(position.x / 100);
    const y = Math.round(position.y / 100);

    return {
      x: x >= 0 ? x : (index % 3) * 4,
      y: y >= 0 ? y : Math.floor(index / 3) * 4,
      w: Math.min(w, 12),
      h: Math.min(h, 12),
      minW: 2,
      minH: 1,
    };
  };

  const getCurrentLayout = () => {
    return widgets.map((widget, index) => ({
      i: widget.id,
      ...convertPositionToLayout(widget.position, index, widget.areaGraph),
    }));
  };

  const convertLayoutToPosition = (layout) => {
    return {
      x: layout.x * 100,
      y: layout.y * 100,
      width: layout.w * 100,
      height: layout.h * 100,
    };
  };

  const fetchTerminalData = async () => {
    if (!terminalId) {
      setError("Terminal ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiKey}terminal/widget/${terminalId}`);
      const data = await response.json();

      if (response.status === 404) {
        throw new Error(data.message || "No widgets found for this terminal");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch widgets");
      }

      const terminalName = Object.keys(data).find(
        (key) => key !== "terminalID"
      );
      const widgetScripts = data[terminalName] || [];

      setTerminal({
        terminalId: data.terminalID,
        terminalName: terminalName,
      });

      const transformedWidgets = widgetScripts.map((script, index) => {
        const defaultPosition = {
          x: (index % 3) * 400,
          y: Math.floor(index / 3) * 300,
          width: script.areaGraph ? 800 : 400,
          height: script.areaGraph ? 400 : 300,
        };

        return {
          id: script._id,
          scriptName: script.scriptName,
          dispalyName: script.displayName,
          properties: script.properties,
          areaGraph: script.areaGraph,
          position: script.position || defaultPosition,
          decimalPlaces: script.decimalPlaces,
          graphType: script.graphType,
          refreshInterval: script.refreshInterval,
          xAxisConfiguration: script.xAxisConfiguration,
          terminalID: data.terminalID,
        };
      });

      setWidgets(transformedWidgets);
      setLayoutReady(true);
    } catch (err) {
      setError(
        err.message || "Failed to load terminal data. Please try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminalData();
  }, [terminalId]);

  const handleLayoutChange = async (layout) => {
    if (!layoutReady) return;

    if (layoutChangeTimeout.current) {
      clearTimeout(layoutChangeTimeout.current);
    }

    layoutChangeTimeout.current = setTimeout(async () => {
      setIsLayoutChanging(true);

      const updatedPositions = layout.map((item) => ({
        widgetId: item.i,
        position: convertLayoutToPosition(item),
      }));

      try {
        const updatePromises = updatedPositions.map(({ widgetId, position }) =>
          fetch(`${apiKey}terminal/${widgetId}/position`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(position),
          })
        );

        await Promise.all(updatePromises);

        setWidgets((prevWidgets) =>
          prevWidgets.map((widget) => {
            const updatedPosition = updatedPositions.find(
              (pos) => pos.widgetId === widget.id
            );
            return updatedPosition
              ? { ...widget, position: updatedPosition.position }
              : widget;
          })
        );
      } catch (err) {
        console.error("Error updating widget positions:", err);
      } finally {
        setIsLayoutChanging(false);
      }
    }, 500);
  };
  const handleDeleteWidget = async (widgetId) => {
    try {
      const response = await fetch(`${apiKey}widget/script/${widgetId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setWidgets((prevWidgets) =>
          prevWidgets.filter((widget) => widget.id !== widgetId)
        );
        setSnackbar({
          open: true,
          message: "Widget deleted successfully",
          severity: "success",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to delete widget",
        severity: "error",
      });
      console.error(err);
    }
  };
  const handleGoBack = () => {
    navigate("/view/terminal", {
      state: { activeTab: 0 },
    });
  };
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Tooltip title="Back to View">
            <IconButton onClick={() => handleGoBack()}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontWeight: "bold",
              color: "#4a90e2",
            }}
          >
            Device Name: {terminal?.terminalName}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>
              <Clock format="DD-MM-YYYY" ticking={false} />
            </Typography>
            <Typography>
              <Clock format="HH:mm:ss" ticking />
            </Typography>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchTerminalData} sx={{ color: "#1976d2" }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Widget
            </Button>
          </Box>
        </Stack>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {layoutReady && widgets.length > 0 && (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: getCurrentLayout() }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={(layout) => handleLayoutChange(layout)}
          margin={[20, 20]}
          containerPadding={[20, 20]}
          isDraggable={true}
          isResizable={true}
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <Widget
                widgetData={{
                  ...widget,
                  terminalId: widget.terminalId,
                  widgetId: widget.id,
                }}
                onDelete={() => handleDeleteWidget(widget.id)}
                isLayoutChanging={isLayoutChanging}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
      <CreateWidgetDialog
        open={createDialogOpen}
        onClose={(success) => {
          setCreateDialogOpen(false);
          if (success) {
            fetchTerminalData();
          }
        }}
        initialTerminalData={{
          TerminalId: terminal?.terminalId,
          TerminalName: terminal?.terminalName,
        }}
        existingWidgets={widgets}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TerminalDetailPage;
