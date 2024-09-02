import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  Select,
  Switch,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import user from "../Utilites/Users.json";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [delopen, setDelOpen] = useState(false);
  const user = useSelector((store) => store.user);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const customerID = user
    ? user.customerID
    : JSON.parse(localStorage.getItem("user")).customerID;
  const handleClickEdit = () => {
    setOpen(true);
  };

  const handleClickDelete = () => {
    setDelOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDeleteClose = () => {
    setDelOpen(false);
  };

  const getUsers = async () => {
    await axios
      .get(apiKey + "user/list/" + customerID)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    getUsers();
  }, []);

  const [userType, setUserType] = useState("");

  const handleChange = (event) => {
    setUserType(event.target.value);
  };
  const label = { inputProps: { "aria-label": "Active User" } };

  return (
    <div className="  mx-10 my-10 md:mx-10 md:mt-24 lg:mx-20 lg:mt-24 ">
      <div className="flex">
        <p className="mt-2 text-2xl font-bold  text-white dark:text-white sm:text-2xl">
          <span className=" text-custom-blue  uppercase "> Users</span>
        </p>
      </div>

      <div className="">
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full  text-sm font-light text-left">
                  <thead className="border-b font-medium dark:border-neutral-500 dark:text-white ">
                    <tr>
                      <th scope="col" className="px-6 py-4">
                        #
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-4 ">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  {users &&
                    users.map((user) => (
                      <tbody className="dark:text-white">
                        <tr className="border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                          <td className="whitespace-nowrap px-6 py-4 font-medium">
                            {user._id}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {user.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {user.email}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <tr className=" text-left">
                              <button
                                onClick={handleClickEdit}
                                className=" bg-green-600 text-white p-2 w-20 rounded m-1"
                              >
                                <span className="spinner-border spinner-border-sm"></span>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={handleClickDelete}
                                className=" bg-red-600 text-white p-2 w-20 rounded m-1"
                              >
                                <span className="spinner-border spinner-border-sm"></span>
                                <span>Delete</span>
                              </button>
                              <Dialog
                                open={open}
                                onClose={handleClose}
                                PaperProps={{
                                  component: "form",
                                  onSubmit: (event) => {
                                    event.preventDefault();
                                    const formData = new FormData(
                                      event.currentTarget
                                    );
                                    const formJson = Object.fromEntries(
                                      formData.entries()
                                    );
                                    const email = formJson.email;
                                    console.log(email);
                                    handleClose();
                                  },
                                }}
                              >
                                <DialogTitle>Update </DialogTitle>
                                <DialogContent>
                                  <FormControl
                                    variant="standard"
                                    sx={{
                                      m: 1,
                                      minWidth: 120,
                                      display: "flow",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <InputLabel id="demo-simple-select-standard-label">
                                      User Type
                                    </InputLabel>
                                    <Select
                                      labelId="demo-simple-select-standard-label"
                                      id="demo-simple-select-standard"
                                      value={userType}
                                      onChange={handleChange}
                                      label="User Type"
                                    >
                                      <MenuItem value={1}>Admin</MenuItem>
                                      <MenuItem value={2}>Super User</MenuItem>
                                      <MenuItem value={2}>User</MenuItem>
                                    </Select>
                                    <Switch
                                      {...label}
                                      defaultChecked
                                      sx={{ right: "0" }}
                                    />
                                  </FormControl>

                                  <TextField
                                    autoFocus
                                    required
                                    margin="dense"
                                    id="name"
                                    name="name"
                                    label="Name"
                                    value={user.name}
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                  />
                                  <TextField
                                    autoFocus
                                    required
                                    margin="dense"
                                    id="name"
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    value={user.email}
                                    fullWidth
                                    variant="standard"
                                  />
                                  <TextField
                                    autoFocus
                                    required
                                    margin="dense"
                                    id="phone"
                                    name="phone"
                                    label="Phone"
                                    type="text"
                                    value={user.phone}
                                    fullWidth
                                    variant="standard"
                                  />
                                </DialogContent>
                                <DialogActions>
                                  <Button onClick={handleClose}>Cancel</Button>
                                  <Button type="submit">Update</Button>
                                </DialogActions>
                              </Dialog>
                            </tr>
                          </td>
                        </tr>
                      </tbody>
                    ))}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={delopen} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm the action</DialogTitle>
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
            color="primary"
            variant="contained"
            onClick={handleDeleteClose}
          >
            Cancel
          </Button>
          <Button color="secondary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
