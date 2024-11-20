import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Button,
  TablePagination,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Switch,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Typography from "@mui/material/Typography";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ClearIcon from "@mui/icons-material/Clear";
import GraphIcon from "@mui/icons-material/InsertChartOutlined";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ColumnCreationDialog from "./ColumnCreationDialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import GraphDialog from "./GraphDialog.js"; // Import the GraphDialog component
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const DataTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGraphDialog, setOpenGraphDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [columns, setColumns] = useState([
    { id: "date", label: "Date" },
    { id: "terminal1", label: "132kVTSP" },
    { id: "terminal2", label: "132kVPATNA" },
    { id: "avgConsumption", label: "Average Consumption" },
  ]);
  const [scriptName, setScriptName] = useState("");
  const [startDate, setStartDate] = useState(dayjs("2024-09-01"));
  const [endDate, setEndDate] = useState(dayjs("2024-09-11"));
  const [showPercentage, setShowPercentage] = useState(false); // Toggle between value and percentage display
  const scriptList = ["Script1", "Script2", "Script3"]; // Example list of scripts

  const scriptOptions = [
    "Script1",
    "Script2",
    "Script3",
    // Add more script options here
  ];
  const [selectedScript, setSelectedScript] = React.useState("");

  const handleScriptChange = (script) => {
    setSelectedScript(script);
    // Additional logic if needed
  };
  function generateSequentialDates(startDate, endDate, stepMinutes) {
    const dates = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate).endOf("day"); // Include the whole end date

    while (currentDate.isBefore(end)) {
      dates.push({
        date: currentDate.format("YYYY-MM-DD HH:mm"),
        terminal1: generateRandomValue(70, 100),
        terminal2: generateRandomValue(70, 100),
        terminal3: generateRandomValue(70, 100),
        terminal4: generateRandomValue(60, 100),
        terminal5: generateRandomValue(70, 100),
        terminal6: generateRandomValue(60, 100),
        terminal7: generateRandomValue(50, 100),
        avgConsumption: generateRandomValue(60, 100),
        script1: generateRandomValue(70, 100),
        script2: generateRandomValue(70, 100),
        script3: generateRandomValue(70, 100),
      });

      currentDate = currentDate.add(stepMinutes, "minute");
    }

    // Add data for the end date if it's missing
    if (currentDate.isSame(end, "minute") || currentDate.isBefore(end)) {
      dates.push({
        date: end.format("YYYY-MM-DD HH:mm"),
        terminal1: generateRandomValue(70, 100),
        terminal2: generateRandomValue(70, 100),
        terminal3: generateRandomValue(70, 100),
        terminal4: generateRandomValue(60, 100),
        terminal5: generateRandomValue(70, 100),
        terminal6: generateRandomValue(60, 100),
        terminal7: generateRandomValue(50, 100),
        avgConsumption: generateRandomValue(60, 100),
        script1: generateRandomValue(70, 100),
        script2: generateRandomValue(70, 100),
        script3: generateRandomValue(70, 100),
      });
    }

    return dates;
  }

  function generateRandomValue(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
  }

  const rows = generateSequentialDates(startDate, endDate, 60); // Adjust step as needed

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToPDF = () => {
    const input = document.getElementById("data-table");

    if (!input) {
      toast.error("The table element is not available for export.");
      return;
    }

    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -heightLeft, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("table.pdf");
        toast.success("PDF exported successfully!");
      })
      .catch((error) => {
        console.error("Error exporting to PDF:", error);
        toast.error("Failed to export PDF. Please try again.");
      });
  };

  const exportToExcel = () => {
    try {
      if (!filteredRows || filteredRows.length === 0) {
        toast.error("No data available to export!");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(filteredRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      const filenameGenerate = new Date().toISOString().slice(0, 10);
      const filename = `data_${filenameGenerate}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export Excel. Please try again.");
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddColumn = (newColumn) => {
    setColumns([
      ...columns,
      { id: newColumn.terminalName, label: newColumn.terminalName },
    ]);
    toast.success("Column added successfully!");
  };

  const filterRowsByDate = (rows) => {
    if (!startDate || !endDate) return rows;

    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day"); // Ensure it includes up to 23:59

    return rows.filter((row) => {
      const rowDate = dayjs(row.date, "YYYY-MM-DD HH:mm");
      return rowDate.isBetween(start, end, null, "[]"); // Inclusive of start and end dates
    });
  };

  const filteredRows = filterRowsByDate(rows);

  const handleClearFilters = () => {
    setStartDate("2024-09-01");
    setEndDate("2024-09-09");
    setScriptName("");
  };

  const handleOpenGraphDialog = (columnId) => {
    setSelectedColumn(columnId);
    setOpenGraphDialog(true);
  };

  const handleCloseGraphDialog = () => {
    setOpenGraphDialog(false);
    setSelectedScript(""); // Reset selected script when closing dialog
  };

  const calculateDifference = (currentValue, previousValue) => {
    const current = parseFloat(currentValue);
    const previous = parseFloat(previousValue);
    const difference = current - previous;
    const percentageDifference = ((difference / previous) * 100).toFixed(2);

    return {
      value: difference.toFixed(2),
      percentage: percentageDifference,
    };
  };

  const handleToggleDisplayMode = () => {
    setShowPercentage(!showPercentage); // Toggle between value and percentage mode
  };

  return (
    <Box sx={{ display: "flex", height: "110vh" }}>
      {/* Left Side Content */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          width: "300px",
          maxWidth: "300px",
          height: "100%",
          overflowY: "auto",
          backgroundColor: "#fff",
          borderRight: "2px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        ></Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 2,
          }}
        >
          {" "}
          <FormControl fullWidth>
            <InputLabel>Script Names</InputLabel>
            <Select
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              label="Script Names"
            >
              {scriptOptions.map((script) => (
                <MenuItem key={script} value={script}>
                  {script}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            sx={{ width: "300px", maxWidth: "300px" }}
            variant="contained"
            color="secondary"
            onClick={exportToPDF}
          >
            <PictureAsPdfIcon /> Export PDF
          </Button>
          <Button
            sx={{ width: "300px", maxWidth: "300px" }}
            variant="contained"
            color="success"
            onClick={exportToExcel}
          >
            <FontAwesomeIcon icon={faFileExcel} /> Export Excel
          </Button>
          <TextField
            sx={{ width: "300px", maxWidth: "300px" }}
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate ? dayjs(startDate).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              setStartDate(
                e.target.value ? dayjs(e.target.value).toDate() : null
              )
            }
          />
          <TextField
            sx={{ width: "300px", maxWidth: "300px" }}
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              setEndDate(e.target.value ? dayjs(e.target.value).toDate() : null)
            }
          />
          <Button
            sx={{ width: "300px", maxWidth: "300px" }}
            variant="contained"
            color="primary"
            onClick={handleClearFilters}
          >
            <ClearIcon /> Clear Filters
          </Button>
          <Button
            sx={{ width: "300px", maxWidth: "300px" }}
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
          >
            <AddBoxIcon /> Add Column
          </Button>
        </Box>
      </Box>

      {/* Right Side - Table */}
      <Box
        sx={{
          flex: "auto",
          overflowY: "auto",
          padding: 2,
          height: "100%",
        }}
      >
        {" "}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
          }}
        >
          <TextField
            label="Primary Category"
            variant="outlined"
            disabled
            value="PrimaryCategory: {name}"
          />
          <TextField
            label="Secondary Category"
            variant="outlined"
            disabled
            value="SecondaryCategory: {name}"
          />
          <TextField
            label="Tertiary Category"
            variant="outlined"
            disabled
            value="TertiaryCategory: {name}"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            marginBottom: 2,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {showPercentage ? "Percentage Difference" : "Value Difference"}
          </Typography>
          <Switch
            checked={showPercentage}
            onChange={handleToggleDisplayMode}
            name="showPercentage"
            inputProps={{ "aria-label": "Show percentage difference" }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#007c89",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#007c89",
              },
            }}
          />
        </Box>
        <TableContainer
          id="data-table"
          component={Paper}
          sx={{
            borderRadius: 2,
            overflow: "auto",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            height: "100%",
          }}
        >
          <Table>
            <TableHead
              sx={{
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #007c89",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "bold",
                "& th": {
                  borderRight: "1px solid #e0e0e0",
                },
                "& th:last-child": {
                  borderRight: "none",
                },
              }}
            >
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} sx={{ padding: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TableSortLabel>{column.label}</TableSortLabel>
                      {column.id !== "date" && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenGraphDialog(column.id)}
                          sx={{
                            marginLeft: 1,
                            color: "#007c89",
                            "&:hover": {
                              backgroundColor: "#e0f7fa",
                            },
                          }}
                        >
                          <GraphIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: "#fafafa",
                      },
                      "&:nth-of-type(even)": {
                        backgroundColor: "#ffffff",
                      },
                      "&:hover": {
                        backgroundColor: "#e8f5e9",
                      },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          padding: 1.5,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {column.id === "date" ? (
                          dayjs(row[column.id]).format("YYYY-MM-DD")
                        ) : (
                          <>
                            <Typography variant="body2">
                              {row[column.id]}
                            </Typography>
                            {rowIndex < rows.length - 1 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  color: (() => {
                                    const { value } = calculateDifference(
                                      row[column.id],
                                      rows[rowIndex + 1][column.id]
                                    );
                                    return value > 0 ? "green" : "red";
                                  })(),
                                  marginLeft: 1,
                                }}
                              >
                                {(() => {
                                  const { value, percentage } =
                                    calculateDifference(
                                      row[column.id],
                                      rows[rowIndex + 1][column.id]
                                    );
                                  return value > 0 ? (
                                    <>
                                      <ArrowUpwardIcon
                                        fontSize="small"
                                        sx={{ color: "green" }}
                                      />
                                      {showPercentage
                                        ? `${percentage}%`
                                        : `${value}`}
                                    </>
                                  ) : (
                                    <>
                                      <ArrowDownwardIcon
                                        fontSize="small"
                                        sx={{ color: "red" }}
                                      />
                                      {showPercentage
                                        ? `${percentage}%`
                                        : `${value}`}
                                    </>
                                  );
                                })()}
                              </Typography>
                            )}
                          </>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100, 500]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
        <ColumnCreationDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onAddColumn={handleAddColumn}
        />
        <GraphDialog
          open={openGraphDialog}
          onClose={handleCloseGraphDialog}
          columnId={selectedColumn}
          data={rows.map((row) => ({
            name: row.date,
            value: parseFloat(row[selectedColumn]) || 0,
            script1: parseFloat(row.script1) || 0,
            script2: parseFloat(row.script2) || 0,
            script3: parseFloat(row.script3) || 0,
          }))}
          scripts={scriptList}
          selectedScript={selectedScript}
          onScriptChange={handleScriptChange}
        />
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default DataTable;
