import React, { useState, useEffect } from "react";
import { Box, Button, Tabs, Tab } from "@mui/material";
import WidgetCreationForm from "./WidgetCreationForm";
import Widget from "./Widget";
import HistoricalDataDisplay from "./HistoricalDataDisplay"; // Import HistoricalDataDisplay
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ScriptView = () => {
  const [value, setValue] = useState(0); // Tab index state
  const [widgets, setWidgets] = useState([]); // Store created widgets
  const [showForm, setShowForm] = useState(false); // Toggle to show/hide form

  useEffect(() => {
    // Load widgets from localStorage on component mount
    const savedWidgets = JSON.parse(localStorage.getItem("widgets")) || [];
    setWidgets(savedWidgets);
  }, []);

  const handleCreateWidget = (widgetData) => {
    const newWidget = {
      ...widgetData,
      width: 300, // Default width
      height: 320, // Default height
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    localStorage.setItem("widgets", JSON.stringify(updatedWidgets));
    setShowForm(false);
  };

  const handleResize = (index, size) => {
    const updatedWidgets = [...widgets];
    updatedWidgets[index] = { ...updatedWidgets[index], ...size };
    setWidgets(updatedWidgets);
    localStorage.setItem("widgets", JSON.stringify(updatedWidgets));
  };

  const handleDeleteWidget = (index) => {
    const updatedWidgets = widgets.filter((_, i) => i !== index);
    setWidgets(updatedWidgets);
    localStorage.setItem("widgets", JSON.stringify(updatedWidgets));
    toast.success("Widget Deleted successfully!");
  };

  const handleCancel = () => {
    setShowForm(false); // Hide the form
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          padding: 2,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="view tabs"
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              fontWeight: "bold",
              color: "#007c89",
              textTransform: "none",
              transition: "color 0.3s ease",
            },
            "& .Mui-selected": {
              color: "#007c89",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#007c89",
              height: 4,
              borderRadius: 2,
              transition: "transform 0.3s ease",
              transform: "translateX(0)",
            },
            "& .MuiTab-root:hover": {
              color: "#005f6a",
            },
            "& .MuiTab-root.Mui-selected:hover": {
              color: "#005f6a",
            },
          }}
        >
          <Tab label="Current Data Display" />
          <Tab label="Historical Data Display" />
        </Tabs>

        {value === 0 && (
          <>
            {showForm ? (
              <WidgetCreationForm
                onCreate={handleCreateWidget}
                onCancel={handleCancel}
              />
            ) : (
              <>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3 }}>
                  {widgets.map((widget, index) => (
                    <Widget
                      key={widget.id} // Use unique identifier
                      widgetData={widget}
                      onResize={(size) => handleResize(index, size)}
                      onDelete={() => handleDeleteWidget(index)}
                    />
                  ))}{" "}
                  <ToastContainer />
                </Box>

                <Button
                  variant="contained"
                  onClick={() => setShowForm(true)}
                  sx={{ backgroundColor: "#007c89", color: "white", mt: 2 }}
                >
                  {widgets.length > 0
                    ? "Add Another Widget"
                    : "Create New Widget"}
                </Button>
              </>
            )}
          </>
        )}
        {value === 1 && <HistoricalDataDisplay />}
      </Box>
    </Box>
  );
};

export default ScriptView;
