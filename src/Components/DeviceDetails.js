import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WorkIcon from "@mui/icons-material/Work";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import * as math from "mathjs";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridToolbar, GridRow, GridRowProps } from "@mui/x-data-grid";
import { Close } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { saveAs } from 'file-saver';
import dayjs from "dayjs";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
  Box,
  Switch,
  Grid,
  Button,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  DialogContent,
  DialogActions,
  Dialog,
  styled,
  InputBase,
  Fab,
  Link,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,

} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FunctionsIcon from "@mui/icons-material/Functions";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import TablePagination from "@mui/material/TablePagination";
import "./Devices/devices.css";
import CardTitleBar from "../common/CardTitleBar";
import CardLayout from "../common/CardLayout";
import useDialogActions from "../common/useDialogActions";
import CenterDialog from "../common/CenterDialog";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const ListItemData = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),

}));

const timezoneList = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "user",
    label: "User",
  },
];
let nextId = 0;
const DeviceDetails = () => {
  const navigate = useNavigate();
  const [delopen, setDelOpen] = useState(false);
  const [cerTitle, setCerTitle] = React.useState("");
  const [cerText, setCerText] = React.useState("");
  const [ceropen, setCerOpen] = useState(false);
  const [conditionStatus, setConditionStatus] = useState(false);
  const [page, setPage] = React.useState(2);
  const [expression, setExpression] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openVarForm, setOpenVarForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { deviceId } = useParams();
  const [expressionNames, setexpressionNames] = useState([]);
  let selectedDeviceId =
    deviceId != null || deviceId != undefined
      ? deviceId
      : JSON.parse(localStorage.getItem("selectedDeviceId"));

  const [devices, setDevices] = useState([]);
  const [variable, setVariable] = useState([]);
  const [withoutVariable, setwithoutVariable] = useState([]);
  const [params, setParams] = useState([]);
  const [fixedparams, setFixedParams] = useState(
      {
        fields:[
          {name : "DC",value:0},
          {name : "SG_Current",value:0},
          {name : "SG_Next_1",value:0},
          {name : "SG_Next_2",value:0},
          {name : "SG_Next_3",value:0},
          {name : "SG_Next_4",value:0},
          {name : "BlockNo",value:0}
        ]
      });
  const vairableTypeList = [
    {
      value: "Static",
      label: "Static",
    },
    {
      value: "Synthetic",
      label: "Synthetic",
    }
  ];
  const [selectedVariable, setSelectedVariable] = useState({});
  const [editVariable, seteditVariable] = useState(false);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const { addopen, openDialog, closeDialog } = useDialogActions();

  const goRouteId = (variableid) => {
    localStorage.setItem("selectedVariableId", variableid);
    navigate(`/VariableDetails/${variableid}`);
  };

  const getDevice = async () => {
    try {
      const deviceResponse = await axios.get(
        apiKey + "device/item/" + selectedDeviceId
      ).then(response =>{
        console.log(response.data, "deviceResponse");
        setDevices(response.data);
      });



      const variableResponse = await axios.get(
        apiKey + "variable/list/" + selectedDeviceId
      ).then(response =>{
        // let variableUnIncludeArr = response.data.filter(str => !str.formula.includes("variable_"));
        // setwithoutVariable(variableUnIncludeArr);
        setVariable(response.data);
      });
 

      const instantResponse = await axios.get(
        apiKey + "instant/list/" + selectedDeviceId
      ).then(response =>{
        console.log(response.data, "instantResponse");
        setParams(response.data[0]);
      });

    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };

  useEffect(() => {
    getDevice();
  }, []);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleFieldClick = (event) => {
    setErrorMsg("");
    let expValue;
    if (expression === "") {
      expValue = event.target.textContent;
    } else {
      expValue = expression + "" + event.target.textContent;
      //expValue = event.target.textContent;

      setexpressionNames([
        ...expressionNames,
        { id: nextId++, name: expValue },
      ]);
    }
    setExpression(expValue);

    let modifiedexp = expValue;
    params.fields.forEach((element) => {
      if (modifiedexp.includes(element.name)) {
        modifiedexp = modifiedexp.replaceAll(element.name, 1);
      }
    });

    try {
      math.parse(modifiedexp);
      setConditionStatus(true);
      setErrorMsg("Valid Expression");
    } catch (error) {
      setConditionStatus(false);
      setErrorMsg("Invalid Expression");
      console.log(error);
    }
  };

  const handleExpressionClick = (event) => {
    let expValue;
    expValue = event.target.value;
    setExpression(expValue);
    let modifiedexp = expValue;
    params.fields.forEach((element) => {
      if (modifiedexp.includes(element.name)) {
        modifiedexp = modifiedexp.replaceAll(element.name, 1);
      }
    });

    try {
      math.parse(modifiedexp);
      setErrorMsg("Valid Expression");
      setConditionStatus(true);
    } catch (error) {
      setErrorMsg("Invalid Expression");
      console.log(error);
      setConditionStatus(false);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = (event) => {
    setExpression("");
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleCellClick = (params, event) => {
    setExpression("");
    setErrorMsg("");
    let variableSelected = params.row;
    setSelectedVariable(variableSelected);
    //console.log('Cell clicked:', params.field, params.value);
    if (params.field === "actions") {
      seteditVariable(true);
      setExpression(variableSelected.formula);
    }
    if (params.field === "actions2") {
      setDelOpen(true);
    }
  };

  const handleEditFormSubmit = async (e) => {
    if (e != null || e != undefined) {
      if(selectedDeviceId != "" && e.target.form.name.value !== "" && e.target.form.description.value !== "" && e.target.form.expressionfield.value !== "" && e.target.form.variabletype.value !== "" ){
      let condition = e.target.form.expressionfield.value;
      let variableObject = {
        deviceid: selectedDeviceId,
        variablename: e.target.form.name.value,
        description: e.target.form.description.value,
        scale: e.target.form.scale.value,
        formula: condition,
        variabletype: e.target.form.variabletype.value,
        active : e.target.form.active.checked,
        calcavg : e.target.form.calcavg.checked
      };
      console.log(JSON.stringify(variableObject));
      await axios.put(apiKey + "variable/update/" + selectedVariable.variableid,variableObject)
        .then((response) => {
          // 1. Find the todo with the provided id
          const currentTodoIndex = variable.findIndex((item) => item.variableid === selectedVariable.variableid);
          // 2. Mark the todo as complete
          const updatedTodo = Object.assign({}, variable[currentTodoIndex]);
          updatedTodo.variablename = response.data.variablename;
          updatedTodo.variabletype = response.data.variabletype;
          updatedTodo.scale = response.data.scale;
          updatedTodo.description = response.data.description;
          updatedTodo.calcavg = response.data.calcavg;
          updatedTodo.formula = response.data.formula;
          updatedTodo.active = response.data.active;
          updatedTodo.updatedAt = response.data.updatedAt;
          updatedTodo.createdAt = response.data.createdAt;

          // 3. Update the todo list with the updated todo
          const newTodos = variable.slice();
          newTodos[currentTodoIndex] = updatedTodo;
          setVariable(newTodos);
          seteditVariable(false);
          setExpression("");
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
         });
    }
  }
  };

  const handleDelete = (e) => {
    if (selectedVariable != null || selectedVariable != undefined) {
      const deleteVariableData = async () => {
        await axios
          .delete(apiKey + "variable/remove/" + selectedVariable.variableid)
          .then((response) => {
            setDelOpen(false);
            const newvariables = variable.filter(
              (item) => item.variableid !== selectedVariable.variableid
            );
            setVariable(newvariables);
          })
          .catch((error) => { });
      };
      deleteVariableData();
    }
  };
  const handleEditClose = () => {
    seteditVariable(false);
  };
  const handleDeleteClose = () => {
    setDelOpen(false);
  };
  const handleCerClose = () => {
    setCerOpen(false);
  };

  const handleaAddVariable = () => {
    setExpression("");
    setErrorMsg("");
    setOpenVarForm(true);
  };
  const handleAddVarClose = () => {
    setOpenVarForm(false);
    setExpression("");
  };
  const handleaddForm = async (e) => {
    if (e != null || e != undefined) {
      if(selectedDeviceId != "" && e.target.form.name.value !== "" && e.target.form.description.value !== "" && e.target.form.expressionfield.value !== "" && e.target.form.variabletype.value !== "" ){
    let condition = e.target.form.expressionfield.value;
    let variableObject = {
      deviceid: selectedDeviceId,
      active: true,
      variablename: e.target.form.name.value,
      description: e.target.form.description.value,
      formula: condition,
      calcavg:e.target.form.calcavg.checked,
      variabletype: e.target.form.variabletype.value,
      scale: e.target.form.scale.value,
    };
    await axios
      .post(apiKey + "variable/create", variableObject)
      .then((response) => {
        setVariable((prevState) => [
          ...prevState,
          {
            id: variable.length + 1,
            deviceid: response.data.deviceid,
            variablename: response.data.variablename,
            variabletype: response.data.variabletype,
            description: response.data.description,
            scale: response.data.scale,
            formula: response.data.formula,
            active: response.data.active,
            updatedAt:response.data.updatedAt,
            createdAt:response.data.createdAt,
            variableid:response.data.variableid
          },
        ]);
        setOpenVarForm(false);
        setExpression("");
      })
      .catch((error) => { });
    }
  }
  };

  if (!devices || !variable) {
    return <div>Loading...</div>;
  }
  const columns = [
    { field: "deviceid", headerName: "Device ID", width: 150,flex:1},
    { field: "devicename", headerName: "Device Name", width: 150 ,flex:1, editable: false},
    { field: "description", headerName: "Description", width: 200 ,flex:1, editable: false},
    { field: "createdAt", 
    headerName: "Created At", 
    width: 150, editable: false,flex:1,
    valueFormatter: params => 
      dayjs(params?.value).format("YYYY-MM-DD HH:mm:ss")
   },
    { field: "updatedAt", headerName: "Updated At",flex:1, width: 150, editable: false,
     },
    {
      field: "active", headerName: "Active", width: 80,flex:1, editable: false,
      renderCell: (params) => {
        return (
          <Chip variant="outlined" size="small" {...getStatusChipProps(params)} />
        );
      },
    },
    {
      field: "location",
      headerName: "Location",
      width: 150, editable: false,flex:1,
      renderCell: (params) => {
        const { address } = params?.row;
        if (address) {
          const { longitude, latitude, location } = address;
          return (
            <div>
              <div>Longitude: {longitude}</div>
              <div>Latitude: {latitude}</div>
              <div>Location: {location}</div>
            </div>
          );
        }
        return "";
      },
    },
    {
      field: "keys",
      headerName: "Keys",
      width: 150, editable: false,flex:1,
      renderCell: (params) => {
        const { keys, certificateid, devicename } = params?.row;
        if (keys) {
          const { private_key, public_key } = keys;
          return (<div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link
                sx={{ ml: 1, cursor: "pointer" }}
                onClick={() => {
                  setCerTitle("Private Key");
                  setCerText(private_key);
                  setCerOpen(true);
                }
                }
              >
                Private Key
              </Link>
              <Tooltip title="Download Private Key">
              <CloudDownloadOutlinedIcon sx={{ ml: 1, cursor: "pointer" }} onClick={() => {
                const file = new Blob([private_key], { type: 'text/plain;charset=utf-8' });
                if (certificateid)
                  saveAs(file, devicename+'-'+certificateid + '-private.pem.key');
              }} />
              </Tooltip>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}><Link
              sx={{ ml: 1, cursor: "pointer" }}
              onClick={() => {
                setCerTitle("Public Key");
                setCerText(public_key);
                setCerOpen(true);
              }
              }
            >
              Public Key
            </Link>
            <Tooltip title="Download Public Key">
              <CloudDownloadOutlinedIcon sx={{ ml: 1, cursor: "pointer" }} onClick={() => {
                const file = new Blob([public_key], { type: 'text/plain;charset=utf-8' });
                if (certificateid)
                  saveAs(file, devicename+'-'+certificateid + '-public.pem.key');
              }} />
                      </Tooltip>
            </div>
          </div>
          );
        }
        return "";
      }
    },
    { field: "certificateid", headerName: "Certificate ID", width: 150, editable: false,flex:1 },
    {
      field: "certificate", headerName: "Certificate", width: 150, editable: false,flex:1,
      renderCell: (params) => {
        const { certificateid, devicename } = params?.row;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link
              sx={{ ml: 1, cursor: "pointer" }}
              onClick={() => {
                setCerTitle("Certificate");
                setCerText(params.value);
                setCerOpen(true);
              }
              }
            >
              Certificate
            </Link>
            <Tooltip title="Download Certificate">
            <CloudDownloadOutlinedIcon sx={{ ml: 1, cursor: "pointer" }} onClick={() => {
              const file = new Blob([params.value], { type: 'text/plain;charset=utf-8' });
              if (certificateid)
                saveAs(file, devicename+'-'+certificateid + '-certificate.pem.crt');
            }} />
             </Tooltip>
          </div>
        );
      }
    }
  ];

  const rows = [
    {
      id: devices?.id || "",
      ...devices,
    },
  ];

  const handleDeleteExpression = (chipToDelete) => () => {
    console.log(chipToDelete, 'praveen');
    setexpressionNames((chips) => chips.filter((chip) => chip.key !== chipToDelete.key));
  };

  function getStatusChipProps(params) {
    if (params.value === true) {
      return {
        // icon: <WarningIcon style={{ fill: red[500] }} />,
        label: "Active",
        style: {
          borderColor: "green",
        },
      };
    } else {
      return {
        label: "InActive",
        style: {
          borderColor: "red",
        },
      };
    }
  }

  return (
    <div>
      <CardTitleBar title={
        <>
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
          Device Details
        </>
      } />
      <CardLayout title={"Device Details"}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooterPagination={true}
          disableRowSelectionOnClick
        />

        <Card
          sx={{
            mt: 3,
            background: "#007c89",
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            p: 1.5,
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: "1.3rem" }}>
            Variable Details
            <Button
              sx={{ mx: 2 }}
              onClick={handleaAddVariable}
              aria-label="Add"
              className="add_from_section float-right"
              size="medium"
            >
              <AddCircleOutlineRoundedIcon />
              Add Variable
            </Button>
          </Typography>
        </Card>
        <DataGrid
          rows={variable}
          columns={[
            {
              field: "variablename",
              headerName: "Variable Name",
              width: 200,
              editable: false,
              flex:1,
              renderCell: (params) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CloudUploadOutlinedIcon />
                  <Link
                    sx={{ ml: 1, cursor: "pointer" }}
                    onClick={() => goRouteId(params?.row?.variableid)}
                  >
                    {params.value}
                  </Link>
                </div>
              ),
            },
            {
              field: "variableid",
              headerName: "Variable Id",
              width: 150,
              editable: false,
              flex:1,
            },
            {
              field: "variabletype",
              headerName: "Variable Type",
              width: 150,
              editable: false,
              flex:1,
            },
            {
              field: "scale",
              headerName: "Scale Factor",
              width: 150,
              editable: false,
              flex:1,
            },
            {
              field: "createdAt",
              headerName: "Created At",
              width: 250,
              editable: false,
              flex:1,
              valueFormatter: params => 
                dayjs(params?.value).format("YYYY-MM-DD HH:mm:ss")
            },

            {
              field: "updatedAt",
              headerName: "Updated At",
              width: 250,
              editable: false,
              flex:1,
              valueFormatter: params => 
                dayjs(params?.value).format("YYYY-MM-DD HH:mm:ss")
            },
            {
              field: "actions",
              numeric: true,
              editable: false,
              disablePadding: false,
              headerName: "",
              width: 50,
             
              renderCell: () => {
                return (
                  <CreateIcon
                    onClick={(event) => {
                      //handleClickEdit(event);
                    }}
                  />
                );
              },
            },
            {
              field: "actions2",
              numeric: true,
              editable: false,
              disablePadding: false,
              headerName: "",
              width: 50,
             
              renderCell: () => {
                return (
                  <DeleteIcon
                    onClick={(event) => {
                      // handleClickDelete(event);
                    }}
                  />
                );
              },
            },
          ]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
            columns: {
              columnVisibilityModel: {
                // Hide the 'id' column
                id: false,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[5, 10, 25]}
          onPageChange={handleChangePage}
          rowCount={variable.length}
          rowsPerPage={rowsPerPage}
          onCellClick={handleCellClick}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {/*<List>
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
            <MenuItem onClick={handleClose}>
              <FunctionsIcon sx={{ color: "red" }} />
              Raw
          </MenuItem>
            <MenuItem onClick={handleaAddVariable}>
              <SignalCellularAltIcon sx={{ color: "green" }} />
              Synthetic
            </MenuItem>
          </Menu>
          </List>*/}
      </CardLayout>
   {/*** Add variable */}
      <BootstrapDialog
        sx={{ p: 1 }}
        aria-labelledby="customized-dialog-title"
        open={openVarForm}
        fullWidth
      >
        <DialogTitle
          sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}
          id="customized-dialog-title"
        >
          Add Variable
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleAddVarClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#fff",
          }}
        >
          <CloseIcon />
        </IconButton>
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <DialogContent dividers>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={6}>
                  <Typography>
                    Enter your variable expression.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={2}
                    minRows={2}
                    name="expressionfield"
                    defaultValue={expression}
                    value={expression}
                    onChange={handleExpressionClick}
                  />
                  <Typography>{errorMsg}</Typography>

                 <FormControlLabel control={<Checkbox  name="calcavg"  />} label="Calculate Average and Save" />
                  <Typography>Select the Device parameter</Typography>
                  <Paper style={{ maxHeight: 150, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {params?.fields?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={field.name} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
                  <Typography>Select the Device Variable</Typography>
                  <Paper style={{ maxHeight: 150, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {variable?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={"variable_" +field.variablename} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                {/*<Grid item xs={12} md={12} sx={{height: 350}}>
                <Paper sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        listStyle: "none",
                        p: 0.5,
                        m: 0,
                      }}>
                <Paper
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        listStyle: "none",
                        p: 0.5,
                        m: 0,
                        height:0
                      }}
                      component="ul"
                    >
                      {expressionNames.map((data) => {
                        return (
                          <ListItemData key={data.key}>
                            <Chip label={data.name} />
                          </ListItemData>
                        );
                      })}
                    </Paper>
                </Paper>
                    
                    </Grid>*/}
                <Grid item xs={6} md={6}>
                  <Typography>Name</Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={1}
                    minRows={1}
                    id="name"
                    name="name"
                    label="Name"
                  />
                  <Typography>Description</Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={1}
                    minRows={1}
                    id="description"
                    name="description"
                    label="Description"
                  />
                   <Typography>Scale Factor</Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={1}
                    minRows={1}
                    id="scale"
                    name="scale"
                    label="Scale Factor"
                  />
                  <Typography>Variable Type</Typography>
                  <TextField fullWidth
                  id="variabletype"
                  name="variabletype"
                  select
                >
                  {vairableTypeList.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography>Select the DC/SG parameter</Typography>
                  <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {fixedparams?.fields?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={field.name} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
         
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button className="action-cancel-btn" onClick={handleAddVarClose}>
              Cancel
            </Button>
            <Button
              className="share-device-btn"
              autoFocus
              onClick={handleaddForm}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </BootstrapDialog>
      {/**    Delete conform  */}
      <Dialog open={delopen} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}>
          Confirmation Alert
        </DialogTitle>
        <Box position="absolute" top={0} right={0}>
          <IconButton>
            <Close onClick={handleDeleteClose} />
          </IconButton>
        </Box>
        <DialogContent>
          <Typography>Sure you want Delete? </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            className="action-cancel-btn"
            variant="contained"
            onClick={handleDeleteClose}
          >
            Cancel
          </Button>
          <Button
            className="share-device-btn"
            variant="contained"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/*** Edit variable */}

      <BootstrapDialog
        sx={{ p: 1 }}
        aria-labelledby="customized-dialog-title"
        open={editVariable}
        fullWidth
      >
        <DialogTitle
          sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}
          id="customized-dialog-title"
        >
          Edit Variable
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleEditClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#fff",
          }}
        >
          <CloseIcon />
        </IconButton>
        <form autoComplete="off">
          <DialogContent dividers>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={6}>
                  <Typography>
                    Enter your variable expression.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={2}
                    minRows={2}
                    name="expressionfield"
                    defaultValue={expression}
                    value={expression}
                    onChange={handleExpressionClick}
                  // sx={{ display: "none" }}
                  />
                                    <Typography>{errorMsg}</Typography>
                                    <FormControlLabel control={<Checkbox  name="calcavg" defaultChecked={selectedVariable.calcavg} />} label="Calculate Average and Save" />
                  {/*  <Grid item xs={12} md={12} sx={{height: 350}}>
                  <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        
        '& > :not(style)': {
          m: 1,
          width: 280,
          height: 480
        },
      }}
    >
                    <Paper elevation={3}
                      sx={{
                        display: "flex",

                        flexWrap: "wrap",
                        listStyle: "none",
                        justifyContent: 'space-evenly',
                        p: 0.5,
                        m: 0,
                        overflow: 'scroll',
                       

                      }}
                      component="ul"
                    >
                      {expressionNames.map((data) => {
                        return (
                          <ListItemData key={data.key}>
                            <Chip label={data.name} 
                             onDelete={data.label === data.name ? undefined : handleDeleteExpression(data)}
                            />
                            
                          </ListItemData>
                        );
                      })}
                    </Paper>
                    </Box>
                  </Grid>*/}
                  <Typography>Select the Device parameter</Typography>
                  <Paper style={{ maxHeight: 150, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {params?.fields?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={field.name} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
                  <Typography>Select the Device Variable</Typography>
                  <Paper style={{ maxHeight: 150, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                    {variable?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={"variable_" +field.variablename} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={6}>
                  <Typography>Name</Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={1}
                    minRows={1}
                    id="name"
                    name="name"
                    // label="Name"
                    defaultValue={selectedVariable.variablename}
                   // sx={{ margin: 1 }}
                  />
                  <Typography>Description</Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={1}
                    minRows={1}
                    id="description"
                    name="description"
                    // label="Description"
                    defaultValue={selectedVariable.description}
                    //sx={{ margin: 1 }}
                  />
                   <Typography>Scale Factor</Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={1}
                    minRows={1}
                    id="scale"
                    name="scale"
                    defaultValue={selectedVariable.scale}
                  />
                      <Typography>Change the Status</Typography>
                <Switch
                  id="active"
                  name="active"
                  sx={{ colors: "#007c89" }}
                  defaultChecked={selectedVariable.active}
                />

                   <Typography>Variable Type</Typography>
                  <TextField fullWidth
                  id="variabletype"
                  name="variabletype"
                  defaultValue={selectedVariable.variabletype}
                  //sx={{ margin: 1 }}
                  select
                >
                  {vairableTypeList.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography>Select the DC/SG parameter</Typography>
                  <Paper style={{ maxHeight: 150, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {fixedparams?.fields?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={field.name} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button className="action-cancel-btn" onClick={handleEditClose}>
              Cancel
            </Button>
            <Button
              className="share-device-btn"
              autoFocus
              onClick={handleEditFormSubmit}
            >
              Update
            </Button>
          </DialogActions>
        </form>
      </BootstrapDialog>

      {/**    certificates popup  */}
      <Dialog open={ceropen} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}>
          {cerTitle}
        </DialogTitle>
        <Box position="absolute" top={0} right={0}>
          <IconButton>
            <Close onClick={handleCerClose} />
          </IconButton>
        </Box>
        <DialogContent>
          <Box sx={{ height: 400, width: "100%" }}>
            <TextField
              fullWidth
              multiline
              maxRows={16}
              minRows={16}
              defaultValue={cerText}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            className="action-cancel-btn"
            variant="contained"
            onClick={handleCerClose}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeviceDetails;
