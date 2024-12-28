import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  Bar,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Chip,
  OutlinedInput,
  IconButton,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  Menu,
  Alert,
  ListItemIcon,
  ListItemButton,
  TextField,
  DialogActions,
} from "@mui/material";
import { ChromePicker } from "react-color";

import {
  Timer as TimerIcon,
  Analytics as ProfileIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  Palette as PaletteIcon,
  Speed as ThresholdIcon,
} from "@mui/icons-material";
import axios from "axios";
import {
  BarChart as GraphTypeIcon,
  CompareArrows as CompareScriptsIcon,
} from "@mui/icons-material";

const apiUrl = process.env.REACT_APP_API_LOCAL_URL;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")} ${String(
    date.getUTCHours()
  ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(
    date.getUTCSeconds()
  ).padStart(2, "0")}`;
};

const SimpleGraph = ({ widgetData, showXAxis = true, isExpanded = false }) => {
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState("trend");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [availableScripts, setAvailableScripts] = useState([]);
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [chartType, setChartType] = useState("Area");
  const [zoomRange, setZoomRange] = useState({
    start: 0,
    end: 100,
    minPoints: 5,
  });
  const [displayData, setDisplayData] = useState([]);
  const [isCompareScriptsDialogOpen, setIsCompareScriptsDialogOpen] =
    useState(false);
  const [isGraphTypeDialogOpen, setIsGraphTypeDialogOpen] = useState(false);
  const chartRef = useRef(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [timerState, setTimerState] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [timerAnchorEl, setTimerAnchorEl] = useState(null);
  const [graphTypeAnchorEl, setGraphTypeAnchorEl] = useState(null);

  const [scriptColors, setScriptColors] = useState({});
  const [currentColorPickerScript, setCurrentColorPickerScript] =
    useState(null);
  const colors = [
    "#2196f3",
    "#f44336",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#795548",
    "#3f51b5",
    "#00bcd4",
    "#e91e63",
    "#FFC107",
  ];

  const [thresholds, setThresholds] = useState({
    min: null,
    max: null,
  });
  const [isThresholdDialogOpen, setIsThresholdDialogOpen] = useState(false);
  const [tempThresholds, setTempThresholds] = useState({
    min: "",
    max: "",
  });

  const [timerSlot, setTimerSlot] = useState(null);
  const [currentCycle, setCurrentCycle] = useState({
    startTime: null,
    endTime: null,
  });

  const timerIntervalRef = useRef(null);

  // ---------------- Retrieve widget config ----------------
  useEffect(() => {
    const fetchWidgetPreferences = async () => {
      try {
        const response = await axios.get(apiUrl + "get-widget-preferences", {
          params: {
            widgetId: widgetData.id,
            customerID: widgetData.customerID,
            scriptName: widgetData.scriptName,
          },
        });

        const preferences = response.data.data.preferences;
        if (preferences) {
          setSelectedProfile(preferences.selectedProfile || "trend");
          setSelectedScripts(preferences.comparisonScripts || []);
          setChartType(preferences.chartType || "Area");
          setThresholds(preferences.thresholds || { min: null, max: null });

          if (preferences.scriptColors) {
            setScriptColors(preferences.scriptColors);
          }

          if (preferences.timerState) {
            const now = Date.now();
            const endTime = new Date(preferences.timerState.endTime).getTime();

            if (now < endTime) {
              setTimerState({
                ...preferences.timerState,
                remainingTime: Math.max(0, Math.ceil((endTime - now) / 1000)),
              });
            }
          }
        }
      } catch (err) {
        console.log("No existing preferences found");
      }
    };

    fetchWidgetPreferences();
  }, [widgetData]);

  const handleThresholdDialogOpen = () => {
    setTempThresholds({
      min: thresholds.min || "",
      max: thresholds.max || "",
    });
    setIsThresholdDialogOpen(true);
    handleMenuClose();
  };

  const handleThresholdDialogClose = () => {
    setIsThresholdDialogOpen(false);
  };

  const handleThresholdSave = () => {
    setThresholds({
      min: tempThresholds.min === "" ? null : Number(tempThresholds.min),
      max: tempThresholds.max === "" ? null : Number(tempThresholds.max),
    });
    setIsThresholdDialogOpen(false);
  };

  // ----------------- Profile selection -------------------
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    handleProfileMenuClose();
  };

  const handleTimerMenuOpen = (event) => {
    setTimerAnchorEl(event.currentTarget);
  };

  const handleGraphTypeMenuOpen = (event) => {
    setGraphTypeAnchorEl(event.currentTarget);
  };

  const handleGraphTypeMenuClose = () => {
    setGraphTypeAnchorEl(null);
  };

  const handleGraphTypeSelect = (type) => {
    setChartType(type);
    handleGraphTypeMenuClose();
  };

  // ----------------- Time slot ---------------------------
  const timerSlots = [
    { label: "1 minute", value: 1 * 60 },
    { label: "15 min", value: 15 * 60 },
    { label: "1 hr", value: 60 * 60 },
    { label: "8 hr", value: 8 * 60 * 60 },
    { label: "24 hr", value: 24 * 60 * 60 },
  ];

  // Start continuous timer
  const startContinuousTimer = useCallback((slot) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setTimerSlot(slot);
    const times = alignTimeToInterval(slot.value);
    setCurrentCycle(times);

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now >= times.endTime) {
        const newTimes = alignTimeToInterval(slot.value);
        setCurrentCycle(newTimes);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const fetchTimerPreferences = async () => {
      try {
        const response = await axios.get(apiUrl + "get-widget-preferences", {
          params: {
            widgetId: widgetData.id,
            customerID: widgetData.customerID,
            scriptName: widgetData.scriptName,
          },
        });

        const preferences = response.data.data.preferences;
        if (preferences && preferences.timerSlot) {
          const savedSlot = timerSlots.find(
            (slot) => slot.value === preferences.timerSlot.value
          );
          if (savedSlot) {
            startContinuousTimer(savedSlot);
          }
        }
      } catch (err) {
        console.log("No existing timer preferences found");
      }
    };

    fetchTimerPreferences();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [widgetData, startContinuousTimer]);

  // Calculate remaining time for display
  const getRemainingTime = useCallback(() => {
    if (!currentCycle.endTime) return 0;
    return Math.max(0, Math.ceil((currentCycle.endTime - Date.now()) / 1000));
  }, [currentCycle]);

  const alignTimeToInterval = (interval) => {
    const now = new Date();
    const alignedDate = new Date(now);

    switch (interval) {
      case 60: // 1 minute
        alignedDate.setSeconds(0, 0);
        return {
          startTime: alignedDate.getTime(),
          endTime: alignedDate.getTime() + interval * 1000,
        };

      case 15 * 60: // 15 minutes
        const minutes = alignedDate.getMinutes();
        const alignedMinutes = Math.floor(minutes / 15) * 15;
        alignedDate.setMinutes(alignedMinutes, 0, 0);
        return {
          startTime: alignedDate.getTime(),
          endTime: alignedDate.getTime() + interval * 1000,
        };

      case 60 * 60: // 1 hour
        alignedDate.setMinutes(0, 0, 0);
        return {
          startTime: alignedDate.getTime(),
          endTime: alignedDate.getTime() + interval * 1000,
        };

      case 8 * 60 * 60: // 8 hours
        const hours = alignedDate.getHours();
        const alignedHours = Math.floor(hours / 8) * 8;
        alignedDate.setHours(alignedHours, 0, 0, 0);
        return {
          startTime: alignedDate.getTime(),
          endTime: alignedDate.getTime() + interval * 1000,
        };

      case 24 * 60 * 60: // 24 hours
        alignedDate.setHours(0, 0, 0, 0);
        return {
          startTime: alignedDate.getTime(),
          endTime: alignedDate.getTime() + interval * 1000,
        };

      default:
        return {
          startTime: alignedDate.getTime(),
          endTime: alignedDate.getTime() + interval * 1000,
        };
    }
  };

  const startTimer = useCallback((slot) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const now = Date.now();
    const alignedStartTime = alignTimeToInterval(now, slot.value);
    const endTime = alignedStartTime + slot.value * 1000;

    const newTimerState = {
      selectedSlot: slot,
      startTime: alignedStartTime,
      endTime: endTime,
      remainingTime: Math.ceil((endTime - now) / 1000),
      alignedStartTime: alignedStartTime,
    };

    setTimerState(newTimerState);

    timerIntervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - currentTime) / 1000)
      );

      if (remainingSeconds <= 0) {
        startTimer(slot);
      } else {
        setTimerState((prev) => ({
          ...prev,
          remainingTime: remainingSeconds,
        }));
      }
    }, 1000);

    setTimerAnchorEl(null);
  }, []);

  const formatRemainingTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimerSlotSelect = (slot) => {
    if (slot === null) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTimerSlot(null);
      setCurrentCycle({ startTime: null, endTime: null });
      setTimerAnchorEl(null);
      return;
    }

    startContinuousTimer(slot);
    setTimerAnchorEl(null);
  };
  // --------------- Filter data by Config ----------------------
  const filterDataByConfig = useCallback(
    (data) => {
      if (!data || data.length === 0) return [];

      let filteredData = data;

      if (timerSlot) {
        const cycleStartTime = new Date(currentCycle.startTime);
        const cycleEndTime = new Date(currentCycle.endTime);

        filteredData = data.filter((item) => {
          const itemTime = new Date(item.timestamp);
          return itemTime >= cycleStartTime && itemTime <= cycleEndTime;
        });
      } else {
        if (isExpanded) {
          filteredData = data.slice(-2880);
        } else if (!widgetData.xAxisConfiguration) {
          filteredData = data.slice(-10);
        } else if (widgetData.xAxisConfiguration.type === "records") {
          filteredData = data.slice(-widgetData.xAxisConfiguration.value);
        } else if (widgetData.xAxisConfiguration.type === "seconds") {
          const cutoffTime = new Date(
            Date.now() - widgetData.xAxisConfiguration.value * 1000
          );
          filteredData = data.filter(
            (item) => new Date(item.timestamp) > cutoffTime
          );
        }
      }

      const startIdx = Math.floor(
        filteredData.length * (zoomRange.start / 100)
      );
      const endIdx = Math.ceil(filteredData.length * (zoomRange.end / 100));
      return filteredData.slice(startIdx, endIdx);
    },
    [
      currentCycle,
      timerSlot,
      zoomRange,
      widgetData.xAxisConfiguration,
      isExpanded,
    ]
  );

  useEffect(() => {
    if (timerState && timerState.selectedSlot) {
      startTimer(timerState.selectedSlot);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [startTimer]);

  // ---------------- Fetch scripts ----------------
  useEffect(() => {
    if (!isExpanded && !isCompareScriptsDialogOpen) return;

    const fetchAvailableScripts = async () => {
      try {
        const response = await fetch(
          `${apiUrl}terminal/${widgetData.terminalID}/scripts`
        );
        if (!response.ok) throw new Error("Failed to fetch scripts");
        const data = await response.json();
        const scriptNames = Object.keys(data.scripts).filter(
          (script) => script !== widgetData.scriptName
        );
        setAvailableScripts(scriptNames);
      } catch (err) {
        console.error("Error fetching scripts:", err);
        setError("Failed to load available scripts");
      }
    };

    fetchAvailableScripts();
  }, [
    widgetData.terminalID,
    widgetData.scriptName,
    isExpanded,
    isCompareScriptsDialogOpen,
  ]);

  // ---------------- Fetch history data ----------------
  const fetchScriptData = async (scriptName, profile = "trend") => {
    try {
      const response = await fetch(
        `${apiUrl}terminal/${widgetData.terminalID}/script/${encodeURIComponent(
          scriptName
        )}/cddhistory/${profile}`
      );

      if (!response.ok)
        throw new Error(`Failed to fetch data for ${scriptName}`);

      const data = await response.json();
      return [...data].map((item) => ({
        timestamp: formatTimestamp(item.timestamp),
        [scriptName]: item[scriptName],
      }));
    } catch (err) {
      console.error(`Error fetching data for ${scriptName}:`, err);
      return [];
    }
  };

  // ------------Update useEffect to pass profile -----------
  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const updateData = async () => {
      try {
        const mainData = await fetchScriptData(
          widgetData.scriptName,
          selectedProfile
        );
        if (!isMounted) return;

        let allData = [...mainData].reverse().map((item) => ({
          ...item,
          [widgetData.scriptName]: item[widgetData.scriptName],
        }));

        // Fetch data for selected comparison scripts with the same profile
        for (const script of selectedScripts) {
          const scriptData = await fetchScriptData(script, selectedProfile);
          const reversedScriptData = [...scriptData].reverse();
          allData = allData.map((item, index) => ({
            ...item,
            [script]: reversedScriptData[index]?.[script],
          }));
        }

        if (!isMounted) return;

        setMergedData(allData);
        const filteredData = filterDataByConfig(allData);
        setDisplayData(filteredData);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          setError("Failed to load comparison data");
        }
      }
    };

    updateData();

    if (selectedScripts.length > 0 || widgetData.scriptName) {
      intervalId = setInterval(updateData, 10000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedScripts, widgetData.scriptName, selectedProfile]);

  // ---------------- profile ----------------
  const renderProfileDialog = () => (
    <Dialog
      open={isProfileDialogOpen}
      onClose={() => setIsProfileDialogOpen(false)}
      sx={{
        "& .MuiPaper-root": {
          padding: "24px",
          backgroundColor: "#eef4fa",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          minWidth: "320px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.4rem",
          textAlign: "center",
          color: "#1a73e8",
          borderBottom: "2px solid #d0e1f9",
          paddingBottom: "12px",
        }}
      >
        Select Profile
      </DialogTitle>
      <DialogContent
        sx={{
          paddingTop: "16px",
        }}
      >
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {["trend", "daily", "block"].map((profile) => (
            <ListItem
              key={profile}
              button
              onClick={() => {
                setSelectedProfile(profile);
                setIsProfileDialogOpen(false);
              }}
              sx={{
                backgroundColor:
                  selectedProfile === profile ? "#e3f2fd" : "#ffffff",
                border: "2px solid",
                borderColor:
                  selectedProfile === profile ? "#1a73e8" : "#d0e0e3",
                borderRadius: "12px",
                "&:hover": {
                  backgroundColor: "#f0f9ff",
                  borderColor: "#1a73e8",
                },
                transition: "all 0.3s ease",
                boxShadow:
                  selectedProfile === profile
                    ? "0 4px 12px rgba(26, 115, 232, 0.3)"
                    : "0 2px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <ListItemText
                primary={profile.charAt(0).toUpperCase() + profile.slice(1)}
                sx={{
                  textAlign: "center",
                  color: selectedProfile === profile ? "#1a73e8" : "#333",
                  fontWeight: selectedProfile === profile ? "bold" : "500",
                  fontSize: "1.1rem",
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );

  const handleScriptChange = (event) => {
    const newSelectedScripts = event.target.value;
    setSelectedScripts(newSelectedScripts);
  };

  // ------------------- Zoom In , Zoom Out , Reset Zoom -------------------
  const handleWheel = useCallback((event) => {
    event.preventDefault();

    if (!chartRef.current) return;

    const zoomSensitivity = 1.5;
    const zoomDirection = event.deltaY > 0 ? 1 : -1;

    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / rect.width;

    setZoomRange((prevRange) => {
      const currentRangeSize = prevRange.end - prevRange.start;
      const newRangeSize = Math.max(
        5,
        Math.min(
          100,
          currentRangeSize * (1 + zoomDirection * 0.1 * zoomSensitivity)
        )
      );

      const rangeCenter = prevRange.start + mouseX * currentRangeSize;
      let newStart = rangeCenter - newRangeSize * mouseX;
      let newEnd = newStart + newRangeSize;

      if (newStart < 0) {
        newStart = 0;
        newEnd = newRangeSize;
      }
      if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - newRangeSize;
      }

      return {
        start: Math.max(0, newStart),
        end: Math.min(100, newEnd),
        minPoints: prevRange.minPoints,
      };
    });
  }, []);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.addEventListener("wheel", handleWheel, { passive: false });
      return () => chartElement.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    const filteredData = filterDataByConfig(mergedData);
    setDisplayData(filteredData);
  }, [mergedData, filterDataByConfig]);

  useEffect(() => {
    const chartNode = chartRef.current;
    if (!chartNode) return;

    chartNode.addEventListener("wheel", handleWheel, { passive: false });
    return () => chartNode.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // ----------------- Tooltip and hover functionality -----------------
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1, backgroundColor: "white" }}>
          <Box sx={{ mb: 1 }}>{label}</Box>
          {payload.map((entry, index) => {
            const scriptColor =
              scriptColors[entry.name] || colors[index % colors.length];
            return (
              <Box key={entry.name} sx={{ color: scriptColor }}>
                {entry.name}:{" "}
                {entry.value?.toFixed(widgetData.decimalPlaces || 2)}
              </Box>
            );
          })}
        </Paper>
      );
    }
    return null;
  };

  const isColorDark = (backgroundColor) => {
    if (!backgroundColor || backgroundColor === "transparent") return false;
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // ---------------------- Chart type --------------------------
  const renderChartType = (dataKey, color) => {
    const scriptColor = scriptColors[dataKey] || color;
    switch (chartType) {
      case "Line":
        return (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={scriptColor}
            dot={false}
            isAnimationActive={false}
          />
        );
      case "Area":
        return (
          <Area
            type="monotone"
            dataKey={dataKey}
            fill={scriptColor}
            stroke={scriptColor}
            fillOpacity={0.3}
            isAnimationActive={false}
          />
        );
      case "Bar":
        return (
          <Bar dataKey={dataKey} fill={scriptColor} isAnimationActive={false} />
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleCompareScriptsClose = () => {
    setIsCompareScriptsDialogOpen(false);
  };

  const handleScriptToggle = (script) => {
    const newSelectedScripts = selectedScripts.includes(script)
      ? selectedScripts.filter((s) => s !== script)
      : [...selectedScripts, script];

    setSelectedScripts(newSelectedScripts);
  };

  const handleGraphTypeClose = () => {
    setIsGraphTypeDialogOpen(false);
  };

  const handleGraphTypeChange = (type) => {
    setChartType(type);
    setIsGraphTypeDialogOpen(false);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // --------------------- Icons and Buttons ---------------------
  const openProfileDialog = () => {
    setIsProfileDialogOpen(true);
    handleMenuClose();
  };

  // New function to handle graph type selection for non-expanded view
  const openGraphTypeDialog = () => {
    setIsGraphTypeDialogOpen(true);
    handleMenuClose();
  };

  // New function to handle timer selection for non-expanded view
  const openTimerMenu = (event) => {
    setTimerAnchorEl(event.currentTarget);
    handleMenuClose();
  };

  const openCompareScriptsDialog = () => {
    setIsCompareScriptsDialogOpen(true);
    handleMenuClose();
  };

  const renderTimerMenu = () => (
    <Menu
      anchorEl={timerAnchorEl}
      open={Boolean(timerAnchorEl)}
      onClose={() => setTimerAnchorEl(null)}
      PaperProps={{
        style: {
          maxHeight: 300,
          width: "200px",
        },
      }}
    >
      {timerSlots.map((slot) => (
        <MenuItem
          key={slot.value}
          onClick={() => handleTimerSlotSelect(slot)}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor:
              timerSlot?.value === slot.value
                ? "rgba(25, 118, 210, 0.08)"
                : "transparent",
            "&:hover": {
              backgroundColor:
                timerSlot?.value === slot.value
                  ? "rgba(25, 118, 210, 0.12)"
                  : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Typography>{slot.label}</Typography>
          {timerSlot?.value === slot.value && (
            <Box
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                ml: 1,
              }}
            />
          )}
        </MenuItem>
      ))}
      {timerSlot && (
        <MenuItem
          onClick={() => handleTimerSlotSelect(null)}
          sx={{
            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
            color: "error.main",
          }}
        >
          Clear Timer
        </MenuItem>
      )}
    </Menu>
  );

  // Update timer button to show active state
  const renderTimerButton = () => (
    <MuiTooltip title="Timer Settings">
      <IconButton onClick={handleTimerMenuOpen}>
        <TimerIcon
          sx={{
            color: timerSlot ? "#1976d2" : "inherit",
            mt: 2,
            ml: 2,
          }}
        />
        {timerSlot && (
          <Typography
            variant="caption"
            sx={{
              color: "#1976d2",
              mt: 2,
              ml: 2,
            }}
          >
            {formatRemainingTime(getRemainingTime())}
          </Typography>
        )}
      </IconButton>
    </MuiTooltip>
  );

  // Update timer display in menu
  const renderMenuTimerItem = () => (
    <ListItem disablePadding>
      <ListItemButton
        onClick={openTimerMenu}
        sx={{
          bgcolor: timerSlot ? "rgba(25, 118, 210, 0.08)" : "transparent",
        }}
      >
        <ListItemIcon>
          <TimerIcon
            fontSize="small"
            sx={{
              color: timerSlot ? "#1976d2" : "inherit",
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary="Timer Settings"
          secondary={
            timerSlot
              ? `Active: ${timerSlot.label} (${formatRemainingTime(
                  getRemainingTime()
                )})`
              : "Set Timer"
          }
          secondaryTypographyProps={{
            sx: {
              color: timerSlot ? "#1976d2" : "inherit",
              fontWeight: timerSlot ? "medium" : "normal",
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  // Modify the existing renderNonExpandedIcons function
  const renderNonExpandedIcons = () => {
    if (isExpanded) return null;

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          display: "flex",
          p: 1,
        }}
      >
        <MuiTooltip title="Save Preferences">
          <IconButton
            size="small"
            sx={{
              color: isColorDark(widgetData.properties.backgroundColor)
                ? "#fff"
                : "#000",
              mr: 1,
              position: "absolute",
              top: 4,
              right: 20,
              display: "flex",
              p: 1,
            }}
            onClick={handleSavePreferences}
          >
            <SaveIcon
              sx={{
                fontSize: "1.2rem",
                "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              }}
              fontSize="small"
            />
          </IconButton>
        </MuiTooltip>
        <MuiTooltip title="Graph Options">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              color: isColorDark(widgetData.properties.backgroundColor)
                ? "#fff"
                : "#000",
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </MuiTooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              minWidth: 250,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              borderRadius: "10px",
            },
          }}
        >
          {" "}
          {renderMenuTimerItem()}
          <ListItem disablePadding>
            <ListItemButton onClick={handleThresholdDialogOpen}>
              <ListItemIcon>
                <ThresholdIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Threshold Settings"
                secondary={
                  thresholds.min || thresholds.max
                    ? `Min: ${thresholds.min || "none"}, Max: ${
                        thresholds.max || "none"
                      }`
                    : "Not set"
                }
              />
            </ListItemButton>
          </ListItem>
          {/* Profile Settings */}
          <ListItem disablePadding>
            <ListItemButton onClick={openProfileDialog}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Profile Settings"
                secondary={
                  selectedProfile.charAt(0).toUpperCase() +
                  selectedProfile.slice(1)
                }
              />
            </ListItemButton>
          </ListItem>
          {/* Graph Type */}
          <ListItem disablePadding>
            <ListItemButton onClick={openGraphTypeDialog}>
              <ListItemIcon>
                <GraphTypeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Change Graph Type" secondary={chartType} />
            </ListItemButton>
          </ListItem>
          {/* Compare Scripts */}
          <ListItem disablePadding>
            <ListItemButton onClick={openCompareScriptsDialog}>
              <ListItemIcon>
                <CompareScriptsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Compare Scripts"
                secondary={`${selectedScripts.length} selected`}
              />
            </ListItemButton>
          </ListItem>
        </Menu>
      </Box>
    );
  };
  // ------------ Graph Type Selection Dialog---------------
  const renderGraphTypeDialog = () => (
    <Dialog
      open={isGraphTypeDialogOpen}
      onClose={handleGraphTypeClose}
      sx={{
        "& .MuiPaper-root": {
          padding: "24px",
          backgroundColor: "#eef4fa",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          minWidth: "320px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.4rem",
          textAlign: "center",
          color: "#1a73e8",
          borderBottom: "2px solid #d0e1f9",
          paddingBottom: "12px",
        }}
      >
        Select Graph Type
      </DialogTitle>
      <DialogContent
        sx={{
          paddingTop: "16px",
        }}
      >
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {["Line", "Area", "Bar"].map((type) => (
            <ListItem
              key={type}
              button
              onClick={() => handleGraphTypeChange(type)}
              sx={{
                backgroundColor: "#ffffff",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                  borderColor: "#1a73e8",
                },
                transition: "all 0.3s ease",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
            >
              <ListItemText
                primary={type}
                sx={{
                  textAlign: "center",
                  color: "#333",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  "&:hover": {
                    color: "#1a73e8",
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );

  // --------------- Compare Scripts Dialog ---------------
  const handleScriptColorChange = (script, color) => {
    setScriptColors((prev) => ({
      ...prev,
      [script]: color.hex,
    }));
  };

  // Modified renderCompareScriptsDialog to include color selection
  const renderCompareScriptsDialog = () => (
    <Dialog
      open={isCompareScriptsDialogOpen}
      onClose={handleCompareScriptsClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        style: {
          width: "800px",
          height: "600px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <DialogTitle
        style={{
          background: "linear-gradient(90deg, #2196f3, #0d47a1)",
          color: "#fff",
          fontWeight: "bold",
          textAlign: "center",
          padding: "24px",
          fontSize: "20px",
        }}
      >
        Compare Scripts
      </DialogTitle>
      <DialogContent
        style={{
          padding: "16px",
          backgroundColor: "#f9f9f9",
          display: "flex",
          justifyContent: "space-between",
          height: "calc(100% - 24px)",
        }}
      >
        <Box
          style={{
            width: "50%",
            overflowY: "auto",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "8px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Available Scripts
          </Typography>
          <List>
            {availableScripts.map((script) => (
              <ListItem
                key={script}
                button
                onClick={() => handleScriptToggle(script)}
                dense
                style={{
                  margin: "4px 0",
                  borderRadius: "6px",
                  transition: "background-color 0.3s",
                  display: "flex",
                  justifyContent: "space-between",
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    edge="start"
                    checked={selectedScripts.includes(script)}
                    tabIndex={-1}
                    disableRipple
                    style={{
                      color: selectedScripts.includes(script)
                        ? "#2196f3"
                        : "#ccc",
                    }}
                  />
                  <ListItemText
                    primary={script}
                    style={{
                      fontSize: "14px",
                      fontWeight: selectedScripts.includes(script)
                        ? "bold"
                        : "normal",
                    }}
                  />
                </Box>
                {selectedScripts.includes(script) && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentColorPickerScript(script);
                    }}
                  >
                    <PaletteIcon
                      style={{
                        color:
                          scriptColors[script] ||
                          colors[
                            selectedScripts.indexOf(script) % colors.length
                          ],
                      }}
                    />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
        {currentColorPickerScript && (
          <Box
            style={{
              width: "45%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Choose Color for {currentColorPickerScript}
            </Typography>
            <ChromePicker
              color={
                scriptColors[currentColorPickerScript] ||
                colors[
                  selectedScripts.indexOf(currentColorPickerScript) %
                    colors.length
                ]
              }
              onChange={handleScriptColorChange.bind(
                null,
                currentColorPickerScript
              )}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCurrentColorPickerScript(null)}
              style={{ marginTop: "16px" }}
            >
              Confirm Color
            </Button>
          </Box>
        )}
      </DialogContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          padding: 2,
        }}
      >
        <Button
          onClick={handleCompareScriptsClose}
          color="primary"
          style={{
            backgroundColor: "#f44336",
            color: "#fff",
            textTransform: "none",
            borderRadius: "8px",
            padding: "6px 16px",
          }}
        >
          Back
        </Button>
      </Box>
    </Dialog>
  );

  // --------------------- Save graph config ---------------------
  const handleSavePreferences = async () => {
    try {
      const preferences = {
        widgetId: widgetData.id,
        scriptName: widgetData.scriptName,
        preferences: {
          selectedProfile,
          comparisonScripts: selectedScripts,
          scriptColors,
          thresholds,
          timerSlot,
          chartType,
        },
      };

      const response = await axios.post(
        apiUrl + "widget-preferences",
        preferences
      );
      setSnackbarMessage("Preferences saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSnackbarMessage("Failed to save preferences");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const renderThresholdDialog = () => (
    <Dialog
      open={isThresholdDialogOpen}
      onClose={handleThresholdDialogClose}
      PaperProps={{
        sx: {
          width: "400px",
          padding: "20px",
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.4rem",
          textAlign: "center",
          color: "#1a73e8",
          borderBottom: "2px solid #d0e1f9",
          paddingBottom: "12px",
        }}
      >
        Set Bandwidth Thresholds
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="Minimum Threshold"
            type="number"
            value={tempThresholds.min}
            onChange={(e) =>
              setTempThresholds({ ...tempThresholds, min: e.target.value })
            }
            fullWidth
            variant="outlined"
            helperText="Leave empty to remove minimum threshold"
          />
          <TextField
            label="Maximum Threshold"
            type="number"
            value={tempThresholds.max}
            onChange={(e) =>
              setTempThresholds({ ...tempThresholds, max: e.target.value })
            }
            fullWidth
            variant="outlined"
            helperText="Leave empty to remove maximum threshold"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <Button
          onClick={handleThresholdDialogClose}
          variant="outlined"
          color="error"
        >
          Cancel
        </Button>
        <Button
          onClick={handleThresholdSave}
          variant="contained"
          color="primary"
        >
          Save Thresholds
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderSnackbar = () => (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity={snackbarSeverity}
        sx={{ width: "100%" }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
  return (
    <Box sx={{ width: "100%", height: "100%" }} ref={chartRef}>
      {renderNonExpandedIcons()}
      {renderProfileDialog()}
      {renderGraphTypeDialog()}
      {renderCompareScriptsDialog()}
      {renderThresholdDialog()}
      {renderTimerMenu()}
      {renderSnackbar()}
      {isExpanded && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            ml: 2,
          }}
        >
          {renderTimerButton()}
          <MuiTooltip title="Select Profile">
            <IconButton onClick={handleProfileMenuOpen} sx={{ mt: 2 }}>
              <ProfileIcon />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {selectedProfile.charAt(0).toUpperCase() +
                  selectedProfile.slice(1)}
              </Typography>
            </IconButton>
          </MuiTooltip>
          {/* Profile Selection Dropdown */}
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
          >
            {["trend", "daily", "block"].map((profile) => (
              <MenuItem
                key={profile}
                onClick={() => handleProfileSelect(profile)}
                selected={selectedProfile === profile}
              >
                {profile.charAt(0).toUpperCase() + profile.slice(1)}
              </MenuItem>
            ))}
          </Menu>
          <MuiTooltip title="Change Graph Type">
            <IconButton onClick={handleGraphTypeMenuOpen} sx={{ mt: 2 }}>
              <GraphTypeIcon />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {chartType}
              </Typography>
            </IconButton>
          </MuiTooltip>
          <Menu
            anchorEl={graphTypeAnchorEl}
            open={Boolean(graphTypeAnchorEl)}
            onClose={handleGraphTypeMenuClose}
          >
            {["Line", "Area", "Bar"].map((type) => (
              <MenuItem
                key={type}
                onClick={() => handleGraphTypeSelect(type)}
                selected={chartType === type}
              >
                {type}
              </MenuItem>
            ))}
          </Menu>
          <FormControl sx={{ flex: 1, mt: 2, ml: 8 }} size="small">
            <InputLabel>Compare Scripts</InputLabel>
            <Select
              multiple
              value={selectedScripts}
              onChange={handleScriptChange}
              input={<OutlinedInput label="Compare Scripts" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {availableScripts.map((script) => (
                <MenuItem key={script} value={script}>
                  {script}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ minWidth: 120, mt: 2, mr: 2 }}>
            <MuiTooltip title="Save Preferences">
              <IconButton
                size="medium"
                color="primary"
                onClick={handleSavePreferences}
              >
                <SaveIcon fontSize="medium" />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>
      )}
      <Box
        ref={chartRef}
        sx={{
          height: showXAxis ? "calc(100% - 80px)" : "100%",
          cursor: "zoom-in",
        }}
      >
        <ResponsiveContainer>
          <ComposedChart
            data={displayData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" hide={!showXAxis} />
            <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Add threshold reference lines */}
            {thresholds.max !== null && (
              <ReferenceLine
                y={thresholds.max}
                stroke="red"
                strokeDasharray="3 3"
                label={{
                  value: `Max: ${thresholds.max}`,
                  position: "insideTopLeft",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#ff0000",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    border: "1px solid #ff0000",
                  },
                }}
              />
            )}
            {thresholds.min !== null && (
              <ReferenceLine
                y={thresholds.min}
                stroke="orange"
                strokeDasharray="3 3"
                label={{
                  value: `Min: ${thresholds.min}`,
                  position: "insideTopLeft",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#ff9800",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    border: "1px solid #ff9800",
                  },
                }}
              />
            )}

            {renderChartType(widgetData.scriptName, scriptColors[0])}
            {selectedScripts.map((script, index) =>
              renderChartType(
                script,
                scriptColors[(index + 1) % scriptColors.length]
              )
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default SimpleGraph;
