import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import BlocksModal from "./BlocksModal";
import Notifications from "../Notifications";

dayjs.extend(relativeTime);
const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const NotificationDashboard = ({ open, onClose }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterModel, setFilterModel] = useState({
    items: [{ field: "isShown", operator: "is", value: false }],
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);

  // --------------- ( Function to Get User Info from Local Storage ) -------------
  const getUserInfo = () => {
    const userInfo = localStorage.getItem("user");
    return userInfo ? JSON.parse(userInfo) : null;
  };

  // --------------- ( Function to Fetch Notifications from API ) -------------
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiKey}notifications`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 400) {
        console.error("User  information missing or invalid");
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------- ( useEffect to Fetch Notifications on Component Mount ) -------------
  useEffect(() => {
    const user = getUserInfo();
    if (user && user.user_Type === "Admin") {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, []);

  // --------------- ( Function to Mark Notification as Shown/Unshown ) -------------
  const handleMarkAsShown = async (id, currentStatus, notificationStatus) => {
    if (notificationStatus === "approved") {
      return;
    }

    try {
      const endpoint = currentStatus
        ? `notification/${id}/mark-unshown`
        : `notification/${id}/mark-shown`;

      const response = await axios.patch(
        `${apiKey}${endpoint}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? { ...notification, isShown: !currentStatus }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const handleViewBlocks = (notification) => {
    if (notification.status === "approved") {
      return;
    }
    setSelectedNotification(notification);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNotification(null);
  };

  const handleSettingsClick = () => {
    setOpenSettings(true);
  };

  const handleSettingsClose = () => {
    setOpenSettings(false);
  };

  const handleCellClick = (params) => {
    if (params.field === "message" && params.row.blocks?.length > 0) {
      handleViewBlocks(params.row);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: theme.palette.primary.main,
      approved: theme.palette.success.main,
      read: theme.palette.grey[500],
      snoozed: theme.palette.warning.main,
    };
    return colors[status] || theme.palette.grey[500];
  };

  const getNotificationNumber = (fullNumber) => {
    return fullNumber ? fullNumber.split("_").pop() : "N/A";
  };

  const getLatestNotificationByDevice = (notifications) => {
    const deviceMap = new Map();

    notifications.forEach((notification) => {
      const existingNotification = deviceMap.get(notification.deviceName);
      if (
        !existingNotification ||
        new Date(notification.createdAt) >
          new Date(existingNotification.createdAt)
      ) {
        deviceMap.set(notification.deviceName, notification);
      }
    });

    return deviceMap;
  };

  const columns = [
    {
      field: "dateTime",
      headerName: "Date & Time",
      width: 180,
      valueGetter: (params) => params.row.createdAt,
      renderCell: (params) => (
        <Typography noWrap sx={{ fontSize: "0.875rem" }}>
          {dayjs(params.value).format("DD/MM/YYYY HH:mm:ss")}
        </Typography>
      ),
    },

    {
      field: "userName",
      headerName: "Customer Name",
      width: 220,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography noWrap sx={{ fontSize: "0.875rem" }}>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "message",
      headerName: "Message",
      width: 400,
      flex: 1,
      
      renderCell: (params) => {
        const latestNotificationsMap =
          getLatestNotificationByDevice(notifications);
        const isLatestForDevice =
          latestNotificationsMap.get(params.row.deviceName)?._id ===
          params.row._id;

        return (
          <Tooltip
            title={
              params.row.status === "approved"
                ? "This notification has been approved and cannot be modified"
                : ""
            }
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: alpha(theme.palette.primary.light, 0.1),
                padding: "8px",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "inherit",
                  fontWeight: params.row.isShown ? 400 : 500,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {`AVC Revision Request Initiated for Device: `}
                <span
                  style={{ fontWeight: 400, color: theme.palette.info.dark }}
                >
                  {params.row.deviceName || "N/A"}
                </span>
                {` | Rev-No: `}
                <span
                  style={{
                    fontWeight: "bold",
                    color: theme.palette.success.main,
                    fontStyle: "italic",
                  }}
                >
                  {getNotificationNumber(params.row.notificationNumber)}
                </span>
                {isLatestForDevice && params.row.status === "new" && (
                  <Chip
                    label="LATEST"
                    size="small"
                    sx={{
                      ml: 1,
                      height: "20px",
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.common.white,
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                    }}
                  />
                )}
              </Typography>
              {params.row.blocks?.length > 0 &&
                params.row.status !== "approved" && (
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 1,
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    View Blocks
                  </Typography>
                )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      type: "dateTime",
      valueGetter: (params) => new Date(params.row.createdAt),
      renderCell: (params) => (
        <Tooltip title={dayjs(params.value).format("YYYY-MM-DD HH:mm:ss")}>
          <Typography
            sx={{ fontSize: "0.875rem", color: theme.palette.text.secondary }}
          >
            {dayjs(params.value).fromNow()}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip
            title={
              params.value === "approved"
                ? "This notification has been approved and cannot be modified"
                : ""
            }
          >
            <Chip
              label={params.value.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(params.value), 0.1),
                color: getStatusColor(params.value),
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: alpha(getStatusColor(params.value), 0.2),
                },
              }}
            />
          </Tooltip>
          {params.row.status === "snoozed" && params.row.snoozeUntil && (
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              Until {dayjs(params.row.snoozeUntil).format("HH:mm")}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip
            title={
              params.row.status === "approved"
                ? "Approved notifications cannot be modified"
                : params.row.isShown
                ? "Mark as Unread"
                : "Mark as Read"
            }
          >
            <span>
              <IconButton
                onClick={() =>
                  handleMarkAsShown(
                    params.row._id,
                    params.row.isShown,
                    params.row.status
                  )
                }
                size="small"
                disabled={params.row.status === "approved"}
                sx={{
                  color: params.row.isShown
                    ? theme.palette.grey[500]
                    : theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(
                      params.row.isShown
                        ? theme.palette.grey[500]
                        : theme.palette.primary.main,
                      0.1
                    ),
                  },
                  "&.Mui-disabled": {
                    color: theme.palette.grey[300],
                  },
                }}
              >
                {params.row.isShown ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const getRowClassName = (params) => {
    if (params.row.status === "approved") {
      return "approved-row";
    }
    return "";
  };

  const removeFromLocalStorage = (notificationId) => {
    try {
      const STORAGE_KEY = "snoozed_notifications";
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed[notificationId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (error) {
      console.error("Error removing notification from localStorage:", error);
    }
  };

  // ------------- the StatusChange handler function ------------
  const handleStatusChange = (updatedNotification) => {
    if (updatedNotification.status === "approved") {
      removeFromLocalStorage(updatedNotification._id);
    }
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === updatedNotification._id ? updatedNotification : notif
      )
    );
  };

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        background: theme.palette.background.paper,
      }}
    >
      <CardHeader
        avatar={
          <NotificationsActiveIcon
            sx={{
              color: theme.palette.primary.main,
              fontSize: 28,
            }}
          />
        }
        title={
          <Typography variant="h6" fontWeight="600">
            Notification Management
          </Typography>
        }
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchNotifications}
                disabled={loading}
                sx={{
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notification Settings">
              <IconButton
                onClick={handleSettingsClick}
                sx={{
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
        }}
      />
      <Box sx={{ height: 600, width: "100%", p: 2 }}>
        <DataGrid
          rows={notifications}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          onCellClick={handleCellClick}
          disableRowSelectionOnClick
          getRowClassName={getRowClassName}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: "createdAt", sort: "desc" }],
            },
            filter: {
              filterModel: {
                items: [{ field: "isShown", operator: "is", value: false }],
              },
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
              sx: {
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              cursor: "pointer",
              borderColor: theme.palette.divider,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderColor: theme.palette.divider,
            },
            "& .MuiDataGrid-footerContainer": {
              borderColor: theme.palette.divider,
            },
            "& .approved-row": {
              backgroundColor: alpha(theme.palette.success.light, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.success.light, 0.2),
              },
            },
          }}
        />
      </Box>

      <BlocksModal
        open={openModal}
        onClose={handleCloseModal}
        notification={selectedNotification}
        onStatusChange={handleStatusChange}
      />

      <Dialog
        open={openSettings}
        onClose={handleSettingsClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6" fontWeight="600"></Typography>
          <IconButton
            aria-label="close"
            onClick={handleSettingsClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
              "&:hover": {
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Notifications />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NotificationDashboard;
