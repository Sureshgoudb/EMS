import React from "react";
import { Box } from "@mui/material";
import DataTable from "./DataTable";

const HistoricalDataDisplay = () => {
  return (
    <Box
      sx={{
        padding: 4,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "#fafafa",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <DataTable />
    </Box>
  );
};

export default HistoricalDataDisplay;
