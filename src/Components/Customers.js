import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Chip,
  Fab,
  Box,
  TextField,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Close } from "@mui/icons-material";
import CardLayout from "../common/CardLayout";
import useDialogActions from "../common/useDialogActions";
import CenterDialog from "../common/CenterDialog";
import CardTitleBar from "../common/CardTitleBar";
import useForm from "../Hooks/useForm";
import { validator } from "../Helpers/validator";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));



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

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [addCustomer, setaddCustomer] = useState(false);
  const [editCustomer, seteditCustomer] = useState(false);
  const [delopen, setDelOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [selectedValue, setSelectedValue] = useState("");
  const [isAdd, setIsAdd] = useState(false);
  const user = useSelector((store) => store.user);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  console.log("store -- " + user);
  console.log(
    "local storage -- " + JSON.parse(localStorage.getItem("customer"))
  );
  const customerID =
    user != null || user != undefined
      ? user.customerID
      : JSON.parse(localStorage.getItem("user")).customerID;

  const getCustomers = async () => {
    let url;
    if (customerID != null || customerID != undefined) {
      url = apiKey + "customer/list/" + customerID
    }
    else {
      url = apiKey + "customer/list/"
    }

    await axios
      .get(url)
      .then((response) => {
        setCustomers(response.data);
      })
      .catch((error) => { });
  };

  useEffect(() => {
    getCustomers();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 90, hide: true },
    {
      field: "name",
      headerName: "Name",
      width: 250,flex:1,
      editable: false,
    },
    {
      field: "description",
      headerName: "Description",
      width: 150,flex:1,
      editable: false,
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
      numeric: false,
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
      numeric: false,
      disablePadding: false,
      headerName: "",
      width: 50,
      renderCell: (params) => {
        const { customerid } = params?.row;
        if (customerid) {
          if(customerid !== customerID){
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

  const [initState, setInitState] = useState({
    name: selectedCustomer.name,
    description: selectedCustomer.description,
  });

  useEffect(() => {
    if(isAdd)
      setInitState({
        name: "",
        description: "",
      });
    else
      setInitState({
        name: selectedCustomer.name,
        description: selectedCustomer.description,
      })
  }, [isAdd])

  const handleCellClick = (params, event) => {
    let customerSelected = JSON.stringify(params.row);
    setSelectedCustomer(JSON.parse(customerSelected));
    //console.log('Cell clicked:', params.field, params.value);
    if (params.field === "actions") {
      seteditCustomer(true);
      setIsAdd(false);
    }
    if (params.field === "actions2") {
       if(selectedCustomer.customerid !== customerID){
      setDelOpen(true);
      }
    }
  };

  const handleaddCustomer = () => {
    setaddCustomer(true);
  };
  const handleEditClose = () => {
    seteditCustomer(false);
    resetErrors();
  };
  const handleaddCustomerClose = () => {
    setaddCustomer(false);
  };
  const handleCustomerUpdate = (e) => {
    console.log("handleUserUpdate" + e);
  };
  const handleaddFormSubmit = async (e) => {
    if (e != null || e != undefined) {
      if(e.target.form.name.value !== "" && e.target.form.description.value !== ""){
      let createCustomer = {
        name: e.target.form.name.value,
        description: e.target.form.description.value,
        active: true,
        parentId:customerID
      };
      const addCustomerData = async () => {
        await axios
          .post(apiKey + "customer/create/", createCustomer)
          .then((response) => {
            setCustomers((prevState) => [
              ...prevState,
              {
                id: customers.length + 1,
                customerid: response.data.customerid,
                name: response.data.name,
                description: response.data.description,
                active: response.data.active,
                parentId:response.data.parentId,
              },
            ]);
            setaddCustomer(false);
            closeDialog();
          })
          .catch((error) => { 
            console.log(error);
          });
      };
      addCustomerData();
    }
  }
  };
  const handleEditFormSubmit = async (e) => {
    if (e != null || e != undefined) {
      if(e.target.form.name.value !== "" && e.target.form.description.value !== ""){
      let updateCustomerData = {
        name: e.target.form.name.value,
        description: e.target.form.description.value,
      };
      const updateCustomer = async () => {
        await axios
          .put(
            apiKey + "customer/update/" + selectedCustomer.customerid,
            updateCustomerData
          )
          .then((response) => {
            // 1. Find the todo with the provided id
            const currentTodoIndex = customers.findIndex((customer) => customer.customerid === selectedCustomer.customerid);
            // 2. Mark the todo as complete
            const updatedTodo = Object.assign({}, customers[currentTodoIndex]);
            updatedTodo.name = e.target.form.name.value;
            updatedTodo.description = e.target.form.description.value;
            // 3. Update the todo list with the updated todo
            const newTodos = customers.slice();
            newTodos[currentTodoIndex] = updatedTodo;
            setCustomers(newTodos);

            seteditCustomer(false);
          })
          .catch((error) => { });
      };
      updateCustomer();
    }
    }
  };
  const handleDelete = (e) => {
    if (selectedCustomer != null || selectedCustomer != undefined) {
      const deleteCustomerData = async () => {
        await axios
          .delete(apiKey + "customer/remove/" + selectedCustomer.customerid)
          .then((response) => {
            setDelOpen(false);
            const newCustomers = customers.filter(
              (item) => item.customerid !== selectedCustomer.customerid
            );
            setCustomers(newCustomers);
          })
          .catch((error) => { });
      };
      deleteCustomerData();
    }
  };
  const handleDeleteClose = () => {
    setDelOpen(false);
  };

  const {
    handleChange,
    handleSubmit,
    errors,
    resetErrors,
  } = useForm({
    initState,
    callback: handleaddFormSubmit,
    validator,
  });

  const label = { inputProps: { "aria-label": "Active User" } };
  const { open, openDialog, closeDialog } = useDialogActions();
  return (
    <div>
      <CardTitleBar title={"Customers"} />
      <CardLayout
        title={`${customers.length} Customers`}
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
          rows={customers}
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
        open={editCustomer}
      >
        <DialogTitle
          sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}
          id="customized-dialog-title"
        >
          Update Customer
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
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Name"
              defaultValue={selectedCustomer.name}
              type="text"
              onChange={handleChange}
              error={errors.name ? true : false}
              helperText={errors.name}
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
              defaultValue={selectedCustomer.description}
              type="text"
              onChange={handleChange}
              error={errors.description ? true : false}
              helperText={errors.description}
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

      <CenterDialog open={open} onClose={() => {closeDialog(); resetErrors();}} title="Add Customer">
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            defaultValue=""
            onChange={handleChange}
            error={errors.name? true : false}
            helperText={errors.name}
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
            defaultValue=""
            onChange={handleChange}
            error={errors.description? true : false}
            helperText={errors.description} 
            type="text"
            fullWidth
            variant="standard"
          />
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
              onClick={handleSubmit}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </CenterDialog>
    </div>
  );
}
export default Customers;
