import React, { useState, useEffect, useRef } from "react";

import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Card, Typography, Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import io from "socket.io-client";

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: "0 15px 45px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  transition: "all 0.5s ease-in-out",
  "&:hover": {
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  backgroundImage: "linear-gradient(45deg, #2196F3, #21CBF3)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  fontWeight: 700,
  fontSize: "1.5rem",
  textShadow: "3px 3px 5px rgba(0, 0, 0, 0.1)",
  top: "10px",
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  height: "100%",
  "& .MuiDataGrid-root": {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid rgba(224, 224, 224, 0.5)",

    color: "#333",
    fontFamily: "'Poppins', 'Arial', sans-serif",
    transition: "all 0.3s ease",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundImage: "linear-gradient(135deg, #2196F3, #21CBF3)",
    color: "#fff",
    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
  },
  "& .MuiDataGrid-cell:hover": {
    backgroundColor: "rgba(227, 242, 253, 0.7)",
    boxShadow: "inset 0 0 15px rgba(33, 150, 243, 0.6)",
    transform: "scale(1.05)",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(245, 245, 245, 0.8)",
  },

  "& .ui-percentage-medium": {
    color: "#FFA726",
    fontWeight: 700,
  },
  "& .ui-percentage-negative": {
    color: "#EF5350",
    fontWeight: 700,
  },
  "& .ui-percentage-high": {
    color: "#F44336",
    fontWeight: 700,
  },
  "@keyframes blink": {
    "0%": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
    "50%": { backgroundColor: "rgba(244, 67, 54, 0.3)" },
    "100%": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
  },
  "& .row-critical": {
    animation: "blink 1s infinite",
  },
  "& .cell-critical": {
    animation: "blink 1s infinite",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    fontWeight: 700,
  },
  "& .ui-percentage-critical": {
    animation: "blink 1s infinite",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    fontWeight: 700,
  },
}));

const CurrentDateTime = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: "10px",
  left: "20px",
  fontSize: "1.2rem",
  backgroundImage: "linear-gradient(45deg, #FF9800, #FFC107)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  fontWeight: 600,
}));

const BlkNoDisplay = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: "10px",
  right: "20px",
  fontSize: "1.2rem",
  backgroundImage: "linear-gradient(45deg, #FF9800, #FFC107)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  fontWeight: 600,
}));

