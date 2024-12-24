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

const ALLOWED_SCRIPTS = [
  "AvC MW",
  "SG MW",
  "AG MW",
  "Block Average MW",
  "UI MW",
  "MAE",
  "4th Block SG",
];

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
  border: `2px solid ${theme.palette.divider}`,

  "& .MuiDataGrid-root": {
    border: "none",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
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
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& .MuiDataGrid-columnHeader": {
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    borderRight: `1px solid ${theme.palette.divider}`,
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

const convertToBlock = (date) => {
  let old = new Date("01/01/1970");
  let present = date;
  let diff = Math.floor((present - old) / 1000);
  let blockNo = Math.floor((diff % 86400) / 900) + 1;
  return blockNo;
};

const TableGrid = () => {
  const [terminals, setTerminals] = useState([]);
  const [availableScripts, setAvailableScripts] = useState({});
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [blkNo, setBlkNo] = useState("");
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setBlkNo(convertToBlock(now));
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch terminals and their available scripts
  useEffect(() => {
    const fetchTerminalAndScripts = async () => {
      try {
        const terminalsResponse = await axios.get(`${apiKey}terminal/list`);
        const terminalsList = terminalsResponse.data;
        setTerminals(terminalsList);

        // Fetch scripts for each terminal and store availability
        const scriptsMap = {};
        await Promise.all(
          terminalsList.map(async (terminal) => {
            try {
              const scriptsResponse = await axios.get(
                `${apiKey}terminal/${terminal.terminalId}/scripts`
              );
              scriptsMap[terminal.terminalId] = Object.keys(
                scriptsResponse.data.scripts
              ).filter((script) => ALLOWED_SCRIPTS.includes(script));
            } catch (error) {
              console.error(
                `Failed to fetch scripts for terminal ${terminal.terminalId}:`,
                error
              );
              scriptsMap[terminal.terminalId] = [];
            }
          })
        );
        setAvailableScripts(scriptsMap);
        initializeColumns(ALLOWED_SCRIPTS);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminalAndScripts();
  }, []);

  const initializeColumns = (scripts) => {
    const columns = [
      {
        field: "terminal",
        headerName: "Site Name",
        flex: 1.5,
        headerAlign: "center",
        align: "center",
      },
      ...scripts.map((script) => ({
        field: script,
        headerName: script,
        flex: 1,
        headerAlign: "center",
        align: "center",
        cellClassName: (params) => {
          const value = parseFloat(params.value);
          if (script === "MAE") {
            if (value >= 0) return "ui-percentage-green";
            if (value < 0 && value >= -20) return "ui-percentage-light-red";
            if (value < -20 && value >= -28) return "ui-percentage-dark-red";
            if (value < -28) return "ui-percentage-critical";
          }
          return "";
        },
      })),
      {
        field: "timestamp",
        headerName: "Last Updated",
        flex: 1.5,
        headerAlign: "center",
        align: "center",
      },
    ];

    setColumns(columns);
  };

  // Fetch grid data
  const fetchGridData = async () => {
    setLoading(true);
    try {
      const newRows = await Promise.all(
        terminals.map(async (terminal, index) => {
          const row = {
            id: index,
            terminal: terminal.terminalName,
            timestamp: "N/A",
          };

          ALLOWED_SCRIPTS.forEach((script) => {
            row[script] = "N/A";
          });

          // Only fetch data for available scripts
          const terminalScripts = availableScripts[terminal.terminalId] || [];
          const scriptPromises = terminalScripts.map(async (script) => {
            try {
              const response = await axios.get(
                `${apiKey}terminal/${terminal.terminalId}/script/${script}/currentValue`
              );

              row[script] =
                typeof response.data[script] === "number"
                  ? response.data[script].toFixed(2)
                  : response.data[script];
              row.timestamp = formatTimestamp(response.data.timestamp);
            } catch (error) {
              console.error(
                `Error fetching ${script} for ${terminal.terminalName}:`,
                error
              );
            }
          });

          await Promise.all(scriptPromises);
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

  useEffect(() => {
    if (terminals.length > 0 && Object.keys(availableScripts).length > 0) {
      fetchGridData();
      const interval = setInterval(fetchGridData, 10000);
      return () => clearInterval(interval);
    }
  }, [terminals, availableScripts]);

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
          <Tooltip title="Current Time (IST)">
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
              boxShadow: "0px 6px 6px rgba(0, 0, 0, 0.3)",
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
          const uiPercentageValue = parseFloat(params.row["MAE"]);
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
