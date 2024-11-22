import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Box,
  IconButton,
  Grid,
} from "@mui/material";
import { Save, Close } from "@mui/icons-material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

const TextFormatDialog = ({
  open,
  onClose,
  initialProperties,
  onApply,
  mode = "create",
}) => {
  const [fontSettings, setFontSettings] = useState({
    fontFamily: "Arial",
    fontSize: "40px",
    fontStyle: "normal",
    fontWeight: "400",
    fontColor: "#000000",
    backgroundColor: "#ffffff",
  });

  useEffect(() => {
    if (initialProperties) {
      setFontSettings(initialProperties);
    }
  }, [initialProperties]);

  const fontFamilies = [
    "Arial",
    "Roboto",
    "Poppins",
    "Inter",
    "Montserrat",
    "Open Sans",
    "Lato",
    "Ubuntu",
  ];

  const fontStyles = ["normal", "italic"];
  const fontWeights = ["300", "400", "500", "600", "700"];

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "range"
        ? `${event.target.value}px`
        : event.target.value;
    setFontSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    onApply(fontSettings);
    onClose();
  };

  const getFontSizeNumber = () => {
    return parseInt(fontSettings.fontSize);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4A4A4A",
          color: "#ffffff",
          fontWeight: "600",
          padding: "16px 24px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        {mode === "create" ? "Set Text Format" : "Update Text Format"}
      </DialogTitle>

      <DialogContent>
        {/* Preview Section */}
        <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <Typography
            sx={{
              fontFamily: fontSettings.fontFamily,
              fontSize: fontSettings.fontSize,
              fontStyle: fontSettings.fontStyle,
              fontWeight: fontSettings.fontWeight,
              color: fontSettings.fontColor,
              backgroundColor: fontSettings.backgroundColor,
              padding: "16px",
              textAlign: "center",
            }}
          >
            Sample Text
          </Typography>
        </Box>

        {/* Font Settings */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Font Family</InputLabel>
              <Select
                value={fontSettings.fontFamily}
                onChange={handleChange("fontFamily")}
                label="Font Family"
              >
                {fontFamilies.map((font) => (
                  <MenuItem
                    key={font}
                    value={font}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={() =>
                    handleChange("fontSize")({
                      target: { value: Math.max(8, getFontSizeNumber() - 1) },
                    })
                  }
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  type="number"
                  label="Font Size"
                  value={getFontSizeNumber()}
                  onChange={handleChange("fontSize")}
                  fullWidth
                  sx={{ fontSize: "0.9rem" }}
                  inputProps={{ style: { textAlign: "center" } }}
                />
                <IconButton
                  onClick={() =>
                    handleChange("fontSize")({
                      target: { value: Math.min(60, getFontSizeNumber() + 1) },
                    })
                  }
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Style</InputLabel>
              <Select
                value={fontSettings.fontStyle}
                onChange={handleChange("fontStyle")}
                label="Style"
              >
                {fontStyles.map((style) => (
                  <MenuItem key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Weight</InputLabel>
              <Select
                value={fontSettings.fontWeight}
                onChange={handleChange("fontWeight")}
                label="Weight"
              >
                {fontWeights.map((weight) => (
                  <MenuItem key={weight} value={weight}>
                    {weight}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <Typography gutterBottom>Text Color</Typography>
            <TextField
              fullWidth
              type="color"
              value={fontSettings.fontColor}
              onChange={handleChange("fontColor")}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography gutterBottom>Background Color</Typography>
            <TextField
              fullWidth
              type="color"
              value={fontSettings.backgroundColor}
              onChange={handleChange("backgroundColor")}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          startIcon={<Save />}
        >
          {mode === "create" ? "Apply" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextFormatDialog;
