import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import Widget from "./Widget";
import WidgetCreationForm from "./WidgetCreationForm";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TerminalDetailView = () => {
  const { terminalName } = useParams();
  const [terminals, setTerminals] = useState({});
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [draggingWidgetId, setDraggingWidgetId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [terminalsResponse] = await Promise.all([
          axios.get(apiKey + "terminalwidgets"),
        ]);

        // Load terminals from API
        const fetchedTerminals = terminalsResponse.data;

        setTerminals(fetchedTerminals);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCreateWidget = async (widgetData) => {
    try {
      const response = await axios.post(
        apiKey + "terminal/createWidget",
        widgetData
      );
      const newWidget = response.data;
      setTerminals((prevTerminals) => {
        const updatedTerminals = { ...prevTerminals };
        if (!updatedTerminals[newWidget.terminalName]) {
          updatedTerminals[newWidget.terminalName] = [];
        }
        updatedTerminals[newWidget.terminalName].push(newWidget);
        return updatedTerminals;
      });
      setShowForm(false);
      toast.success("Widget created successfully!");
    } catch (error) {
      console.error("Error creating widget:", error);
      toast.error("Failed to create widget");
    }
  };

  const handleResize = (widgetId, newSize) => {
    const updatedTerminals = { ...terminals };
    const widgets = updatedTerminals[terminalName];
    const widgetIndex = widgets.findIndex((widget) => widget.id === widgetId);

    if (widgetIndex !== -1) {
      widgets[widgetIndex] = { ...widgets[widgetIndex], ...newSize };
      setTerminals(updatedTerminals);
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    try {
      const updatedTerminals = { ...terminals };
      updatedTerminals[terminalName] = updatedTerminals[terminalName].filter(
        (widget) => widget._id !== widgetId
      );
      setTerminals(updatedTerminals);
      toast.success("Widget deleted successfully!");
    } catch (error) {
      console.error("Error updating UI after widget deletion:", error);
      toast.error("Error updating display after widget deletion");
    }
  };

  const handleDragStart = (e, widgetId) => {
    setDraggingWidgetId(widgetId);
  };

  const handleDragEnd = (e) => {
    setDraggingWidgetId(null);
  };

  const handleDrop = (droppedWidgetId) => {
    const widgetList = terminals[terminalName];
    const draggingWidgetIndex = widgetList.findIndex(
      (widget) => widget._id === draggingWidgetId
    );
    const droppedWidgetIndex = widgetList.findIndex(
      (widget) => widget._id === droppedWidgetId
    );

    if (draggingWidgetIndex !== -1 && droppedWidgetIndex !== -1) {
      const updatedWidgets = [...widgetList];
      const [draggedWidget] = updatedWidgets.splice(draggingWidgetIndex, 1);
      updatedWidgets.splice(droppedWidgetIndex, 0, draggedWidget);

      setTerminals((prevTerminals) => {
        const newTerminals = {
          ...prevTerminals,
          [terminalName]: updatedWidgets,
        };
        return newTerminals;
      });
    }
  };

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
            {terminals[terminalName]?.map((widget) => (
              <Widget
                key={widget._id}
                widgetData={widget}
                onResize={handleResize}
                onDelete={handleDeleteWidget}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                className="widget"
                data-id={widget._id} // Store widget ID in a data attribute
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
