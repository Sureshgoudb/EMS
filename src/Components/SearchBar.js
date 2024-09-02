import React, { useState } from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const SearchBar = ({ onChange, onRequestSearch, placeholder }) => {
  const [searchText, setSearchText] = useState("");

  const handleChange = (event) => {
    setSearchText(event.target.value);
    onChange && onChange(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onRequestSearch && onRequestSearch(searchText);
    }
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder || "Search"}
      value={searchText}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => onRequestSearch(searchText)}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
