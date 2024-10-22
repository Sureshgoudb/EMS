import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import WidgetCreationForm from "./WidgetCreationForm";
import HistoricalDataView from "./HistoricalData/HistoricalDataView";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TerminalView = () => {
  const [value, setValue] = useState(0);
  const [terminals, setTerminals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (location.state?.activeTab) {
      setValue(location.state.activeTab === "Historical Data Display" ? 1 : 0);
    }
  }, [location.state]);

  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const customerID = user
          ? user.customerID
          : JSON.parse(localStorage.getItem("user")).customerID;

        const url = `${apiKey}terminal/widget/allWidgets/${customerID}`;

        const response = await axios.get(url, {
          params: { page, limit: 20 },
        });
        setTerminals(response.data.widgets || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      fetchData();
    }
  };

  const handleCreateWidget = async (widgetData) => {
    try {
      // Retrieve customerID from local storage
      const user = JSON.parse(localStorage.getItem("user"));
      const customerID = user ? user.customerID : null;

      if (!customerID) {
        toast.error("Customer ID not found. Please log in again.");
        return;
      }

      console.log(
        "Sending widget creation request with customerID:",
        customerID
      );

      // Include customerID in the request body
      const response = await axios.post(
        `${apiKey}terminal/createWidget`,
        { ...widgetData, customerID },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      const { message, newWidget, updatedWidget } = response.data;

      setTerminals((prevTerminals) => {
        const updatedTerminals = [...prevTerminals];
        const terminalIndex = updatedTerminals.findIndex(
          (t) =>
            t.terminalID === (newWidget || updatedWidget).terminal.terminalID
        );
        if (terminalIndex !== -1) {
          updatedTerminals[terminalIndex].widgetCount += 1;
        } else {
          updatedTerminals.push({
            terminalID: (newWidget || updatedWidget).terminal.terminalID,
            terminalName: (newWidget || updatedWidget).terminal.terminalName,
            widgetCount: 1,
          });
        }
        return updatedTerminals;
      });

      setShowForm(false);
      toast.success(message);
    } catch (error) {
      console.error("Error creating widget:", error);
      toast.error("Failed to create widget");
    }
  };

  const handleTerminalClick = useCallback(
    (terminal, isHistorical = false) => {
      if (isHistorical) {
        navigate(`/historical/${terminal.terminalID}`);
      } else if (terminal && terminal.terminalID) {
        navigate(`/terminal/${terminal.terminalID}`, { state: { terminal } });
      } else {
        console.error("Invalid terminal data:", terminal);
        toast.error("Unable to view terminal details. Invalid terminal data.");
      }
    },
    [navigate]
  );

  const renderTerminals = useCallback(
    (terminalsData, isHistorical = false) => (
      <Grid container spacing={2}>
        {terminalsData.map((terminal) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={terminal.terminalID}>
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
              onClick={() => handleTerminalClick(terminal, isHistorical)}
            >
              <Typography
                variant="body1"
                align="center"
                sx={{ fontSize: "1rem", fontWeight: "medium", color: "#555" }}
              >
                {terminal.terminalName}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    ),
    [handleTerminalClick]
  );

  const isUserTypeUser = user && user.user_Type === "User";

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
            "& .Mui-selected": { color: "#007c89" },
            "& .MuiTabs-indicator": {
              backgroundColor: "#007c89",
              height: 4,
              borderRadius: 2,
            },
            "& .MuiTab-root:hover": { color: "#005f6a" },
            "& .MuiTab-root.Mui-selected:hover": { color: "#005f6a" },
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
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <>
                {isLoading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  renderTerminals(terminals)
                )}
                <Button
                  variant="contained"
                  onClick={() => setShowForm(true)}
                  disabled={isUserTypeUser}
                  sx={{
                    backgroundColor: "#007c89",
                    color: "white",
                    mt: 2,
                    "&:hover": { backgroundColor: "#005f6a" },
                    "&:disabled": {
                      backgroundColor: "#cccccc",
                      color: "#666666",
                    },
                  }}
                >
                  Create New Display
                </Button>
              </>
            )}
          </>
        )}

        {value === 1 && <HistoricalDataView />}
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default TerminalView;
