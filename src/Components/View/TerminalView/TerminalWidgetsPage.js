import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import Widget from "./Widget";
import WidgetCreationForm from "./WidgetCreationForm";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TerminalDetailView = () => {
  const { terminalID } = useParams();
  const [widgets, setWidgets] = useState([]);
  const [terminalName, setTerminalName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [draggingWidgetId, setDraggingWidgetId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ---------- Fetching widget ---------------
  const fetchWidgetData = async (widgetId) => {
    try {
      const response = await axios.get(`${apiKey}terminal/widget/${widgetId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data for widget ${widgetId}:`, error);
      return null;
    }
  };

  // ---------- Fetching all widgets ---------------
  const fetchAllWidgets = async () => {
    setLoading(true);
    try {
      // Get customerID from localStorage
      const userDataString = localStorage.getItem("user");
      const userData = JSON.parse(userDataString);
      const customerID = userData?.customerID;

      if (!customerID) {
        throw new Error("Customer ID not found in local storage");
      }

      const response = await axios.get(
        `${apiKey}terminal/widget/${terminalID}?customerID=${customerID}`
      );
      const data = response.data;
      const [fetchedTerminalName] = Object.keys(data);
      setTerminalName(fetchedTerminalName);

      const widgetsWithData = await Promise.all(
        data[fetchedTerminalName].map(async (widget) => {
          const widgetData = await fetchWidgetData(widget._id);
          return { ...widget, data: widgetData };
        })
      );

      setWidgets(widgetsWithData);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to fetch terminal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWidgets();
  }, [terminalID]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // -------------- Create Widget ---------------
  const handleCreateWidget = async (widgetData) => {
    try {
      // Get customerID from localStorage
      const userDataString = localStorage.getItem("user");
      const userData = JSON.parse(userDataString);
      const customerID = userData?.customerID;

      if (!customerID) {
        throw new Error("Customer ID not found in local storage");
      }

      const response = await axios.post(`${apiKey}terminal/createWidget`, {
        ...widgetData,
        terminalID,
        customerID,
      });
      const newWidget = response.data;

      const widgetWithData = await fetchWidgetData(newWidget._id);

      setWidgets((prevWidgets) => [
        ...prevWidgets,
        { ...newWidget, data: widgetWithData },
      ]);
      setShowForm(false);
      toast.success("Widget created successfully!");
      fetchAllWidgets();
    } catch (error) {
      console.error("Error creating widget:", error);
      toast.error(error.message || "Failed to create widget");
    }
  };
  // --------------- Resize Widget ---------------
  const handleResize = (widgetId, newSize) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget._id === widgetId ? { ...widget, ...newSize } : widget
      )
    );
  };

  // --------------- Delete Widget ---------------
  const handleDeleteWidget = async (widgetId) => {
    try {
      setWidgets((prevWidgets) =>
        prevWidgets.filter((widget) => widget._id !== widgetId)
      );
      await axios.delete(`${apiKey}terminal/deleteWidget/${widgetId}`);
      toast.success("Widget deleted successfully!");
    } catch (error) {
      console.error("Error deleting widget:", error);
      fetchAllWidgets();
      toast.error("Failed to delete widget");
    }
  };

  // --------------- Drag and Drop ---------------
  const handleDragStart = (e, widgetId) => {
    setDraggingWidgetId(widgetId);
  };

  const handleDragEnd = () => {
    setDraggingWidgetId(null);
  };

  const handleDrop = (droppedWidgetId) => {
    const draggingWidgetIndex = widgets.findIndex(
      (widget) => widget._id === draggingWidgetId
    );
    const droppedWidgetIndex = widgets.findIndex(
      (widget) => widget._id === droppedWidgetId
    );

    if (draggingWidgetIndex !== -1 && droppedWidgetIndex !== -1) {
      const updatedWidgets = [...widgets];
      const [draggedWidget] = updatedWidgets.splice(draggingWidgetIndex, 1);
      updatedWidgets.splice(droppedWidgetIndex, 0, draggedWidget);
      setWidgets(updatedWidgets);
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 1 }}>
      <Paper
        elevation={2}
        sx={{
          padding: 1,
          background: "linear-gradient(135deg, #007c89 20%, #004d53 80%)",
          color: "white",
          textAlign: "center",
          mb: 4,
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow: "0 6px 25px rgba(0,0,0,0.4)",
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "700",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          Device Name: {terminalName}
          <Typography
            variant="h6"
            component="span"
            sx={{
              ml: 2,
              fontSize: "1.2rem",
              fontStyle: "italic",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            {currentTime.toLocaleString()}{" "}
          </Typography>
        </Typography>
      </Paper>

      {showForm ? (
        <WidgetCreationForm
          onCreate={handleCreateWidget}
          onCancel={() => setShowForm(false)}
          presetTerminal={terminalName}
        />
      ) : (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {widgets.map((widgetData) => (
              <Widget
                key={widgetData._id}
                widgetData={widgetData}
                terminalName={terminalName}
                onResize={handleResize}
                onDelete={handleDeleteWidget}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                className="widget"
                data-id={widgetData._id}
              />
            ))}
          </Box>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => setShowForm(true)}
              sx={{
                mr: 2,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              }}
            >
              + Add New Widget
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/view/terminal")}
              sx={{
                background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
              }}
            >
              Back to Device View
            </Button>
          </Box>
        </>
      )}
      <ToastContainer />
    </Box>
  );
};

export default TerminalDetailView;
