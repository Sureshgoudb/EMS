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
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
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
import TableColumnCreate from "./TableColumnCreate";

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";

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
  const [selectedTerminal, setSelectedTerminal] = useState("");
  const [selectedScript, setSelectedScript] = useState("");
  const [terminals, setTerminals] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tableRef = useRef(null);
  const [scripts, setScripts] = useState([]);
  const [page, setPage] = useState(0);
  const { tableId } = useParams();
  const [sortedRows, setSortedRows] = useState([]);
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [tableName, setTableName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs().startOf("year"));
  const [toDate, setToDate] = useState(dayjs().endOf("day"));
  const [openGraph, setOpenGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [selectedGraphScripts, setSelectedGraphScripts] = useState([]);
  const [showPercentage, setShowPercentage] = useState({});
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [exporting, setExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [tableInfo, setTableInfo] = useState(null);

  useEffect(() => {
    fetchTerminals();
  }, []);

  useEffect(() => {
    if (selectedTerminal) {
      fetchScripts(selectedTerminal);
    }
  }, [selectedTerminal]);

  useEffect(() => {
    if (tableInfo) {
      fetchInitialData();
    }
  }, [tableInfo]);

  useEffect(() => {
    if (selectedTerminal && selectedScript) {
      const newColumn = {
        id: selectedScript,
        label: selectedTerminal + "_" + selectedScript,
      };
      setColumns((prevColumns) => {
        if (!prevColumns.find((col) => col.id === selectedScript)) {
          return [...prevColumns, newColumn];
        }
        return prevColumns;
      });
      fetchInitialData();
    }
  }, [selectedScript]);

  useEffect(() => {
    filterData();
  }, [rows, fromDate, toDate]);

  // ---------- Fetch terminals ----------
  const fetchTerminals = async () => {
    try {
      const response = await axios.get(`${apiKey}terminal/list`);
      setTerminals(response.data);
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  // ---------- Fetch scripts ----------
  const fetchScripts = async (terminalId) => {
    try {
      const response = await axios.get(
        `${apiKey}terminal/${terminalId}/scripts`
      );
      setScripts(response.data);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  useEffect(() => {
    if (selectedTerminal && selectedScripts.length > 0) {
      fetchInitialData();
    }
  }, [selectedTerminal, selectedScripts]);
  // ---------- Fetch hdnuts data ----------
  useEffect(() => {
    if (selectedTerminal && selectedScripts.length > 0) {
      fetchInitialData();
    }
  }, [selectedTerminal, selectedScripts]);

  const fetchInitialData = async (scriptsToFetch = selectedScripts) => {
    setLoading(true);
    try {
      if (scriptsToFetch.length === 0) {
        setRows([]);
        setFilteredRows([]);
        setSortedRows([]);
        setVisibleRows([]);
        setLoading(false);
        return;
      }

      const promises = scriptsToFetch.map((script) =>
        axios.get(
          `${apiKey}terminal/${selectedTerminal}/script/${script}/history`
        )
      );
      const responses = await Promise.all(promises);

      const newRows = {};
      responses.forEach((response, index) => {
        const script = scriptsToFetch[index];
        response.data.forEach((item) => {
          const timestamp = item[script].timestamp;
          const value = parseFloat(item[script].value);

          if (!newRows[timestamp]) {
            newRows[timestamp] = { timestamp };
          }
          newRows[timestamp][script] = value;
        });
      });

      const sortedRows = Object.values(newRows).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setRows(sortedRows);
      setFilteredRows(sortedRows);
      setSortedRows(sortedRows);
      setVisibleRows(sortedRows.slice(0, 50));
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to fetch initial data");
    } finally {
      setLoading(false);
    }
  };

  // ------------- Create new column ----------
  const handleCreateColumn = async (terminal, script, profile) => {
    setSelectedTerminal(terminal);
    setSelectedScripts((prevScripts) => [...prevScripts, script]);

    setColumns((prevColumns) => [
      ...prevColumns,
      { id: script, label: script },
    ]);

    setSelectedProfile(profile);

    try {
      const response = await axios.get(
        `${apiKey}terminal/${terminal}/script/${script}/history`
      );
      const newData = response.data;

      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        newData.forEach((item) => {
          const timestamp = item[script].timestamp;
          const value = item[script].value;
          const existingRow = updatedRows.find(
            (row) => row.timestamp === timestamp
          );
          if (existingRow) {
            existingRow[script] = value;
          } else {
            updatedRows.push({ timestamp, [script]: value });
          }
        });
        return updatedRows.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });

      setFilteredRows((prevFilteredRows) => {
        const updatedRows = [...prevFilteredRows];
        newData.forEach((item) => {
          const timestamp = item[script].timestamp;
          const value = item[script].value;
          const existingRow = updatedRows.find(
            (row) => row.timestamp === timestamp
          );
          if (existingRow) {
            existingRow[script] = value;
          } else {
            updatedRows.push({ timestamp, [script]: value });
          }
        });
        return updatedRows.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });

      setSortedRows((prevSortedRows) => {
        const updatedRows = [...prevSortedRows];
        newData.forEach((item) => {
          const timestamp = item[script].timestamp;
          const value = item[script].value;
          const existingRow = updatedRows.find(
            (row) => row.timestamp === timestamp
          );
          if (existingRow) {
            existingRow[script] = value;
          } else {
            updatedRows.push({ timestamp, [script]: value });
          }
        });
        return updatedRows.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });
    } catch (error) {
      console.error("Error fetching data for new column:", error);
      toast.error("Failed to fetch data for the new column");
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
      };

      let response;
      if (tableInfo && tableId) {
        response = await axios.put(
          `${apiKey}terminal/updateTable/${tableId}`,
          tableData
        );
        console.log("Table updated successfully:", response.data);
        toast.success("Table updated successfully");
      } else {
        response = await axios.post(`${apiKey}terminal/createTable`, tableData);
        console.log("Table saved successfully:", response.data);
        toast.success("Table saved successfully");
      }
      setSaveDialogOpen(false);

      //------------ Update tableInfo with the latest data -------------
      setTableInfo(response.data);
    } catch (error) {
      console.error("Error saving/updating table:", error);
      toast.error("Failed to save/update table");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchTableInfo();
  }, [tableId]);

  const fetchTableInfo = async () => {
    try {
      const response = await axios.get(`${apiKey}terminal/table/${tableId}`);
      setTableInfo(response.data);
      setTableName(response.data.name);
      setSelectedTerminal(response.data.terminal);
      setSelectedScripts(
        response.data.columns.filter((col) => col !== "timestamp")
      );
      setColumns(response.data.columns.map((col) => ({ id: col, label: col })));
    } catch (error) {
      console.error("Error fetching table info:", error);
    }
  };
  useEffect(() => {
    if (tableInfo) {
      setSelectedTerminal(tableInfo.terminal);
      setSelectedScripts(
        tableInfo.columns.filter((col) => col !== "timestamp")
      );
      setColumns([
        { id: "timestamp", label: "Timestamp" },
        ...tableInfo.columns
          .filter((col) => col !== "timestamp")
          .map((col) => ({ id: col, label: col })),
      ]);
      fetchInitialData();
    }
  }, [tableInfo]);

  const filterData = () => {
    let filteredData = rows;

    if (selectedProfile) {
      const now = dayjs();
      let startDate;

      switch (selectedProfile) {
        case "trend":
        case "1min":
        case "1hr":
        case "shift":
          startDate = now.startOf("day");
          break;
        case "daily":
        case "weekly":
        case "monthly":
        case "yearly":
          startDate = now.startOf("month");
          break;
        default:
          startDate = now.startOf("day");
      }

      filteredData = filteredData.filter((row) => {
        const rowDate = dayjs(row.timestamp);
        return rowDate.isAfter(startDate) && rowDate.isBefore(now);
      });
    }

    // Apply date range filtering
    filteredData = filteredData.filter((row) => {
      const rowDate = dayjs(row.timestamp);
      return rowDate.isAfter(fromDate) && rowDate.isBefore(toDate);
    });

    setFilteredRows(filteredData);
    setPage(0);
  };
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

  const graphexportToPdf = async () => {
    const input = document.getElementById("graph-container");

    try {
      const canvas = await html2canvas(input, { useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("l", "mm", "a4"); // Landscape orientation for A4 size
      const imgWidth = pdf.internal.pageSize.getWidth(); // Get PDF width
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate the height to maintain aspect ratio

      // If the image is taller than the PDF page, split into multiple pages
      let heightLeft = imgHeight;
      let position = 0;

      // Add title or header
      pdf.setFontSize(16);
      pdf.text("Multi-Variable Comparison", imgWidth / 2, 15, {
        align: "center",
      });

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      // If the image is larger than one page, continue adding pages
      while (heightLeft >= 0) {
        pdf.addPage();
        position = heightLeft > 0 ? 0 : heightLeft;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      // Save the PDF
      pdf.save("multi_variable_comparison.pdf");
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting to PDF: ", error);
      toast.error("Failed to export PDF");
    }
  };

  useEffect(() => {
    const sorted = [...filteredRows].sort(
      (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
    );
    setSortedRows(sorted);
  }, [filteredRows]);

  const formatTimestamp = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // ---------- Function to calculate the difference between two values ----------
  const calculateDifference = (currentValue, previousValue) => {
    if (previousValue === null || currentValue === null)
      return { value: null, percentage: null };
    if (previousValue === 0) {
      // Handle division by zero error
      return { value: currentValue, percentage: null };
    }
    const valueDiff = currentValue - previousValue;
    const percentageDiff = (valueDiff / previousValue) * 100;
    return { value: valueDiff, percentage: percentageDiff };
  };

  const formatDifference = (difference, showPercentage) => {
    if (difference.value === null) return "-";
    // if (difference.value === 0 || difference.value === -0.0) {
    //   // Return a plain "0" without the arrow icon
    //   return (
    //     <Typography variant="body2" component="span">
    //       0
    //     </Typography>
    //   );
    // }
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
      .filter((v) => !isNaN(v));
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
      setSelectedScript(scriptParam);
    }
  }, [location]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleGoBack = () => {
    navigate("/view/terminal");
  };

  const handleScriptChange = (event) => {
    const {
      target: { value },
    } = event;
    const newSelectedScripts =
      typeof value === "string" ? value.split(",") : value;

    // Check if the new selection is a subset of the previous selection
    if (newSelectedScripts.length < selectedScripts.length) {
      const removedScripts = selectedScripts.filter(
        (script) => !newSelectedScripts.includes(script)
      );
      removedScripts.forEach((script) => {
        toast.info(`Script ${script} has been removed from the table.`);
      });
    }

    setSelectedScripts(newSelectedScripts);
  };

  useEffect(() => {
    // Update columns based on selectedScripts
    const newColumns = [
      { id: "timestamp", label: "Timestamp" },
      ...selectedScripts.map((script) => ({ id: script, label: script })),
    ];
    setColumns(newColumns);

    // Fetch data for newly selected scripts
    selectedScripts.forEach((script) => {
      if (!columns.some((col) => col.id === script)) {
        fetchScriptData(script);
      }
    });

    // Remove data for unselected scripts
    setRows((prevRows) =>
      prevRows.map((row) => {
        const newRow = { timestamp: row.timestamp };

        selectedScripts.forEach((script) => {
          if (row.hasOwnProperty(script)) {
            newRow[script] = row[script];
          }
        });
        return newRow;
      })
    );
  }, [selectedScripts]);

  const [loadingScriptData, setLoadingScriptData] = useState(false);

  const fetchScriptData = async (script) => {
    setLoadingScriptData(true);
    try {
      const response = await axios.get(
        `${apiKey}terminal/${selectedTerminal}/script/${script}/history`
      );
      const newData = response.data;

      if (!Array.isArray(newData) || newData.length === 0) {
        toast.warning(`No data available for script: ${script}`);
        setLoadingScriptData(false);
        return;
      }

      const updateRowsLogic = (prevRows) => {
        const updatedRows = [...prevRows];
        newData.forEach((item) => {
          if (item && item[script]) {
            const timestamp = item[script].timestamp;
            const value = parseFloat(item[script].value);
            if (timestamp && !isNaN(value)) {
              const existingRowIndex = updatedRows.findIndex(
                (row) => row.timestamp === timestamp
              );
              if (existingRowIndex !== -1) {
                updatedRows[existingRowIndex] = {
                  ...updatedRows[existingRowIndex],
                  [script]: value,
                };
              } else {
                updatedRows.push({ timestamp, [script]: value });
              }
            }
          }
        });
        return updatedRows.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      };

      setRows(updateRowsLogic);
      setFilteredRows(updateRowsLogic);
      setSortedRows(updateRowsLogic);
      setFilteredRows((prevFilteredRows) => {
        return prevFilteredRows.filter((row) => {
          const rowDate = dayjs(row.timestamp);
          return rowDate.isAfter(fromDate) && rowDate.isBefore(toDate);
        });
      });

      setSortedRows((prevSortedRows) => {
        const newSortedRows = [...prevSortedRows];
        setVisibleRows(newSortedRows.slice(0, 50));
        setHasMore(newSortedRows.length > 50);
        return newSortedRows;
      });

      toast.success(`Data for ${script} loaded successfully`);
    } catch (error) {
      console.error("Error fetching data for new script:", error);
      toast.error(`Failed to fetch data for the script: ${script}`);
    } finally {
      setLoadingScriptData(false);
    }
  };

  // ---------- Function to export To Pdf ----------
  const exportToPdf = async () => {
    setExporting(true);
    const doc = new jsPDF("l", "mm", "a4");

    // Title for the PDF
    doc.text(tableName || "Filtered Data", 14, 15);

    // Add the table to the PDF
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

    // Capture the graph as an image using html2canvas
    const graphContainer = document.getElementById("graph-container");

    // Ensure the graph container exists before capturing
    if (graphContainer) {
      const canvas = await html2canvas(graphContainer, {
        useCORS: true, // Use this if the graph includes images from different origins
        scale: 2, // Optional: Increase scale for better quality
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 297; // A4 width in mm
      const pageHeight = doc.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Add the image to the PDF
      let position = 20 + (filteredRows.length > 0 ? 40 : 10); // Adjust position based on table height

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

    // Save the PDF
    doc.save("filtered_data.pdf");
    toast.success("PDF exported successfully");

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
    toast.success("Excel exported successfully");
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
    <Dialog
      open={openGraph}
      onClose={handleCloseGraph}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "#f5f5f5",
          borderRadius: "16px",
          boxShadow: "0 14px 45px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        style={{
          background: "linear-gradient(135deg, #3f51b5 30%, #5c6bc0 90%)",
          color: "white",
          textAlign: "center",
          position: "relative", // Set position to relative for icon positioning
        }}
      >
        Multi-Variable Comparison
        {/* Icon Button for Export to PDF */}
        <Tooltip title="Export to PDF" arrow>
          <IconButton
            style={{
              position: "absolute",
              right: "50px",
              top: "10px",
              color: "white",
            }} // Adjust position as needed
            onClick={graphexportToPdf}
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
        {/* Icon Button for Close */}
        <Tooltip title="Close" arrow>
          <IconButton
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              color: "white",
            }} // Adjust position as needed
            onClick={handleCloseGraph}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        <Box mb={3} mt={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="script-select-label">Select Variable</InputLabel>
            <Select
              labelId="script-select-label"
              multiple
              value={selectedGraphScripts}
              onChange={handleScriptSelect}
              renderValue={(selected) => selected.join(", ")}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "16px",
                height: "40px",
                padding: "0 12px",
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  },
                },
              }}
            >
              {columns
                .filter((col) => col.id !== "timestamp")
                .map((col) => (
                  <MenuItem key={col.id} value={col.id}>
                    <Checkbox
                      checked={selectedGraphScripts.indexOf(col.id) > -1}
                    />
                    <ListItemText primary={col.label} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <div
          id="graph-container"
          style={{
            background: "linear-gradient(white, #e3f2fd)",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={reversedGraphData}
              margin={{ top: 30, right: 40, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="timestamp"
                stroke="#555"
                style={{ fontSize: "13px" }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#555" style={{ fontSize: "13px" }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
                  padding: "10px",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={36} />
              {selectedGraphScripts.map((script, index) => (
                <Area
                  key={script}
                  type="monotone"
                  dataKey={script}
                  stroke={`hsl(${(index * 137) % 360}, 60%, 50%)`}
                  fill={`url(#gradient${index})`}
                  strokeWidth={2}
                  fillOpacity={0.6}
                />
              ))}
              {selectedGraphScripts.map((script, index) => (
                <defs key={`defs${index}`}>
                  <linearGradient
                    id={`gradient${index}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{
                        stopColor: `hsl(${(index * 137) % 360}, 60%, 50%)`,
                        stopOpacity: 1,
                      }}
                    />
                    <stop
                      offset="100%"
                      style={{
                        stopColor: `hsl(${(index * 137) % 360}, 60%, 80%)`,
                        stopOpacity: 0.5,
                      }}
                    />
                  </linearGradient>
                </defs>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
      {/* Removed DialogActions section */}
    </Dialog>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              }}
            >
              Table Name: {tableInfo ? tableInfo.name : "Loading..."}
            </Typography>

            <StyledFormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: "#424242" }}>Device</InputLabel>
              <Select
                value={selectedTerminal}
                disabled
                label="Terminal"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  "& .MuiSelect-select": {
                    color: "#1565c0",
                    fontWeight: "bold",
                  },
                }}
              >
                <MenuItem value={selectedTerminal}>{selectedTerminal}</MenuItem>
              </Select>
            </StyledFormControl>
            <StyledFormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: "#424242" }}>Select Variable</InputLabel>
              <Select
                multiple
                value={selectedScripts}
                onChange={handleScriptChange}
                renderValue={(selected) => selected.join(", ")}
                label="Select Variables"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                {scripts.map((script) => (
                  <MenuItem key={script} value={script}>
                    <Checkbox checked={selectedScripts.indexOf(script) > -1} />
                    <ListItemText primary={script} />
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
                transition: "box-shadow 0.3s",
                "&:hover": {
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "#1565c0",
                  letterSpacing: "0.3px",
                }}
              >
                Filter Data
              </Typography>
              <DateTimePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    sx={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                )}
              />
              <DateTimePicker
                label="To Date"
                sx={{ mt: 2, mb: 2 }}
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    sx={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                )}
              />
            </Box>

            <Box
              display="flex"
              fullWidth
              sx={{
                mt: 3,
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Button
                onClick={handleSaveTable}
                variant="outlined"
                color="primary"
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  color: "#1565c0",
                  borderColor: "#1565c0",
                  "&:hover": {
                    borderColor: "#0d47a1",
                    color: "#0d47a1",
                    transform: "scale(1.05)",
                    transition: "transform 0.2s",
                  },
                }}
              >
                Save Table
              </Button>
              <Button
                variant="outlined"
                onClick={handleGoBack}
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  color: "#1565c0",
                  borderColor: "#1565c0",
                  "&:hover": {
                    borderColor: "#0d47a1",
                    color: "#0d47a1",
                    transform: "scale(1.05)",
                    transition: "transform 0.2s",
                  },
                }}
              >
                Back to view
              </Button>
            </Box>

            <Dialog
              open={saveDialogOpen}
              onClose={() => setSaveDialogOpen(false)}
              PaperProps={{
                sx: {
                  p: 3,
                  borderRadius: 4,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <DialogTitle
                sx={{
                  textAlign: "center",
                  color: "#3f51b5",
                  letterSpacing: "0.4px",
                }}
              >
                Save Table
              </DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Table Name"
                  fullWidth
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  sx={{
                    backgroundColor: "#f5f7fa",
                    borderRadius: "8px",
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ justifyContent: "center" }}>
                <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleSaveConfirm}
                  color="primary"
                  disabled={isSaving}
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
              <Button
                variant="contained"
                color="primary"
                onClick={exportToPdf}
                disabled={exporting}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: "#3f51b5",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#303f9f",
                    transform: "scale(1.05)",
                    transition: "transform 0.2s",
                  },
                }}
              >
                Export PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={exportToExcel}
                disabled={exporting}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: "#f50057",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#c51162",
                    transform: "scale(1.05)",
                    transition: "transform 0.2s",
                  },
                }}
              >
                Export Excel
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {selectedScripts && selectedScripts.length > 0 ? (
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
                      <StyledTableCell
                        key={column.id}
                        align="center"
                        sx={{ backgroundColor: "#007c89" }}
                      >
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                        >
                          <Typography variant="subtitle2">
                            {column.label}
                          </Typography>
                          {column.id !== "timestamp" && (
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <BarChartIcon
                                onClick={() => handleGraphIconClick(column.id)}
                                sx={{
                                  cursor: "pointer",
                                  fontSize: "small",
                                  mr: 1,
                                }}
                              />
                              <StyledSwitch
                                size="small"
                                checked={showPercentage[column.id] || false}
                                onChange={() =>
                                  handleTogglePercentage(column.id)
                                }
                              />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>
                                {showPercentage[column.id] ? "%" : "Val"}
                              </Typography>
                            </Box>
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
                                : row[column.id] !== undefined
                                ? row[column.id].toFixed(2)
                                : "-"}
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
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              No variables selected. Please select a variable to view data.
            </Typography>
          )}
          {!loading && (
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
                        Max: <strong>{columnInsights.max.toFixed(2)}</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 0.5 }}
                      >
                        Min: <strong>{columnInsights.min.toFixed(2)}</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        Avg: <strong>{columnInsights.avg.toFixed(2)}</strong>
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
        onCreateColumn={handleCreateColumn}
        presetTerminal={selectedTerminal}
      />
      {renderGraph()}

      <ToastContainer />
    </LocalizationProvider>
  );
};

export default DataTable;
