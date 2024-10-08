import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Box,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AreaChart, Area } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const GraphDialog = ({
  open,
  onClose,
  columnId,
  data,
  scripts,
  selectedScript,
  onScriptChange,
}) => {
  const [xAxisFrom, setXAxisFrom] = useState("");
  const [xAxisTo, setXAxisTo] = useState("");
  const [boxSize, setBoxSize] = useState({ width: 800, height: 400 });
  const [combinedData, setCombinedData] = useState([]);
  const handleScriptChange = (event) => {
    onScriptChange(event.target.value);
  };
  // Simulated script data (replace with actual data fetching logic)
  const scriptData = {
    Script1: [
      { name: "2024-09-01", value: 110 },
      { name: "2024-09-02", value: 140 },
      { name: "2024-09-03", value: 180 },
    ],
    Script2: [
      { name: "2024-09-01", value: 130 },
      { name: "2024-09-02", value: 150 },
      { name: "2024-09-03", value: 190 },
    ],
    Script3: [
      { name: "2024-09-01", value: 95 },
      { name: "2024-09-02", value: 130 },
      { name: "2024-09-03", value: 220 },
    ],
  };

  useEffect(() => {
    combineData();
  }, [data, selectedScript, columnId]);

  const combineData = () => {
    const combined = data.map((item) => {
      const scriptItem = selectedScript
        ? scriptData[selectedScript]?.find((s) => s.name === item.name)
        : null;

      return {
        name: item.name,
        [columnId]: item.value,
        ...(selectedScript && { [selectedScript]: scriptItem?.value || null }),
      };
    });
    setCombinedData(combined);
  };

  const handleXAxisFromChange = (event) => {
    setXAxisFrom(event.target.value);
  };

  const handleXAxisToChange = (event) => {
    setXAxisTo(event.target.value);
    console.log(event.target.value);
  };

  const filterDataByRange = (data) => {
    if (!xAxisFrom || !xAxisTo) return data;

    const from = new Date(xAxisFrom);
    const to = new Date(xAxisTo);

    return data.filter((d) => {
      const date = new Date(d.name);
      return date >= from && date <= to;
    });
  };

  const handleExportPDF = async () => {
    const titleElement = document.getElementById("dialog-title");
    const chartElement = document.getElementById("chart-container");

    await new Promise((resolve) => setTimeout(resolve, 100));

    const titleCanvas = await html2canvas(titleElement, { useCORS: true });
    const chartCanvas = await html2canvas(chartElement, { useCORS: true });
    const titleImgData = titleCanvas.toDataURL("image/png");
    const chartImgData = chartCanvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const pageHeight = 295;

    pdf.addImage(titleImgData, "PNG", 10, 10, imgWidth, 10);
    let heightLeft = chartCanvas.height * (imgWidth / chartCanvas.width);
    pdf.addImage(chartImgData, "PNG", 10, 20, imgWidth, heightLeft);
    pdf.save("graph-report.pdf");
  };

  const filteredData = filterDataByRange(combinedData);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box>
        <DialogTitle
          id="dialog-title"
          sx={{
            backgroundColor: "#f5f5f5",
            fontWeight: "bold",
            position: "relative",
            paddingRight: 50,
          }}
        >
          Graph for {columnId}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
              color: "#007c89",
              "&:hover": {
                backgroundColor: "#e0f2f1",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              marginBottom: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              id="chart-container"
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                marginBottom: 4,
                marginTop: 4,
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name={columnId}
                  />
                  {selectedScript && (
                    <Area
                      type="monotone"
                      dataKey={selectedScript.toLowerCase()}
                      stroke="#82ca9d"
                      name={selectedScript}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Script for Comparison</InputLabel>
                <Select value={selectedScript} onChange={handleScriptChange}>
                  <MenuItem value="">None</MenuItem>
                  {scripts.map((script) => (
                    <MenuItem key={script} value={script}>
                      {script}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="From"
                type="date"
                value={xAxisFrom}
                onChange={handleXAxisFromChange}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ width: 250 }}
              />
              <TextField
                label="To"
                type="date"
                value={xAxisTo}
                onChange={handleXAxisToChange}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ width: 250 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleExportPDF}
                size="small"
              >
                Export as PDF
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default GraphDialog;
