import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  useTheme,
  alpha,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Analytics,
  Close,
  ShowChart,
  DeviceHub,
  Schedule,
  CheckCircle,
  Notifications,
  AccessTime,
} from "@mui/icons-material";
import dayjs from "dayjs";
import axios from "axios";
import ApprovalForm from "./ApprovalForm";

const BlocksModal = ({ open, onClose, notification, onStatusChange }) => {
  const theme = useTheme();
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [approvalDetails, setApprovalDetails] = useState({
    type: "offline",
    operatorName: "",
    approvalDateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    isValid: false,
  });

  // --------------- ( Function to Get Time from Block Number ) -------------
  const getTimeFromBlock = (blockNo) => {
    const totalMinutes = (blockNo - 1) * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // --------------- ( Return null if no notification ) -------------
  if (!notification) return null;

  // --------------- ( Function to Handle Status Change ) -------------
  const handleStatusChange = async (newStatus) => {
    try {
      setIsLoading(true);
      setApprovalMessage("Processing approval...");

      const userInfo = JSON.parse(localStorage.getItem("user"));
      if (!userInfo || userInfo.user_Type !== "Admin") {
        setApprovalMessage("Unauthorized access");
        return;
      }

      const response = await axios.patch(
        `${apiKey}notification/${notification._id}/status`,
        {
          status: newStatus,
          approvalDetails: {
            type: approvalDetails.type,
            operatorName: approvalDetails.operatorName,
            approvalDateTime: approvalDetails.approvalDateTime,
            customerName: notification.userName,
          },
        }
      );

      if (response.data.success) {
        setApprovalMessage("Successfully approved!");
        const updatedNotification = {
          ...notification,
          status: newStatus,
          approvalDetails: {
            type: approvalDetails.type,
            operatorName: approvalDetails.operatorName,
            approvalDateTime: approvalDetails.approvalDateTime,
            customerName: notification.userName,
          },
        };
        onStatusChange(updatedNotification);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating notification status:", error);
      setApprovalMessage("Error during approval");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setApprovalMessage("");
      }, 1500);
    }
  };
  
  // --------------- ( Stats Cards Data ) -------------
  const statsCards = [
    {
      icon: <DeviceHub sx={{ fontSize: 40, color: "#1976D2" }} />,
      title: "Device Info",
      value: notification.deviceName,
      subValue: notification.deviceId,
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: "#1976D2" }} />,
      title: "Start Time",
      value: dayjs(notification.startTime).format("HH:mm:ss"),
      subValue: dayjs(notification.startTime).format("YYYY-MM-DD"),
    },
    {
      icon: <ShowChart sx={{ fontSize: 40, color: "#1976D2" }} />,
      title: "Number of Blocks",
      value: notification.numBlocks,
      subValue: "Total Blocks",
    },
  ];

  // --------------- ( Function to Get Status Chip ) -------------
  const getStatusChip = () => (
    <Chip
      label={notification.status?.toUpperCase() || "NEW"}
      size="medium"
      sx={{
        ml: 2,
        px: 2,
        py: 1,
        backgroundColor: "white",
        color: getStatusColor(notification.status),
        fontWeight: 600,
        fontSize: "0.95rem",
        display: "flex",
        alignItems: "center",
        gap: 1,
        animation: "fadeIn 0.5s ease-in-out",
        boxShadow: `0 4px 8px ${alpha(
          getStatusColor(notification.status),
          0.4
        )}`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: `0 8px 16px ${alpha(
            getStatusColor(notification.status),
            0.6
          )}`,
        },
      }}
      icon={
        <Notifications sx={{ color: getStatusColor(notification.status) }} />
      }
    />
  );

  const getStatusColor = (status) => {
    const colors = {
      new: "#1976D2",
      approved: "#43A047",
      read: "#BDBDBD",
      snoozed: "#FFB300",
    };
    return colors[status] || "#1976D2";
  };
  const isButtonDisabled =
    notification.status === "approved" || !approvalDetails.isValid || isLoading;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: 2,
            backgroundColor: "#F5F5F5",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(45deg, rgba(0, 124, 137, 1) 0%, rgba(0, 200, 200, 1) 50%, rgba(0, 50, 60, 1) 100%)`,
            color: "#fff",
            py: 2,
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item display="flex" alignItems="center">
              <Analytics sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="600" sx={{ ml: 1 }}>
                Block Details
              </Typography>
              {getStatusChip()}
            </Grid>
            <Grid item>
              <IconButton
                onClick={onClose}
                sx={{
                  color: "white",
                  "&:hover": {
                    backgroundColor: alpha("#fff", 0.2),
                  },
                }}
              >
                <Close />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2.5,
                    height: "100%",
                    borderRadius: 2,
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha("#1976D2", 0.1),
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography
                        color="#333333"
                        variant="body2"
                        fontWeight="500"
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        sx={{ mt: 0.5 }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        color="#999999"
                        variant="caption"
                        sx={{ fontSize: 11 }}
                      >
                        {stat.subValue}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Table */}
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: alpha("#1976D2", 0.05),
              }}
            >
              <Typography variant="h6" fontWeight="600" color="#1976D2">
                Block Details
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alpha("#1976D2", 0.05),
                      }}
                    >
                      Block Number
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alpha("#1976D2", 0.05),
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime sx={{ fontSize: 20 }} />
                        Time
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alpha("#1976D2", 0.05),
                      }}
                    >
                      AVC Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notification.blocks.map((block, index) => (
                    <TableRow
                      key={block.blockno}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: alpha("#1976D2", 0.02),
                        },
                        "&:hover": {
                          backgroundColor: alpha("#1976D2", 0.05),
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={`#${block.blockno}`}
                            size="small"
                            sx={{
                              backgroundColor: alpha("#1976D2", 0.1),
                              color: "#1976D2",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="500">
                          {getTimeFromBlock(block.blockno)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="500">{block.avc}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <ApprovalForm
            onApprovalDetailsChange={setApprovalDetails}
            customerName={notification.userName}
          />
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            gap: 1.5,
            justifyContent: "flex-end",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Button
              onClick={() => handleStatusChange("approved")}
              variant="contained"
              disabled={isButtonDisabled}
              sx={{
                minWidth: "150px",
                background: isLoading
                  ? "linear-gradient(90deg, #64b5f6, #2196f3)"
                  : isButtonDisabled
                  ? theme.palette.action.disabledBackground
                  : "linear-gradient(90deg, #00c853, #1b5e20)",
                color: isButtonDisabled
                  ? theme.palette.action.disabled
                  : "#ffffff",
                textTransform: "uppercase",
                boxShadow: isButtonDisabled
                  ? "none"
                  : isLoading
                  ? "0px 4px 8px rgba(33, 150, 243, 0.3)"
                  : "0px 4px 8px rgba(0, 200, 83, 0.3)",
                "&:hover": {
                  background: isButtonDisabled
                    ? theme.palette.action.disabledBackground
                    : isLoading
                    ? "linear-gradient(90deg, #64b5f6, #2196f3)"
                    : "linear-gradient(90deg, #00e676, #00c853)",
                  boxShadow: isButtonDisabled
                    ? "none"
                    : "0px 6px 12px rgba(0, 230, 118, 0.4)",
                },
                "&.Mui-disabled": {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                  boxShadow: "none",
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress
                    size={20}
                    sx={{
                      color: isButtonDisabled
                        ? theme.palette.action.disabled
                        : "#fff",
                    }}
                  />
                  <Typography variant="button">{approvalMessage}</Typography>
                </Box>
              ) : (
                <>
                  <CheckCircle sx={{ mr: 1 }} />
                  Approve
                </>
              )}
            </Button>
          </Box>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isLoading}
            sx={{
              color: "#d32f2f",
              borderColor: "#d32f2f",
              textTransform: "uppercase",
              "&:hover": {
                background: "rgba(211, 47, 47, 0.1)",
                borderColor: "#c62828",
              },
              "&.Mui-disabled": {
                borderColor: theme.palette.action.disabled,
                color: theme.palette.action.disabled,
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BlocksModal;
