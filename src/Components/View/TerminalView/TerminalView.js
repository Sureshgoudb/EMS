import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CardContent,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
} from "@mui/material";
import CreateWidgetDialog from "./CreateWidgetDialog";
import CreateNewTableDialog from "./HistoricalData/CreateNewTableDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowForward, Add } from "@mui/icons-material";
import HistoricalDataView from "../TerminalView/HistoricalData/HistoricalDataView";

const TerminalView = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  const getUserData = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  useEffect(() => {
    if (location.state && location.state.activeTab !== undefined) {
      setTabIndex(location.state.activeTab);
    }
  }, [location.state]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("User data not found");
      }

      const endpoint =
        userData.user_Type === "Admin"
          ? `${apiKey}terminal/widget/allWidgetsAdmin`
          : `${apiKey}terminal/widget/allWidgets/${userData.customerID}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch widgets");
      }

      const transformedData = data.widgets
        .filter((widget) => widget.widgetCount > 0)
        .map((widget) => ({
          TerminalId: widget.terminalID,
          TerminalDisplayName: widget.terminalName,
          TerminalName: widget.terminalName,
          widgetCount: widget.widgetCount,
        }));

      setWidgets(transformedData);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWidgetDialogClose = async (success = false) => {
    setWidgetDialogOpen(false);
    if (success) {
      await fetchData();
    }
  };

  const handleTableDialogClose = async (success = false) => {
    setTableDialogOpen(false);
    if (success) {
      await fetchData();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Tabs
        value={tabIndex}
        onChange={(event, newValue) => setTabIndex(newValue)}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 3,
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          "& .Mui-selected": {
            color: "#1976d2",
            transform: "scale(1.05)",
            transition: "transform 0.3s ease, background-color 0.3s ease",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
            position: "relative",
          },
          "& .Mui-selected::after": {
            content: '""',
            position: "absolute",
            bottom: -2,
            width: "100%",
            height: "5px",
            backgroundColor: "#1976d2",
            borderRadius: "3px",
          },
          "& .MuiTab-root": {
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#f0f7ff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              transform: "scale(1.02)",
            },
            borderBottom: "2px solid transparent",
            "&.Mui-selected": {
              borderBottom: "2px solid #1976d2",
            },
          },
          "& .MuiTabs-flexContainer": {
            gap: "15px",
          },
        }}
      >
        <Tab label="Current Data Display" />
        <Tab label="Historical Data Display" />
      </Tabs>

      {tabIndex === 0 && (
        <Box p={4} minHeight="100vh" bgcolor="background.default">
          <Box sx={{ position: "relative" }}>
            {widgets.length > 0 ? (
              <Grid container spacing={3}>
                {widgets.map((terminal) => (
                  <Grid item key={terminal.TerminalId}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: "12px",
                        cursor: "pointer",
                        position: "relative",
                        transition:
                          "transform 0.2s ease-in-out, box-shadow 0.3s",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          transform: "translateY(-4px)",
                        },
                      }}
                      onClick={() =>
                        navigate(`/terminal/${terminal.TerminalId}`)
                      }
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#1976d2",
                                fontSize: "1rem",
                                fontWeight: 500,
                                mb: 0.5,
                              }}
                            >
                              {terminal.TerminalDisplayName}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#637381",
                                fontSize: "0.75rem",
                                mb: 0.5,
                              }}
                            >
                              ID: {terminal.TerminalId}
                            </Typography>
                          </Box>
                          <ArrowForward
                            sx={{ color: "#1976d2", fontSize: "1.2rem" }}
                          />
                        </Box>
                      </CardContent>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#637381",
                    mb: 2,
                  }}
                >
                  No terminals with widgets found
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#637381",
                    mb: 2,
                  }}
                >
                  Create a new display to get started
                </Typography>
              </Box>
            )}

            <Grid item xs={12} display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  mt: 3,
                  mb: 2,
                  borderRadius: "8px",
                  textTransform: "none",
                  boxShadow: "0 2px 4px rgba(25,118,210,0.2)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(25,118,210,0.3)",
                  },
                }}
                onClick={() => setWidgetDialogOpen(true)}
              >
                Create New Display
              </Button>
            </Grid>
            {error && (
              <Typography
                color="error"
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: "8px",
                  backgroundColor: "#fff3f3",
                }}
              >
                {error}
              </Typography>
            )}

            <CreateWidgetDialog
              open={widgetDialogOpen}
              onClose={handleWidgetDialogClose}
            />
          </Box>{" "}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ mt: 2 }}>
          <HistoricalDataView />

          <CreateNewTableDialog
            open={tableDialogOpen}
            onClose={handleTableDialogClose}
          />
        </Box>
      )}
    </Box>
  );
};

export default TerminalView;
