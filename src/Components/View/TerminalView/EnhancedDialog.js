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
import autoTable from "jspdf-autotable";
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

  const handleFullScreen = () => {
    const dialogElement = document.querySelector(".MuiDialog-paper");
    if (!isFullScreen) {
      if (dialogElement.requestFullscreen) {
        dialogElement.requestFullscreen();
      } else if (dialogElement.webkitRequestFullscreen) {
        dialogElement.webkitRequestFullscreen();
      } else if (dialogElement.msRequestFullscreen) {
        dialogElement.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
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
      maxWidth={isFullScreen ? "xl" : "md"}
      fullScreen={isFullScreen}
      sx={{
        "& .MuiDialog-paper": {
          background: "linear-gradient(135deg, #f8f9fa, #eef2f7)",
          boxShadow: "0px 8px 16px rgba(0,0,0,0.2)",
          borderRadius: "16px",
          transition: "transform 0.3s ease-in-out",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #3f51b5, #5c6bc0)",
          color: "#fff",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {terminalName} - {selectedScript}
        </Typography>
        <Box>
          <Tooltip title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
            <IconButton
              onClick={handleFullScreen}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.1)",
                },
                transition: "transform 0.2s ease",
              }}
            >
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to PDF" arrow>
            <IconButton
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.1)",
                },
                transition: "transform 0.2s ease",
              }}
              onClick={graphexportToPdf}
            >
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={handleCloseDialog} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: "24px", position: "relative" }}>
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
                    zIndex: isFullScreen ? 1300 : "auto",
                  },
                },
              }}
              sx={{
                borderRadius: "8px",
                zIndex: isFullScreen ? 1300 : "auto",
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
                  key={script}
                  value={script}
                  sx={{
                    backgroundColor:
                      script === selectedScript
                        ? "rgba(76, 175, 80, 0.1)"
                        : "inherit",
                    fontWeight: script === selectedScript ? "bold" : "normal",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                >
                  {script}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          id="graph-container"
          sx={{
            height: 420,
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
