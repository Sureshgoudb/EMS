import React from "react";
import { TextField, InputAdornment } from "@mui/material";

const getFlagUrl = (countryCode) => {
  return `https://flagsapi.com/${countryCode.toUpperCase()}/flat/24.png`;
};

const PhoneNumber = ({
  errors,
  state,
  handleChange,
  handleBlur,
  countryCode,
}) => {
  console.log(countryCode);
  return (
    <TextField
    sx={{ mt: 1}}
      required
      name="phone"
      label="Phone Number"
      error={errors.phone ? true : false}
      defaultValue={state.phone}
      onChange={handleChange}
      helperText={errors.phone}
      onBlur={handleBlur}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <img
              src={countryCode && getFlagUrl(countryCode)}
              alt={countryCode || ""}
              height="18px"
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PhoneNumber;
