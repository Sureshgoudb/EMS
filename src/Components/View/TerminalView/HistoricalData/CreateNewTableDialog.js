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
  Box,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowDown,
  Save,
  AddCircleOutline,
  Cancel,
  AccountTree,
  DeviceHub,
  Assessment,
} from "@mui/icons-material";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TableColumnCreate = ({
  open,
  onClose,
  onCreateColumn,
  presetTerminal,
}) => {
  const [profiles] = useState([
    { value: "trend", label: "Trend", icon: <AccountTree /> },
    { value: "block", label: "Block", icon: <DeviceHub /> },
    { value: "daily", label: "Daily", icon: <Assessment /> },
  ]);
  const [terminals, setTerminals] = useState([]);
  const [variables, setVariables] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedTerminal, setSelectedTerminal] = useState(
    presetTerminal || ""
  );
  const [selectedVariable, setSelectedVariable] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = userInfo.user_Type === "Admin";

  useEffect(() => {
    if (selectedProfile) fetchTerminals(selectedProfile);
  }, [selectedProfile]);

  useEffect(() => {
    if (selectedProfile && selectedTerminal)
      fetchVariables(selectedProfile, selectedTerminal);
  }, [selectedProfile, selectedTerminal]);

  const fetchTerminals = async (profile) => {
    setLoading(true);
    setError(null);
    try {
      const url = isAdmin
        ? `${apiKey}terminals/${profile}`
        : `${apiKey}terminals/${profile}/${userInfo.customerID}`;
      const response = await axios.get(url);
  
      const data = response.data;
  
      const terminalsData = Array.isArray(data)
        ? data 
        : data.terminals || [];
  
      setTerminals(terminalsData);
    } catch (error) {
      setError("Failed to fetch terminals");
    } finally {
      setLoading(false);
    }
  };
  

  const fetchVariables = async (profile, terminal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${apiKey}variables/${profile}/${terminal.terminalName || terminal}`
      );
      setVariables(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError("Failed to fetch variables");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (selectedProfile && selectedTerminal && selectedVariable) {
      const tableData = {
        name: `${selectedProfile} - ${selectedTerminal.terminalName} - ${selectedVariable}`,
        terminal: selectedTerminal.terminalId,
        terminalName: selectedTerminal.terminalName,
        columns: ["timestamp", selectedVariable],
        profile: selectedProfile,
        customerID: userInfo.customerID,
      };
      onCreateColumn(tableData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4A4A4A", // Darker gray for a sleek look
          color: "#ffffff", // White text for contrast
          fontWeight: "600",
          padding: "16px 24px", // Adding padding for a more polished look
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Subtle shadow for depth
        }}
      >
        <Typography
          variant="h6"
          style={{ fontSize: "1.25rem", letterSpacing: "0.5px" }}
        >
          Create New Table
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" style={{ marginBottom: "16px" }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Profile Type</InputLabel>
              <Select
                value={selectedProfile}
                onChange={(e) => {
                  setSelectedProfile(e.target.value);
                  setSelectedTerminal("");
                  setSelectedVariable("");
                }}
                label="Profile Type"
                IconComponent={KeyboardArrowDown}
              >
                {profiles.map((profile) => (
                  <MenuItem key={profile.value} value={profile.value}>
                    {profile.icon} {profile.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              margin="normal"
              disabled={!selectedProfile}
              variant="outlined"
            >
              <InputLabel>Select Device</InputLabel>
              <Select
                value={selectedTerminal}
                onChange={(e) => {
                  setSelectedTerminal(e.target.value);
                  setSelectedVariable("");
                }}
                label="Select Device"
                IconComponent={KeyboardArrowDown}
              >
                {terminals.map((terminal) => (
                  <MenuItem key={terminal.terminalId} value={terminal}>
                    {terminal.terminalName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              margin="normal"
              disabled={!selectedProfile || !selectedTerminal}
              variant="outlined"
            >
              <InputLabel>Select Variable</InputLabel>
              <Select
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                label="Select Variable"
                IconComponent={KeyboardArrowDown}
              >
                {variables.map((variable) => (
                  <MenuItem key={variable} value={variable}>
                    {variable}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>

      <DialogActions style={{ justifyContent: "center", padding: "16px" }}>
        <Button
          onClick={onClose}
          startIcon={<Cancel />}
          variant="outlined"
          color="error"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={
            !selectedProfile ||
            !selectedTerminal ||
            !selectedVariable ||
            loading
          }
          startIcon={<AddCircleOutline />}
          variant="contained"
          color="primary"
        >
          Create Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableColumnCreate;
