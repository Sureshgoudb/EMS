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
  Alert,
  CircularProgress,
  Fade,
  useTheme,
} from "@mui/material";
import {
  KeyboardArrowDown,
  Save,
  AddCircleOutline,
  Cancel,
} from "@mui/icons-material";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const TableColumnCreate = ({
  open,
  onClose,
  onCreateColumn,
  presetTerminal,
}) => {
  const theme = useTheme();
  const userInfo = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = userInfo.user_Type === "Admin";

  const [profiles] = useState([
    { value: "trend", label: "Trend", icon: "📈" },
    { value: "block", label: "Block", icon: "🔲" },
    { value: "daily", label: "Daily", icon: "📅" },
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

  // ------------- Fetch terminals -------------
  const fetchTerminals = async (profile) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (isAdmin) {
        response = await axios.get(`${apiKey}terminals/${profile}`);
      } else {
        response = await axios.get(
          `${apiKey}terminals/${profile}/${userInfo.customerID}`
        );
      }

      let terminalsData;
      if (isAdmin) {
        terminalsData = response.data;
      } else {
        terminalsData = response.data.terminals;
      }

      if (Array.isArray(terminalsData)) {
        const filteredTerminals = isAdmin
          ? terminalsData
          : terminalsData.filter(
              (terminal) => terminal.customerid === userInfo.customerID
            );

        setTerminals(filteredTerminals);
      } else {
        setTerminals([]);
        setError("Invalid terminal data received");
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      setError(error.response?.data?.message || "Failed to fetch terminals");
      setTerminals([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------- Fetch variables -------------
  const fetchVariables = async (profile, terminal) => {
    setLoading(true);
    setError(null);
    try {
      const terminalName = terminal.terminalName || terminal;
      const response = await axios.get(
        `${apiKey}variables/${profile}/${terminalName}`
      );
      if (Array.isArray(response.data)) {
        setVariables(response.data);
      } else {
        setVariables([]);
        setError("Invalid variables data received");
      }
    } catch (error) {
      console.error("Error fetching variables:", error);
      setError("Failed to fetch variables");
      setVariables([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------- Create table -------------
  const handleCreate = () => {
    if (selectedProfile && selectedTerminal && selectedVariable) {
      const terminalId = selectedTerminal.terminalId;
      const terminalName = selectedTerminal.terminalName;
      const tableName = `${selectedProfile} - ${terminalName} - ${selectedVariable}`;
      const columns = ["timestamp", selectedVariable];

      const tableData = {
        name: tableName,
        terminal: terminalId,
        terminalName: terminalName,
        columns: columns,
        profile: selectedProfile,
        customerID: userInfo.customerID,
      };

      onCreateColumn(tableData);
      onClose();
    }
  };

  const customSelectStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 1)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      },
      "&.Mui-focused": {
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
  };

  const SelectWrapper = ({ children, disabled }) => (
    <Box
      sx={{
        opacity: disabled ? 0.6 : 1,
        transform: disabled ? "scale(0.98)" : "scale(1)",
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: theme.palette.primary.main,
          color: "white",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center">
          <AddCircleOutline sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="600">
            Create New Table
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          background: "linear-gradient(145deg, #f6f8ff 0%, #f0f4ff 100%)",
          p: 3,
        }}
      >
        <Box sx={{ mt: 1 }}>
          {error && (
            <Fade in={true}>
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: "8px",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={40} thickness={4} />
            </Box>
          )}

          <SelectWrapper disabled={loading}>
            <FormControl
              fullWidth
              margin="normal"
              variant="outlined"
              sx={customSelectStyles}
            >
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
                  <MenuItem
                    key={profile.value}
                    value={profile.value}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography sx={{ mr: 1 }}>{profile.icon}</Typography>
                      {profile.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SelectWrapper>

          <SelectWrapper
            disabled={!selectedProfile || !!presetTerminal || loading}
          >
            <FormControl
              fullWidth
              margin="normal"
              variant="outlined"
              sx={customSelectStyles}
            >
              <InputLabel>Select Device</InputLabel>
              <Select
                value={selectedTerminal}
                onChange={(e) => {
                  setSelectedTerminal(e.target.value);
                  setSelectedVariable("");
                }}
                disabled={!selectedProfile || !!presetTerminal || loading}
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
          </SelectWrapper>

          <SelectWrapper disabled={!selectedTerminal || loading}>
            <FormControl
              fullWidth
              margin="normal"
              variant="outlined"
              sx={customSelectStyles}
            >
              <InputLabel>Select Variable</InputLabel>
              <Select
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                disabled={!selectedTerminal || loading}
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
          </SelectWrapper>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "rgba(0, 0, 0, 0.02)",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Cancel />}
          sx={{
            borderRadius: "8px",
            px: 3,
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main,
            "&:hover": {
              backgroundColor: theme.palette.error.main,
              color: "white",
              borderColor: theme.palette.error.main,
            },
          }}
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
          variant="contained"
          startIcon={<Save />}
          sx={{
            borderRadius: "8px",
            px: 3,
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
              transform: "translateY(-2px)",
            },
            "&:disabled": {
              backgroundColor: theme.palette.action.disabledBackground,
            },
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          Create Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableColumnCreate;
