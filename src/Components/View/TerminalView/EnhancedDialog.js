import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import LineGraph from "./LineGraph";
import MultiAxisGraph from "./MultiAxisGraph";
import { Chart } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

const EnhancedDialog = ({
  isDialogOpen,
  isGraphExpanded,
  handleCloseDialog,
  terminalName,
  selectedScript,
  comparisonScripts,
  handleComparisonScriptChange,
  availableScripts,
  graphType,
  state,
  comparisonData,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);

  // ---------- - Full Screen -------------
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // ---------- - Export to PDF -------------
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

      pdf.save("graph.pdf");
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting to PDF: ", error);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <Dialog
      open={isDialogOpen && isGraphExpanded}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="lg"
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
          position: "relative",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {terminalName} - {selectedScript}
        </Typography>
        <Box sx={{ position: "absolute", right: "10px", top: "10px" }}>
          <Tooltip
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            arrow
          >
            <IconButton
              style={{
                color: "white",
              }}
              onClick={toggleFullScreen}
            >
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to PDF" arrow>
            <IconButton
              style={{
                color: "white",
              }}
              onClick={graphexportToPdf}
            >
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton onClick={handleCloseDialog} style={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ marginBottom: "20px" }}>
          <FormControl
            fullWidth
            size="small"
            sx={{
              mt: "10px",
              "& .MuiInputLabel-root": {
                color: "primary.main",
                fontSize: 16,
              },
              "& .MuiSelect-select": {
                padding: "10px",
                borderRadius: "8px",
              },
              "& .MuiFormControl-fullWidth": {
                backgroundColor: "primary.light",
              },
            }}
          >
            <InputLabel id="compare-scripts-label" sx={{ fontSize: 16 }}>
              Compare with
            </InputLabel>
            <Select
              labelId="compare-scripts-label"
              multiple
              value={comparisonScripts}
              onChange={handleComparisonScriptChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      sx={{
                        backgroundColor:
                          value === selectedScript ? "#4caf50" : "#2196f3",
                        color: "white",
                        fontWeight: 500,
                        "&:hover": {
                          boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                  },
                },
              }}
              sx={{
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#f1f1f1",
                },
              }}
            >
              <MenuItem value="none">
                <em>None</em>
              </MenuItem>
              {availableScripts.map((script) => (
                <MenuItem
                  key={script.scriptName}
                  value={script.scriptName}
                  sx={{
                    backgroundColor:
                      script.scriptName === selectedScript
                        ? "rgba(76, 175, 80, 0.1)"
                        : "inherit",
                    fontWeight:
                      script.scriptName === selectedScript ? "bold" : "normal",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                >
                  {script.scriptName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          id="graph-container"
          ref={containerRef}
          sx={{
            height: isFullScreen ? "100vh" : "420px",
            marginBottom: 2,
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            backgroundColor: "#fff",
            padding: "16px",
            boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
            "&:hover": {
              boxShadow: "0px 8px 16px rgba(0,0,0,0.2)",
            },
          }}
        >
          {graphType === "simple" ? (
            <LineGraph
              data={state.detailedData}
              comparisonData={comparisonData}
              expanded={true}
              scriptName={selectedScript}
            />
          ) : (
            <MultiAxisGraph
              data={state.detailedData}
              comparisonData={comparisonData}
              expanded={true}
              scriptName={selectedScript}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedDialog;
