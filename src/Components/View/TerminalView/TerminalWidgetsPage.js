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
  const [currentTerminal, setCurrentTerminal] = useState(null);

  // --------------- Fetch terminal widgets ---------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [terminalsResponse] = await Promise.all([
          axios.get(apiKey + "terminalwidgets"),
        ]);
        setTerminals(terminalsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
      }
    };

    fetchData();
  }, []);

  // --------------- Create terminal widget ---------------
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
      setCurrentTerminal(null);
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
      localStorage.setItem("terminals", JSON.stringify(updatedTerminals));
    }
  };

  const handleDeleteWidget = (widgetId) => {
    const updatedTerminals = { ...terminals };
    updatedTerminals[terminalName] = updatedTerminals[terminalName].filter(
      (widget) => widget.id !== widgetId
    );
    setTerminals(updatedTerminals);
    localStorage.setItem("terminals", JSON.stringify(updatedTerminals));
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          borderRadius: 2,
          background: "#007c89",
          color: "white",
          textAlign: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Terminal Name: {terminalName}</Typography>
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
                key={widget.id}
                widgetData={widget}
                onResize={handleResize}
                onDelete={handleDeleteWidget}
              />
            ))}
          </Box>
          <Button
            variant="contained"
            onClick={() => setShowForm(true)}
            sx={{ mt: 3 }}
          >
            + Add New Widget
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/view/terminal")}
            sx={{ mt: 3, ml: 2 }}
          >
            Back to Terminal View
          </Button>
        </>
      )}
      <ToastContainer />
    </Box>
  );
};

export default TerminalDetailView;
