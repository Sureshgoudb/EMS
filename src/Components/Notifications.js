import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Chip,
  Grid,
  Select,
  Box,
  Fab,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography, Slide
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import { Close } from "@mui/icons-material";
import useForm from "../Hooks/useForm";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import * as math from "mathjs";
import { validator } from "../Helpers/validator";
import CardLayout from "../common/CardLayout";
import useDialogActions from "../common/useDialogActions";
import CardTitleBar from "../common/CardTitleBar";
import NotificationDashboard from './Notifications/NotificationDashboard';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const columns = [
  { field: "id", headerName: "ID", width: 90, hide: true },
  {
    field: "notificationname",
    headerName: "Name",
    width: 250,
    editable: false, flex: 1
  },
  {
    field: "notificationtype",
    headerName: "Type",
    width: 100,
    editable: false, flex: 1
  },
  {
    field: "message",
    headerName: "Message",
    width: 350,
    editable: false, flex: 1
  },
  {
    field: "conditionfield",
    headerName: "Condition",
    width: 150,
    editable: false, flex: 1
  },
  {
    field: "conditionstatus",
    headerName: "Last Triggered",
    width: 150,
    editable: false, flex: 1
  },
  {
    field: "active",
    headerName: "Status",
    width: 250, flex: 1,
    editable: false,
    renderCell: (params) => {
      return (
        <Chip variant="outlined" size="small" {...getStatusChipProps(params)} />
      );
    },
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
];

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

function Notifications() {
  const [fixedparams, setFixedParams] = useState(
    {
      fields: [
        { name: "DC", value: 0 },
        { name: "SG", value: 0 },
        { name: "BlockNo", value: 0 }
      ]
    });
  const { open, openDialog, closeDialog } = useDialogActions();
  const [errorMsg, setErrorMsg] = React.useState("");
  const [notifications, setNotifications] = useState([]);
  const [expression, setExpression] = useState("");
  const [devices, setDevices] = useState([]);
  const [addNotification, setaddNotification] = useState(false);
  const [editNotification, seteditNotification] = useState(false);
  const [delopen, setDelOpen] = useState(false);
  const [selectedNotification, setselectedNotifications] = useState({});
  const [selectedValue, setSelectedValue] = useState("");
  const [variable, setVariable] = useState([]);
  const [withoutVariable, setwithoutVariable] = useState([]);
  const [isAdd, setIsAdd] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const [params, setParams] = useState({
    id: 1,
    variableid: "",
    deviceid: "",
    timestamp: "",
    device: {},
    fields: [
    ],
  });
  const user = useSelector((store) => store.user);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  console.log("store -- " + user);
  console.log("local storage -- " + JSON.parse(localStorage.getItem("user")));
  const customerID =
    user != null || user != undefined
      ? user.customerID
      : JSON.parse(localStorage.getItem("user")).customerID;

  const getNotifications = async () => {
    let url;
    if (user != null) {
      if (user.parentId != null || user.parentId != undefined) {
        url = apiKey + "notification/list/" + customerID
      }
      else {
        url = apiKey + "notification/list/"
      }
    }
    else {
      let localData = JSON.parse(localStorage.getItem("user"));
      if (localData.parentId != null || localData.parentId != undefined) {
        url = apiKey + "notification/list/" + localData.customerID
      }
      else {
        url = apiKey + "notification/list/"
      }
    }
    await axios
      .get(url)
      .then((response) => {
        console.log(response.data);
        setNotifications(response.data);
      })
      .catch((error) => { });
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const getDeviceList = async (add) => {
    let url;
    if (user != null) {
      if (user.parentId != null || user.parentId != undefined) {
        url = apiKey + "device/list/" + user.parentId
      }
      else {
        url = apiKey + "device/list/"
      }
    }
    else {
      let localData = JSON.parse(localStorage.getItem("user"));
      if (localData.parentId != null || localData.parentId != undefined) {
        url = apiKey + "device/list/" + localData.parentId
      }
      else {
        url = apiKey + "device/list/"
      }
    }
    await axios
      .get(url)
      .then(async (response) => {
        setDevices(response.data);
        if (add) setaddNotification(true);
        else seteditNotification(true);
      })
      .catch((error) => { });
  };

  const handleCellClick = (params, event) => {
    let notificationSelected = JSON.stringify(params.row);
    let parsedNotificationSelected = JSON.parse(notificationSelected);
    setselectedNotifications(parsedNotificationSelected);
    //console.log('Cell clicked:', params.field, params.value);
    if (params.field === "actions") {
      setExpression(parsedNotificationSelected.conditionfield);
      getDeviceList(false);
      getParamsForDevice(apiKey + "instant/list/" + parsedNotificationSelected.deviceid);
      setIsAdd(false);

    }
    if (params.field === "actions2") {
      setDelOpen(true);
    }
  };

  const handleaddNotification = async () => {
    setExpression("");
    setErrorMsg("");
    setParams({
      id: 1,
      variableid: "",
      deviceid: "",
      timestamp: "",
      device: {},
      fields: [
      ],
    });
    getDeviceList(true);
    openDialog();
  };
  const handleEditClose = () => {
    seteditNotification(false);
    resetErrors();
  };
  const handleaddNotificationClose = () => {
    setaddNotification(false);
  };
  const handleNotificationUpdate = (e) => {
    console.log("handleUserUpdate" + e);
  };
  const handleFieldClick = (event) => {
    setErrorMsg("");
    let expValue;
    if (expression === "") {
      expValue = event.target.textContent;
    } else {
      expValue = expression + "" + event.target.textContent;
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
      setErrorMsg("Valid Expression");
    } catch (error) {
      setErrorMsg("Invalid Expression");
      console.log(error);
    }
  };
  const conditioncheck = (e) => {
    setErrorMsg("");
    setExpression(e.target.value);
    let modifiedexp = e.target.value;
    params.fields.forEach((element) => {
      if (modifiedexp.includes(element.name)) {
        modifiedexp = modifiedexp.replaceAll(element.name, 1);
      }
    });
    try {
      math.parse(modifiedexp);
      setErrorMsg("Valid Expression");
    } catch (error) {
      setErrorMsg("Invalid Expression");
      console.log(error);
    }

  }
  const [initState, setInitState] = useState({
    notificationname: selectedNotification.notificationname,
    type: selectedNotification.type,
    device: selectedNotification.deviceid,
    message: selectedNotification.message,
    expressionfield: selectedNotification.expressionfield
  });

  useEffect(() => {
    if (isAdd)
      setInitState({
        notificationname: "",
        message: "",
        type: "",
        device: "",
        expressionfield: "",
      });
    else
      setInitState({
        notificationname: selectedNotification.notificationname,
        message: selectedNotification.message,
        type: selectedNotification.type,
        device: selectedNotification.deviceid,
        expressionfield: selectedNotification.expressionfield,
      })
  }, [isAdd])

  const handleaddFormSubmit = async (e) => {
    if ((e != null || e != undefined) && errorMsg === "Valid Expression") {
      if (e.target.form.notificationname.value !== "" && e.target.form.type.value !== "" && e.target.form.expressionfield.value !== "" && e.target.form.device.value !== "" && e.target.form.message.value !== "") {

        let createNotification = {
          notificationname: e.target.form.notificationname.value,
          notificationtype: e.target.form.type.value,
          conditionfield: e.target.form.expressionfield.value,
          deviceid: e.target.form.device.value,
          message: e.target.form.message.value,
          customerid: customerID,
          active: true,
        };
        const addNotification = async () => {
          await axios
            .post(apiKey + "notification/create/", createNotification)
            .then((response) => {
              setNotifications((prevState) => [
                ...prevState,
                {
                  id: notifications.length + 1,
                  notificationname: response.data.notificationname,
                  notificationtype: response.data.notificationtype,
                  conditionfield: response.data.conditionfield,
                  deviceid: response.data.deviceid,
                  message: response.data.message,
                  customerid: response.data.customerid,
                  active: response.data.active,
                },
              ]);
              setaddNotification(false);
              closeDialog();
            })
            .catch((error) => { });
        };
        addNotification();
      }
    }
  };

  const {
    handleChange,
    resetErrors,
    handleBlur,
    handleSubmit,
    state,
    errors,
    countryCode,
  } = useForm({
    initState,
    callback: handleaddFormSubmit,
    validator,
  });

  const handleEditFormSubmit = async (e) => {
    const isValidated = Object.values(errors).every((value) => value === "");
    if ((e != null || e != undefined) && isValidated && errorMsg === "Valid Expression") {
      if (e.target.form.notificationname.value !== "" && e.target.form.type.value !== "" && e.target.form.expressionfield.value !== "" && e.target.form.device.value !== "" && e.target.form.message.value !== "") {
        let updateNotificationData = {
          notificationname: e.target.form.notificationname.value,
          notificationtype: e.target.form.type.value,
          conditionfield: e.target.form.expressionfield.value,
          deviceid: e.target.form.device.value,
          message: e.target.form.message.value,
          customerid: customerID,
          active: e.target.form.active.checked,
        };
        const updateNotification = async () => {
          await axios
            .put(
              apiKey +
              "notification/update/" +
              selectedNotification.notificationid,
              updateNotificationData
            )
            .then((response) => {
              // 1. Find the todo with the provided id
              const currentTodoIndex = notifications.findIndex((notification) => notification.notificationid === selectedNotification.notificationid);
              // 2. Mark the todo as complete
              const updatedTodo = Object.assign({}, notifications[currentTodoIndex]);
              updatedTodo.notificationname = e.target.form.notificationname.value;
              updatedTodo.notificationtype = e.target.form.type.value;
              updatedTodo.conditionfield = e.target.form.expressionfield.value;
              updatedTodo.deviceid = e.target.form.device.value;
              updatedTodo.message = e.target.form.message.value;
              updatedTodo.customerid = customerID;
              updatedTodo.active = e.target.form.active.checked;
              // 3. Update the todo list with the updated todo
              const newTodos = notifications.slice();
              newTodos[currentTodoIndex] = updatedTodo;
              setNotifications(newTodos);
              seteditNotification(false);
            })
            .catch((error) => { });
        };
        updateNotification();
      }
    }
  };
  const handleDelete = (e) => {
    if (selectedNotification != null || selectedNotification != undefined) {
      const deleteNotificationData = async () => {
        await axios
          .delete(apiKey + "notification/remove/" + selectedNotification.notificationid)
          .then((response) => {
            setDelOpen(false);
            const newNotifications = notifications.filter(
              (item) => item.notificationid !== selectedNotification.notificationid
            );
            setNotifications(newNotifications);
          })
          .catch((error) => { });
      };
      deleteNotificationData();
    }
  };
  const handleDeleteClose = () => {
    setDelOpen(false);
  };

  const handleDeviceClick = async (e) => {
    let url = apiKey + "instant/list/" + e.target.value;
    await getParamsForDevice(url);

    const variableResponse = await axios.get(
      apiKey + "variable/list/" + e.target.value
    ).then(response => {
      let variableUnIncludeArr = response.data.filter(str => !str.formula.includes("variable_"));
      setwithoutVariable(variableUnIncludeArr);
      setVariable(response.data);
    });

  };

  const getParamsForDevice = async (url) => {
    await axios
      .get(url)
      .then(async (response) => {
        if (response.data.length > 0) {
          setParams(response.data[0]);
        }
      })
      .catch((error) => { });
  }

  const userTypeList = [
    {
      value: "Admin",
      label: "Admin",
    },
    {
      value: "User",
      label: "User",
    },
  ];
  const notificationTypeList = [
    {
      value: "Email",
      label: "Email",
    },
    {
      value: "SMS",
      label: "SMS",
    },
  ];
  const label = { inputProps: { "aria-label": "Active User" } };


  let isValidForm =
    Object.values(errors).filter((error) => typeof error !== "undefined")
      .length === 0;

  const handleOnChange = (event) => {
    setSelectedValue(event.target.value);
  };


  return (
    <div>
      <CardTitleBar title={"Notifications"} />
      <CardLayout
        title={`${notifications.length} Notifications`}
        action={
          <Box sx={{ gap: 2 }}>

            <Fab
              onClick={() => { handleaddNotification(); setIsAdd(true); }}
              aria-label="add"
              className="add_from_section"
              size="medium"
            >
              <AddIcon className="add_from_Icon" />
            </Fab>
          </Box>
        }
      >
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={notifications}
          columns={columns}
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
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          slotProps={{ toolbar: { showQuickFilter: true } }}
          onCellClick={handleCellClick}
          sx={{ "&, [class^=MuiDataGrid-root ]": { border: "none" } }}
        />
      </CardLayout>


      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={editNotification}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}
          id="customized-dialog-title"
        >
          Update Notification
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => { handleEditClose(); resetErrors(); }}
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
                  <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="notificationname"
                    name="notificationname"
                    label="NotificationName"
                    // value={state.notificationname}
                    type="text"
                    fullWidth
                    variant="standard"
                    onChange={handleChange}
                    error={errors.notificationname ? true : false}
                    helperText={errors.notificationname}
                    onBlur={handleBlur}
                    defaultValue={selectedNotification.notificationname}
                  />
                  <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="message"
                    name="message"
                    label="message"
                    // value={state.message}
                    defaultValue={selectedNotification.message}
                    type="text"
                    fullWidth
                    variant="standard"
                    onChange={handleChange}
                    error={errors.message ? true : false}
                    helperText={errors.message}
                    onBlur={handleBlur}
                  />
                  <TextField
                    margin="dense"
                    fullWidth
                    multiline
                    maxRows={8}
                    minRows={8}
                    name="expressionfield"
                    label="Notification Condition."
                    value={expression}
                    error={!!(errors.expressionfield || errorMsg === "Invalid Expression")}
                    helperText={
                      <>
                        <span>{errors.expressionfield}</span><br />
                        <span>{errorMsg}</span>
                      </>
                    }
                    onChange={(e) => { conditioncheck(e); handleChange(e); }}
                    defaultValue={selectedNotification.conditionfield}
                  />
                  {/* <Typography>{errorMsg}</Typography> */}
                  <Typography>Select the Device Variable</Typography>
                  <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {withoutVariable?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={"variable_" + field.variablename} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={6}>
                  <div>
                    <Typography>Change the Status</Typography>
                    <Switch
                      {...label}
                      id="active"
                      name="active"
                      sx={{ colors: "#007c89" }}
                      defaultChecked={selectedNotification.active}
                    />
                  </div>
                  <div>
                    <TextField
                      id="type"
                      name="type"
                      select
                      fullWidth
                      label="Notification Type"
                      margin="dense"
                      // value={state.type}
                      defaultValue={selectedNotification.notificationtype}
                    >
                      {notificationTypeList.map((option) => (
                        <MenuItem
                          key={option.label}
                          value={option.value}
                          sx={{ font: 12 }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                  <TextField
                    id="device"
                    name="device"
                    select
                    label="Device"
                    margin="dense"
                    // value={state.device}
                    fullWidth
                    onChange={handleDeviceClick}
                    defaultValue={selectedNotification.deviceid}
                  // error={errors.device ? true : false}
                  // helperText="Select a Device"
                  >
                    {devices.map((option) => (
                      <MenuItem
                        key={option.devicename}
                        value={option.deviceid}
                        sx={{ font: 12 }}
                      >
                        {option.devicename}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Typography>Select the parameter</Typography>
                  <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {params.fields.map((field) => (
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
            <Button className="action-cancel-btn" onClick={() => { handleEditClose(); resetErrors(); }}>
              Cancel
            </Button>
            <Button
              className="share-device-btn"
              autoFocus
              // disabled={!isValidForm}
              onClick={handleEditFormSubmit}
            >
              Update
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
      {/*** add notification */}
      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}
          id="customized-dialog-title"
        >
          Add Notification Configuration
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => { closeDialog(); resetErrors(); }}
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
                <Grid item xs={6}>
                  <TextField
                    required
                    margin="dense"
                    id="notificationname"
                    name="notificationname"
                    label="NotificationName"
                    defaultValue=""
                    type="text"
                    fullWidth
                    variant="standard"
                    onChange={handleChange}
                    error={errors.notificationname ? true : false}
                    helperText={errors.notificationname}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    margin="dense"
                    id="message"
                    name="message"
                    label="Message"
                    defaultValue=""
                    type="text"
                    fullWidth
                    variant="standard"
                    onChange={handleChange}
                    error={errors.message ? true : false}
                    helperText={errors.message}
                    onBlur={handleBlur}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth error={errors.type ? true : false}>
                    <InputLabel id="demo-simple-select-label">
                      Notification Type
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="tupe"
                      name="type"
                      label="Notification Type"
                      onChange={handleChange}
                    >
                      {notificationTypeList.map((option) => (
                        <MenuItem
                          key={option.label}
                          value={option.value}
                          sx={{ font: 12 }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.type}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth error={errors.device ? true : false}>
                    <InputLabel id="demo-simple-select-label">Device</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="device"
                      name="device"
                      label="Device"
                      onChange={(e) => { handleDeviceClick(e); handleChange(e); }}
                    >
                      {devices.map((option) => (
                        <MenuItem
                          key={option.devicename}
                          value={option.deviceid}
                          sx={{ font: 12 }}
                        >
                          {option.devicename}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.device}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={5}
                    minRows={5}
                    id="expressionfield"
                    name="expressionfield"
                    label="Notification Condition."
                    value={expression}
                    error={!!(errors.expressionfield || errorMsg === "Invalid Expression")}
                    helperText={
                      <>
                        <span>{errors.expressionfield}</span><br />
                        <span>{errorMsg}</span>
                      </>
                    }
                    onChange={(e) => { conditioncheck(e); handleChange(e); }}
                  />
                  {/* <Typography>{errorMsg}</Typography> */}
                  <Typography>Select the Device Variable</Typography>
                  <Paper style={{ maxHeight: 200, overflow: "auto" }}>
                    <List sx={{ mx: 2, p: 2 }}>
                      {withoutVariable?.map((field) => (
                        <Paper>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 1, cursor: "pointer" }}
                          >
                            <ListItemText primary={"variable_" + field.variablename} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={6}>
                  <Typography>Select the parameter</Typography>
                  <Paper
                    style={{ maxHeight: 200, overflow: "auto", marginTop: "1px", minHeight: 200 }}
                  >
                    <List sx={{ mx: 2, p: 2 }}>
                      {params.fields.map((field) => (
                        <Paper elevation={4}>
                          <ListItem
                            onClick={handleFieldClick}
                            alignItems="flex-start"
                            sx={{ bgcolor: "#fff", m: 0.5, cursor: "pointer" }}
                          >
                            <ListItemText primary={field.name} />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  </Paper>
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
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button className="action-cancel-btn" onClick={() => { closeDialog(); resetErrors(); }}>
              Cancel
            </Button>
            <Button
              className="share-device-btn"
              autoFocus
              // disabled={!isValidForm}
              onClick={handleSubmit}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </BootstrapDialog>

    </div>
  );
}
export default Notifications;
