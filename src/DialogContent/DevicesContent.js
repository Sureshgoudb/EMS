import { Button, Grid, Stack, TextField, Typography } from "@mui/material";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function AddDeviceForm({ setter,tableData,setTableData }) {
  const deviceNameref = useRef("");
  const locationref = useRef("");
  const longituderef = useRef("");
  const latituderef = useRef("");
  const dref = useRef("");
  const user = useSelector((store) => store.user);
  const [showHelp, setShowHelp] = useState("none");
  const customerID = user
    ? user.customerID
    : JSON.parse(localStorage.getItem("user")).customerID;
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  const handleshowHelp = () => {
    setShowHelp("");
  };
  const handleCloseHelp = () => {
    setShowHelp("none");
  };
  const handleAddDevice = () => {
    const addDeviceData = async () => {
      let adddeviceData = {
        devicename: deviceNameref.current.value,
        description: dref.current.value,
        customerid: customerID,
        address: {
          location: locationref.current.value,
          longitude: longituderef.current.value,
          latitude: latituderef.current.value,
        },
        active: true,
        tags: [],
        groups: [],
      };
      console.log(JSON.stringify(adddeviceData));
      await axios
        .post(apiKey + "device/create/", adddeviceData)
        .then((response) => {     
          setTableData(prevState => [...prevState, {
              id : tableData.length + 1,
              devicename : response.data.devicename,
              deviceid : response.data.deviceid,
              description : response.data.description,
              address : {
                location : response.data.address.location,
                longitude :response.data.address.longitude,
                latitude : response.data.address.latitude
              },
              customerid : response.data.customerid,
              active : response.data.active
            }]);
            
          setter(false);
        })
        .catch((error) => {});
    };
    addDeviceData();
  };

  return (
    <div>
      <Typography sx={{ display: showHelp }} variant="p">
        Create a new blank device shell, or automatically create new devices
      </Typography>
      <Stack direction="row" justifyContent="end">
        <Button onClick={showHelp ? handleshowHelp : handleCloseHelp}>
          {showHelp ? "Help" : "Close"}
        </Button>
      </Stack>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={6}>
          <Grid item xs={12}>
            <Typography variant="p">Add Details</Typography>
          </Grid>
          <TextField
            required
            margin="dense"
            id="devicename"
            name="devicename"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            inputRef={deviceNameref}
          />
        </Grid>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <Typography variant="p">Address</Typography>
          </Grid>
          <TextField
            required
            margin="dense"
            id="name"
            name="name"
            label="Location"
            type="text"
            fullWidth
            variant="standard"
            inputRef={locationref}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} alignItems="center" my={1}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            id="outlined-basic"
            label="Longitude"
            variant="outlined"
            inputRef={longituderef}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="outlined-basic"
            label="Latitude"
            variant="outlined"
            fullWidth
            inputRef={latituderef}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} alignItems="center" my={1}>
        <Grid item xs={12}>
          <Typography variant="p">Description</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            aria-label="Description"
            id="description"
            name="description"
            minRows={4}
            placeholder="Description"
            inputRef={dref}
          />
        </Grid>
      </Grid>
      <Button
        sx={{ background: "#007c89", color: "#fff" }}
        variant="contained"
        onClick={() => handleAddDevice()}
      >
        {" "}
        Add Device
      </Button>
    </div>
  );
}

export default AddDeviceForm;
