import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Grid,
  Box,
  Fab,
  DialogActions,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  styled,
  Switch,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import useDialogActions from "../common/useDialogActions";
import { useSelector } from "react-redux";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import CardLayout from "../common/CardLayout";
import AddIcon from "@mui/icons-material/Add";
import CenterDialog from "../common/CenterDialog";
import Typography from "@mui/material/Typography";
import { Close } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const LeftDialogContent = ({ closeLeftDrawer, setDashBoardData }) => {
  const [dashboards, setDashboards] = useState([]);
  const [valid, setValid] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [addDashboard, setaddDashboard] = useState(false);
  const [editdashboard, seteditDashboard] = useState(false);
  const [delopen, setDelOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState({});
  const { open, openDialog, closeDialog } = useDialogActions();
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  let user = useSelector((store) => store.user);
  user = user ? user : JSON.parse(localStorage.getItem("user"));
  const customerID =
  user != null || user != undefined
    ? user.customerID
    : JSON.parse(localStorage.getItem("user")).customerID;

  const handleSearch = () => {};

  // Function to handle cancel
  const handleCancel = () => {
    closeLeftDrawer();
    setSearchText("");
  };
  const columns = [
    { field: "id", headerName: "ID", width: 100, hide: true },
    {
      field: "name",
      headerName: "Name",
      numeric: false,
      disablePadding: true,
      editable: false,
      width: 200,
      cellClassName: "devicename--cell",flex:1
    },
    { field: "description", editable: false,headerName: "Description", width: 200, flex:1},
    {
      field: "active",
      headerName: "Status",
      width: 100,
      editable: false, flex:1,
      renderCell: (params) => {
        return (
          <Chip
            variant="outlined"
            size="small"
            {...getStatusChipProps(params)}
          />
        );
      },
    },
    {
      field: "actions",
      numeric: true,
      disablePadding: false,
      headerName: "",
      width: 50,
      editable: false,
      renderCell: () => {
        return (
          user.user_Type !== "User" && ( <CreateIcon
            onClick={(event) => {
              //handleClickEdit(event);
            }}
          />)
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
           user.user_Type !== "User" && (
          <DeleteIcon
            onClick={(event) => {
              // handleClickDelete(event);
            }}
          />)
        );
      },
    },
    // Add more columns as needed
  ];

  const label = { inputProps: { "aria-label": "Active Dashboard" } };

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

  const handleValidation = (e) => {
    if(e.target.value !== ""){
    //test whether input is valid
    setValid(true);
    }
    else{
      setValid(false);
    }
};

  const handleCellClick = (params, event) => {
    const dashboardSelectedItem = JSON.stringify(params.row);
    setSelectedDashboard(JSON.parse(dashboardSelectedItem));
    if (params.field === "name") {
      setDashBoardData(dashboardSelectedItem);
      sessionStorage.setItem("selectedDashboardItem", dashboardSelectedItem);
      closeLeftDrawer();
    }

    if (params.field === "actions") {
      if( user.user_Type !== "User")
      seteditDashboard(true);
    }
    if (params.field === "actions2") {
      if( user.user_Type !== "User")
      setDelOpen(true);
    }
  };

  const handleEditClose = () => {
    seteditDashboard(false);
  };

  const handleDelete = (e) => {
    if (selectedDashboard != null || selectedDashboard != undefined) {
      const deleteDashboardData = async () => {
        await axios
          .delete(apiKey + "dashboard/remove/" + selectedDashboard.dashboardid)
          .then((response) => {
            setDelOpen(false);
            const newDashboards = dashboards.filter(
              (item) => item.dashboardid !== selectedDashboard.dashboardid
            );
            setDashboards(newDashboards);
          })
          .catch((error) => {});
      };
      deleteDashboardData();
    }
  };
  const handleDeleteClose = () => {
    setDelOpen(false);
  };

  const handleEditFormSubmit = async (e) => {
    if (e != null || e != undefined) {
      let updateDashboardData = {
        name: e.target.form.name.value,
        customerid: e.target.form.customer.value,
        description: e.target.form.description.value,
        active: e.target.form.active.checked,
      };
      console.log(updateDashboardData);
      const updateDashboard = async () => {
        await axios
          .put(
            apiKey + "dashboard/update/" + selectedDashboard.dashboardid,
            updateDashboardData
          )
          .then((response) => {
                        // 1. Find the todo with the provided id
                        const currentTodoIndex = dashboards.findIndex((dashboard) => dashboard.dashboardid === selectedDashboard.dashboardid);
                        // 2. Mark the todo as complete
                        const updatedTodo = Object.assign({}, dashboards[currentTodoIndex]);
                        updatedTodo.name = e.target.form.name.value;
                        updatedTodo.description = e.target.form.description.value;
                        updatedTodo.customerid = e.target.form.customer.value;
                        updatedTodo.active = e.target.form.active.checked;
                        // 3. Update the todo list with the updated todo
                        const newTodos = dashboards.slice();
                        newTodos[currentTodoIndex] = updatedTodo;
                        setDashboards(newTodos);
            seteditDashboard(false);
          })
          .catch((error) => {});
      };
      updateDashboard();
    }
  };
  const handleaddFormSubmit = async (e) => {
    if (e != null || e != undefined) {
       if(e.target.form.name.value !== "" && e.target.form.description.value !== "" && e.target.form.customer.value !== ""){
      let createDashboard = {
        name: e.target.form.name.value,
        description: e.target.form.description.value,
        customerid: e.target.form.customer.value,
        active: true,
      };
      const addDashboardData = async () => {
        await axios
          .post(apiKey + "dashboard/create/", createDashboard)
          .then((response) => {
            setDashboards((prevState) => [
              ...prevState,
              {
                id: dashboards.length + 1,
                customerid: response.data.customerid,
                name: response.data.name,
                description: response.data.description,
                active: response.data.active,
                dashboardid: response.data.dashboardid,
              },
            ]);
            closeDialog();
            setaddDashboard(false);
          })
          .catch((error) => {});
      };
      addDashboardData();
    }
    }
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        let url;
        let customerUrl ;
        if(user !=null){
        if(user.parentId != null || user.parentId != undefined)
        {
            url = apiKey + "dashboard/list/" + customerID;
            customerUrl = apiKey + "customer/list/"+ customerID;
        }
        else
        {
          url = apiKey + "dashboard/list/";
          customerUrl = apiKey + "customer/list/";
        }
      }
      else{
        let localData = JSON.parse(localStorage.getItem("user"));
        if(localData.parentId != null || localData.parentId != undefined)
          {
              url = apiKey + "dashboard/list/" + customerID;
              customerUrl = apiKey + "customer/list/"+ customerID;
          }
          else
          {
            url = apiKey + "dashboard/list/";
            customerUrl = apiKey + "customer/list/";
          }
      }
        const response = await axios.get(url);
        setDashboards(response.data);
        localStorage.setItem("dashboards", JSON.stringify(response.data));
        const customerResponse = await axios.get(customerUrl);
        setCustomers(customerResponse.data);
        localStorage.setItem(
          "customers",
          JSON.stringify(customerResponse.data)
        );
        console.log("Customer data:", customerResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDashboards();
  }, []);

  return (
    <>
      <CardLayout
        title={""}
        action={ user.user_Type !== "User" && (
          <Fab
            onClick={openDialog}
            aria-label="add"
            className="add_from_section"
            size="medium"
          >
            <AddIcon className="add_from_Icon" />
          </Fab>
  )}
      >
        <Grid container spacing={2}>
          {/*<Grid item xs={12}>
            <TextField
              label="Search"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>*/}
        </Grid>
        <Grid container spacing={2} my={1}>
          {/* Render grid data */}

          <Grid item xs={12}>
            <DataGrid
              rows={dashboards}
              columns={columns}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              autoHeight
              pageSize={5}
              disableRowSelectionOnClick
              onCellClick={handleCellClick}
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
            />
          </Grid>
        </Grid>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button className="action-cancel-btn" onClick={handleCancel}>
            Cancel
          </Button>
          { user.user_Type !== "User" && (<Button className="share-device-btn" onClick={openDialog}>
            Add
          </Button>)}
        </DialogActions>
      </CardLayout>

      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={editdashboard}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}
          id="customized-dialog-title"
        >
          Update Dashboard
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
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <DialogContent dividers>
            <div className=" flex  justify-between">
              <div>
                <TextField
                  id="customer"
                  name="customer"
                  select
                  label="Customer"
                  helperText="Please select Customer"
                  defaultValue={selectedDashboard.customerid}
                >
                  {customers.map((option) => (
                    <MenuItem key={option.name} value={option.customerid}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <div>
                <Typography>Change the Status</Typography>
                <Switch
                  {...label}
                  id="active"
                  name="active"
                  sx={{ colors: "#007c89" }}
                  defaultChecked={selectedDashboard.active}
                />
              </div>
            </div>

            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Name"
              defaultValue={selectedDashboard.name}
              type="text"
              fullWidth
              variant="standard"
            />

            <TextField
              autoFocus
              required
              margin="dense"
              id="description"
              name="description"
              label="Description"
              defaultValue={selectedDashboard.description}
              type="text"
              fullWidth
              variant="standard"
            />
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
      {/*** add user */}

      <CenterDialog open={open} onClose={closeDialog} title="Add Dashboard">
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <TextField
          required
          sx={{mt:1}}
            id="customer"
            name="customer"
            select
            label="Customer"
            fullWidth
            onChange={(e) => handleValidation(e)}
            error={!valid}
          >
            {customers.map((option) => (
              <MenuItem key={option.name} value={option.customerid}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            defaultValue=""
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => handleValidation(e)}
            error={!valid}
          />

          <TextField
            autoFocus
            required
            margin="dense"
            id="description"
            name="description"
            label="Description"
            defaultValue=""
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => handleValidation(e)}
            error={!valid}
          />
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button className="action-cancel-btn" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              className="share-device-btn"
              autoFocus
              type="submit"
              variant="outlined"
              color="secondary"
              onClick={handleaddFormSubmit}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </CenterDialog>
    </>
  );
};

export default LeftDialogContent;
