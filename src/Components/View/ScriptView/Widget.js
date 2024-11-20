import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import AreaGraph from "./AreaGraph";
import FormatDialog from "./FormatDialog";

const Widget = ({ widgetData, onResize, onDelete }) => {
  const [value, setValue] = useState(widgetData.value || 150);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  // State for dialog control and selected text for styling
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  // State for styling of individual elements
  const [categoryStyle, setCategoryStyle] = useState({
    fontFamily: widgetData.fontFamily || "Arial",
    fontSize: "18px",
    fontColor: "#000000",
    fontStyle: "normal",
  });

  const [terminalStyle, setTerminalStyle] = useState({
    fontFamily: widgetData.fontFamily || "Arial",
    fontSize: "18px",
    fontColor: "#000000",
    fontStyle: "normal",
  });

  const [valueStyle, setValueStyle] = useState({
    fontFamily: widgetData.fontFamily || "Arial",
    fontSize: "24px",
    fontColor: "#FF0000",
    fontStyle: "normal",
  });

  // State for background color
  const [backgroundColor, setBackgroundColor] = useState(
    localStorage.getItem(`widgetBackgroundColor_${widgetData.id}`) || "#f0f0f0"
  );

  // State for graph expansion
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);

  useEffect(() => {
    const storedValue = localStorage.getItem(`widgetValue_${widgetData.id}`);
    if (storedValue) {
      setValue(JSON.parse(storedValue));
    }
  }, [widgetData.id]);

  const handleRefresh = () => {
    const newValue = Math.floor(Math.random() * 200);
    setValue(newValue);
    setTimestamp(new Date().toLocaleString());

    localStorage.setItem(
      `widgetValue_${widgetData.id}`,
      JSON.stringify(newValue)
    );
  };

  const handleEdit = (textType) => {
    setSelectedText(textType);
    setIsDialogOpen(true);
  };

  const handleApplyChanges = (updatedStyles) => {
    if (selectedText === "category") {
      setCategoryStyle(updatedStyles);
    } else if (selectedText === "terminalName") {
      setTerminalStyle(updatedStyles);
    } else if (selectedText === "value") {
      setValueStyle(updatedStyles);
    }

    // Set background color if it was updated and store it in localStorage
    if (updatedStyles.backgroundColor) {
      setBackgroundColor(updatedStyles.backgroundColor);
      localStorage.setItem(
        `widgetBackgroundColor_${widgetData.id}`,
        updatedStyles.backgroundColor
      );
    }
  };

  const dummyData = [
    { name: "Jan", value: Math.random() * 100 },
    { name: "Feb", value: Math.random() * 100 },
    { name: "Mar", value: Math.random() * 100 },
    { name: "Apr", value: Math.random() * 100 },
    { name: "May", value: Math.random() * 100 },
  ];

  const handleExpandClick = () => {
    setIsGraphExpanded(!isGraphExpanded);
  };

  return (
    <>
      <ResizableBox
        width={widgetData.width}
        height={widgetData.height}
        minConstraints={[300, 300]}
        maxConstraints={[600, 450]}
        resizeHandles={["se"]}
        onResizeStop={(e, data) =>
          onResize({ width: data.size.width, height: data.size.height })
        }
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            border: "1px solid #007c89",
            borderRadius: "8px",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: backgroundColor, // Apply background color here
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          {/* Header with Text, Value, and Control Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: categoryStyle.fontFamily,
                  fontSize: categoryStyle.fontSize,
                  color: categoryStyle.fontColor,
                  fontStyle: categoryStyle.fontStyle,
                }}
                onClick={() => handleEdit("category")}
              >
                {widgetData.primaryCategory}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: terminalStyle.fontFamily,
                  fontSize: terminalStyle.fontSize,
                  color: terminalStyle.fontColor,
                  fontStyle: terminalStyle.fontStyle,
                }}
                onClick={() => handleEdit("terminalName")}
              >
                {widgetData.terminalName}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: valueStyle.fontFamily,
                  fontSize: valueStyle.fontSize,
                  color: valueStyle.fontColor,
                  fontStyle: valueStyle.fontStyle,
                  fontWeight: "bold",
                }}
                onClick={() => handleEdit("value")}
              >
                {value}
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={handleRefresh} aria-label="Refresh data">
                <RefreshIcon />
              </IconButton>
              <IconButton
                onClick={() => handleEdit("value")}
                aria-label="Edit widget"
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={onDelete} aria-label="Delete widget">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Graph Rendering */}
          <Box
            sx={{
              flex: 1,
              mt: 2,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {widgetData.areaGraph && (
              <AreaGraph data={dummyData} expanded={isGraphExpanded} />
            )}
          </Box>

          {/* Footer with Timestamp and Expand/Collapse Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
              flexShrink: 0,
            }}
          >
            <Typography color="success">Timestamp: {timestamp}</Typography>
            {widgetData.areaGraph && (
              <Tooltip
                title={isGraphExpanded ? "Collapse graph" : "Expand graph"}
              >
                <IconButton
                  onClick={handleExpandClick}
                  aria-label={
                    isGraphExpanded ? "Collapse graph" : "Expand graph"
                  }
                  sx={{
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    backgroundColor: "#007c89",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#005f6b",
                    },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isGraphExpanded ? (
                    <KeyboardArrowUp />
                  ) : (
                    <KeyboardArrowDown />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </ResizableBox>

      <FormatDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onApply={handleApplyChanges} // Pass the handleApplyChanges function
        // Font Family
        fontFamily={
          selectedText === "category"
            ? categoryStyle.fontFamily
            : selectedText === "terminalName"
            ? terminalStyle.fontFamily
            : valueStyle.fontFamily
        }
        setFontFamily={(value) =>
          handleApplyChanges({
            ...(selectedText === "category"
              ? categoryStyle
              : selectedText === "terminalName"
              ? terminalStyle
              : valueStyle),
            fontFamily: value,
          })
        }
        // Font Size
        fontSize={
          selectedText === "category"
            ? categoryStyle.fontSize
            : selectedText === "terminalName"
            ? terminalStyle.fontSize
            : valueStyle.fontSize
        }
        setFontSize={(value) =>
          handleApplyChanges({
            ...(selectedText === "category"
              ? categoryStyle
              : selectedText === "terminalName"
              ? terminalStyle
              : valueStyle),
            fontSize: value,
          })
        }
        // Font Color
        fontColor={
          selectedText === "category"
            ? categoryStyle.fontColor
            : selectedText === "terminalName"
            ? terminalStyle.fontColor
            : valueStyle.fontColor
        }
        setFontColor={(value) =>
          handleApplyChanges({
            ...(selectedText === "category"
              ? categoryStyle
              : selectedText === "terminalName"
              ? terminalStyle
              : valueStyle),
            fontColor: value,
          })
        }
        // Font Style
        fontStyle={
          selectedText === "category"
            ? categoryStyle.fontStyle
            : selectedText === "terminalName"
            ? terminalStyle.fontStyle
            : valueStyle.fontStyle
        }
        setFontStyle={(value) =>
          handleApplyChanges({
            ...(selectedText === "category"
              ? categoryStyle
              : selectedText === "terminalName"
              ? terminalStyle
              : valueStyle),
            fontStyle: value,
          })
        }
        // Background Color
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />
    </>
  );
};

export default Widget;
