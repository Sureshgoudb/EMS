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
} from "@mui/material";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TableColumnCreate = ({
  open,
  onClose,
  onCreateColumn,
  presetTerminal,
}) => {
  const [terminals, setTerminals] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [selectedTerminal, setSelectedTerminal] = useState(
    presetTerminal || ""
  );
  const [selectedScript, setSelectedScript] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");

  const profiles = [
    { value: "trend", label: "Trend" },
    { value: "1min", label: "1 min profile" },
    { value: "1hr", label: "1 hrs profile" },
    { value: "shift", label: "Shift profile" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly profile" },
    { value: "monthly", label: "Monthly profile" },
    { value: "yearly", label: "Yearly" },
  ];

  useEffect(() => {
    fetchTerminals();
  }, []);

  useEffect(() => {
    if (selectedTerminal) {
      fetchScripts(selectedTerminal);
    }
  }, [selectedTerminal]);

  // --------------- Fetching terminals ---------------
  const fetchTerminals = async () => {
    try {
      const response = await axios.get(`${apiKey}terminal/list`);
      setTerminals(response.data);
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  // --------------- Fetching scripts ---------------
  const fetchScripts = async (terminalId) => {
    try {
      const response = await axios.get(
        `${apiKey}terminal/${terminalId}/scripts`
      );
      setScripts(response.data);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  // --------------- Creating column ---------------
  const handleCreate = () => {
    if (selectedTerminal && selectedScript && selectedProfile) {
      onCreateColumn(selectedTerminal, selectedScript, selectedProfile);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Table Column</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Device</InputLabel>
          <Select
            value={selectedTerminal}
            onChange={(e) => setSelectedTerminal(e.target.value)}
            disabled={!!presetTerminal}
          >
            {terminals.map((terminal) => (
              <MenuItem key={terminal} value={terminal}>
                {terminal}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Variable</InputLabel>
          <Select
            value={selectedScript}
            onChange={(e) => setSelectedScript(e.target.value)}
          >
            {scripts.map((script) => (
              <MenuItem key={script} value={script}>
                {script}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Profile</InputLabel>
          <Select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
          >
            {profiles.map((profile) => (
              <MenuItem key={profile.value} value={profile.value}>
                {profile.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableColumnCreate;
