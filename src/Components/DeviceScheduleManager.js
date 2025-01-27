import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Typography,
  alpha,
  createTheme,
  ThemeProvider,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CircularProgress from "@mui/material/CircularProgress";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(0, 124, 137)",
      light: "rgb(70, 178, 189)",
      dark: "rgb(0, 87, 96)",
    },
  },
});

// ---------- Function to get time from block number ----------
const getTimeFromBlock = (blockNo) => {
  const totalMinutes = (blockNo - 1) * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const columns = [
  {
    field: "blockno",
    headerName: "Block Number",
    width: 120,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "time",
    headerName: "Time",
    width: 120,
    headerAlign: "center",
    align: "center",
    renderHeader: () => (
      <Stack direction="row" spacing={1} alignItems="center">
        <AccessTimeIcon sx={{ fontSize: 20 }} />
        <Typography>Time</Typography>
      </Stack>
    ),
    valueGetter: (params) => getTimeFromBlock(params.row.blockno),
  },
  {
    field: "avc",
    headerName: "AVC",
    width: 150,
    editable: true,
    type: "number",
    headerAlign: "center",
    align: "center",
    preProcessEditCellProps: (params) => {
      const hasError = params.props.value < 0;
      return { ...params.props, error: hasError };
    },
  },
];

function DeviceScheduleManager() {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [numBlocks, setNumBlocks] = useState(95);
  const [defaultAvcValue, setDefaultAvcValue] = useState(0);
  const [devices, setDevices] = useState([]);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  // ---------- Function to calculate starting block ----------
  const calculateStartingBlock = (time) => {
    if (!time) return 1;
    const hours = time.hour();
    const minutes = time.minute();
    return hours * 4 + Math.floor(minutes / 15) + 1;
  };

  // ---------- Function to validate blocks for time ----------
  const validateBlocksForTime = (startBlock, numOfBlocks) => {
    const totalBlocks = startBlock + numOfBlocks - 1;
    if (totalBlocks > 96) {
      const maxAllowedBlocks = 96 - startBlock + 1;
      setAlert({
        open: true,
        message: `Maximum ${maxAllowedBlocks} blocks allowed for the selected time to avoid crossing midnight`,
        severity: "error",
      });
      return maxAllowedBlocks;
    }
    return numOfBlocks;
  };

  const updateGridData = (blocks, startTimeValue) => {
    const startBlock = calculateStartingBlock(startTimeValue);
    const validatedBlocks = validateBlocksForTime(startBlock, blocks);

    if (validatedBlocks !== blocks) {
      setNumBlocks(validatedBlocks);
      return;
    }

    const initialData = Array.from({ length: validatedBlocks }, (_, index) => {
      const blockNumber = startBlock + index;
      return {
        id: index + 1,
        blockno: blockNumber,
        avc: defaultAvcValue,
      };
    });
    setRows(initialData);
  };

  useEffect(() => {
    if (startTime) {
      updateGridData(numBlocks, startTime);
    }
  }, [numBlocks, startTime, defaultAvcValue]);

  // ---------- Function to fetch devices ----------
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setIsLoading(true);
        const userData = JSON.parse(localStorage.getItem("user"));

        if (!userData) {
          throw new Error("User data not found. Please login again.");
        }

        let response;
        if (userData.user_Type === "Admin") {
          response = await axios.get(`${apiKey}terminal/list`);
          setDevices(
            response.data.map((device) => ({
              deviceid: device.terminalId,
              devicename: device.terminalName,
            }))
          );
        } else {
          response = await axios.get(
            `${apiKey}terminal/list/${userData.customerID}`
          );
          setDevices(
            response.data.terminals.map((device) => ({
              deviceid: device.terminalId,
              devicename: device.terminalName,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
        setAlert({
          open: true,
          message: error.message || "Error fetching devices",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const handleStartTimeChange = (newValue) => {
    if (!newValue) return;

    const now = dayjs();
    const selectedTime = dayjs(newValue);

    // selected time is in the future and on 15-minute intervals
    const roundedMinutes = Math.ceil(now.minute() / 15) * 15;
    const minAllowedTime = now.minute(roundedMinutes);

    if (selectedTime.isBefore(minAllowedTime)) {
      setAlert({
        open: true,
        message: "Please select a future time",
        severity: "error",
      });
      return;
    }

    const roundedTime = newValue
      .minute(Math.round(newValue.minute() / 15) * 15)
      .second(0);

    setStartTime(roundedTime);
  };

  const handleNumBlocksChange = (event) => {
    const value = parseInt(event.target.value);
    if (value < 1) {
      setAlert({
        open: true,
        message: "Number of blocks cannot be Zero or Negative",
        severity: "error",
      });
      return;
    }

    if (startTime) {
      const startBlock = calculateStartingBlock(startTime);
      const maxAllowedBlocks = 96 - startBlock + 1;

      if (value > maxAllowedBlocks) {
        setAlert({
          open: true,
          message: `Maximum ${maxAllowedBlocks} blocks allowed for the selected time`,
          severity: "error",
        });
        setNumBlocks(maxAllowedBlocks);
        return;
      }
    }

    setNumBlocks(value);
  };

  // ---------- Function to handle default AVC value change ----------
  const handleDefaultAvcChange = (event) => {
    const value = parseInt(event.target.value);
    if (value < 0) {
      setAlert({
        open: true,
        message: "Default AVC value cannot be negative",
        severity: "error",
      });
      return;
    }
    setDefaultAvcValue(value);
  };

  const handleCellEdit = (newRow) => {
    setRows((prevRows) => {
      return prevRows.map((row) => (row.id === newRow.id ? newRow : row));
    });
  };

  // ---------- Function to save request ----------
  const handleSave = async () => {
    if (!selectedDevice || !startTime) {
      setAlert({
        open: true,
        message: "Please select device and start time",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const deviceName = devices.find(
        (d) => d.deviceid === selectedDevice
      )?.devicename;

      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData || !userData.email) {
        throw new Error("User data not found. Please login again.");
      }

      const notificationCustomerId =
        userData.user_Type === "Admin"
          ? userData.customerID
          : userData.parentId;

      if (!notificationCustomerId) {
        throw new Error("Customer ID not found");
      }

      const notificationData = {
        message: `AVC Revision Requested for Device: ${deviceName}`,
        severity: "success",
        deviceId: selectedDevice,
        deviceName: deviceName,
        startTime: startTime.toDate(),
        numBlocks: numBlocks,
        blocks: rows.map((row) => ({
          blockno: row.blockno,
          avc: row.avc,
        })),
        userName: userData.name,
        userId: userData.userId,
      };

      const notificationResponse = await axios.post(
        `${apiKey}createnotification`,
        notificationData
      );

      if (!notificationResponse.data.success) {
        throw new Error("Failed to save schedule");
      }

      setAlert({
        open: true,
        message: `Schedule saved successfully for ${deviceName} (Notification #${notificationResponse.data.data.notificationNumber})`,
        severity: "success",
      });

      updateGridData(0, null);
      setSelectedDevice("");
      setNumBlocks(1);
      setDefaultAvcValue(0);
    } catch (error) {
      console.error("Error in handleSave:", error);

      let errorMessage = "Error saving schedule";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlert({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    updateGridData(0, null);
    setSelectedDevice("");
    setNumBlocks(0);
    setDefaultAvcValue(0);
  };

  const renderDeviceSelect = () => (
    <FormControl sx={{ width: 200 }}>
      <InputLabel sx={{ color: theme.palette.primary.main }}>
        Select Device
      </InputLabel>
      <Select
        value={selectedDevice}
        label="Select Device"
        onChange={(e) => setSelectedDevice(e.target.value)}
        size="small"
        disabled={isLoading}
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(theme.palette.primary.main, 0.2),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        {isLoading ? (
          <MenuItem disabled>
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Loading devices...</Typography>
            </Stack>
          </MenuItem>
        ) : (
          devices.map((device) => (
            <MenuItem key={device.deviceid} value={device.deviceid}>
              {device.devicename}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );

  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )}, ${alpha(theme.palette.primary.light, 0.1)})`,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          },
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Stack spacing={2}>
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                pb: 1.5,
                borderBottom: `1px solid ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}`,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <DashboardIcon
                  sx={{ fontSize: 24, color: theme.palette.primary.main }}
                />
              </Box>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Device Schedule Manager
              </Typography>
            </Stack>

            {/* Controls Section */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                bgcolor: alpha(theme.palette.primary.light, 0.05),
                p: 1.5,
                borderRadius: 1,
              }}
            >
              {renderDeviceSelect()}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileTimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  ampm={false}
                  views={["hours", "minutes", "seconds"]}
                  minutesStep={15}
                  secondsStep={15}
                  slots={{
                    textField: (props) => (
                      <TextField
                        {...props}
                        size="small"
                        sx={{
                          width: 250,
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                            "&:hover": {
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.primary.main,
                              },
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: theme.palette.primary.main,
                            "&.Mui-focused": {
                              color: theme.palette.primary.dark,
                            },
                          },
                        }}
                      />
                    ),
                    openPickerIcon: AccessTimeIcon,
                  }}
                  slotProps={{
                    actionBar: {
                      actions: ["accept", "cancel"],
                    },
                    openPickerIcon: {
                      sx: {
                        color: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      },
                    },
                  }}
                  minTime={dayjs().minute(
                    Math.ceil(dayjs().minute() / 15) * 15
                  )}
                />
              </LocalizationProvider>
              <TextField
                label="Number of Blocks"
                type="number"
                value={numBlocks}
                onChange={handleNumBlocksChange}
                size="small"
                InputProps={{
                  inputProps: { min: 0, max: 95 },
                }}
                sx={{ width: 150 }}
              />
              <TextField
                label="Default AVC Value"
                type="number"
                value={defaultAvcValue}
                onChange={handleDefaultAvcChange}
                size="small"
                InputProps={{
                  inputProps: { min: 0 },
                }}
                sx={{ width: 150 }}
              />
            </Stack>

            {/* Data Grid */}
            <Box
              sx={{
                height: 500,
                width: "100%",
                bgcolor: "#fff",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[25, 50, 96]}
                processRowUpdate={(newRow) => {
                  handleCellEdit(newRow);
                  return newRow;
                }}
                onProcessRowUpdateError={(error) => {
                  console.error("Error updating row:", error);
                }}
                initialState={{
                  pagination: {
                    pageSize: 25,
                  },
                }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell--editing": {
                    bgcolor: alpha(theme.palette.primary.light, 0.1),
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    ".MuiDataGrid-columnHeaderTitle": {
                      fontWeight: "bold",
                    },
                  },
                  "& .MuiDataGrid-row:nth-of-type(even)": {
                    bgcolor: alpha(theme.palette.primary.light, 0.05),
                  },
                  "& .MuiDataGrid-row:hover": {
                    bgcolor: alpha(theme.palette.primary.light, 0.1),
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                size="small"
                disabled={isSubmitting}
                sx={{
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                size="small"
                disabled={isSubmitting}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Snackbar
          open={alert.open}
          autoHideDuration={2000}
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setAlert({ ...alert, open: false })}
            severity={alert.severity}
            sx={{ width: "100%" }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Paper>
    </ThemeProvider>
  );
}

export default DeviceScheduleManager;
