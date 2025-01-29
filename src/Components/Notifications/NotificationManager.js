import React, { useEffect, useState } from "react";
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useTheme,
  Chip,
  Grow,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import SnoozeIcon from "@mui/icons-material/Snooze";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import BlocksModal from "./BlocksModal";
import axios from "axios";

const ToastNotification = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [snoozeAnchorEl, setSnoozeAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snoozedNotifications, setSnoozedNotifications] = useState(new Map());
  const [blocksModalOpen, setBlocksModalOpen] = useState(false);

  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const STORAGE_KEY = "snoozed_notifications";

  // --------------- ( Snooze Options for Notifications ) -------------
  const snoozeOptions = [
    { label: "10 seconds", value: 10 / 60 },
    { label: "5 minutes", value: 5 },
    { label: "10 minutes", value: 10 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "4 hours", value: 240 },
  ];

  // --------------- ( Function to Load Snoozed Notifications from Local Storage ) -------------
  const loadSnoozedNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSnoozedNotifications(new Map(Object.entries(parsed)));
      }
    } catch (error) {
      console.error("Error loading snoozed notifications:", error);
    }
  };

  // --------------- ( Function to Save Snoozed Notifications to Local Storage ) -------------
  const saveSnoozedNotifications = (notificationsMap) => {
    try {
      const notificationsObj = Object.fromEntries(notificationsMap);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notificationsObj));
    } catch (error) {
      console.error("Error saving snoozed notifications:", error);
    }
  };

  // --------------- ( Function to Remove Notification from Local Storage ) -------------
  const removeFromLocalStorage = (notificationId) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed[notificationId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

        setSnoozedNotifications(new Map(Object.entries(parsed)));
      }
    } catch (error) {
      console.error("Error removing notification from localStorage:", error);
    }
  };

  // --------------- ( useEffect to Load Snoozed Notifications on Component Mount ) -------------
  useEffect(() => {
    loadSnoozedNotifications();
  }, []);

  // --------------- ( Function to Handle Notification Close ) -------------
  const handleClose = async (notification) => {
    try {
      removeFromLocalStorage(notification._id);

      // Only update status if the notification is not approved and was snoozed
      if (
        notification.status !== "approved" &&
        snoozedNotifications.has(notification._id)
      ) {
        await axios.patch(`${apiKey}notification/${notification._id}/status`, {
          status: "new",
          snoozeUntil: null,
        });
      }
      await axios.patch(`${apiKey}notification/${notification._id}/mark-shown`);

      handleNotificationRemoval(notification._id);
    } catch (error) {
      console.error("Error handling notification close:", error);
      setError(
        error.response?.data?.message || "Failed to handle notification close"
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      let hasChanges = false;

      snoozedNotifications.forEach((snoozeData, notificationId) => {
        if (currentTime >= snoozeData.showAt) {
          resetNotificationStatus(notificationId);
          setSnoozedNotifications((prev) => {
            const newMap = new Map(prev);
            newMap.delete(notificationId);
            hasChanges = true;
            return newMap;
          });
        }
      });

      if (hasChanges) {
        saveSnoozedNotifications(snoozedNotifications);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [snoozedNotifications]);

  // --------------- ( Function to Reset Notification Status ) -------------
  const resetNotificationStatus = async (notificationId) => {
    try {
      await axios.patch(`${apiKey}notification/${notificationId}/status`, {
        status: "new",
        snoozeUntil: null,
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error resetting notification status:", error);
    }
  };

  // --------------- ( Function to Handle Snooze Selection ) -------------
  const handleSnoozeSelect = async (minutes) => {
    if (!selectedNotification) return;

    try {
      const showAt = new Date().getTime() + minutes * 60 * 1000;

      await axios.patch(
        `${apiKey}notification/${selectedNotification._id}/status`,
        {
          status: "snoozed",
          snoozeUntil: new Date(showAt),
        }
      );

      const newMap = new Map(snoozedNotifications);
      newMap.set(selectedNotification._id, {
        notification: selectedNotification,
        showAt: showAt,
      });
      saveSnoozedNotifications(newMap);
      setSnoozedNotifications(newMap);
      handleNotificationRemoval(selectedNotification._id);
    } catch (error) {
      console.error("Error snoozing notification:", error);
      setError(
        error.response?.data?.message || "Failed to snooze notification"
      );
    }

    handleSnoozeClose();
  };

  // --------------- ( Function to Fetch Notifications from API ) -------------
  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user"));
      if (!userInfo || userInfo.user_Type !== "Admin") return;

      const response = await axios.get(`${apiKey}notifications/unshown`);
      if (response.data.success) {
        const newNotifs = response.data.data.filter(
          (notif) =>
            notif.status === "new" ||
            (notif.status === "snoozed" &&
              new Date(notif.snoozeUntil) <= new Date())
        );

        setNotifications((prev) => {
          const filteredNew = newNotifs.filter(
            (newNotif) =>
              !prev.some((existingNotif) => existingNotif._id === newNotif._id)
          );
          return [...prev, ...filteredNew];
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationRemoval = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleViewBlocks = (notification) => {
    if (notification.status === "approved") return;
    setSelectedNotification(notification);
    setBlocksModalOpen(true);
  };

  const handleBlocksModalClose = () => {
    setBlocksModalOpen(false);
    setSelectedNotification(null);
  };

  const handleSnoozeClick = (event, notification) => {
    setSnoozeAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleSnoozeClose = () => {
    setSnoozeAnchorEl(null);
    setSelectedNotification(null);
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

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 75,
          right: 2,
          display: "flex",
          flexDirection: "column-reverse",
          gap: 3,
          maxHeight: "calc(100vh - 52px)",
        }}
      >
        {notifications.map((notification, index) => {
          const latestNotificationsMap =
            getLatestNotificationByDevice(notifications);
          const isLatestForDevice =
            latestNotificationsMap.get(notification.deviceName)?._id ===
            notification._id;

          return (
            <Grow key={notification._id} in={true} timeout={300}>
              <Box
                sx={{
                  opacity: 1,
                  transition: "opacity 0.3s ease",
                  minWidth: 400,
                  maxWidth: 500,
                }}
              >
                <Snackbar
                  open={true}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  sx={{
                    position: "relative",
                    transform: "none",
                  }}
                >
                  <Alert
                    severity={notification.severity || "info"}
                    icon={
                      <NotificationsActiveIcon sx={{ fontSize: "1.2rem" }} />
                    }
                    action={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {notification.blocks?.length > 0 &&
                          notification.status !== "approved" && (
                            <Button
                              size="small"
                              onClick={() => handleViewBlocks(notification)}
                              sx={{
                                minWidth: "auto",
                                py: 0.5,
                                px: 1,
                                color: "inherit",
                                "&:hover": {
                                  backgroundColor: theme.palette.grey[800],
                                },
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: "1.1rem" }} />
                            </Button>
                          )}
                        {notification.status !== "approved" && (
                          <Button
                            size="small"
                            onClick={(e) => handleSnoozeClick(e, notification)}
                            sx={{
                              minWidth: "auto",
                              py: 0.5,
                              px: 1,
                              color: "inherit",
                              "&:hover": {
                                backgroundColor: theme.palette.grey[800],
                              },
                            }}
                          >
                            <SnoozeIcon sx={{ fontSize: "1.1rem" }} />
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          aria-label="close"
                          color="inherit"
                          onClick={() => handleClose(notification)}
                          sx={{ p: 0.5 }}
                        >
                          <CloseIcon sx={{ fontSize: "1.1rem" }} />
                        </IconButton>
                      </Box>
                    }
                    sx={{
                      width: "100%",
                      backgroundColor: theme.palette.grey[900],
                      color: theme.palette.getContrastText(
                        theme.palette.grey[900]
                      ),
                      py: 0.5,
                      px: 1,
                      ".MuiAlert-message": {
                        width: "100%",
                        color: "inherit",
                        py: 0.5,
                      },
                      ".MuiAlert-icon": {
                        py: 0.5,
                        mr: 1,
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "inherit",
                          mb: 0.5,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          backgroundColor: theme.palette.grey[800],
                          p: 1,
                          borderRadius: 1,
                          minHeight: "32px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "inherit",
                            flex: 1,
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.message}
                          {isLatestForDevice && (
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
                        <Chip
                          label={notification.notificationNumber}
                          color="primary"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: theme.palette.primary.dark,
                            height: "20px",
                            "& .MuiChip-label": {
                              px: 1,
                              fontSize: "0.7rem",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Alert>
                </Snackbar>
              </Box>
            </Grow>
          );
        })}
      </Box>

      <Menu
        anchorEl={snoozeAnchorEl}
        open={Boolean(snoozeAnchorEl)}
        onClose={handleSnoozeClose}
      >
        {snoozeOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSnoozeSelect(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <BlocksModal
        open={blocksModalOpen}
        onClose={handleBlocksModalClose}
        notification={selectedNotification}
        onStatusChange={(updatedNotification) => {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif._id === updatedNotification._id
                ? updatedNotification
                : notif
            )
          );
        }}
      />
    </>
  );
};

export default ToastNotification;
