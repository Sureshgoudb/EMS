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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import eslogo from "../assets/images/es.svg";
import "../assets/css/header.css";

function Header() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(!open);
  };
  let user = useSelector((store) => store.user);
  const memoizedUser = useMemo(() => {
    return user ? user : JSON.parse(localStorage.getItem("user"));
  }, [user]);

  const getPageLinks = () => {
    const links = [];
    if (memoizedUser) {
      if (memoizedUser.user_Type === "Admin" || memoizedUser.user_Type === "Super User") {
        links.push({ id: 1, name: "Dashboard", to: "/dashboard" });
        links.push({ id: 2, name: "Users", to: "/users" });
        links.push({ id: 3, name: "Devices", to: "/devices" });
        links.push({ id: 4, name: "Customers", to: "/customers" });
        links.push({ id: 5, name: "Schedule", to: "/schedule" });
        links.push({ id: 6, name: "Notifications", to: "/notifications" });
        links.push({ id: 7, name: "Device Data", to: "/devicedata" });
        links.push({ id: 8, name: "Reports", to: "/reports" });
        links.push({ id: 9, name: "Profile", to: "/profile" });
        links.push({ id: 10, name: "Logout", to: "/" });
      } else if(memoizedUser.user_Type === "User"){
        links.push({ id: 1, name: "Dashboard", to: "/dashboard" });
        links.push({ id: 2, name: "Profile", to: "/profile" });
        links.push({ id: 3, name: "Logout", to: "/" });
      }
    }
    return links;
  };

  const pageLinks = getPageLinks();

  useEffect(() => {
    const currentPath = location.pathname;
    const selectedTab = pageLinks.findIndex((link) => link.to === currentPath);
    if (selectedTab !== -1) {
      setSelectedTab(selectedTab);
    }
  }, [location.pathname, pageLinks]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: "rgba(31, 41, 55, 0.9)" }}
      >
        <Toolbar style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            <Link to={"/dashboard"}>
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
              {pageLinks.map((pageLink, index) => (
                <Tab
                  key={index}
                  label={pageLink.name}
                  component={NavLink}
                  to={pageLink.to}
                  className={selectedTab === index ? "active-tab" : ""}
                />
              ))}
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
                <Link
                  to={pageLink.to}
                  key={pageLink.id}
                  onClick={() => setOpen(false)}
                >
                  {pageLink.name}
                </Link>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}

export default Header;
