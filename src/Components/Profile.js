import React, { useEffect, useState } from "react";
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import axios from "axios";
import { useSelector } from "react-redux";
import {
  TextField,
  Button,
  Box,
  Alert
} from "@mui/material";
import CardTitleBar from "../common/CardTitleBar";
import { alignProperty } from "@mui/material/styles/cssUtils";
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import useForm from "../Hooks/useForm";
import { validator } from "../Helpers/validator";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUser, setselectedUser] = useState({});
  const [showPassword, setShowPassword] = React.useState(false)
  const user = useSelector((store) => store.user);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const [open, setOpen] = React.useState(false);


  const initState= {
    name: "",
    email: "",
    phone: "",
    password: "",
  }
  const submit = () => {
    console.log(" Submited");
  };

  const {
    handleChange,
    handleSubmit,
    errors,
    resetErrors,
  } = useForm({
    initState,
    callback: submit,
    validator,
  });

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  const getUser = async () => {
    let url;
    if(user !=null){
      url = apiKey + "user/item/" + user.userId
    }
    else
    {
      let localData = JSON.parse(localStorage.getItem("user"));
      url = apiKey + "user/item/" + localData.userId
    }
    await axios
      .get(url)
      .then((response) => {
        setselectedUser(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
        setPhone(response.data.phone);
        setPassword(response.data.password);

      })
      .catch((error) => { });
  }

  useEffect(() => {
    getUser();
  }, []);


  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const isValidated = Object.values(errors).every((value) => value === "");
    if(isValidated) {
      if(name!== "" && email !== "" && phone !== ""&& password !== ""){
      let updateUserData = {
        name: name,
        email: email,
        phone: phone,
        password: password
      };
      const updateUser = async () => {
        let url;
        if(user !=null){
          url = apiKey + "user/update/" + user.userId
        }
        else
        {
          let localData = JSON.parse(localStorage.getItem("user"));
          url = apiKey + "user/update/" + localData.userId
        }
        await axios
          .put(url, updateUserData)
          .then((response) => {
            setName(response.data.name);
            setEmail(response.data.email);
            setPhone(response.data.phone);
            setPassword(response.data.password);
            setOpen(true);
          })
          .catch((error) => {});
      };
      updateUser();
    }
  }
  };

  return (
    <div>
      <CardTitleBar title={"Profile"} />
          <TextField
                     label="Name"
            margin="dense"
            id="name"
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value );
              handleChange(event);
          }}
            error={errors.name ? true : false}
            helperText={errors.name}
            type="text"
            fullWidth
          />

          <TextField
            
            margin="dense"
            id="email"
            name="email"
         label="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value );
              handleChange(event);
          }}
            error={errors.email ? true : false}
            helperText={errors.email}
            type="email"
            fullWidth
 
          />

<TextField
            
            margin="dense"
            id="phone"
            name="phone"
            label="Phone Number"
            onChange={(event) => {
              setPhone(event.target.value );
              handleChange(event);
          }}
            value={phone}
            error={errors.phone ? true : false}
            helperText={errors.phone}
            type="text"
            fullWidth

          />

<Box sx={{ display: 'flex', position: 'relative' }}>
      <TextField     margin="dense" id="password" label="Password" type={showPassword ? 'text' : 'password'} fullWidth    onChange={(event) => {
            setPassword(event.target.value );
            handleChange(event);
        }}
          value={password}
          error={errors.password ? true : false}
          helperText={errors.password}
          />
      <IconButton   onClick={() => { setShowPassword(!showPassword) }} sx={{ position: 'absolute', right: 0, top: 15 }}>
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </Box>

          <div class="flex justify-center ...">
          <Button 
               sx={{  top: 15 }}
              className="share-device-btn"
              autoFocus
              onClick={handleUpdateSubmit}
            >
              Update
            </Button>
          </div>
          <Snackbar
            sx={{ height: "60%"}}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "center"
            }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
          <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Successfully updated
        </Alert>
        </Snackbar>


    </div>
  )
}

export default Profile