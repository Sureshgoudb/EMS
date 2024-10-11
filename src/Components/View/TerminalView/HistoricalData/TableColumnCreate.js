import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogTitle-root": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(2),
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
  },
  "& .MuiSelect-select": {
    "&:focus": {
      backgroundColor: "transparent",
    },
  },
}));

const TableColumnCreate = ({
  open,
  onClose,
  onCreateColumn,
  presetTerminal,
}) => {
  const [profiles] = useState([
    { value: "trend", label: "Trend" },
    { value: "block", label: "Block" },
    { value: "daily", label: "Daily" },
  ]);
  const [terminals, setTerminals] = useState([]);
  const [variables, setVariables] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedTerminal, setSelectedTerminal] = useState(
    presetTerminal || ""
  );
  const [selectedVariable, setSelectedVariable] = useState("");

  useEffect(() => {
    if (selectedProfile) {
      fetchTerminals(selectedProfile);
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (selectedProfile && selectedTerminal) {
      fetchVariables(selectedProfile, selectedTerminal);
    }
  }, [selectedProfile, selectedTerminal]);

  const fetchTerminals = async (profile) => {
    try {
      const response = await fetch(apiKey + `terminals/${profile}`);
      const data = await response.json();
      setTerminals(data);
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  const fetchVariables = async (profile, terminalName) => {
    try {
      const response = await fetch(
        apiKey + `variables/${profile}/${terminalName}`
      );
      const data = await response.json();
      setVariables(data);
    } catch (error) {
      console.error("Error fetching variables:", error);
    }
  };

  const handleCreate = () => {
    if (selectedProfile && selectedTerminal && selectedVariable) {
      onCreateColumn(selectedTerminal, selectedVariable, selectedProfile);
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Add New Table</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <StyledFormControl fullWidth>
            <InputLabel>Select Profile</InputLabel>
            <Select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              label="Select Profile"
            >
              {profiles.map((profile) => (
                <MenuItem key={profile.value} value={profile.value}>
                  {profile.label}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
          <StyledFormControl fullWidth>
            <InputLabel>Select Device</InputLabel>
            <Select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
              disabled={!selectedProfile || !!presetTerminal}
              label="Select Device"
            >
              {terminals.map((terminal) => (
                <MenuItem key={terminal} value={terminal}>
                  {terminal}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
          <StyledFormControl fullWidth>
            <InputLabel>Select Variable</InputLabel>
            <Select
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              disabled={!selectedTerminal}
              label="Select Variable"
            >
              {variables.map((variable) => (
                <MenuItem key={variable} value={variable}>
                  {variable}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCreate} color="primary" variant="contained">
          Create
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default TableColumnCreate;
