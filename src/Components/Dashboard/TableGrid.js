import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const TableGrid = () => {
  const [terminals, setTerminals] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  const formatTimestamp = (timestamp) => {
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

  useEffect(() => {
    fetchTerminalsAndScripts();
  }, []);

  useEffect(() => {
    if (terminals.length > 0 && scripts.length > 0) {
      initializeGrid();
      fetchGridData(); // Fetch data initially
      const intervalId = setInterval(fetchGridData, 30000); // Fetch data every 30 seconds

      return () => clearInterval(intervalId); // Clear the interval when the component is unmounted
    }
  }, [terminals, scripts]);

  // Fetch terminals and scripts and automatically select all
  const fetchTerminalsAndScripts = async () => {
    setLoading(true);
    try {
      const terminalsResponse = await axios.get(`${apiKey}terminal/list`);
      setTerminals(terminalsResponse.data);

      if (terminalsResponse.data.length > 0) {
        const scriptsResponse = await axios.get(
          `${apiKey}terminal/${terminalsResponse.data[0]}/scripts`
        );
        setScripts(scriptsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching terminals and scripts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize grid columns based on selected terminals and scripts
  const initializeGrid = () => {
    const cols = [
      {
        field: "terminal",
        headerName: "Terminal",
        width: 200,
        headerClassName: "header-cell", // Custom header class
      },
      {
        field: "timestamp",
        headerName: "Timestamp",
        width: 200,
        headerClassName: "header-cell",
      },
      ...scripts.map((script) => ({
        field: script,
        headerName: script,
        width: 150,
        headerClassName: "header-cell",
      })),
    ];
    setColumns(cols);
  };

  // Fetch grid data for all selected terminals and scripts
  const fetchGridData = async () => {
    setLoading(true);
    try {
      const newRows = await Promise.all(
        terminals.map(async (terminal, index) => {
          const row = {
            id: index,
            terminal: terminal,
          };

          let latestTimestamp = ""; // Store the latest timestamp for the terminal

          await Promise.all(
            scripts.map(async (script) => {
              try {
                const response = await axios.get(
                  `${apiKey}terminal/${encodeURIComponent(
                    terminal
                  )}/script/${encodeURIComponent(script)}/currentValue`
                );

                const key = Object.keys(response.data)[0];
                const scriptData = response.data[key];

                // Store the latest timestamp from the API response
                if (scriptData && scriptData.timestamp) {
                  latestTimestamp = formatTimestamp(scriptData.timestamp);
                }

                // Rounding to 2 decimal places for the script value
                row[script] = scriptData ? scriptData.value.toFixed(2) : "N/A";
              } catch (error) {
                console.error(`Error fetching ${terminal}/${script}:`, error);
                row[script] = "Error";
              }
            })
          );

          // Set the timestamp for the row
          row.timestamp = latestTimestamp || "N/A"; // Add timestamp to row

          return row;
        })
      );

      setRows(newRows);
    } catch (error) {
      console.error("Error fetching grid data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        overflow: "hidden",
        backgroundColor: "#f9f9f9",
        marginTop: "20px",
        display: "flex", // Use flexbox for Card
        flexDirection: "column", // Stack children vertically
        height: "100vh", // Full height
      }}
    >
      <CardContent style={{ padding: "20px", flex: "1 1 auto" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h4"
            style={{
              marginBottom: "16px",
              textAlign: "center",
              color: "#333",
            }}
          >
            Current Terminal Data
          </Typography>
          <IconButton
            onClick={fetchGridData}
            color="primary"
            style={{ marginLeft: "10px", transition: "transform 0.2s" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        <div style={{ flex: "1 1 auto", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
            disableColumnMenu
            hideFooterPagination={rows.length <= 5}
            sx={{
              height: "100%", // Full height
              "& .MuiDataGrid-root": {
                backgroundColor: "#fff", // Set DataGrid background color
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #e0e0e0", // Cell border styling
                fontSize: "1rem", // Font size for cell text
                color: "#333", // Cell text color
                fontFamily: "Arial, sans-serif", // Updated font family
                fontWeight: 400, // Normal font weight
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#3f51b5", // Header background color
                color: "#fff", // Header text color
                fontFamily: "Arial, sans-serif", // Updated font family
                fontWeight: 400, // Normal font weight
              },
              "& .MuiDataGrid-cell:hover": {
                backgroundColor: "#e3f2fd", // Hover effect on cells
              },
              "& .MuiDataGrid-footerCell": {
                borderTop: "2px solid #3f51b5", // Footer cell border
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f5f5f5", // Row hover effect
              },
              "& .header-cell": {
                textAlign: "center", // Center align header text
              },
            }}
            components={{
              NoRowsOverlay: () => (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <Typography>No data found</Typography>
                  )}
                </Box>
              ),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TableGrid;
