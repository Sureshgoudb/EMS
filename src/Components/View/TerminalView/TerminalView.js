import React, { useState, useEffect } from "react";
import { Box, Button, Tabs, Tab, Typography, Grid } from "@mui/material";
import WidgetCreationForm from "./WidgetCreationForm";
import HistoricalDataView from "./HistoricalData/HistoricalDataView";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TerminalView = () => {
  const [value, setValue] = useState(0);
  const [terminals, setTerminals] = useState({});
  const [historicalTerminals, setHistoricalTerminals] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [currentTerminal, setCurrentTerminal] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------------- Fetch terminal widgets ---------------
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [terminalsResponse, historicalTerminalsResponse] =
          await Promise.all([axios.get(apiKey + "terminalwidgets")]);
        setTerminals(terminalsResponse.data);
        setHistoricalTerminals(historicalTerminalsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
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

  const handleTerminalClick = (terminalName, isHistorical = false) => {
    if (isHistorical) {
      navigate(`/historical/${terminalName}`);
    } else {
      navigate(`/terminal/${terminalName}`);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentTerminal(null);
  };

  const filteredTerminals = Object.entries(terminals).filter(
    ([, widgets]) => widgets.length > 0
  );

  const filteredHistoricalTerminals = Object.entries(
    historicalTerminals
  ).filter(([, data]) => data.columns && data.columns.length > 0);

  const renderTerminals = (terminalsData, isHistorical = false) => (
    <Grid container spacing={2}>
      {terminalsData.map(([terminalName, data]) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={terminalName}>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: 2,
              p: 2,
              mb: 2,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                background:
                  "linear-gradient(to bottom right, rgba(0, 124, 137, 0.3), rgba(77, 208, 225, 0.3))",
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
            onClick={() => handleTerminalClick(terminalName, isHistorical)}
          >
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontSize: "1rem",
                fontWeight: "medium",
                color: "#555",
              }}
            >
              {terminalName}
            </Typography>
            <Typography variant="caption" align="center" sx={{ color: "#888" }}>
              {isHistorical
                ? `${data.columns.length} columns, ${data.data.length} rows`
                : `${data.length} widget${data.length !== 1 ? "s" : ""}`}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#e3f2fd" }}>
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
                presetTerminal={currentTerminal}
              />
            ) : (
              <>
                {renderTerminals(filteredTerminals)}
                <Button
                  variant="contained"
                  onClick={() => setShowForm(true)}
                  sx={{
                    backgroundColor: "#007c89",
                    color: "white",
                    mt: 2,
                    "&:hover": {
                      backgroundColor: "#005f6a",
                    },
                  }}
                >
                  Create New Display
                </Button>
              </>
            )}
          </>
        )}
        {value === 1 && (
          <>
            {renderTerminals(filteredHistoricalTerminals, true)}

            <HistoricalDataView />
          </>
        )}
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default TerminalView;
