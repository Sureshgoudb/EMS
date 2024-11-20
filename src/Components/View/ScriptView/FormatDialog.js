import React from "react";
import {
  Dialog,
  TextField,
  Grid,
  Button,
  MenuItem,
  Typography,
  IconButton,
  ButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const FormatDialog = ({
  open,
  onClose,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  fontColor,
  setFontColor,
  backgroundColor,
  setBackgroundColor,
  fontStyle,
  setFontStyle,
  onApply,
}) => {
  const fontFamilies = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Tahoma",
  ];

  // Function to handle changes in font size increment or decrement
  const handleFontSizeChange = (value) => {
    const newSize = parseInt(fontSize.replace("px", "")) + value;
    if (newSize >= 8 && newSize <= 100) {
      setFontSize(`${newSize}px`);
    }
  };

  const handleApply = () => {
    onApply({
      fontFamily,
      fontSize,
      fontColor,
      backgroundColor,
      fontStyle,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Grid container spacing={2} p={2} alignItems="center">
        {/* Font Family */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Font Family"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            fullWidth
            size="small"
          >
            {fontFamilies.map((font) => (
              <MenuItem key={font} value={font}>
                {font}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Font Style */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Font Style"
            value={fontStyle}
            onChange={(e) => setFontStyle(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="italic">Italic</MenuItem>
          </TextField>
        </Grid>

        {/* Font Size */}
        <Grid item xs={12}>
          <Typography variant="subtitle1">Font Size</Typography>
          <ButtonGroup>
            <IconButton
              onClick={() => handleFontSizeChange(-1)}
              disabled={parseInt(fontSize.replace("px", "")) <= 8}
            >
              <RemoveIcon />
            </IconButton>
            <TextField
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              size="small"
              sx={{ width: 80 }}
            />
            <IconButton
              onClick={() => handleFontSizeChange(1)}
              disabled={parseInt(fontSize.replace("px", "")) >= 100}
            >
              <AddIcon />
            </IconButton>
          </ButtonGroup>
        </Grid>

        {/* Font Color */}
        <Grid item xs={12} sm={6}>
          <TextField
            type="color"
            label="Font Color"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Background Color */}
        <Grid item xs={12} sm={6}>
          <TextField
            type="color"
            label="Background Color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleApply}
            sx={{ mr: 2, bgcolor: "#007c89", color: "white" }}
          >
            Apply
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default FormatDialog;
