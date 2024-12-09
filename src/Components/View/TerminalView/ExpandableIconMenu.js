import React, { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  Tooltip as MuiTooltip,
  Typography,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  Analytics as ProfileIcon,
  Timer as TimerIcon,
  BarChart as GraphTypeIcon,
  CompareArrows as CompareScriptsIcon,
  ShowChart as LineChartIcon,
  ViewComfy as AreaChartIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";

const ExpandableIconMenu = ({
  isColorDark,
  onSavePreferences,
  onProfileMenuOpen,
  onTimerMenuOpen,
  onGraphTypeMenuOpen,
  onCompareScriptsDialog,
  selectedProfile,
  timerState,
  graphTypeAnchorEl,
  widgetBackgroundColor,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [timerMenuAnchorEl, setTimerMenuAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Enhanced time slots with more granular and custom options
  const timeSlots = [
    { label: "1 minute", value: 1 * 60 },
    { label: "5 minutes", value: 5 * 60 },
    { label: "15 minutes", value: 15 * 60 },
    { label: "30 minutes", value: 30 * 60 },
    { label: "1 hour", value: 60 * 60 },
    { label: "2 hours", value: 2 * 60 * 60 },
    { label: "4 hours", value: 4 * 60 * 60 },
    { label: "8 hours", value: 8 * 60 * 60 },
    { label: "24 hours", value: 24 * 60 * 60 },
  ];

  // Graph type icons mapping
  const graphTypeIcons = {
    Line: <LineChartIcon fontSize="small" />,
    Area: <AreaChartIcon fontSize="small" />,
    Bar: <BarChartIcon fontSize="small" />,
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTimerMenuOpen = (event) => {
    setTimerMenuAnchorEl(event.currentTarget);
  };

  const handleTimerMenuClose = () => {
    setTimerMenuAnchorEl(null);
  };

  const iconColor = isColorDark(widgetBackgroundColor) ? "#fff" : "#000";

  const formatRemainingTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const menuItems = [
    {
      icon: <SaveIcon fontSize="small" />,
      tooltip: "Save Preferences",
      onClick: () => {
        onSavePreferences();
        handleClose();
      },
    },
    {
      icon: <ProfileIcon fontSize="small" />,
      tooltip: `Profile: ${
        selectedProfile.charAt(0).toUpperCase() + selectedProfile.slice(1)
      }`,
      onClick: () => {
        onProfileMenuOpen();
        handleClose();
      },
    },
    {
      icon: <TimerIcon fontSize="small" />,
      tooltip: timerState?.selectedSlot
        ? `Timer: ${formatRemainingTime(timerState.remainingTime)}`
        : "Timer Settings",
      onClick: (event) => {
        handleTimerMenuOpen(event);
        handleClose();
      },
      renderSubmenu: () => (
        <Menu
          anchorEl={timerMenuAnchorEl}
          open={Boolean(timerMenuAnchorEl)}
          onClose={handleTimerMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {timeSlots.map((slot) => (
            <MenuItem
              key={slot.value}
              onClick={() => {
                onTimerMenuOpen(slot);
                handleTimerMenuClose();
              }}
            >
              {slot.label}
            </MenuItem>
          ))}
        </Menu>
      ),
    },
    {
      icon: graphTypeIcons[graphTypeAnchorEl],
      tooltip: `Graph Type: ${graphTypeAnchorEl}`,
      onClick: () => {
        onGraphTypeMenuOpen();
        handleClose();
      },
    },
    {
      icon: <CompareScriptsIcon fontSize="small" />,
      tooltip: "Compare Scripts",
      onClick: () => {
        onCompareScriptsDialog();
        handleClose();
      },
    },
  ];

  return (
    <Box sx={{ position: "absolute", top: 0, right: 0, p: 1 }}>
      <MuiTooltip title="More Options">
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            color: iconColor,
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </MuiTooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 2,
            minWidth: 220,
          },
        }}
      >
        {menuItems.map((item, index) => (
          <div key={index}>
            <MenuItem
              onClick={item.onClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1.5,
              }}
            >
              <MuiTooltip title={item.tooltip} placement="left">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {item.icon}
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {item.tooltip}
                  </Typography>
                </Box>
              </MuiTooltip>
            </MenuItem>
            {item.renderSubmenu && item.renderSubmenu()}
          </div>
        ))}
      </Menu>
    </Box>
  );
};

export default ExpandableIconMenu;
