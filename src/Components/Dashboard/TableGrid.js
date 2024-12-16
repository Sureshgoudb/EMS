import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import {
  Card,
  Typography,
  Box,
  useTheme,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Refresh } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100vh",
  borderRadius: 0,
  fontWeight: "bold",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "none",
  backgroundColor: theme.palette.background.default,
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  fontWeight: "bold",
  backgroundImage:
    theme.palette.mode === "light"
      ? "linear-gradient(45deg, #2196F3, #21CBF3)"
      : "linear-gradient(45deg, #1976d2, #90caf9)",
  backgroundClip: "text",
  textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
  WebkitBackgroundClip: "text",
  color: "transparent",
  fontSize: "1.5rem",
  padding: theme.spacing(2),
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  flex: 1,
  width: "100%",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,

  "& .MuiDataGrid-root": {
    border: "none",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    fontWeight: "bold",
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundImage:
      theme.palette.mode === "light"
        ? "linear-gradient(135deg, #2196F3, #21CBF3)"
        : "linear-gradient(135deg, #1976d2, #90caf9)",
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
  },
  "& .MuiDataGrid-columnHeader": {
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    textAlign: "center",
    width: "100%",
  },
  "& .MuiDataGrid-cell:hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? "rgba(227, 242, 253, 0.7)"
        : "rgba(255,255,255,0.08)",
    transform: "scale(1.02)",
  },
  "& .ui-percentage-green": {
    color: "#50ef53",
  },
  "& .ui-percentage-light-red": {
    color: "#FFA726",
  },
  "& .ui-percentage-dark-red": {
    color: "#F44336",
  },

  "@keyframes blink-cell": {
    "0%": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
    "50%": { backgroundColor: "rgba(244, 67, 54, 0.3)" },
    "100%": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
  },
  "& .ui-percentage-critical": {
    color: "#f44336",
    animation: "blink-cell 1s infinite",
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(1, 2),
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255,255,255,0.8)"
      : "rgba(0,0,0,0.8)",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
}));

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

const TableGrid = () => {
  const [terminals, setTerminals] = useState([]);
  const [scriptsData, setScriptsData] = useState({});
  const [scripts, setScripts] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [blkNo, setBlkNo] = useState("");
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    fetchTerminals();
    const dateTimeTimer = setInterval(() => {
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
      clearInterval(dateTimeTimer);
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
      const fetchInterval = setInterval(fetchGridData, 20000);
      return () => {
        clearInterval(fetchInterval);
      };
    }
  }, [terminals, scripts]);

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
      setScriptsData(response.data.scripts);
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
        flex: 1.5,
        headerClassName: "header-cell",
        cellClassName: "centered-cell",
        headerAlign: "center",
        align: "center",
      },
      {
        field: "timestamp",
        headerName: "Date Time",
        flex: 1.5,
        headerClassName: "header-cell",
        cellClassName: "centered-cell",
        headerAlign: "center",
        align: "center",
      },
    ];

    const scriptColumns = scripts.map((script) => ({
      field: script,
      headerName: script,
      flex: 1,
      headerClassName: "header-cell",
      cellClassName: (params) => {
        const value = parseFloat(params.value);
        let baseClass = "centered-cell";

        if (script === "UI Percentage") {
          if (value >= 0) return `${baseClass} ui-percentage-green`;
          if (value < 0 && value >= -20)
            return `${baseClass} ui-percentage-light-red`;
          if (value < -20 && value >= -28)
            return `${baseClass} ui-percentage-dark-red`;
          if (value < -28) return `${baseClass} ui-percentage-critical`;
        }

        return baseClass;
      },
      headerAlign: "center",
      align: "center",
    }));

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
            Object.keys(scriptsData).map(async (script) => {
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
      <HeaderBox>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: isDarkMode
              ? "0 4px 8px rgba(0, 0, 0, 0.5)"
              : "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s, background-color 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          <Tooltip title="Current Time">
            <Chip
              icon={<AccessTimeIcon />}
              label={` ${currentDateTime}`}
              color="success"
              size="medium"
              variant="filled"
              sx={{
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                "& .MuiChip-icon": {
                  color: "#fff",
                },
              }}
            />
          </Tooltip>
        </Box>
        <StyledTypography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "12px 24px",
            color: "primary",
            borderRadius: "8px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: "0px 6px 6px rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          Generation Live Monitoring
        </StyledTypography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: isDarkMode
              ? "0 4px 8px rgba(0, 0, 0, 0.5)"
              : "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s, background-color 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          <Tooltip title="Block Number">
            <Chip
              label={`Block Number: ${blkNo}`}
              color="error"
              size="medium"
              variant="filled"
              sx={{
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                "& .MuiChip-icon": {
                  color: "#fff",
                },
              }}
            />
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton
              color="primary"
              onClick={fetchGridData}
              disabled={loading}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </HeaderBox>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        disableColumnMenu
        loading={loading}
        getRowClassName={(params) => {
          const uiPercentageValue = parseFloat(params.row["UI Percentage"]);
          if (uiPercentageValue < -28) {
            return "row-critical";
          }
          return "";
        }}
      />
    </StyledCard>
  );
};

export default TableGrid;
