import React, { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { Close } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import {
  Box,
  Fab,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import "./Devices/devices.css";
import CardLayout from "../common/CardLayout";
import RightDrawerDialog from "../common/RightDrawerDialog";
import useDialogActions from "../common/useDialogActions";
import AddDeviceForm from "../DialogContent/DevicesContent";
import CardTitleBar from "../common/CardTitleBar";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const headCells = [
  { field: "id", headerName: "ID", width: 90 },
  /* {
    field: 'deviceid',
    headerName: 'Device Id',
    width: 150,
    editable: true,
  },
  */

  {
    field: "devicename",
    numeric: false,
    disablePadding: true,
    editable: false,
    headerName: "Device Name",
    width: 250,
    cellClassName: "devicename--cell",flex:1,
  },
  {
    field: "description",
    numeric: true,
    editable: false,
    disablePadding: false,
    headerName: "Description",flex:1,
    width: 350,
  },
  {
    field: "active",
    numeric: true,
    editable: false,
    disablePadding: false,
    headerName: "Status",
    width: 150,flex:1,
    renderCell: (params) => {
      return (
        <Chip variant="outlined" size="small" {...getStatusChipProps(params)} />
      );
    },
  },
  {
    field: "createdAt",
    editable: false,
    disablePadding: false,
    headerName: "Created at",
    valueFormatter: (params) => 
    dayjs(params?.value).format("YYYY-MM-DD HH:mm:ss"),
    width: 150,flex:1,
  },

  {
    field: "updatedAt",
    numeric: true,
    editable: false,
    disablePadding: false,
    headerName: "Last Activity",
    width: 150,flex:1,
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
        <DeviceHubIcon
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

const headCustomerCells = [
  { field: "id", headerName: "ID", width: 90 },
  /* {
    field: 'deviceid',
    headerName: 'Device Id',
    width: 150,
    editable: true,
  },
  */

  {
    field: "name",
    numeric: false,
    disablePadding: true,
    headerName: "Name",
    width: 150,
    cellClassName: "customername--cell",
  },
  {
    field: "description",
    numeric: true,
    disablePadding: false,
    headerName: "Description",
    width: 350,
  },
  {
    field: "active",
    numeric: true,
    disablePadding: false,
    headerName: "Status",
    width: 150,
  },
  {
    field: "createdAt",
    disablePadding: false,
    headerName: "Created at",
    valueFormatter: (params) => dayjs(params.value).format("DD/MM/YYYY"),
    width: 150,
  },

  {
    field: "updatedAt",
    numeric: true,
    disablePadding: false,
    headerName: "Last Activity",
    width: 150,
  },
];

const Devices = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  //const [deviceList, setDeviceLists] = useState([]);

  const [assignDevice, setAssignDevice] = useState(false);
  const [delopen, setDelOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [selectedDevice, setselectedDevices] = useState({});
  const [selectedCustomer, setselectedCustomer] = useState({});
  const [selectionModel, setSelectionModel] = useState();
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const customerID = user
    ? user.customerID
    : JSON.parse(localStorage.getItem("user")).customerID;
   
  const getDevices = async () => {
    let url;
    if(user !=null){
    if(user.parentId != null || user.parentId  != undefined)
    {
        url = apiKey + "device/list/" + customerID
    }
    else
    {
      url = apiKey + "device/list/"
    }
  }
  else
  {
    let localData = JSON.parse(localStorage.getItem("user"));
    if(localData.parentId != null || localData.parentId  != undefined)
      {
          url = apiKey + "device/list/" + localData.customerID
      }
      else
      {
        url = apiKey + "device/list/"
      }
  }
    await axios.get(url).then((response) => {
      setTableData(response.data);
      localStorage.setItem("devices", response.data);
    });
  };
  const getCustomers = async () => {
    let url;
    if(user !=null){
    if(user.parentId != null || user.parentId != undefined)
    {
        url = apiKey + "customer/list/" + user.parentId
    }
    else
    {
      url = apiKey + "customer/list/"
    }
  }
  else{
    let localData = JSON.parse(localStorage.getItem("user"));
    if(localData.parentId != null || localData.parentId != undefined)
      {
          url = apiKey + "customer/list/" + localData.parentId
      }
      else
      {
        url = apiKey + "customer/list/"
      }
  }
    await axios
    .get(url)
    .then((response) => {
      setCustomerData(response.data);
    });
 }

  useEffect(() => {
    getDevices();
    getCustomers();
  }, []);

  /* useEffect(() => {
     getDevices();
   }, []);
 */

  const [filterModel, setFilterModel] = React.useState({
    items: [],
    quickFilterValues: [""],
  });

  const [customerfilterModel, setCustomerFilterModel] = React.useState({
    items: [],
    quickFilterValues: [""],
  });

  const [state, setState] = React.useState({
    right: false,
  });
  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const data_from_child = (data) => {
    //console.log(data); // or set the data to a state

    console.log("praveen");
    setState(data);
  };

  // console.log(state, "praveen ");
  /* const handleClickDevice = (params, e) => {
     console.log(params);
    navigate(`/details/${params.deviceid}`);
  }; */
  const handleCellClick = (params, event) => {
    let sel;
    let deviceSelected = JSON.stringify(params.row);
    let parsedDevice = JSON.parse(deviceSelected);
    setselectedDevices(parsedDevice);
    //console.log('Cell clicked:', params.field, params.value);
    if (params.field === "devicename") {
      navigate(`/devices/details/${params.row.deviceid}`);
      localStorage.setItem("selectedDeviceId", params.row.deviceid);
    }
    if (params.field === "actions") {    
          sel = customerData
            .filter((item) => item.customerid == parsedDevice.customerid)
            .map((element) => element.id);
          setSelectionModel(sel);
          setAssignDevice(true);
    }
    if (params.field === "actions2") {
      setDelOpen(true);
    }
  };
  const handleCustomerCellClick = (params, event) => {
    let customerSelected = JSON.stringify(params.row);
    let customer = JSON.parse(customerSelected);
    setselectedCustomer(customer);
    let updateDeviceData = selectedDevice;
    updateDeviceData.customerid = customer.customerid
    const updateDevice = async () => {
      await axios
        .put(
          apiKey + "device/update/" + selectedDevice.deviceid,
          updateDeviceData
        )
        .then((response) => {
                      // 1. Find the todo with the provided id
                      const currentTodoIndex = tableData.findIndex((device) => device.deviceid === selectedDevice.deviceid);
                      // 2. Mark the todo as complete
                      const updatedTodo = Object.assign({}, tableData[currentTodoIndex]);
                      updatedTodo.deviceid = selectedDevice.deviceid;
                      updatedTodo.devicename = selectedDevice.devicename;
                      updatedTodo.active = selectedDevice.active;
                      updatedTodo.description = selectedDevice.description;
                      updatedTodo.createdAt = selectedDevice.createdAt;
                      updatedTodo.customerid = customer.customerid;
                      updatedTodo.address = selectedDevice.address;
                      // 3. Update the todo list with the updated todo
                      const newTodos = tableData.slice();
                      newTodos[currentTodoIndex] = updatedTodo;
                      setTableData(newTodos);
          setAssignDevice(false);
        })
        .catch((error) => {});
    };
    updateDevice();
/*
    let updateCustomerData = {
      adddevices: selectedDevice.deviceid,
    };
    const updateCustomer = async () => {
      await axios
        .put(
          apiKey + "customer/update/" + selectedCustomer.customerid,
          updateCustomerData
        )
        .then((response) => {
          setAssignDevice(false);
        })
        .catch((error) => {});
    };
    updateCustomer();*/
  };
  const handleClose = () => {
    setAssignDevice(false);
  };
  const handleDeleteClose = () => {
    setDelOpen(false);
  };
  const handleDelete = (e) => {
    if (selectedDevice != null || selectedDevice != undefined) {
      const deleteDeviceData = async () => {
        await axios
          .delete(apiKey + "device/remove/" + selectedDevice.deviceid)
          .then((response) => {
            setDelOpen(false);
            const newDevices = tableData.filter(
              (item) => item.deviceid !== selectedDevice.deviceid
            );
            setTableData(newDevices);
          })
          .catch((error) => {});
      };
      deleteDeviceData();
    }
  };
  const { open, openDialog, closeDialog } = useDialogActions();
  return (
    <div>
      <CardTitleBar title={"Devices"} />
      <CardLayout
        title={`${tableData.length} Devices`}
        action={
          <Fab
            onClick={openDialog}
            aria-label="add"
            className="add_from_section"
            size="medium"
          >
            <AddIcon className="add_from_Icon" />
          </Fab>
        }
      >
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={tableData}
          columns={headCells}
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
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          // onRowClick={(param) => handleClickDevice(param.row)}
          onCellClick={handleCellClick}
          sx={{ "&, [class^=MuiDataGrid-root ]": { border: "none" } }}
        />
      </CardLayout>

      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={assignDevice}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            background: "#007c89",
            color: "#fff",
            textAlign: "center",
          }}
          id="customized-dialog-title"
        >
          {selectedDevice.devicename}
          <br />
          Assign to Customer
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#fff",
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={customerData}
              columns={headCustomerCells}
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
                    active: false,
                    createdAt: false,
                    updatedAt: false,
                  },
                },
              }}
              filterModel={customerfilterModel}
              onFilterModelChange={setCustomerFilterModel}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              pageSizeOptions={[5, 10, 25]}
              rowSelectionModel={selectionModel}
              checkboxSelection
              disableRowSelectionOnClick
              // onRowClick={(param) => handleClickDevice(param.row)}
              onCellClick={handleCustomerCellClick}
              sx={{ "&, [class^=MuiDataGrid-root ]": { border: "none" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button className="action-cancel-btn" onClick={handleClose}>
            Cancel
          </Button>
         {/*} <Button className="share-device-btn" autoFocus onClick={handleClose}>
            Accept
            </Button>*/}
        </DialogActions>
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

      <RightDrawerDialog open={open} onClose={closeDialog} title="Add Device">
        <AddDeviceForm setter={closeDialog} tableData={tableData} setTableData={setTableData} />
      </RightDrawerDialog>
    </div>
  );
};

export default Devices;
