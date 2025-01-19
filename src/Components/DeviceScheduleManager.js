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
      Snackbar
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from "axios";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CircularProgress from '@mui/material/CircularProgress';

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const theme = createTheme({
      palette: {
            primary: {
                  main: 'rgb(0, 124, 137)',
                  light: 'rgb(70, 178, 189)',
                  dark: 'rgb(0, 87, 96)',
            },
      },
});

const columns = [
      {
            field: "blockno",
            headerName: "Block Number",
            width: 120,
            headerAlign: 'center',
            align: 'center',
      },
      {
            field: "avc",
            headerName: "AVC",
            width: 150,
            editable: true,
            type: 'number',
            headerAlign: 'center',
            align: 'center',
            preProcessEditCellProps: (params) => {
                  const hasError = params.props.value < 0;
                  return { ...params.props, error: hasError };
            },
      }
];

function DeviceScheduleManager() {
      const [selectedDevice, setSelectedDevice] = useState("");
      const [selectedDate, setSelectedDate] = useState(null);
      const [startTime, setStartTime] = useState(null);
      const [numBlocks, setNumBlocks] = useState(95);
      const [devices, setDevices] = useState([]);
      const [rows, setRows] = useState([]);
      const [openDialog, setOpenDialog] = useState(false);
      const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' });
      const [isSubmitting, setIsSubmitting] = useState(false);

      const calculateStartingBlock = (time) => {
            if (!time) return 1;
            const hours = time.hour();
            const minutes = time.minute();
            return (hours * 4) + Math.floor(minutes / 15) + 1;
      };

      const validateBlocksForTime = (startBlock, numOfBlocks) => {
            const totalBlocks = startBlock + numOfBlocks - 1;
            if (totalBlocks > 96) {
                  const maxAllowedBlocks = 96 - startBlock + 1;
                  setAlert({
                        open: true,
                        message: `Maximum ${maxAllowedBlocks} blocks allowed for the selected time to avoid crossing midnight`,
                        severity: 'error'
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
                        avc: 0
                  };
            });
            setRows(initialData);
      };

      useEffect(() => {
            if (startTime) {
                  updateGridData(numBlocks, startTime);
            }
      }, [numBlocks, startTime]);

      useEffect(() => {
            const fetchDevices = async () => {
                  try {
                        const response = await axios.get(`${apiKey}device/list/`);
                        setDevices(response.data);
                  } catch (error) {
                        console.error("Error fetching devices:", error);
                  }
            };
            fetchDevices();
      }, []);

      const handleStartTimeChange = (newValue) => {
            if (!newValue) return;

            const now = dayjs();
            const selectedTime = dayjs(newValue);

            if (selectedTime.isBefore(now)) {
                  setAlert({
                        open: true,
                        message: 'Cannot select past time. Please select a future time.',
                        severity: 'error'
                  });
                  return;
            }

            const minutes = newValue.minute();
            const roundedMinutes = Math.round(minutes / 15) * 15;
            const roundedTime = newValue.minute(roundedMinutes).second(0);
            setStartTime(roundedTime);
      };

      const handleNumBlocksChange = (event) => {
            const value = parseInt(event.target.value);
            if (value < 1) {
                  setAlert({
                        open: true,
                        message: 'Number of blocks cannot be Zero or Negative',
                        severity: 'error'
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
                              severity: 'error'
                        });
                        setNumBlocks(maxAllowedBlocks);
                        return;
                  }
            }

            setNumBlocks(value);
      };
      const handleCellEdit = (newRow) => {
            setRows(prevRows => {
                  return prevRows.map(row =>
                        row.id === newRow.id ? newRow : row
                  );
            });
      };

      const handleSave = async () => {
            if (!selectedDevice || !startTime) {
                  setAlert({
                        open: true,
                        message: 'Please select device and start time',
                        severity: 'error'
                  });
                  return;
            }

            setIsSubmitting(true);
            try {
                  // Format data for email notification
                  const deviceName = devices.find(d => d.deviceid === selectedDevice)?.devicename;
                  const emailText = `
                Device: ${deviceName}
                Start Time: ${startTime.format('HH:mm')}
                Number of Blocks: ${numBlocks}
                Block Details:
                ${rows.map(row => `Block ${row.blockno}: AVC = ${row.avc}`).join('\n')}
              `;

                  // Send email notification
                  await axios.post(`${apiKey}avcnotification`, {
                        subject: `AVC Schedule Update - ${deviceName}`,
                        text: emailText
                  });

                  setAlert({
                        open: true,
                        message: 'Schedule saved and notification sent successfully',
                        severity: 'success'
                  });

                  setOpenDialog(true);
            } catch (error) {
                  console.error("Error:", error);
                  setAlert({
                        open: true,
                        message: error.response?.data?.message || 'Error saving schedule and sending notification',
                        severity: 'error'
                  });
            } finally {
                  setIsSubmitting(false);
            }
      };
      const handleCancel = () => {
            updateGridData(0, null);
            setSelectedDevice("");
            setSelectedDate(null);
            setStartTime(null);
            setNumBlocks(0);
      };

      return (
            <ThemeProvider theme={theme}>
                  <Paper
                        elevation={3}
                        sx={{
                              p: 2,
                              m: 1,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.primary.light, 0.1)})`,
                              position: 'relative',
                              '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                              },
                        }}
                  >
                        <Box sx={{ width: '100%' }}>
                              <Stack spacing={2}>
                                    {/* Header */}
                                    <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={1.5}
                                          sx={{
                                                pb: 1.5,
                                                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                          }}
                                    >
                                          <Box
                                                sx={{
                                                      p: 1,
                                                      borderRadius: 1.5,
                                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                }}
                                          >
                                                <DashboardIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />
                                          </Box>
                                          <Typography
                                                variant="h6"
                                                fontWeight="600"
                                                sx={{
                                                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                                      WebkitBackgroundClip: 'text',
                                                      WebkitTextFillColor: 'transparent',
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
                                                alignItems: 'center',
                                                bgcolor: alpha(theme.palette.primary.light, 0.05),
                                                p: 1.5,
                                                borderRadius: 1,
                                          }}
                                    >
                                          <FormControl sx={{ width: 200 }}>
                                                <InputLabel sx={{ color: theme.palette.primary.main }}>Select Device</InputLabel>
                                                <Select
                                                      value={selectedDevice}
                                                      label="Select Device"
                                                      onChange={(e) => setSelectedDevice(e.target.value)}
                                                      size="small"
                                                      sx={{
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                  borderColor: alpha(theme.palette.primary.main, 0.2),
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                  borderColor: theme.palette.primary.main,
                                                            },
                                                      }}
                                                >
                                                      {devices.map((device) => (
                                                            <MenuItem key={device.deviceid} value={device.deviceid}>
                                                                  {device.devicename}
                                                            </MenuItem>
                                                      ))}
                                                </Select>
                                          </FormControl>

                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <TimePicker
                                                      label="Start Time"
                                                      value={startTime}
                                                      onChange={handleStartTimeChange}
                                                      minutesStep={15}
                                                      shouldDisableTime={(timeValue, clockType) => {
                                                            if (clockType === 'minutes') {
                                                                  return timeValue % 15 !== 0;
                                                            }
                                                            return false;
                                                      }}
                                                      slotProps={{
                                                            textField: {
                                                                  size: 'small',
                                                                  sx: { width: 200 }
                                                            }
                                                      }}
                                                />
                                          </LocalizationProvider>
                                          <TextField
                                                label="Number of Blocks"
                                                type="number"
                                                value={numBlocks}
                                                onChange={handleNumBlocksChange}
                                                size="small"
                                                InputProps={{
                                                      inputProps: { min: 0, max: 95 }
                                                }}
                                                sx={{ width: 150 }}
                                          />
                                    </Stack>

                                    {/* Data Grid */}
                                    <Box sx={{ height: 500, width: '100%', bgcolor: '#fff', borderRadius: 1, overflow: 'hidden' }}>
                                          <DataGrid
                                                rows={rows}
                                                columns={columns}
                                                pageSizeOptions={[25, 50, 96]}
                                                processRowUpdate={(newRow) => {
                                                      handleCellEdit(newRow);
                                                      return newRow;
                                                }}
                                                onProcessRowUpdateError={(error) => {
                                                      console.error('Error updating row:', error);
                                                }}
                                                initialState={{
                                                      pagination: {
                                                            pageSize: 25,
                                                      },
                                                }}
                                                sx={{
                                                      border: 'none',
                                                      '& .MuiDataGrid-cell--editing': {
                                                            bgcolor: alpha(theme.palette.primary.light, 0.1),
                                                      },
                                                      '& .MuiDataGrid-columnHeaders': {
                                                            bgcolor: theme.palette.primary.main,
                                                            color: '#fff',
                                                            '.MuiDataGrid-columnHeaderTitle': {
                                                                  fontWeight: 'bold',
                                                            }
                                                      },
                                                      '& .MuiDataGrid-row:nth-of-type(even)': {
                                                            bgcolor: alpha(theme.palette.primary.light, 0.05),
                                                      },
                                                      '& .MuiDataGrid-row:hover': {
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
                                                justifyContent: 'flex-end',
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
                                                      '&:hover': {
                                                            borderColor: theme.palette.primary.main,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                      }
                                                }}
                                          >
                                                Cancel
                                          </Button>
                                          <Button
                                                variant="contained"
                                                onClick={handleSave}
                                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                                size="small"
                                                disabled={isSubmitting}
                                                sx={{
                                                      bgcolor: theme.palette.primary.main,
                                                      '&:hover': {
                                                            bgcolor: theme.palette.primary.dark,
                                                      },
                                                }}
                                          >
                                                {isSubmitting ? 'Submitting...' : 'Submit'}
                                          </Button>
                                    </Stack>
                              </Stack>
                        </Box>

                        <Snackbar
                              open={alert.open}
                              autoHideDuration={6000}
                              onClose={() => setAlert({ ...alert, open: false })}
                              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                              <Alert
                                    onClose={() => setAlert({ ...alert, open: false })}
                                    severity={alert.severity}
                                    sx={{ width: '100%' }}
                              >
                                    {alert.message}
                              </Alert>
                        </Snackbar>
                  </Paper>
            </ThemeProvider>
      );
}

export default DeviceScheduleManager;