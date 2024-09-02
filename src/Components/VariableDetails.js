import React, { useState, useEffect, useRef } from "react";
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import CancelOutlinedIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import CardTitleBar from "../common/CardTitleBar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PauseIcon from '@mui/icons-material/Pause';
import { json, useParams } from "react-router";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { io } from 'socket.io-client';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Tooltip,
  styled,
  Box,
  Grid,
  Paper,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputBase,
  ListSubheader,
  FormControlLabel,
  MenuItem,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  Typography,
  Button,
  Menu,
  Checkbox,
  CardContent,
  Stack,
  TextField
} from "@mui/material";
import { SketchPicker } from "react-color";
import {
  Add as AddIcon,
  Functions as FunctionsIcon,
  SignalCellularAlt as SignalCellularAltIcon,
} from "@mui/icons-material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LineChart } from "@mui/x-charts";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CardLayout from "../common/CardLayout";
import SearchBar from "./SearchBar";
import "./Devices/devices.css";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));


const VariableDetails = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [live, setLive] = useState(false);
  const [rindex, setRIndex] = useState(0);
  const [sf, setSf] = useState(1);
  const timeout = useRef(null);
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const { variableid } = useParams();
  const user = useSelector((store) => store.user);
  const [range, setRange] = useState("");
  const [variable, setVariable] = useState({});
  const [colorPicker, setColor] = useState("lightblue");
  const [hidden, setHidden] = useState(false);
  const [name, setName] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [selected, setSelected] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [socketVar, setSocketVar] = useState(null);
  const [showavg, setShowavg] = useState(false);
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    /*{
      field: "name",
      headerName: "Name",
      width: 110,
      editable: true,
    },*/
    {
      field: "timestamp",
      headerName: "Date",
      width: 180,
      flex: 1,
      editable: false,
      valueFormatter: params => {
        if (params !== undefined)
          return dayjs(params?.value).subtract(5, 'hours').subtract(30, 'minute').format("YYYY-MM-DD HH:mm:ss")
      }
    },
    {
      field: "value",
      headerName: "Value",
      width: 110,
      editable: false,
      flex: 1,
      valueFormatter: (params => {
        if (params !== undefined){
          let val;
          try{
            val = eval(sf) * parseFloat(params?.value).toFixed(2)
          }
          catch(error)
          {
            val =parseFloat(params?.value).toFixed(2)
          }
          return val;
        }
      })
    },
    {
      field: "avg",
      headerName: "Average",
      width: 110,
      editable: false,
      flex: 1,
      valueFormatter: (params => {
        if (params !== undefined)
          {
            let val;
            try{
              val = eval(sf) * parseFloat(params?.value).toFixed(2)
            }
            catch(error)
            {
              val =parseFloat(params?.value).toFixed(2)
            }
            return val;
          }
      })
    },
  ];


  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  let variable_id =
    variableid !== null || variableid !== undefined
      ? variableid
      : JSON.parse(localStorage.getItem("selectedVariableId"));

  const pickerStyle = {
    default: {
      picker: {
        position: "absolute",
        top: "220px",
        left: "410px",
        zIndex: 10
      },
    },
  };
  

  const getRowClassName = (params) => {
    try{
    if (params.id === (rows[rows.length-1].id)) {
      return 'first-row';
    }
  }
  catch(Error){}
  };

  function CustomNoRowsOverlay() {
    return (
      <StyledGridOverlay>
        <svg
          style={{ flexShrink: 0 }}
          width="240"
          height="200"
          viewBox="0 0 184 152"
          aria-hidden
          focusable="false"
        >
          <g fill="none" fillRule="evenodd">
            <g transform="translate(24 31.67)">
              <ellipse
                className="ant-empty-img-5"
                cx="67.797"
                cy="106.89"
                rx="67.797"
                ry="12.668"
              />
              <path
                className="ant-empty-img-1"
                d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
              />
              <path
                className="ant-empty-img-2"
                d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
              />
              <path
                className="ant-empty-img-3"
                d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
              />
            </g>
            <path
              className="ant-empty-img-3"
              d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
            />
            <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
              <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
              <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
            </g>
          </g>
        </svg>
        <Box sx={{ mt: 1 }}>No Rows</Box>
      </StyledGridOverlay>
    );
  }

  const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .ant-empty-img-1': {
      fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626',
    },
    '& .ant-empty-img-2': {
      fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959',
    },
    '& .ant-empty-img-3': {
      fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343',
    },
    '& .ant-empty-img-4': {
      fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c',
    },
    '& .ant-empty-img-5': {
      fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
      fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff',
    },
  }));

  const FetchRealTimeData = async () => {
    /*let url = apiKey + "variablevalues/" + variable.variableid;
      await axios.get(url)
        .then(async (response) => {
          console.log("old data :" + JSON.stringify(rows) +"\n ")
          if (rows.includes(response.data)) {
            return;
          } else {
          let varValue = response.data[0];
          //varValue.name = varValue.devicename;
          varValue.id = uuidv4();
          setRows((rows) => [...rows, varValue]);
          console.log("updated data :" + JSON.stringify(rows) +"\n ")
          }
        });
  */

    socketVar.on('new-record', async (response) => {
      if (response.variableid === variable_id) {
        console.log("variable_id:" + variable_id + "\n ")
        if (rows.includes(response)) {
          return;
        } else {
          response.id = uuidv4();
          setRows(rows => [...rows, response]);
        }
      }
    })
  };

  const handleChange = (event) => {
    setRange(event.target.value);
  };

  const getVariable = async () => {
    await axios
      .get(apiKey + "variable/item/" + variable_id)
      .then(async (response) => {
        setVariable(response.data);
        let variableData = response.data;
        setName(variableData.variableName);
        setColor(variableData.color);
        setShowavg(variableData.calcavg)
        console.log("variableData - " + variableData);
        console.log(apiKey + "variable/item/" + variable_id);
      })
      .catch((error) => { });
  };

  const parse = (response) => {
    if (variable.formula != "") {
      let formula = variable.formula;
      let fieldData = response.fields.filter(x => x.name === formula);
      let pData = { timestamp: response.timestamp, name: fieldData[0].name, value: fieldData[0].value };
      return pData;
    }
    return "";
  };

  const getTrendsData = async (from, to) => {
    setRows([]);
    if (from != '' && to != '') {
      let url = apiKey + "variablevalues/trends/" + variable.variableid + "?from=" + from + "&to=" + to
      await axios
        .get(url)
        .then((response) => {
          let varValues = response.data;
          varValues.forEach((element, index) => {
            //varValues[index].name = name;
            varValues[index].id = index;
          });
          setRows(varValues);
        })
        .catch((error) => { });
    }
  }

  const disableRealTime = (event) => {
    setLive(false);
    if (socketVar != null)
      socketVar.off('new-record');
  };

  const handleSubmit = async () => {
    setRows([]);
    disableRealTime();
    clearInterval(timeout.current);
    let from_date = new Date(fromDate).toISOString();
    let to_date = new Date(toDate).toISOString();
    let from = dayjs(from_date).format("YYYY-MM-DD HH:mm:ss")
    let to = dayjs(to_date).format("YYYY-MM-DD HH:mm:ss");
    await getTrendsData(from_date, to_date);
  };

  const handleRealTimeSubmit = () => {
    setRows([]);
    setLive(true);
  };

  const EnableRealTime = async () => {
    if (live) {
      //timeout.current = setInterval(FetchRealTimeData, 3000);
      FetchRealTimeData();
    }
    else {
      if (socketVar !== null)
        socketVar.off('new-record');
      clearInterval(timeout.current);
    }
  };


  useEffect(() => {
    try {
      EnableRealTime();
    } catch (error) {
      console.error("Error updating chart values:", error);
    }
  }, [live]);

  useEffect(() => {
    console.log("live:" + live);
    //const socket = io.connect(apiKey,{ query: "deviceid="+variable_id }); 
    const socket = io.connect(apiKey + "variables");
    setSocketVar(socket);
    getVariable();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };

  }, []);

  const toggleViewType = () => {
    setViewType((prevType) => (prevType === "grid" ? "list" : "grid"));
  };

  const handleSearch = (searchText) => {
    // Handle search logic here
    console.log("Search for:", searchText);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddVariable = () => {
    // Handle adding variable action
    console.log("Add Variable clicked");
    handleClose(); // Close the menu after clicking on an item
  };
  const handleUpdateSf = async(e) => {
    try{
    if (e.target.value !== '' && eval(e.target.value))
        setSf(e.target.value)
  } catch (error) {

  }
    }

  const handleUpdate = async () => {
    setHidden(!hidden)
    let variableObject = {
      color: colorPicker,
      scale: sf
    };
    await handleUpdateVariable(variableObject);
  }

  const handleUpdatescale = async () => {
    let variableObject = {
      color: colorPicker,
      scale: sf
    };
    await handleUpdateVariable(variableObject);
  }

  const handleUpdateVariable = async (variableObject) => {
    let url = apiKey + "variable/update/" + variable_id;
    await axios
      .put(url, variableObject)
      .then(async (response) => {
        let variableData = response.data;
        setColor(variableData.color);
        setSf(variableData.scale);
      })
      .catch((error) => { });
  }

  const handleupdatevariable = async (event) => {
    setColor(event.hex);
  };

  return (
    <>
      <CardTitleBar title={
        <>
          <Tooltip title="Back">
            <IconButton
              edge="end"
              aria-label="menu"
              sx={{
                p: 0,
                color: "white",
              }}
              size="small"
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon sx={{ margin: "-3px 4px 0px" }} />
            </IconButton>
          </Tooltip>
          Variable Details
        </>
      } />
      <CardLayout title={"Variable Details"}>
        <Grid container spacing={2} my={0.1}>
          <Grid item xs={3}>
            <Box>
              <Item>
                <div className="container">
                  {hidden && (
                    <div>
                      <SketchPicker
                        styles={pickerStyle}
                        color={colorPicker}
                        backgroundColor={colorPicker}
                        onChange={handleupdatevariable}
                      />  
                <CancelOutlinedIcon onClick={handleUpdate} style={{ fontSize: 20, color:'red', cursor:'pointer', position: "absolute",top: "208px",left: "625px",zIndex: 10}} />
                    </div>
                  )}
                </div>
                <List
                  sx={{
                    // background: `linear-gradient(45deg, #FF9800 30%, #FFC107 90%)`,

                    background: colorPicker,
                    py: 3
                  }}
                >
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 25,

                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ color: "#fff" }} />

                    <span sx={{ color: "black", fontWeight: 700 }} >{variable.variablename}</span>
                    <IconButton edge="end" aria-label="edit" color="white">
                      <EditIcon
                        onClick={() => setHidden(!hidden)}
                        sx={{ color: "white" }}
                      />
                    </IconButton>

                  </ListItem>
                </List>

                <Divider />
                <List>
                  <ListSubheader
                    sx={{ textAlign: "left", fontSize: 16, fontWeight: 600 }}
                    component="div"
                    id="nested-list-subheader"
                  >
                    Description
                  </ListSubheader>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 16
                    }}
                  >
                    {variable.description}
                    <ContentPasteIcon style={{ fontSize: 16 }} />
                  </ListItem>
                  <Divider />
                  <ListSubheader
                    sx={{ textAlign: "left", fontSize: 16, fontWeight: 600 }}
                    component="div"
                    id="nested-list-subheader"
                  >
                    API Label
                  </ListSubheader>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 16
                    }}
                  >
                    {variable.variablename}
                    <ContentPasteIcon style={{ fontSize: 16 }} />
                  </ListItem>

                  <Divider />
                  <ListSubheader
                    sx={{ textAlign: "left", fontSize: 16, fontWeight: 600 }}
                    component="div"
                    id="nested-list-subheader"
                  >
                    Expression
                  </ListSubheader>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 16
                    }}
                  >
                    {variable.formula}
                    <ContentPasteIcon style={{ fontSize: 16 }} />
                  </ListItem>
                  <Divider />
                  <ListSubheader
                    sx={{ textAlign: "left", fontSize: 16, fontWeight: 600 }}
                    component="div"
                    id="nested-list-subheader"
                  >
                    Unit
                  </ListSubheader>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 16
                    }}
                  >
                    <InputBase
                      id="standard-basic"
                      label="Unit"
                      variant="standard"
                      placeholder="Unit"
                    >
                      {variable.unit}
                    </InputBase>
                    <ContentPasteIcon style={{ fontSize: 16 }} />
                  </ListItem>
                  <Divider />
                  <ListSubheader
                    sx={{ textAlign: "left", fontSize: 16, fontWeight: 600 }}
                    component="div"
                    id="nested-list-subheader"
                  >
                    Scale Factor
                  </ListSubheader>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <InputBase
                      id="standard-basic"
                      label={sf}
                      variant="standard"
                      placeholder={sf}
                      inputProps={{ "aria-label": " " }}
                      onChange={handleUpdateSf}
                    >{sf}
                    </InputBase>
                    <SaveOutlinedIcon style={{ fontSize: 18,cursor:'pointer' }} onClick={handleUpdatescale} />
                  </ListItem>
                  <Divider />
                  <ListSubheader
                    sx={{ textAlign: "left", fontSize: 16, fontWeight: 600 }}
                    component="div"
                    id="nested-list-subheader"
                  >
                    Last activity
                  </ListSubheader>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 16
                    }}
                  >
                    {variable.updatedAt}
                  </ListItem>
                </List>
              </Item>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Card sx={{ px: 3, py: 1 }}>
              <Box>
                {/*<Card
                  sx={{
                    p: 2,
                    background: `linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)`,
                    color: "#fff",
                  }}
                >
                  <Typography sx={{ fontSize: "1.3rem" }}>{`${rows?.length} ${
                    rows?.length === 1 ? "Variable" : "Variables"
                  }`}</Typography>
                </Card>
                */}
                <Grid container spacing={2} my={2} alignItems={"center"}>
                  <Grid xs={3} item>
                    {" "}
                    <FormControl fullWidth size="small">
                      { /*
                    <TextField
                        size="small"
                        id="from"
                        name="from"
                        type="datetime-local" value={fromDate}
                        inputProps={{ step: 1 }}
                        onChange={
                          (e) =>
                            setFromDate(e.target.value)
                        }
                      /> */}

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker fullWidth id="from" label="From Date"
                          name="from"
                          timeSteps={{ minutes: 15 }} slotProps={{ textField: { size: 'small' } }}
                          onChange={
                            (e) => {
                              console.log(JSON.stringify(e));
                              setFromDate(e);
                            }
                          }
                        />
                      </LocalizationProvider>

                    </FormControl>
                  </Grid>
                  <Grid xs={3} item>
                    {" "}
                    <FormControl fullWidth size="small">
                      { /*
                    <TextField
                        size="small"
                        id="to"
                        name="to"
                        type="datetime-local" value={toDate}
                        inputProps={{ step: 1 }} onChange={
                          (e) =>
                            setToDate(e.target.value)}
                      />
*/}
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker fullWidth id="to" label="To Date"
                          name="to"
                          timeSteps={{ minutes: 15 }} slotProps={{ textField: { size: 'small' } }} onChange={
                            (e) => {
                              console.log(JSON.stringify(e));
                              setToDate(e);
                            }
                          } />
                      </LocalizationProvider>

                    </FormControl>
                  </Grid>
                  <Grid xs={6} item>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      sx={{ background: "rgba(0, 0, 0, 0.6)" }}
                    >
                      Submit
                    </Button>
                    {variable.calcavg && (

                      <FormControlLabel sx={{ ml: 2 }}
                        control={
                          <Checkbox
                            id="avg"
                            name="avg"
                            defaultChecked={variable.calcavg}
                            onChange={(event) => setShowavg(event.target.checked)}
                          />
                        }
                        label="Show Average"
                      />

                    )}

                    {!live && (
                      <>
                        <Tooltip title="Enable RealTime">
                          <IconButton>
                            <PlayArrowIcon onClick={handleRealTimeSubmit} />
                          </IconButton>
                        </Tooltip>

                      </>)}
                    {live && (

                      <Tooltip title="Disable Real-Time">
                        <IconButton size="small" sx={{
                          color: "black",
                        }}>
                          <PauseIcon onClick={disableRealTime} />
                        </IconButton>
                      </Tooltip>

                    )}
                  </Grid>

                </Grid>

                <div style={{ width: "100%", height: "300px" }}>
                  <LineChart
                    series={
                      showavg ? ([
                        {
                          label: "Average",
                          data: rows.map(x => eval(sf) * parseFloat(x.avg).toFixed(2)),
                        },
                        {
                          label: "Instant",
                          data: rows.map(x => eval(sf) * parseFloat(x.value).toFixed(2)),
                        }
                      ]
                      ) :
                        ([
                          {
                            label: "Instant",
                            data: rows.map(x => eval(sf) * parseFloat(x.value).toFixed(2)),
                          }]
                        )
                    }
                    xAxis={ live === true ? 
                      [{
                        data:    rows.map(x => {
                          let itemDate = new Date(x.timestamp);
                          itemDate.setHours(itemDate.getHours() - 5);
                          itemDate.setMinutes(itemDate.getMinutes() - 30);
                          return itemDate;
                        }),
                        tickInterval:  rows.map(x => {
                          let itemDate = new Date(x.timestamp);
                          itemDate.setHours(itemDate.getHours() - 5);
                          itemDate.setMinutes(itemDate.getMinutes() - 30);
                          return itemDate;
                        }),
                        scaleType: "time",
                        valueFormatter: (x) => dayjs(x).format("HH:mm:ss"),
                        label: "Date",
                      }] : [{
                        data:  rows.map(x => x.blockno) ,
                        tickInterval: rows.map(x => x.blockno) ,
                        label: "Block No",
                      }]}
                  />
                  
                </div>
                {/* <Grid container spacing={2} mb={2}>
                  <Grid item xs={10}>
                    <SearchBar
                      onChange={(searchText) =>
                        console.log("Search text:", searchText)
                      }
                      onRequestSearch={handleSearch}
                      placeholder="Search..."
                    />
                  </Grid>
                  <Grid item xs={2} textAlign={"right"}>
                    <Button
                      onClick={toggleViewType}
                      variant="outlined"
                      size="small"
                    >
                      {viewType === "list" ? (
                        <ViewListIcon sx={{ fontSize: 30 }} />
                      ) : (
                        <ViewModuleIcon sx={{ fontSize: 30 }} />
                      )}
                    </Button>
                  </Grid>
                      </Grid>*/}

                  <DataGrid autoHeight
                    getRowClassName={getRowClassName}
                    rows={rows}
                    getRowId={(row) => row.id}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 3,
                        },
                      },
                      columns: {
                        columnVisibilityModel: {
                          // Hide the 'id' column
                          id: false,
                        },
                      },
                      sorting: {
                        sortModel: [{ field: 'timestamp', sort: 'desc' }],
                      }
                    }}
                    pageSizeOptions={[3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]}
                    slots={{ toolbar: GridToolbar }}
                    components={{
                      NoRowsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                          No rows in DataGrid
                        </Stack>
                      ),
                    }}
                    //slots={{ noRowsOverlay: CustomNoRowsOverlay }}
                    sx={{
                      '--DataGrid-overlayHeight': '130px' }}

                  />
                
                <br />
                {/*<Box display="flex" alignItems="center" justifyContent="center">
                  <Divider sx={{ width: "100%" }}>
                    <Button onClick={handleClick} startIcon={<AddIcon />}>
                      Add Variable
                    </Button>
                  </Divider>

                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                  >
                    <List>
                      <MenuItem onClick={handleClose}>
                        <FunctionsIcon sx={{ color: "red", marginRight: 1 }} />
                        Raw
                      </MenuItem>
                      <MenuItem onClick={handleAddVariable}>
                        <SignalCellularAltIcon
                          sx={{ color: "green", marginRight: 1 }}
                        />
                        Synthetic
                      </MenuItem>
                    </List>
                  </Menu>
                  </Box>*/}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};

export default VariableDetails;
