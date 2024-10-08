// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { motion } from "framer-motion";
// import { styled } from "@mui/material/styles";

// const StyledDialog = styled(Dialog)(({ theme }) => ({
//   "& .MuiDialog-paper": {
//     borderRadius: 16,
//     boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
//     background: "linear-gradient(145deg, #f6f7f9, #ffffff)",
//   },
// }));

// const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
//   background: "linear-gradient(90deg, #3f51b5, #2196f3)",
//   color: "#ffffff",
//   fontWeight: "bold",
//   textAlign: "center",
//   padding: theme.spacing(2),
// }));

// const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
//   padding: theme.spacing(4),
// }));

// const StyledFormControl = styled(FormControl)(({ theme }) => ({
//   marginBottom: theme.spacing(3),
//   "& .MuiOutlinedInput-root": {
//     borderRadius: 8,
//     transition: "all 0.3s",
//     "&:hover": {
//       boxShadow: "0 0 0 2px rgba(63, 81, 181, 0.2)",
//     },
//   },
// }));

// const StyledButton = styled(Button)(({ theme }) => ({
//   borderRadius: 20,
//   padding: theme.spacing(1, 3),
//   fontWeight: "bold",
//   transition: "all 0.3s",
//   "&:hover": {
//     transform: "translateY(-2px)",
//     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//   },
// }));

// const GraphDialog = ({ open, onClose, graphData, columns }) => {
//   const [selectedGraphScripts, setSelectedGraphScripts] = useState([]);

//   const handleScriptSelect = (event) => {
//     setSelectedGraphScripts(event.target.value);
//   };

//   const exportToPdf = () => {
//     // PDF export logic (unchanged)
//   };

//   const chartColors = [
//     "#3f51b5",
//     "#f50057",
//     "#00bcd4",
//     "#ff9800",
//     "#4caf50",
//     "#9c27b0",
//     "#795548",
//     "#607d8b",
//     "#e91e63",
//     "#009688",
//   ];

//   return (
//     <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
//       <StyledDialogTitle>
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           Multi-Script Comparison
//         </motion.div>
//       </StyledDialogTitle>
//       <StyledDialogContent>
//         <StyledFormControl fullWidth>
//           <InputLabel id="script-select-label">Select Scripts</InputLabel>
//           <Select
//             labelId="script-select-label"
//             multiple
//             value={selectedGraphScripts}
//             onChange={handleScriptSelect}
//             renderValue={(selected) => selected.join(", ")}
//           >
//             {columns
//               .filter((col) => col.id !== "timestamp")
//               .map((col) => (
//                 <MenuItem key={col.id} value={col.id}>
//                   {col.label}
//                 </MenuItem>
//               ))}
//           </Select>
//         </StyledFormControl>
//         <Box id="graph-container" sx={{ height: 500, width: "100%" }}>
//           <ResponsiveContainer>
//             <AreaChart data={graphData}>
//               <defs>
//                 {selectedGraphScripts.map((script, index) => (
//                   <linearGradient
//                     key={script}
//                     id={`color-${script}`}
//                     x1="0"
//                     y1="0"
//                     x2="0"
//                     y2="1"
//                   >
//                     <stop
//                       offset="5%"
//                       stopColor={chartColors[index % chartColors.length]}
//                       stopOpacity={0.8}
//                     />
//                     <stop
//                       offset="95%"
//                       stopColor={chartColors[index % chartColors.length]}
//                       stopOpacity={0.1}
//                     />
//                   </linearGradient>
//                 ))}
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
//               <XAxis
//                 dataKey="timestamp"
//                 tick={{ fill: "#666", fontSize: 12 }}
//                 tickFormatter={(value) => new Date(value).toLocaleDateString()}
//               />
//               <YAxis tick={{ fill: "#666", fontSize: 12 }} />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "rgba(255, 255, 255, 0.8)",
//                   borderRadius: 8,
//                   boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
//                   border: "none",
//                 }}
//                 labelStyle={{ fontWeight: "bold", color: "#333" }}
//               />
//               <Legend
//                 wrapperStyle={{ paddingTop: 20 }}
//                 iconType="circle"
//                 iconSize={10}
//               />
//               {selectedGraphScripts.map((script, index) => (
//                 <Area
//                   key={script}
//                   type="monotone"
//                   dataKey={script}
//                   stroke={chartColors[index % chartColors.length]}
//                   fillOpacity={1}
//                   fill={`url(#color-${script})`}
//                   strokeWidth={2}
//                   activeDot={{ r: 6 }}
//                 >
//                   <motion.animate
//                     attributeName="fillOpacity"
//                     from="0"
//                     to="1"
//                     dur="1s"
//                     begin="0s"
//                   />
//                 </Area>
//               ))}
//             </AreaChart>
//           </ResponsiveContainer>
//         </Box>
//       </StyledDialogContent>
//       <DialogActions sx={{ padding: 3, justifyContent: "space-between" }}>
//         <StyledButton onClick={exportToPdf} variant="outlined" color="primary">
//           Export to PDF
//         </StyledButton>
//         <StyledButton onClick={onClose} variant="contained" color="primary">
//           Close
//         </StyledButton>
//       </DialogActions>
//     </StyledDialog>
//   );
// };

// export default GraphDialog;
