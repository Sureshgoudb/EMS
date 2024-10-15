import React, { useState, useEffect } from "react";
import axios from "axios";

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
  styled,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ColorLensIcon from "@mui/icons-material/ColorLens";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

// Styled FormControl
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(0),
}));

const FormatDialog = ({
  open,
  onClose,
  currentStyles,
  setCurrentStyles,
  terminalID,
  scriptName,
  isNewWidget,
  onStylesUpdate,
}) => {
  const [styles, setStyles] = useState(currentStyles);
  const [error, setError] = useState(null);

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
      setError(null);
      if (isNewWidget) {
        setCurrentStyles(styles);
        onStylesUpdate(styles);
      } else {
        const payload = {
          terminalID,
          scriptName,
          properties: {
            ...styles,
            backgroundColor: styles.backgroundColor || "#FFFFFF",
          },
        };

        const response = await axios.put(
          `${apiKey}terminal/widget/configure`,
          payload
        );

        if (response.status === 200) {
          setCurrentStyles(styles);
          onStylesUpdate(styles);
        } else {
          throw new Error("Failed to update widget properties");
        }
      }
      onClose();
    } catch (error) {
      console.error("Error updating widget properties:", error);
      setError("Failed to update widget properties. Please try again.");
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
          backgroundColor: "#004d54",
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
          backgroundColor: "#f9f9f9",
          marginTop: "20px",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} mt={1}>
            <StyledFormControl fullWidth>
              <InputLabel>Font Family</InputLabel>
              <Select
                name="fontFamily"
                value={styles.fontFamily || ""}
                onChange={handleChange}
                label="Font Family"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Verdana">Verdana</MenuItem>
                <MenuItem value="Georgia">Georgia</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                <MenuItem value="Courier New">Courier New</MenuItem>
              </Select>
            </StyledFormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledFormControl fullWidth>
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => handleFontSizeChange(-2)}
                  sx={{
                    backgroundColor: "#ffffff",
                    ml: "5px",
                    mr: "5px",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                    border: "1px solid #e0e0e0",
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
                  label="Font Size"
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    mt: 1,
                  }}
                />
                <IconButton
                  onClick={() => handleFontSizeChange(2)}
                  sx={{
                    backgroundColor: "#ffffff",
                    ml: "5px",
                    mr: "5px",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </StyledFormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledFormControl fullWidth>
              <InputLabel>Font Style</InputLabel>
              <Select
                name="fontStyle"
                value={styles.fontStyle || "normal"}
                onChange={handleChange}
                label="Font Style"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="italic">Italic</MenuItem>
                <MenuItem value="oblique">Oblique</MenuItem>
              </Select>
            </StyledFormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledFormControl fullWidth>
              <InputLabel>Font Weight</InputLabel>
              <Select
                name="fontWeight"
                value={styles.fontWeight || "normal"}
                onChange={handleChange}
                label="Font Weight"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="bold">Bold</MenuItem>
                <MenuItem value="bolder">Bolder</MenuItem>
                <MenuItem value="lighter">Lighter</MenuItem>
              </Select>
            </StyledFormControl>
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
                backgroundColor: "#ffffff",
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
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                width: "100%",
                border: "1px solid #e0e0e0",
              }}
            />
          </Grid>
        </Grid>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
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
            borderColor: "#004d54",
            color: "#004d54",
            borderRadius: "8px",
            "&:hover": {
              borderColor: "#003c42",
              color: "#003c42",
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
            borderRadius: "8px",
            backgroundColor: "#004d54",
            "&:hover": {
              backgroundColor: "#003c42",
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
