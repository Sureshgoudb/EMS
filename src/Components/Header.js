import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import eslogo from "../assets/images/es.svg";
import "../assets/css/header.css";

function Header() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const location = useLocation();

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
        links.push({ id: 1, name: "SLDC View", to: "/sldcview" });
        links.push({
          id: 2,
          name: "Device View",
          to: "/view/terminal",
          // hasDropdown: true,
        });
        links.push({ id: 3, name: "Users", to: "/users" });
        links.push({ id: 4, name: "Devices", to: "/devices" });
        links.push({ id: 5, name: "Customers", to: "/customers" });
        links.push({ id: 6, name: "Schedule", to: "/schedule" });
        links.push({ id: 7, name: "Notifications", to: "/notifications" });
        links.push({ id: 8, name: "Device Data", to: "/devicedata" });
        links.push({ id: 9, name: "Reports", to: "/reports" });
        links.push({ id: 10, name: "Profile", to: "/profile" });
        links.push({ id: 11, name: "Logout", to: "/" });
      } else if (memoizedUser.user_Type === "User") {
         // links.push({ id: 1, name: "SLDC View", to: "/sldcview" });
         links.push({ id: 2, name: "Device View", to: "/view/terminal" });
         links.push({ id: 3, name: "Profile", to: "/profile" });
         links.push({ id: 4, name: "Logout", to: "/" });
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
        {/* <MenuItem
          component={Link}
          to="/view/script"
          onClick={handleViewClose}
          className={location.pathname === "/view/script" ? "active-tab" : ""}
        >
          Script View
        </MenuItem> */}
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
