import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  useMediaQuery,
  Menu,
  MenuItem,
  Badge,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link, NavLink, useLocation } from "react-router-dom";
import eslogo from "../assets/images/es.svg";
import "../assets/css/header.css";
import NotificationsIcon from "@mui/icons-material/Notifications";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

function Header() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const location = useLocation();

  // --------------- Notification Count ---------------
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(`${apiKey}notifications`);
      if (response.data.success) {
        const newCount = response.data.data.filter((notification) => {
          if (notification.status === "new" && !notification.isShown) {
            return true;
          }
          if (notification.status === "snoozed" && notification.snoozeUntil) {
            return new Date(notification.snoozeUntil) <= new Date();
          }
          return false;
        }).length;

        if (newCount > notificationCount) {
          setHasNewNotification(true);
          setTimeout(() => setHasNewNotification(false), 5000);
        }
        setNotificationCount(newCount);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo && userInfo.user_Type === "Admin") {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 15000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleViewClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleViewClose = () => {
    setAnchorEl(null);
  };

  let user = useSelector((store) => store.user);
  const memoizedUser = useMemo(() => {
    return user ? user : JSON.parse(localStorage.getItem("user"));
  }, [user]);

  const getPageLinks = () => {
    const links = [];
    if (memoizedUser) {
      if (
        memoizedUser.user_Type === "Admin" ||
        memoizedUser.user_Type === "Super User"
      ) {
        links.push({ id: 0, name: "Dashboard", to: "/dashboard" });
        links.push({ id: 1, name: "SLDC View", to: "/sldcview" });
        links.push({ id: 2, name: "Device View", to: "/view/terminal" });
        links.push({ id: 3, name: "Users", to: "/users" });
        links.push({ id: 4, name: "Devices", to: "/devices" });
        links.push({ id: 5, name: "Customers", to: "/customers" });
        links.push({ id: 6, name: "Schedule", to: "/schedule" });
        links.push({
          id: 7,
          name: "Notifications",
          to: "/notification-management",
        });
        links.push({ id: 8, name: "Device Data", to: "/devicedata" });
        links.push({ id: 9, name: "Reports", to: "/reports" });
        links.push({ id: 10, name: "Profile", to: "/profile" });
        links.push({ id: 11, name: "Logout", to: "/" });
      } else if (memoizedUser.user_Type === "User") {
        // links.push({ id: 1, name: "SLDC View", to: "/sldcview" });
        links.push({ id: 2, name: "Device View", to: "/view/terminal" });
        links.push({ id: 3, name: "AVC revision", to: "/avc-revision" });
        links.push({ id: 4, name: "Profile", to: "/profile" });
        links.push({ id: 5, name: "Logout", to: "/" });
      }
    }
    return links;
  };

  const pageLinks = getPageLinks();

  useEffect(() => {
    const currentPath = location.pathname;
    const selectedTab = pageLinks.findIndex((link) => {
      if (link.hasDropdown) {
        return currentPath.startsWith(link.to);
      }
      return link.to === currentPath;
    });
    if (selectedTab !== -1) {
      setSelectedTab(selectedTab);
    }
  }, [location.pathname, pageLinks]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getViewLabel = () => {
    if (location.pathname === "/view/terminal") {
      return "   Device View";
    } else if (location.pathname === "/view/script") {
      return "Script View";
    }
    return "View";
  };

  const renderTab = (pageLink, index) => {
    if (pageLink.hasDropdown) {
      const isActive = location.pathname.startsWith("/view");
      return (
        <Tab
          key={index}
          label={
            <div style={{ display: "flex", alignItems: "center" }}>
              {getViewLabel()}
              <ArrowDropDownIcon />
            </div>
          }
          onClick={handleViewClick}
          className={`custom-tab ${isActive ? "active-tab" : ""}`}
        />
      );
    }

    // Special handling for Notifications tab
    if (pageLink.name === "Notifications") {
      return (
        <Tab
          key={index}
          label={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                position: "relative",
              }}
            >
              {pageLink.name}
              {notificationCount > 0 && (
                <Badge
                  badgeContent={notificationCount}
                  color="error"
                  max={99}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: hasNewNotification
                        ? "#ff4444"
                        : "#f44336",
                      transition:
                        "background-color 0.3s ease, transform 0.2s ease",
                      height: "14px",
                      minWidth: "14px",
                      fontSize: "10px",
                      padding: "0 4px",
                      transform: hasNewNotification ? "scale(1.2)" : "scale(1)",
                      animation: hasNewNotification
                        ? "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        : "none",
                      "@keyframes pulse": {
                        "0%, 100%": {
                          opacity: 1,
                        },
                        "50%": {
                          opacity: 0.7,
                        },
                      },
                    },
                  }}
                >
                  <NotificationsIcon
                    sx={{
                      fontSize: "16px",
                      animation: hasNewNotification
                        ? "shake 0.82s cubic-bezier(.36,.07,.19,.97) both"
                        : "none",
                      "@keyframes shake": {
                        "10%, 90%": {
                          transform: "translate3d(-1px, 0, 0)",
                        },
                        "20%, 80%": {
                          transform: "translate3d(2px, 0, 0)",
                        },
                        "30%, 50%, 70%": {
                          transform: "translate3d(-2px, 0, 0)",
                        },
                        "40%, 60%": {
                          transform: "translate3d(2px, 0, 0)",
                        },
                      },
                    }}
                  />
                </Badge>
              )}
            </Box>
          }
          component={NavLink}
          to={pageLink.to}
          className={`custom-tab ${selectedTab === index ? "active-tab" : ""}`}
        />
      );
    }
    return (
      <Tab
        key={index}
        label={pageLink.name}
        component={NavLink}
        to={pageLink.to}
        className={`custom-tab ${selectedTab === index ? "active-tab" : ""}`}
      />
    );
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: "rgba(31, 41, 55, 0.9)" }}
      >
        <Toolbar style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            <Link to={"/sldcview"}>
              <img width={180} height={100} src={eslogo} alt="Logo" />
            </Link>
          </Typography>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              textColor="inherit"
            >
              {pageLinks.map((pageLink, index) => renderTab(pageLink, index))}
            </Tabs>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={handleDrawerOpen}>
        <div>
          <IconButton onClick={handleDrawerOpen}>
            <CloseIcon />
          </IconButton>
        </div>
        <List>
          {pageLinks.map((pageLink) => (
            <ListItem key={pageLink.id}>
              <ListItemText>
                {pageLink.hasDropdown ? (
                  <div onClick={handleViewClick}>{getViewLabel()}</div>
                ) : (
                  <Link
                    to={pageLink.to}
                    key={pageLink.id}
                    onClick={() => setOpen(false)}
                  >
                    {pageLink.name}
                  </Link>
                )}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleViewClose}
        className="custom-menu"
      >
        <MenuItem
          component={Link}
          to="/view/terminal"
          onClick={handleViewClose}
          className={location.pathname === "/view/terminal" ? "active-tab" : ""}
        >
          Device View
        </MenuItem>
      </Menu>
    </>
  );
}

export default Header;
