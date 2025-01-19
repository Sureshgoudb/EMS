import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
  DialogActions,
  Button,
  Grid,
  Checkbox,
  ListItemIcon
} from '@mui/material';
import {
  Timer as TimerIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  Analytics as ProfileIcon,
  BarChart as GraphTypeIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { SketchPicker } from 'react-color';
import axios from 'axios';
const apiKey = process.env.REACT_APP_API_LOCAL_URL;

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


const GraphWidget = ({ widget }) => {
  const [data, setData] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('trend');
  const [chartType, setChartType] = useState('Area');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isGraphTypeDialogOpen, setIsGraphTypeDialogOpen] = useState(false);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [availableScripts, setAvailableScripts] = useState([]);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);
  const [scriptColors, setScriptColors] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  const defaultColors = {
    [widget?.script?.[0]?.scriptName]: '#2196f3'
  };

  const colors = [
    '#2196f3',
    '#f44336',
    '#4caf50',
    '#ff9800',
    '#9c27b0'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (widget?.terminal?.terminalId && widget?.script?.length > 0) {
          const response = await axios.get(
            `${apiKey}terminal/${widget.terminal.terminalId}/script/${widget.script[0].scriptName}/cddhistory/${selectedProfile}`
          );

          const formattedData = response.data.map(item => ({
            timestamp: formatTimestamp(item.timestamp),
            [widget.script[0].scriptName]: item[widget.script[0].scriptName]
          }));

          for (const scriptName of selectedScripts) {
            const scriptResponse = await axios.get(
              `${apiKey}terminal/${widget.terminal.terminalId}/script/${scriptName}/cddhistory/${selectedProfile}`
            );

            scriptResponse.data.forEach((item, index) => {
              if (formattedData[index]) {
                formattedData[index][scriptName] = item[scriptName];
              }
            });
          }

          setData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error fetching data', 'error');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [widget, selectedProfile, selectedScripts]);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await axios.get(
          `${apiKey}terminal/${widget.terminal.terminalId}/scripts`
        );
        const scriptNames = Object.keys(response.data.scripts).filter(
          script => script !== widget.script[0].scriptName
        );
        setAvailableScripts(scriptNames);
      } catch (error) {
        console.error('Error fetching scripts:', error);
      }
    };

    fetchScripts();
  }, [widget.terminal.terminalId, widget.script]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSavePreferences = async () => {
    try {
      const preferences = {
        widgetId: widget.id,
        scriptName: widget.script[0].scriptName,
        preferences: {
          selectedProfile,
          comparisonScripts: selectedScripts,
          chartType
        }
      };

      await axios.post(
        `${apiKey}widget-preferences`,
        preferences
      );
      showSnackbar('Preferences saved successfully');
    } catch (error) {
      showSnackbar('Error saving preferences', 'error');
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'white' }}>
          <Box sx={{ mb: 1 }}>{label}</Box>
          {payload.map((entry, index) => (
            <Box key={entry.name} sx={{ color: colors[index % colors.length] }}>
              {entry.name}: {entry.value?.toFixed(widget.decimalPlaces || 2)}
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };
  const handleColorChange = (color) => {
    setScriptColors({
      ...scriptColors,
      [currentScript]: color.hex
    });
  };

  const handleScriptToggle = (script) => {
    const currentIndex = selectedScripts.indexOf(script);
    let newSelectedScripts = [...selectedScripts];

    if (currentIndex === -1) {
      newSelectedScripts.push(script);
      if (!scriptColors[script]) {
        setScriptColors({
          ...scriptColors,
          [script]: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        });
      }
    } else {
      newSelectedScripts.splice(currentIndex, 1);
    }

    setSelectedScripts(newSelectedScripts);
  };

  const CompareScriptsDialog = () => (
    <Dialog
      open={isCompareDialogOpen}
      onClose={() => setIsCompareDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Compare Scripts</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1" gutterBottom>
              Available Scripts
            </Typography>
            <List>
              {availableScripts.map((script) => (
                <ListItem key={script} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedScripts.includes(script)}
                      onChange={() => handleScriptToggle(script)}
                    />
                  </ListItemIcon>
                  <ListItemText primary={script} />
                  {selectedScripts.includes(script) && (
                    <Box
                      onClick={() => {
                        setCurrentScript(script);
                        setColorPickerOpen(true);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: scriptColors[script] || '#000',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={6}>
            {colorPickerOpen && (
              <Box sx={{ position: 'sticky', top: 0 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Color Picker for {currentScript}
                </Typography>
                <SketchPicker
                  color={scriptColors[currentScript]}
                  onChange={handleColorChange}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsCompareDialogOpen(false)}>Done</Button>
      </DialogActions>
    </Dialog>
  );

  const renderChartType = (dataKey) => {
    const color = scriptColors[dataKey] || defaultColors[dataKey] || '#000';

    switch (chartType) {
      case 'Line':
        return (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            dot={false}
            isAnimationActive={false}
          />
        );
      case 'Area':
        return (
          <Area
            type="monotone"
            dataKey={dataKey}
            fill={color}
            stroke={color}
            fillOpacity={0.3}
            isAnimationActive={false}
          />
        );
      case 'Bar':
        return (
          <Bar
            dataKey={dataKey}
            fill={color}
            isAnimationActive={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      sx={{ height: '100%', p: 2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >       <Box sx={{ position: 'relative', height: '100%' }}>
        <Box
          sx={{
            position: 'absolute',
            right: 8,
            zIndex: 1,
            display: 'flex',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
        >
          <Tooltip title="Save Preferences">
            <IconButton size="small" onClick={handleSavePreferences}>
              <SaveIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Graph Options">
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setIsProfileDialogOpen(true)}>
            <ProfileIcon sx={{ mr: 1 }} />
            Profile Settings
          </MenuItem>
          <MenuItem onClick={() => setIsGraphTypeDialogOpen(true)}>
            <GraphTypeIcon sx={{ mr: 1 }} />
            Change Graph Type
          </MenuItem>
          <MenuItem onClick={() => setIsCompareDialogOpen(true)}>
            <CompareIcon sx={{ mr: 1 }} />
            Compare Scripts
          </MenuItem>
        </Menu>

        {/* Profile Dialog */}
        <Dialog
          open={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
        >
          <DialogTitle>Select Profile</DialogTitle>
          <DialogContent>
            <List>
              {['trend', 'daily', 'block'].map((profile) => (
                <ListItem
                  key={profile}
                  button
                  onClick={() => {
                    setSelectedProfile(profile);
                    setIsProfileDialogOpen(false);
                  }}
                >
                  <ListItemText primary={profile} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Graph Type Dialog */}
        <Dialog
          open={isGraphTypeDialogOpen}
          onClose={() => setIsGraphTypeDialogOpen(false)}
        >
          <DialogTitle>Select Graph Type</DialogTitle>
          <DialogContent>
            <List>
              {['Line', 'Area', 'Bar'].map((type) => (
                <ListItem
                  key={type}
                  button
                  onClick={() => {
                    setChartType(type);
                    setIsGraphTypeDialogOpen(false);
                  }}
                >
                  <ListItemText primary={type} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        <CompareScriptsDialog />

        {/* Chart */}
        <Box sx={{ height: 'calc(100% - 40px)', mt: 4 }}>
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              {renderChartType(widget.script[0].scriptName)}
              {selectedScripts.map((script) =>
                renderChartType(script)
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Paper>
  );
};

export default GraphWidget;