const TableGrid = () => {
  const [terminals, setTerminals] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [blkNo, setBlkNo] = useState("");
  const socketRef = useRef({});
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
    fetchTerminals();
    const timer = setInterval(() => {
      setCurrentDateTime(
        new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    return () => {
      clearInterval(timer);
      disconnectAllSockets();
    };
  }, []);

  useEffect(() => {
    if (terminals.length > 0) {
      fetchScripts(terminals[0].terminalId);
    }
  }, [terminals]);

  useEffect(() => {
    if (terminals.length > 0 && scripts.length > 0) {
      initializeGrid();
      fetchGridData();
    }
    return () => {
      disconnectAllSockets();
    };
  }, [terminals, scripts]);

  const disconnectAllSockets = () => {
    Object.values(socketRef.current).forEach((socket) => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    });
    socketRef.current = {};
  };

  const fetchTerminals = async () => {
    try {
      const response = await axios.get(`${apiKey}terminal/list`);
      setTerminals(response.data);
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  const fetchScripts = async (terminalId) => {
    try {
      const response = await axios.get(
        `${apiKey}terminal/${terminalId}/scripts`
      );
      const scriptNames = Object.keys(response.data.scripts);
      setScripts(scriptNames.filter((script) => script !== "BLK No"));
    } catch (error) {
      console.error("Error fetching scripts:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeGrid = () => {
    const defaultColumns = [
      {
        field: "terminal",
        headerName: "Site Name",
        width: 200,
        headerClassName: "header-cell",
      },
      {
        field: "timestamp",
        headerName: "Date Time",
        width: 200,
        headerClassName: "header-cell",
      },
    ];

    const scriptColumns = [
      {
        field: "AvC MW",
        headerName: "AvC MW",
        width: 100,
        headerClassName: "header-cell",
      },
      {
        field: "SG MW",
        headerName: "SG MW",
        width: 100,
        headerClassName: "header-cell",
      },
      {
        field: "Inst MW",
        headerName: "Inst MW",
        width: 100,
        headerClassName: "header-cell",
      },
      {
        field: "Avg MW",
        headerName: "Avg MW",
        width: 100,
        headerClassName: "header-cell",
      },
      {
        field: "UI MW",
        headerName: "UI MW",
        width: 100,
        headerClassName: "header-cell",
      },
      {
        field: "UI Percentage",
        headerName: "UI Percentage",
        width: 100,
        headerClassName: "header-cell",
        cellClassName: (params) => {
          const value = parseFloat(params.value);
          if (value > 28) return "cell-critical";
          if (value > 20) return "ui-percentage-high";
          if (value > 12) return "ui-percentage-medium";
          if (value < 0) return "ui-percentage-negative";
          return "ui-percentage-low";
        },
      },
      {
        field: "4thBLK SG MW",
        headerName: "4thBLK SG MW",
        width: 100,
        headerClassName: "header-cell",
      },
    ];

    setColumns([...defaultColumns, ...scriptColumns]);
  };

  const fetchGridData = async () => {
    setLoading(true);
    try {
      const newRows = await Promise.all(
        terminals.map(async (terminal, index) => {
          const row = {
            id: index,
            terminal: terminal.terminalName,
          };

          let latestTimestamp = "";
          let isCritical = false;

          await Promise.all(
            [...scripts, "BLK No"].map(async (script) => {
              try {
                const response = await axios.get(
                  `${apiKey}terminal/${terminal.terminalId}/script/${script}/currentValue`
                );

                const scriptData = response.data[script];
                latestTimestamp = formatTimestamp(response.data.timestamp);

                if (script === "BLK No") {
                  setBlkNo(scriptData);
                } else {
                  row[script] =
                    typeof scriptData === "number"
                      ? scriptData.toFixed(2)
                      : scriptData;
                  if (
                    script === "UI Percentage" &&
                    parseFloat(row[script]) > 28
                  ) {
                    isCritical = true;
                  }
                }

                // Set up Socket.IO for live updates
                const socketKey = `${terminal.terminalId}/${script}`;
                if (!socketRef.current[socketKey]) {
                  socketRef.current[socketKey] = io(`${apiKey}${socketKey}`);
                  socketRef.current[socketKey].on("valueUpdate", (data) => {
                    setRows((prevRows) => {
                      const updatedRows = [...prevRows];
                      const rowIndex = updatedRows.findIndex(
                        (r) => r.id === index
                      );
                      if (rowIndex !== -1) {
                        updatedRows[rowIndex] = {
                          ...updatedRows[rowIndex],
                          [script]:
                            typeof data[script] === "number"
                              ? data[script].toFixed(2)
                              : data[script],
                          timestamp: formatTimestamp(data.timestamp),
                        };
                        if (
                          script === "UI Percentage" &&
                          parseFloat(data[script]) > 28
                        ) {
                          updatedRows[rowIndex].isCritical = true;
                        }
                      }
                      return updatedRows;
                    });
                  });
                }
              } catch (error) {
                console.error(
                  `Error fetching data for terminal ${terminal.terminalName} and script ${script}:`,
                  error
                );
              }
            })
          );

          row.timestamp = latestTimestamp || "N/A";
          row.isCritical = isCritical;

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
    <StyledCard>
      <Box sx={{ position: "relative", padding: "20px" }}>
        <CurrentDateTime variant="body2">{currentDateTime}</CurrentDateTime>
        <StyledTypography variant="h4">
          Generation Live Monitoring
        </StyledTypography>
        <BlkNoDisplay variant="body2">BLK No: {blkNo}</BlkNoDisplay>
      </Box>
      {loading ? (
        <CircularProgress sx={{ margin: "auto" }} />
      ) : (
        <Box sx={{ height: "calc(100vh - 100px)", padding: "0 20px 20px" }}>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            disableColumnMenu
            getRowClassName={(params) =>
              params.row.isCritical ? "row-critical" : ""
            }
          />
        </Box>
      )}
    </StyledCard>
  );
};

export default TableGrid;
