import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Divider,
  Tooltip,
} from "@mui/material";
import FormatDialog from "./FormatDialog";

const WidgetCreationForm = ({ onCreate, onCancel }) => {
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [tertiaryCategory, setTertiaryCategory] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [terminalName, setTerminalName] = useState("");
  const [areaGraph, setAreaGraph] = useState(false);
  const [properties, setProperties] = useState("");

  // Modal states for format dialog
  const [openFormatDialog, setOpenFormatDialog] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("14px");
  const [fontColor, setFontColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [fontStyle, setFontStyle] = useState("normal");

  const handleCreate = () => {
    const widgetData = {
      id: Date.now(),
      primaryCategory,
      secondaryCategory,
      tertiaryCategory,
      scriptName,
      terminalName,
      areaGraph,
      properties,
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
      fontStyle,
      value: Math.floor(Math.random() * 200), // Default value
    };
    onCreate(widgetData);
  };

  const handleOpenFormatDialog = () => {
    setOpenFormatDialog(true);
  };

  const handleCloseFormatDialog = () => {
    setOpenFormatDialog(false);
  };

  const handleApplyFormat = (newFormat) => {
    setFontFamily(newFormat.fontFamily);
    setFontSize(newFormat.fontSize);
    setFontColor(newFormat.fontColor);
    setBackgroundColor(newFormat.backgroundColor);
    setFontStyle(newFormat.fontStyle);
    handleCloseFormatDialog();
  };

  return (
    <Box
      sx={{
        padding: "24px",
        border: "1px solid #007c89",
        borderRadius: "8px",
        bgcolor: "#f5f5f5",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      {" "}
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "#007c89", fontWeight: "bold" }}
      >
        Create Widget
      </Typography>
      {/* Form controls */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Primary Category</InputLabel>
        <Select
          value={primaryCategory}
          onChange={(e) => setPrimaryCategory(e.target.value)}
          sx={{
            bgcolor: "white",
            border: "1px solid #007c89",
            borderRadius: "4px",
            "& .MuiSelect-select": {
              padding: "12px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          <MenuItem value="Category1">Category 1</MenuItem>
          <MenuItem value="Category2">Category 2</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Secondary Category</InputLabel>
        <Select
          value={secondaryCategory}
          onChange={(e) => setSecondaryCategory(e.target.value)}
          sx={{
            bgcolor: "white",
            border: "1px solid #007c89",
            borderRadius: "4px",
            "& .MuiSelect-select": {
              padding: "12px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          <MenuItem value="Category1">Category 1</MenuItem>
          <MenuItem value="Category2">Category 2</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Tertiary Category</InputLabel>
        <Select
          value={tertiaryCategory}
          onChange={(e) => setTertiaryCategory(e.target.value)}
          sx={{
            bgcolor: "white",
            border: "1px solid #007c89",
            borderRadius: "4px",
            "& .MuiSelect-select": {
              padding: "12px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          <MenuItem value="Category1">Category 1</MenuItem>
          <MenuItem value="Category2">Category 2</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Script Name</InputLabel>
        <Select
          value={scriptName}
          onChange={(e) => setScriptName(e.target.value)}
          sx={{
            bgcolor: "white",
            border: "1px solid #007c89",
            borderRadius: "4px",
            "& .MuiSelect-select": {
              padding: "12px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          <MenuItem value="Script1">Script 1</MenuItem>
          <MenuItem value="Script2">Script 2</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Terminal Name</InputLabel>
        <Select
          value={terminalName}
          onChange={(e) => setTerminalName(e.target.value)}
          sx={{
            bgcolor: "white",
            border: "1px solid #007c89",
            borderRadius: "4px",
            "& .MuiSelect-select": {
              padding: "12px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          <MenuItem value="Terminal1">Terminal 1</MenuItem>
          <MenuItem value="Terminal2">Terminal 2</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={areaGraph}
            onChange={(e) => setAreaGraph(e.target.checked)}
            sx={{ color: "#007c89" }}
          />
        }
        label={<Typography sx={{ color: "#007c89" }}>Area Graph</Typography>}
      />
      <Box
        sx={{
          mt: 3,
          display: "flex",
          alignItems: "center",
          bgcolor: "white",
          borderRadius: 1,
          p: 2,
          border: "1px solid #007c89",
        }}
      >
        <Typography variant="subtitle1" sx={{ mr: 2, color: "#007c89" }}>
          Properties
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mr: 1,
            borderColor: "#007c89",
            color: "#007c89",
            "&:hover": {
              borderColor: "#005f6a",
              color: "#005f6a",
            },
          }}
        >
          Default
        </Button>
        <Tooltip title="Change widget format">
          <Button
            variant="outlined"
            onClick={handleOpenFormatDialog}
            sx={{
              borderColor: "#007c89",
              color: "#007c89",
              "&:hover": {
                borderColor: "#005f6a",
                color: "#005f6a",
              },
            }}
          >
            Change Format
          </Button>
        </Tooltip>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onCancel}
          sx={{
            borderColor: "rgba(255, 0, 0, 0.7)",
            color: "rgba(255, 0, 0, 0.7)",
            "&:hover": {
              borderColor: "red",
              color: "red",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{
            bgcolor: "#007c89",
            color: "white",
            "&:hover": { bgcolor: "#005f6a" },
          }}
        >
          Create
        </Button>
      </Box>
      <FormatDialog
        open={openFormatDialog}
        onClose={handleCloseFormatDialog}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontColor={fontColor}
        setFontColor={setFontColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        fontStyle={fontStyle}
        setFontStyle={setFontStyle}
        onApply={handleApplyFormat}
      />{" "}
    </Box>
  );
};

export default WidgetCreationForm;
