import React, { useState, useEffect } from "react";
import axios from "axios"; // Make sure to install and import axios

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ColorLensIcon from "@mui/icons-material/ColorLens";
const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const FormatDialog = ({
  open,
  onClose,
  currentStyles,
  setCurrentStyles,
  widgetId,
  onStylesUpdate, // Add this new prop
}) => {
  const [styles, setStyles] = useState(currentStyles);

  useEffect(() => {
    setStyles(currentStyles);
  }, [currentStyles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStyles((prevStyles) => ({
      ...prevStyles,
      [name]: value,
    }));
  };

  const handleFontSizeChange = (increment) => {
    const sizeValue = parseInt(styles.fontSize, 10) || 16;
    const newSize = Math.max(sizeValue + increment, 8);
    setStyles((prevStyles) => ({
      ...prevStyles,
      fontSize: newSize + "px",
    }));
  };

  const handleApply = async () => {
    try {
      const response = await axios.put(
        `${apiKey}terminal/updateWidgetProperties/${widgetId}`,
        {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontColor: styles.fontColor,
          backgroundColor: styles.backgroundColor,
          fontStyle: styles.fontStyle,
        }
      );

      if (response.status === 200) {
        setCurrentStyles(styles);
        onStylesUpdate(styles); // Call the callback to update parent state
        onClose();
      } else {
        console.error("Failed to update widget properties");
      }
    } catch (error) {
      console.error("Error updating widget properties:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          padding: "24px",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#005f6a",
          color: "#ffffff",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "20px",
          fontWeight: 600,
          fontSize: "1.5rem",
        }}
      >
        Format Text
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "24px",
          backgroundColor: "#ffffff",
          marginTop: "20px",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Font Family</InputLabel>
              <Select
                name="fontFamily"
                value={styles.fontFamily || ""}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Verdana">Verdana</MenuItem>
                <MenuItem value="Georgia">Georgia</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                <MenuItem value="Courier New">Courier New</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => handleFontSizeChange(-2)}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  name="fontSize"
                  type="number"
                  value={parseInt(styles.fontSize, 10) || ""}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: <Typography variant="body1">px</Typography>,
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-input": {
                      textAlign: "center",
                    },
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                  }}
                />
                <IconButton
                  onClick={() => handleFontSizeChange(2)}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Font Style</InputLabel>
              <Select
                name="fontStyle"
                value={styles.fontStyle || "normal"}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="italic">Italic</MenuItem>
                <MenuItem value="oblique">Oblique</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Font Weight</InputLabel>
              <Select
                name="fontWeight"
                value={styles.fontWeight || "normal"}
                onChange={handleChange}
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="bold">Bold</MenuItem>
                <MenuItem value="bolder">Bolder</MenuItem>
                <MenuItem value="lighter">Lighter</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="fontColor"
              type="color"
              label="Font Color"
              value={styles.fontColor || "#000000"}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <ColorLensIcon color="action" sx={{ marginRight: 1 }} />
                ),
              }}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                width: "100%",
                border: "1px solid #e0e0e0",
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="backgroundColor"
              type="color"
              label="Background Color"
              value={styles.backgroundColor || "#ffffff"}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <ColorLensIcon color="action" sx={{ marginRight: 1 }} />
                ),
              }}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                width: "100%",
                border: "1px solid #e0e0e0",
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "16px",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          sx={{
            borderColor: "#005f6a",
            color: "#005f6a",
            borderRadius: "8px",
            "&:hover": {
              borderColor: "#004d54",
              color: "#004d54",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          color="primary"
          variant="contained"
          sx={{
            bgcolor: "#005f6a",
            color: "#ffffff",
            borderRadius: "8px",
            "&:hover": {
              bgcolor: "#004d54",
            },
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormatDialog;
