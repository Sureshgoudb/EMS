import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
import { addUser, removeUser } from "../store/slices/userSlice";
import { removeDevice } from "../store/slices/deviceSlice";

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [formError, setformError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clearData = () => {
    dispatch(removeDevice());
    dispatch(removeUser());
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const apiKey = process.env.REACT_APP_API_LOCAL_URL;
    const currentEmail = emailRef.current.value;
    const currentPass = passwordRef.current.value;
    setEmailError(currentEmail === "");
    setPasswordError(currentPass === "");

    if (currentEmail.length > 0 && currentPass.length > 0) {
      const loginData = {
        email: currentEmail,
        password: currentPass,
      };
      try {
        const response = await axios.post(apiKey + "auth/login", loginData);
        if (response.data && response.data.status !== "invalid user") {
          let parentId = null;
          const customer = await axios.get(
            apiKey + "customer/item/" + response.data.customerID
          );
          if (customer.data) {
            if (
              customer.data.parentId != null ||
              customer.data.parentId != undefined
            ) {
              parentId = customer.data.parentId;
            }
            localStorage.setItem("organization", JSON.stringify(customer.data));
          }
          let user = {
            email: response.data.email,
            name: response.data.name,
            user_Type: response.data.user_Type,
            customerID: response.data.customerID,
            phoneNo: response.data.phoneNo,
            userId: response.data.userId,
            parentId: parentId,
          };
          localStorage.setItem("user", JSON.stringify(user));
          dispatch(addUser(user));

          if (user.user_Type === "Admin") {
            navigate("/sldcview");
          } else {
            navigate("/view/terminal");
          }
        } else {
          setformError(true);
        }
      } catch (error) {
        console.error("Login error:", error);
        setformError(true);
      } finally {
        setLoading(false);
      }
    } else {
      setformError(true);
      setEmailError(currentEmail === "");
      setPasswordError(currentPass === "");
      setLoading(false);
    }
  };

  useEffect(() => {
    clearData();
  }, []);

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Grid justifyContent="center" alignItems="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper elevation={3} className="p-4">
            <Typography
              variant="h5"
              component="div"
              sx={{
                marginBottom: "15px",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Login
            </Typography>

            <form noValidate autoComplete="off">
              <TextField
                id="username"
                label="User Email"
                type="text"
                autoComplete="useremail"
                required
                fullWidth
                inputRef={emailRef}
                error={emailError}
                helperText={emailError && "Please enter User Email"}
                sx={{ marginBottom: "12px" }}
              />

              <TextField
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                fullWidth
                onKeyUp={handleEnterKey}
                inputRef={passwordRef}
                error={passwordError || formError}
                sx={{ marginBottom: "50px" }}
                helperText={
                  passwordError
                    ? "Please enter Password"
                    : formError && "Invalid credentials"
                }
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                sx={{ background: "rgba(0, 0, 0, 0.6)" }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;