import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Table,
  Checkbox,
  ListItemText,
  Card,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  CircularProgress,
  IconButton,
  Alert,
  Tooltip,
  Snackbar,
  Stack,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { ArrowBack, Save, Close } from "@mui/icons-material";
import ExportButtons from "../ExportButtons";
import Clock from "react-live-clock";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import axios from "axios";
import { styled } from "@mui/material/styles";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TableColumnCreate from "./CreateNewTableDialog";
import EnhancedGraph from "./EnhancedGraph";
import * as XLSX from "xlsx";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
  position: "sticky",
  top: 0,
  zIndex: 1,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#177ddc" : "#1890ff",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 200,
}));

const DataTable = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [columns, setColumns] = useState([
    { id: "timestamp", label: "Timestamp" },
  ]);
  const [selectedTerminal, setSelectedTerminal] = useState([]);
  const [selectedScript, setSelectedScript] = useState("");
  const [visibleRows, setVisibleRows] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tableRef = useRef(null);
  const [scripts, setScripts] = useState([]);
  const { tableId } = useParams();
  const [sortedRows, setSortedRows] = useState([]);
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [tableName, setTableName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs().startOf("day"));
  const [toDate, setToDate] = useState(dayjs().endOf("day"));
  const [openGraph, setOpenGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [selectedGraphScripts, setSelectedGraphScripts] = useState([]);
  const [showPercentage, setShowPercentage] = useState({});
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [tableInfo, setTableInfo] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [isDataAvailable, setIsDataAvailable] = useState(true);
  const [sortDirection, setSortDirection] = useState("desc"); // Add this for timestamp sorting

  const [profiles] = useState([
    { value: "trend", label: "Trend" },
    { value: "block", label: "Block" },
    { value: "daily", label: "Daily" },
  ]);
  const requestCache = useRef(new Map());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  });

  const showNotification = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ---------- Fetch scripts ----------
  const fetchScripts = async (terminalId) => {
    try {
      const response = await axios.get(
        `${apiKey}variables/${selectedProfile}/${terminalId}`
      );
      setScripts(response.data);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  // ---------- Save table ----------
  const handleSaveTable = () => {
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = async () => {
    setIsSaving(true);
    try {
      const tableData = {
        name: tableName,
        terminal: selectedTerminal,
        columns: columns.map((col) => col.id),
        profile: selectedProfile,
      };

      let response;
      if (tableInfo && tableId) {
        response = await axios.put(
          `${apiKey}terminal/updateTable/${tableId}`,
          tableData
        );
        console.log("Table updated successfully:", response.data);
        showNotification("Table updated successfully", "success");
      } else {
        response = await axios.post(`${apiKey}terminal/createTable`, tableData);
        console.log("Table saved successfully:", response.data);
        showNotification("Table updated successfully", "success");
      }
      setSaveDialogOpen(false);

      setTableInfo(response.data);
    } catch (error) {
      console.error("Error saving/updating table:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchTableInfo();
  }, [tableId]);

  // ---------- Fetch table info ----------
  const fetchTableInfo = async () => {
    try {
      const response = await axios.get(`${apiKey}terminal/table/${tableId}`);
      setTableInfo(response.data);
      setTableName(response.data.name);
      setSelectedProfile(response.data.profile);
      setSelectedTerminal(response.data.terminal);
      setSelectedScripts(
        response.data.columns.filter((col) => col !== "timestamp")
      );
      setColumns(response.data.columns.map((col) => ({ id: col, label: col })));
    } catch (error) {
      console.error("Error fetching table info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortTimestamp = () => {
    const newDirection = sortDirection === "desc" ? "asc" : "desc";
    setSortDirection(newDirection);

    const sorted = [...filteredRows].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return newDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    setSortedRows(sorted);
    setVisibleRows(sorted.slice(0, 50));
  };

  useEffect(() => {
    if (tableInfo && selectedTerminal && selectedProfile) {
      fetchScripts(selectedTerminal);
      const today = dayjs();
      setFromDate(today.startOf("day"));
      setToDate(today.endOf("day"));

      selectedScripts.forEach((script) => {
        fetchScriptData(script);
      });
    }
  }, [tableInfo, selectedTerminal, selectedProfile]);

  const handleGraphIconClick = (script) => {
    setSelectedGraphScripts([script]);
    updateGraphData([script]);
    setOpenGraph(true);
  };

  const handleScriptSelect = (event) => {
    const selectedScripts = event.target.value;
    setSelectedGraphScripts(selectedScripts);
    updateGraphData(selectedScripts);
  };

  const updateGraphData = (selectedScripts) => {
    if (!selectedScripts || selectedScripts.length === 0) {
      setGraphData([]);
      return;
    }

    const data = filteredRows.map((row) => ({
      timestamp: row.timestamp,
      ...selectedScripts.reduce((acc, script) => {
        acc[script] = row[script];
        return acc;
      }, {}),
    }));
    setGraphData(data);
  };

  const handleCloseGraph = () => {
    setOpenGraph(false);
    setSelectedGraphScripts([]);
  };

  // ------------ Graph Export to PDF ----------
  const graphexportToPdf = async () => {
    const input = document.getElementById("graph-container");

    try {
      const canvas = await html2canvas(input, { useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.setFontSize(16);
      pdf.text("Multi-Variable Comparison", imgWidth / 2, 15, {
        align: "center",
      });
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft >= 0) {
        pdf.addPage();
        position = heightLeft > 0 ? 0 : heightLeft;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save("multi_variable_comparison.pdf");
      showNotification("PDF exported successfully", "success");
    } catch (error) {
      console.error("Error exporting to PDF: ", error);
    }
  };

  useEffect(() => {
    const sorted = [...filteredRows].sort(
      (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
    );
    setSortedRows(sorted);
  }, [filteredRows]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    return dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");
  };

  // ---------- Function to calculate the difference between two values ----------
  const calculateDifference = (currentValue, previousValue) => {
    if (
      currentValue === undefined ||
      previousValue === undefined ||
      currentValue === null ||
      previousValue === null
    ) {
      return { value: null, percentage: null };
    }

    const roundedCurrent = Number(Number(currentValue).toFixed(2));
    const roundedPrevious = Number(Number(previousValue).toFixed(2));

    if (isNaN(roundedCurrent) || isNaN(roundedPrevious)) {
      return { value: null, percentage: null };
    }
    const valueDiff = roundedCurrent - roundedPrevious;
    if (Math.abs(valueDiff) < 0.005) {
      return { value: 0, percentage: 0 };
    }

    let percentageDiff = 0;
    if (roundedPrevious !== 0) {
      percentageDiff = (valueDiff / roundedPrevious) * 100;
    } else if (roundedCurrent !== 0) {
      percentageDiff = roundedCurrent > 0 ? 100 : -100;
    }

    return {
      value: Number(valueDiff.toFixed(2)),
      percentage: Number(percentageDiff.toFixed(2)),
    };
  };
  const formatDifference = (difference, showPercentage) => {
    if (difference.value === null) return "-";
    if (difference.value === 0) return "0";

    const isPositive = difference.value > 0;
    const ArrowIcon = isPositive ? ArrowUpwardIcon : ArrowDownwardIcon;
    const formattedValue = showPercentage
      ? `${difference.percentage.toFixed(2)}%`
      : difference.value.toFixed(2);

    return (
      <Tooltip title={`${formattedValue}`}>
        <Box component="span" display="flex" alignItems="center">
          <ArrowIcon
            fontSize="small"
            color={isPositive ? "success" : "error"}
          />
          <Typography variant="body2" component="span" ml={0.5}>
            {formattedValue}
          </Typography>
        </Box>
      </Tooltip>
    );
  };
  const handleTogglePercentage = (columnId) => {
    setShowPercentage((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // ---------- Function to calculate insights ----------
  const calculateInsights = (data, columnId) => {
    const values = data
      .map((row) => parseFloat(row[columnId]))
      .filter((v) => !isNaN(v) && v !== null && v !== undefined);

    if (values.length === 0) {
      return { max: "-", min: "-", avg: "-" };
    }

    return {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
    };
  };

  useEffect(() => {
    const newInsights = {};
    columns.forEach((column) => {
      if (column.id !== "timestamp") {
        newInsights[column.id] = calculateInsights(filteredRows, column.id);
      }
    });
    setInsights(newInsights);
  }, [filteredRows, columns]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const terminalParam = searchParams.get("terminal");
    const scriptParam = searchParams.get("script");

    if (terminalParam && scriptParam) {
      setSelectedTerminal(terminalParam);
      console.log("param", terminalParam);
      setSelectedScript(scriptParam);
    }
  }, [location]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleGoBack = () => {
    navigate("/view/terminal", {
      state: { activeTab: 1 },
    });
  };
  const [scriptData, setScriptData] = useState({});

  // ---------- Function to handle script change ----------
  const handleScriptChange = (event) => {
    const {
      target: { value },
    } = event;
    const newSelectedScripts =
      typeof value === "string" ? value.split(",") : value;

    const removedScripts = selectedScripts.filter(
      (script) => !newSelectedScripts.includes(script)
    );

    const addedScripts = newSelectedScripts.filter(
      (script) => !selectedScripts.includes(script)
    );

    setSelectedScripts(newSelectedScripts);

    if (removedScripts.length > 0) {
      setScriptData((prevData) => {
        const newData = { ...prevData };
        removedScripts.forEach((script) => {
          delete newData[script];
          showNotification(
            "Column removed",

            "error"
          );
        });
        return newData;
      });
    }

    addedScripts.forEach((script) => {
      fetchScriptData(script);
      showNotification(
        "new Column added",

        "info"
      );
    });
  };

  const fetchScriptData = async (script) => {
    if (!selectedTerminal || !selectedProfile) return;

    const cacheKey = `${selectedTerminal}-${script}-${selectedProfile}-${fromDate}-${toDate}`;

    // Check cache first
    if (requestCache.current.has(cacheKey)) {
      const cachedData = requestCache.current.get(cacheKey);
      setScriptData((prev) => ({
        ...prev,
        [script]: cachedData,
      }));
      return;
    }

    try {
      // Convert dates to ISO string format ensuring timezone is preserved
      const fromDateISO = fromDate.startOf("minute").toISOString();
      const toDateISO = toDate.endOf("minute").toISOString();

      const response = await axios.get(
        `${apiKey}terminal/${selectedTerminal}/script/${script}/history/${selectedProfile}`,
        {
          params: {
            fromDate: fromDateISO,
            toDate: toDateISO,
          },
        }
      );

      const processedData = {};
      response.data.forEach((item) => {
        if (item[script]) {
          const { timestamp, value } = item[script];

          // Create dates using the exact timestamp string to preserve timezone
          const itemDate = dayjs(timestamp);
          const startDate = fromDate.startOf("minute");
          const endDate = toDate.endOf("minute");

          // Include data only if it falls within the selected range
          if (
            itemDate.isAfter(startDate) ||
            (itemDate.isSame(startDate) &&
              (itemDate.isBefore(endDate) || itemDate.isSame(endDate)) &&
              !isNaN(value.$numberDecimal))
          ) {
            processedData[timestamp] = {
              timestamp,
              [script]: parseFloat(value.$numberDecimal),
            };
          }
        }
      });

      // Store in cache
      requestCache.current.set(cacheKey, processedData);

      setScriptData((prev) => ({
        ...prev,
        [script]: processedData,
      }));
    } catch (error) {
      console.error(`Error fetching data for script ${script}:`, error);
      showNotification(`Error fetching data for ${script}`, "error");
    }
  };
  // Add effect to refetch data when dates change
  useEffect(() => {
    // Clear the request cache when dates change
    requestCache.current.clear();

    // Refetch data for all selected scripts with new date range
    selectedScripts.forEach((script) => {
      fetchScriptData(script);
    });
  }, [fromDate, toDate]);

  useEffect(() => {
    const mergedData = {};
    Object.values(scriptData).forEach((scriptRows) => {
      Object.entries(scriptRows).forEach(([timestamp, rowData]) => {
        if (!mergedData[timestamp]) {
          mergedData[timestamp] = { timestamp };
        }
        Object.assign(mergedData[timestamp], rowData);
      });
    });

    const sortedNewRows = Object.values(mergedData).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Check if we have any data
    setIsDataAvailable(sortedNewRows.length > 0);

    setRows(sortedNewRows);
    setFilteredRows(sortedNewRows);
    setSortedRows(sortedNewRows);
    setVisibleRows(sortedNewRows.slice(0, 50));
    setHasMore(sortedNewRows.length > 50);
  }, [scriptData]);

  // Create a component for the no data message
  const renderTimestampHeader = () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ cursor: "pointer" }}
      onClick={handleSortTimestamp}
    >
      <Typography variant="subtitle2" sx={{ mr: 1 }}>
        Timestamp
      </Typography>
      {sortDirection === "desc" ? (
        <ArrowDownward fontSize="small" />
      ) : (
        <ArrowUpward fontSize="small" />
      )}
    </Box>
  );

  // Update the NoDataMessage component
  const NoDataMessage = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "400px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        p: 4,
      }}
    >
      <Box
        component="img"
        src="/api/placeholder/200/200"
        alt="No data"
        sx={{
          width: 200,
          height: 200,
          opacity: 0.5,
          mb: 3,
        }}
      />
      <Typography
        variant="h5"
        sx={{
          color: "#455a64",
          fontWeight: 600,
          mb: 2,
          textAlign: "center",
        }}
      >
        No Data Available
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "#78909c",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        There is no data available for the selected date range:
        <br />
        {fromDate.format("MMMM D, YYYY h:mm A")} to{" "}
        {toDate.format("MMMM D, YYYY h:mm A")}
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={() => {
          const today = dayjs();
          setFromDate(today.startOf("day"));
          setToDate(today.endOf("day"));
          selectedScripts.forEach((script) => {
            fetchScriptData(script);
          });
          showNotification("Reset to today's date range", "info");
        }}
      >
        Reset to Today
      </Button>
    </Box>
  );

  useEffect(() => {
    const mergedData = Object.values(scriptData).reduce((acc, scriptRows) => {
      Object.entries(scriptRows).forEach(([timestamp, rowData]) => {
        if (!acc[timestamp]) {
          acc[timestamp] = { timestamp };
        }
        Object.assign(acc[timestamp], rowData);
      });
      return acc;
    }, {});

    const sortedNewRows = Object.values(mergedData).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    setRows(sortedNewRows);
    setFilteredRows(sortedNewRows);
    setSortedRows(sortedNewRows);
    setVisibleRows(sortedNewRows.slice(0, 50));
    setHasMore(sortedNewRows.length > 50);
  }, [scriptData]);

  useEffect(() => {
    const mergedData = Object.values(scriptData).reduce((acc, scriptRows) => {
      Object.entries(scriptRows).forEach(([timestamp, rowData]) => {
        if (!acc[timestamp]) {
          acc[timestamp] = { timestamp };
        }
        Object.assign(acc[timestamp], rowData);
      });
      return acc;
    }, {});

    const sortedNewRows = Object.values(mergedData).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    setRows(sortedNewRows);
    setFilteredRows(sortedNewRows);
    setSortedRows(sortedNewRows);
    setVisibleRows(sortedNewRows.slice(0, 50));
    setHasMore(sortedNewRows.length > 50);
  }, [scriptData]);

  useEffect(() => {
    const newColumns = [
      { id: "timestamp", label: "Timestamp" },
      ...selectedScripts.map((script) => ({ id: script, label: script })),
    ];
    setColumns(newColumns);

    selectedScripts.forEach((script) => {
      if (!scriptData[script]) {
      }
    });
  }, [selectedScripts]);

  // ---------- Function to export To Pdf ----------
  const exportToPdf = async () => {
    setExporting(true);
    const doc = new jsPDF("l", "mm", "a4");

    doc.text(tableName || "Filtered Data", 14, 15);

    autoTable(doc, {
      head: [columns.map((column) => column.label)],
      body: filteredRows.map((row) =>
        columns.map((column) =>
          column.id === "timestamp"
            ? formatTimestamp(row[column.id])
            : row[column.id]
        )
      ),
      startY: 20,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 30 } },
    });

    const graphContainer = document.getElementById("graph-container");

    if (graphContainer) {
      const canvas = await html2canvas(graphContainer, {
        useCORS: true,
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 297;
      const pageHeight = doc.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 20 + (filteredRows.length > 0 ? 40 : 10);

      if (heightLeft >= pageHeight) {
        doc.addImage(imgData, "PNG", 14, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          doc.addPage();
          position = heightLeft > 0 ? 0 : heightLeft;
          doc.addImage(imgData, "PNG", 14, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        doc.addImage(imgData, "PNG", 14, position, imgWidth, imgHeight);
      }
    }
    doc.save("filtered_data.pdf");
    setExporting(false);
  };

  // ---------- Function to export To Excel ----------
  const exportToExcel = () => {
    setExporting(true);
    const wsData = [
      columns.map((column) => column.label),
      ...filteredRows.map((row) =>
        columns.map((column) =>
          column.id === "timestamp"
            ? formatTimestamp(row[column.id])
            : row[column.id]
        )
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FilteredData");
    XLSX.writeFile(wb, "filtered_data.xlsx");
    setExporting(false);
  };

  const loadMoreRows = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const startIndex = visibleRows.length;
    const endIndex = startIndex + 50;
    const newRows = sortedRows.slice(startIndex, endIndex);

    setTimeout(() => {
      setVisibleRows((prevRows) => [...prevRows, ...newRows]);
      setLoadingMore(false);
      setHasMore(endIndex < sortedRows.length);
    }, 1000);
  }, [loadingMore, hasMore, visibleRows.length, sortedRows]);

  useEffect(() => {
    setVisibleRows(sortedRows.slice(0, 50));
    setHasMore(sortedRows.length > 50);
  }, [sortedRows]);

  useEffect(() => {
    if (sortedRows && sortedRows.length > 0) {
      setVisibleRows(sortedRows.slice(0, 50));
      setHasMore(sortedRows.length > 50);
    } else {
      setVisibleRows([]);
      setHasMore(false);
    }
  }, [sortedRows]);

  useEffect(() => {
    const tableContainer = tableRef.current;
    if (!tableContainer) return;

    const handleScroll = () => {
      if (
        tableContainer.scrollTop + tableContainer.clientHeight >=
        tableContainer.scrollHeight - 20
      ) {
        loadMoreRows();
      }
    };

    tableContainer.addEventListener("scroll", handleScroll);
    return () => tableContainer.removeEventListener("scroll", handleScroll);
  }, [loadMoreRows]);
  const reversedGraphData = [...graphData].reverse();

  // ---------- Function to handle the Graph ----------
  const renderGraph = () => (
    <EnhancedGraph
      openGraph={openGraph}
      handleCloseGraph={handleCloseGraph}
      selectedTerminal={selectedTerminal}
      columns={columns}
      selectedGraphScripts={selectedGraphScripts}
      handleScriptSelect={handleScriptSelect}
      reversedGraphData={reversedGraphData}
      graphexportToPdf={graphexportToPdf}
    />
  );
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            "& .MuiAlert-message": {
              fontSize: "0.9rem",
              fontWeight: 500,
            },
            boxShadow: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Tooltip title="Back to View">
            <IconButton onClick={() => handleGoBack()}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontWeight: "bold",
              color: "#4a90e2",
            }}
          >
            Table Name: {tableInfo ? tableInfo.name : "Loading..."}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>
              <Clock format="DD-MM-YYYY" ticking={false} />
            </Typography>
            <Typography>
              <Clock format="HH:mm:ss" ticking />
            </Typography>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveTable}
            >
              Save Table
            </Button>
          </Box>
        </Stack>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: "#f0f4f8",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "#1a237e",
                textAlign: "center",
              }}
            >
              Table Configuration
            </Typography>
            <StyledFormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Profile</InputLabel>
              <Select
                disabled
                value={selectedProfile}
                onChange={(e) => {
                  setSelectedProfile(e.target.value);
                  selectedScripts.forEach((script) => fetchScriptData(script));
                }}
                label="Profile"
              >
                {profiles.map((profile) => (
                  <MenuItem key={profile.value} value={profile.value}>
                    {profile.label}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>

            <StyledFormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: "#424242" }}>Device</InputLabel>
              <Select
                value={selectedTerminal}
                disabled
                label="Device"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  "& .MuiSelect-select": {
                    color: "#1565c0",
                  },
                }}
              >
                <MenuItem value={selectedTerminal}>{selectedTerminal}</MenuItem>
              </Select>
            </StyledFormControl>

            <StyledFormControl fullWidth sx={{ mb: 3, position: "relative" }}>
              <InputLabel
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#2c3e50",
                  transform: "translate(14px, -8px) scale(0.75)",
                  "&.Mui-focused": {
                    color: "#3498db",
                  },
                }}
              >
                Select Variable
              </InputLabel>
              <Select
                multiple
                value={selectedScripts}
                onChange={handleScriptChange}
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.8,
                      maxHeight: "120px",
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#bdc3c7",
                        borderRadius: "10px",
                      },
                    }}
                  >
                    {selected.map((value) => (
                      <Box
                        key={value}
                        component="span"
                        sx={{
                          m: 0.5,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          backgroundColor: "#3498db",
                          color: "white",
                          fontSize: "0.85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          boxShadow: "0 2px 5px rgba(52, 152, 219, 0.2)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#2980b9",
                            transform: "translateY(-1px)",
                            boxShadow: "0 3px 8px rgba(52, 152, 219, 0.3)",
                          },
                        }}
                      >
                        {value}
                      </Box>
                    ))}
                  </Box>
                )}
                sx={{
                  mt: 1,
                  "& .MuiSelect-select": {
                    padding: "12px 16px",
                    backgroundColor: "#f8fafc",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px !important",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#3498db",
                      backgroundColor: "#fff",
                    },
                    "&.Mui-focused": {
                      borderColor: "#3498db",
                      boxShadow: "0 0 0 2px rgba(52, 152, 219, 0.2)",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 1,
                      padding: "8px",
                      borderRadius: "12px",
                      backgroundColor: "#fff",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      "& .MuiMenuItem-root": {
                        borderRadius: "8px",
                        margin: "4px 0",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "#f1f9ff",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "#e1f0ff",
                          "&:hover": {
                            backgroundColor: "#d1e8ff",
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {scripts.map((script) => (
                  <MenuItem
                    key={script}
                    value={script}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      padding: "10px 16px",
                    }}
                  >
                    <Checkbox
                      checked={selectedScripts.indexOf(script) > -1}
                      sx={{
                        color: "#cbd5e1",
                        "&.Mui-checked": {
                          color: "#3498db",
                        },
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.2rem",
                        },
                      }}
                    />
                    <ListItemText
                      primary={script}
                      sx={{
                        "& .MuiTypography-root": {
                          fontSize: "0.9rem",
                          fontWeight: selectedScripts.includes(script)
                            ? 600
                            : 400,
                          color: selectedScripts.includes(script)
                            ? "#2c3e50"
                            : "#64748b",
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>

            <Box
              sx={{
                mt: 3,
                p: 3,
                backgroundColor: "#e3f2fd",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "#1565c0",
                  mb: 2,
                }}
              >
                Filter Data
              </Typography>
              <DateTimePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => {
                  if (newValue && newValue.isValid()) {
                    setFromDate(newValue);
                    showNotification("From date updated", "info");
                  }
                }}
                maxDate={toDate}
                sx={{ width: "100%", mb: 2 }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !fromDate?.isValid(),
                    helperText: !fromDate?.isValid() ? "Invalid date" : "",
                  },
                }}
              />
              <DateTimePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => {
                  if (newValue && newValue.isValid()) {
                    setToDate(newValue);
                    showNotification("To date updated", "info");
                  }
                }}
                minDate={fromDate}
                sx={{ width: "100%" }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !toDate?.isValid(),
                    helperText: !toDate?.isValid() ? "Invalid date" : "",
                  },
                }}
              />
            </Box>

            <Dialog
              open={saveDialogOpen}
              onClose={() => setSaveDialogOpen(false)}
              PaperProps={{
                sx: {
                  p: 3,
                  borderRadius: 4,
                  backgroundColor: "#f0f4f8",
                  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.15)",
                  maxWidth: "450px",
                  width: "100%",
                },
              }}
            >
              <DialogTitle
                sx={{
                  textAlign: "center",
                  color: "#1565c0",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  mb: 2,
                  pb: 1,
                  borderBottom: "2px solid #e0e0e0",
                }}
              >
                Save Table
              </DialogTitle>
              <DialogContent sx={{ py: 3, px: 4 }}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Table Name"
                  fullWidth
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "#607d8b",
                      fontWeight: 500,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#1565c0",
                    },
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "#cfd8dc",
                        transition: "all 0.3s ease",
                      },
                      "&:hover fieldset": {
                        borderColor: "#90caf9",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1565c0",
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </DialogContent>
              <DialogActions
                sx={{
                  justifyContent: "center",
                  gap: 2,
                  mt: 1,
                  mb: 2,
                  px: 4,
                }}
              >
                <Button
                  onClick={() => setSaveDialogOpen(false)}
                  variant="outlined"
                  color="error"
                  startIcon={<Close />}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfirm}
                  disabled={isSaving}
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </DialogActions>
            </Dialog>

            <Box
              display="flex"
              fullWidth
              sx={{ mt: 3, justifyContent: "center", gap: 2 }}
            >
              <ExportButtons
                exporting={exporting}
                exportToPdf={exportToPdf}
                exportToExcel={exportToExcel}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {selectedScripts && selectedScripts.length > 0 ? (
            isDataAvailable ? (
              <TableContainer
                component={Paper}
                elevation={3}
                sx={{
                  height: "70vh",
                  overflow: "auto",
                }}
                ref={tableRef}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <StyledTableCell key={column.id} align="center">
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                          >
                            {column.id === "timestamp" ? (
                              renderTimestampHeader()
                            ) : (
                              <>
                                <Typography variant="subtitle2">
                                  {column.label}
                                </Typography>
                                {column.id !== "timestamp" && (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mt={0.5}
                                  >
                                    <BarChartIcon
                                      onClick={() =>
                                        handleGraphIconClick(column.id)
                                      }
                                      sx={{
                                        cursor: "pointer",
                                        fontSize: "small",
                                        mr: 1,
                                      }}
                                    />
                                    <StyledSwitch
                                      size="small"
                                      checked={
                                        showPercentage[column.id] || false
                                      }
                                      onChange={() =>
                                        handleTogglePercentage(column.id)
                                      }
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{ ml: 0.5 }}
                                    >
                                      {showPercentage[column.id] ? "%" : "Val"}
                                    </Typography>
                                  </Box>
                                )}
                              </>
                            )}
                          </Box>
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((row, index) => (
                      <StyledTableRow key={index}>
                        {columns.map((column) => (
                          <TableCell key={column.id} align="center">
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                            >
                              <Typography variant="body2">
                                {column.id === "timestamp"
                                  ? formatTimestamp(row.timestamp)
                                  : row[column.id] !== undefined &&
                                    row[column.id] !== null
                                  ? Number(row[column.id]).toFixed(2)
                                  : "NA"}
                              </Typography>
                              {column.id !== "timestamp" &&
                                index < sortedRows.length - 1 && (
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    {formatDifference(
                                      calculateDifference(
                                        row[column.id],
                                        sortedRows[index + 1][column.id]
                                      ),
                                      showPercentage[column.id]
                                    )}
                                  </Typography>
                                )}
                            </Box>
                          </TableCell>
                        ))}
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
                {loadingMore && (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </TableContainer>
            ) : (
              <NoDataMessage />
            )
          ) : (
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              No variables selected. Please select a variable to view data.
            </Typography>
          )}
          {!loading && isDataAvailable && (
            <Box
              mt={4}
              p={3}
              bgcolor="background.paper"
              borderRadius={3}
              boxShadow={3}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  mb: 3,
                  textAlign: "center",
                  letterSpacing: "0.6px",
                }}
              >
                Quick Insights
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(insights).map(([columnId, columnInsights]) => (
                  <Grid item xs={12} sm={6} md={4} key={columnId}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 1,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: 3,
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: "600",
                          mb: 1.5,
                          color: "secondary.main",
                          textTransform: "capitalize",
                          letterSpacing: "0.8px",
                        }}
                      >
                        {columnId}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Max:{" "}
                        <strong>
                          {typeof columnInsights.max === "number"
                            ? columnInsights.max.toFixed(2)
                            : columnInsights.max}
                        </strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Min:{" "}
                        <strong>
                          {typeof columnInsights.min === "number"
                            ? columnInsights.min.toFixed(2)
                            : columnInsights.min}
                        </strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        Avg:{" "}
                        <strong>
                          {typeof columnInsights.avg === "number"
                            ? columnInsights.avg.toFixed(2)
                            : columnInsights.avg}
                        </strong>
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
      <TableColumnCreate
        open={openDialog}
        onClose={handleCloseDialog}
        presetTerminal={selectedTerminal}
        profile={selectedProfile}
      />

      {renderGraph()}
    </LocalizationProvider>
  );
};

export default DataTable;
