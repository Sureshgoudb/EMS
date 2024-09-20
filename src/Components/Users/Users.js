import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import {
  Box,
  Chip,
  Fab,
  FormControl,
  InputLabel,
  MenuItem,
  Switch,
  TextField,
  Select,
  Grid,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Close } from "@mui/icons-material";
import { validator } from "../../Helpers/validator";
import useForm from "../../Hooks/useForm";
import PhoneNumber from "../../Helpers/PhoneNumber";
import CardLayout from "../../common/CardLayout";
import CenterDialog from "../../common/CenterDialog";
import useDialogActions from "../../common/useDialogActions";
import CardTitleBar from "../../common/CardTitleBar";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

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

const Users = () => {
  const [customerfilterModel, setCustomerFilterModel] = React.useState({
    items: [],
    quickFilterValues: [""],
  });
  const [selectedCustomer, setselectedCustomer] = useState({});
  const [assignUser, setAssignUser] = useState(false);
  const [selectionModel, setSelectionModel] = useState();
  const [users, setUsers] = useState([]);
  const [addUser, setaddUser] = useState(false);
  const [editUser, seteditUser] = useState(false);
  const [delopen, setDelOpen] = useState(false);
  const [selectedUser, setselectedUsers] = useState({});
  const [selectedValue, setSelectedValue] = useState("");
  const [customerData, setCustomerData] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({});
  const [isAdd, setIsAdd] = useState(false);
  const user = useSelector((store) => store.user);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const customerID = user
    ? user.customerID
    : JSON.parse(localStorage.getItem("user")).customerID;

    const columns = [
      { field: "id", headerName: "ID", width: 90, hide: true },
      {
        field: "name",
        headerName: "Name",
        width: 250,
        editable: false,flex:1,
      },
      {
        field: "email",
        headerName: "Email",
        width: 150,
        editable: false,flex:1,
      },
      {
        field: "phone",
        headerName: "Phone Number",
        width: 150,
        editable: false,flex:1,
      },
      {
        field: "usertype",
        headerName: "User Type",
        width: 150,
        editable: false,flex:1,
      },
      {
        field: "active",
        headerName: "Status",
        width: 250,
        editable: false,flex:1,
        renderCell: (params) => {
          return (
            <Chip variant="outlined" size="small" {...getStatusChipProps(params)} />
          );
        },
      },
      {
        field: "actions",
        numeric: true,
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
        field: "actions3",
        numeric: true,
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
        disablePadding: false,
        headerName: "",
        width: 50,
        renderCell: (params) => {
          
          const { userid } = params?.row;
          let userID;
          if(user !=null){
            userID =user.userId;
          }
          else{
            userID = JSON.parse(localStorage.getItem("user")).userId;
          }

          if (userid) {
            if(userid !== userID){
              return (
                <DeleteIcon
                  onClick={(event) => {
                    // handleClickDelete(event);
                  }}
                />
              );
          }
          else
          return "";
          }
        },
      },
    ];

    // console.log(user);

  const getUsers = async () => {
    const customer = await axios.get(apiKey + "customer/item/" + customerID);
      setCustomerInfo(customer.data);
      let url;
      if(user !=null){
      if(user.parentId != null || user.parentId  != undefined)
      {
          url = apiKey + "user/list/" + customerID
      }
      else
      {
        url = apiKey + "user/list/"
      }
    }
    else{
      let localData = JSON.parse(localStorage.getItem("user"));
      if(localData.parentId != null || localData.parentId  != undefined)
        {
            url = apiKey + "user/list/" + localData.customerID
        }
        else
        {
          url = apiKey + "user/list/"
        }
    }
      await axios
        .get(url)
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {});
      }

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
   getUsers();
   getCustomers();
  }, []);

  console.log(users);

  const handleCellClick = async (params, event) => {
    event.preventDefault();
    let sel;
    let userSelected = JSON.stringify(params.row);
    let parsedUser = JSON.parse(userSelected);
    setselectedUsers(parsedUser);
    if (params.field === "actions") {
      seteditUser(true);
      setIsAdd(false);
    }
    if (params.field === "actions2") {
      let userID;
      if(user !=null){
        userID =user.userId;
      }
      else{
        userID = JSON.parse(localStorage.getItem("user")).userId;
      }
      if(parsedUser.userid !== userID){
      setDelOpen(true);
      }
    }
    if (params.field === "actions3") {     
        sel = customerData
        .filter((item) => item.customerid == parsedUser.customerid)
        .map((element) => element.id);
        setSelectionModel(sel);
        setAssignUser(true);
    }
  };

  const handleAssignCustomerClose = () => {
    setAssignUser(false);
  };

  const handleEditClose = () => {
    seteditUser(false);
    resetErrors();
  };
  const handleaddUserClose = () => {
    setaddUser(false);
    resetErrors();
  };

  const handleOnChange = (event) => {
    event.preventDefault();
    setSelectedValue(event.target.value);
  };

  const handleaddFormSubmit = async (e) => {
    e.preventDefault();
    handleSubmit();
    const isValidated = Object.values(errors).every((value) => value === "");
    if ((e !== null || e !== undefined) && isValidated) {
      if(e.target.form.username.value !== "" && e.target.form.email.value !== "" && e.target.form.phone.value !== ""&& e.target.form.usertype.value !== ""){
      let createUser = {
        name: e.target.form.username.value,
        email: e.target.form.email.value,
        phone: e.target.form.phone.value,
        usertype: e.target.form.usertype.value,
        customerid: customerID,
        active: true,
      };
      const addUser = async () => {
        await axios
          .post(apiKey + "user/create/", createUser)
          .then((response) => {
            setUsers((prevState) => [
              ...prevState,
              {
                id: users.length + 1,
                userid: response.data.userid,
                name: response.data.name,
                email: response.data.email,
                phone: response.data.phone,
                usertype: response.data.usertype,
                customerid: response.data.customerid,
                active: response.data.active,
              },
            ]);
            setaddUser(false);
            closeDialog();
          })
          .catch((error) => {});
      };
      addUser();
    }
  }
  };
  const handleEditFormSubmit = async (e) => {
    // console.log(errors);
    e.preventDefault();
    const isvalidated = Object.values(errors).every((value) => value === "");
    if ((e !== null || e !== undefined) && isvalidated) {
      if(e.target.form.username.value !== "" && e.target.form.email.value !== "" && e.target.form.phone.value !== ""&& e.target.form.usertype.value !== ""){
      let updateUserData = {
        name: e.target.form.username.value,
        email: e.target.form.email.value,
        phone: e.target.form.phone.value,
        usertype: e.target.form.usertype.value,
        customerid: customerID,
        active: e.target.form.active.checked,
      };
      const updateUser = async () => {
        await axios
          .put(apiKey + "user/update/" + selectedUser.userid, updateUserData)
          .then((response) => {

                        // 1. Find the todo with the provided id
                        const currentTodoIndex = users.findIndex((user) => user.userid === selectedUser.userid);
                        // 2. Mark the todo as complete
                        const updatedTodo = Object.assign({}, users[currentTodoIndex]);
                        updatedTodo.name = e.target.form.username.value;
                        updatedTodo.email = e.target.form.email.value;
                        updatedTodo.phone = e.target.form.phone.value;
                        updatedTodo.usertype = e.target.form.usertype.value;
                        updatedTodo.customerid = customerID;
                        updatedTodo.active = e.target.form.active.checked;
                        // 3. Update the todo list with the updated todo
                        const newTodos = users.slice();
                        newTodos[currentTodoIndex] = updatedTodo;
                        setUsers(newTodos);

            seteditUser(false);
          })
          .catch((error) => {});
      };
      updateUser();
    }
  }
  };
  const handleDelete = (e) => {
    e.preventDefault();
    if (selectedUser !== null || selectedUser !== undefined) {
      const deleteUserData = async () => {
        await axios
          .delete(apiKey + "user/remove/" + selectedUser.userid)
          .then((response) => {
            setDelOpen(false);
            const newUsers = users.filter(
              (item) => item.userid !== selectedUser.userid
            );
            setUsers(newUsers);
          })
          .catch((error) => {});
      };
      deleteUserData();
    }
  };
  const handleDeleteClose = () => {
    setDelOpen(false);
  };
  const userTypeList = [
    {
      value: "Admin",
      label: "Admin",
    },
    {
      value: "Super User",
      label: "Super User",
    },
    {
      value: "User",
      label: "User",
    },
  ];
  const label = { inputProps: { "aria-label": "Active User" } };
  
  const [initState, setInitState] = useState({
    username: selectedUser.username,
    email: selectedUser.email,
    phone: selectedUser.phone,
    usertype: selectedUser.usertype,
  });

  useEffect(() => {
    if(isAdd)
      setInitState({
        username: "",
        email: "",
        phone: "",
        usertype: "",
      });
    else
      setInitState({
        username: selectedUser.username,
        email: selectedUser.email,
        phone: selectedUser.phone,
        usertype: selectedUser.usertype,
      })
  }, [isAdd])


  const handleCustomerCellClick = (params, event) => {
    event.preventDefault();
    let customerSelected = JSON.stringify(params.row);
    let parsedCustomer = JSON.parse(customerSelected);
    setselectedCustomer(parsedCustomer);
    let updateUserData = {
      name: selectedUser.name,
      email: selectedUser.email,
      phone: selectedUser.phone,
      usertype: selectedUser.usertype,
      customerid: parsedCustomer.customerid,
      active: selectedUser.active,
    };
    const updateUser = async () => {
      await axios
        .put(
          apiKey + "user/update/" + selectedUser.userid,
          updateUserData
        )
        .then((response) => {
                                // 1. Find the todo with the provided id
                                const currentTodoIndex = users.findIndex((user) => user.userid === selectedUser.userid);
                                // 2. Mark the todo as complete
                                const updatedTodo = Object.assign({}, users[currentTodoIndex]);
                                updatedTodo.name = updateUserData.name;
                                updatedTodo.email = updateUserData.email;
                                updatedTodo.phone = updateUserData.phone;
                                updatedTodo.usertype = updateUserData.usertype;
                                updatedTodo.customerid = parsedCustomer.customerid;
                                updatedTodo.active = updateUserData.active;

                                // 3. Update the todo list with the updated todo
                                const newTodos = users.slice();
                                newTodos[currentTodoIndex] = updatedTodo;
                                setUsers(newTodos);

          setAssignUser(false);
        })
        .catch((error) => {});
    };
    updateUser();
  };
  const submit = () => {
    console.log(" Submited");
  };
  const {
    handleChange,
    handleSubmit,
    handleBlur,
    handleUpdateSubmit,
    state,
    errors,
    setErrors,
    resetErrors,
    countryCode,
  } = useForm({
    initState,
    callback: submit,
    validator,
  });
  // let isValidForm =
  //   Object.values(errors).filter((error) => typeof error !== "undefined")
  //     .length === 0;
  const { open, openDialog, closeDialog } = useDialogActions();

  return (
    <div>
      <CardTitleBar title={"Users"} />
      <CardLayout
        title={`${users.length} Users`}
        action={
          <Fab
            onClick={() => {openDialog(); setIsAdd(true);}}
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
          rows={users}
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
        open={editUser}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}
          id="customized-dialog-title"
        >
          Update User
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
                  id="usertype"
                  name="usertype"
                  select
                  label="User Type"
                  helperText="Please select user Type"
                  onChange={handleOnChange}
                  defaultValue={selectedUser.usertype}
                >
                  {userTypeList.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
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
                  defaultChecked={selectedUser.active}
                />
              </div>
            </div>

            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="username"
              label="Name"
              defaultValue={selectedUser.name}
              type="text"
              fullWidth
              variant="standard"
              onChange={handleChange}
              error={errors.username ? true : false}
              helperText={errors.username}
              onBlur={handleBlur}
            />

            <TextField
              autoFocus
              required
              margin="dense"
              id="email"
              name="email"
              label="Email"
              defaultValue={selectedUser.email}
              type="email"
              fullWidth
              variant="standard"
              onChange={handleChange}
              error={errors.email ? true : false}
              helperText={errors.email}
              onBlur={handleBlur}
            />

            <PhoneNumber 
              errors={errors}
              // defaultValue={selectedUser.phone}
              state={selectedUser}
              handleChange={handleChange}
              handleBlur={handleBlur}
              countryCode={countryCode}
              // value={state.phone}
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
      <CenterDialog open={open} onClose={() => {closeDialog(); resetErrors();}} title="Add User">
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <TextField
            required
            margin="dense"
            id="name"
            name="username"
            label="Name"
            defaultValue=""
            // value={state.name}
            type="text"
            fullWidth
            variant="standard"
            onChange={handleChange}
            error={errors.username ? true : false}
            helperText={errors.username}
            onBlur={handleBlur}
          />
          <TextField
            required
            margin="dense"
            id="email"
            name="email"
            label="Email"
            defaultValue=""
            // value={state.email}
            type="email"
            fullWidth
            variant="standard"
            onChange={handleChange}
            error={errors.email ? true : false}
            helperText={errors.email}
            onBlur={handleBlur}
          />
          <Grid container spacing={3} alignItems="center" my={1}>
            <Grid item xs={6}>
            
              <TextField
                  id="usertype"
                  name="usertype"
                  select
                  label="User Type"
                  // value={state.usertype}
                  onChange={handleChange}
                  error={errors.usertype ? true : false}
                  helperText="Please Select User Type"
                >
                  {userTypeList.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
            </Grid>
            <Grid item xs={6}>
              <PhoneNumber
                errors={errors}
                state={state}
                defaultValue=""
                // value={state.phone}
                handleChange={handleChange}
                handleBlur={handleBlur}
                countryCode={countryCode}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button className="action-cancel-btn" onClick={() => {closeDialog(); resetErrors();}}>
              Cancel
            </Button>
            <Button
              className="share-device-btn"
              autoFocus
              type="submit"
              variant="outlined"
              color="secondary"
              // disabled={!isValidForm}
              onClick={handleaddFormSubmit}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </CenterDialog>

      <BootstrapDialog
        onClose={handleAssignCustomerClose}
        aria-labelledby="customized-dialog-title"
        open={assignUser}
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
          {selectedUser.name}
          <br />
          Assign to Customer
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleAssignCustomerClose}
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
              disableRowSelectionOnClick
              // onRowClick={(param) => handleClickDevice(param.row)}
              onCellClick={handleCustomerCellClick}
              sx={{ "&, [class^=MuiDataGrid-root ]": { border: "none" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button className="action-cancel-btn" onClick={handleAssignCustomerClose}>
            Cancel
          </Button>
         {/* <Button className="share-device-btn" autoFocus onClick={handleAssignCustomerClose}>
            Accept
            </Button>*/}
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};
export default Users;
