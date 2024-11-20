// // src/CurrentDataDisplay.js
// import React from "react";
// import { Button, Box, Typography, IconButton, Paper } from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import RemoveIcon from "@mui/icons-material/Remove";

// const Widget = ({ terminalName, value, timestamp }) => {
//   return (
//     <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
//       <Typography variant="h6">{terminalName}</Typography>
//       <Typography variant="body1">Value: {value}</Typography>
//       <Typography variant="body2" color="textSecondary">
//         Timestamp: {timestamp}
//       </Typography>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         marginTop={2}
//       >
//         <Button variant="contained" color="primary" startIcon={<RefreshIcon />}>
//           Refresh
//         </Button>
//         <IconButton>
//           <ExpandMoreIcon />
//         </IconButton>
//         <IconButton>
//           <RemoveIcon />
//         </IconButton>
//       </Box>
//     </Paper>
//   );
// };

// const CurrentDataDisplay = () => {
//   // Example data, replace with actual data fetching
//   const widgets = [
//     {
//       terminalName: "132kVTSP",
//       value: "96.32 MW",
//       timestamp: "24/04/2024 14:55:55",
//     },
//     {
//       terminalName: "132kVPATNA",
//       value: "84.09 MW",
//       timestamp: "24/04/2024 14:55:55",
//     },
//   ];

//   return (
//     <Box>
//       {widgets.map((widget, index) => (
//         <Widget
//           key={index}
//           terminalName={widget.terminalName}
//           value={widget.value}
//           timestamp={widget.timestamp}
//         />
//       ))}
//     </Box>
//   );
// };

// export default CurrentDataDisplay;
