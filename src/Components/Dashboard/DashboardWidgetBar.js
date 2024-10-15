// import React from "react";
// import { Tooltip, IconButton } from "@mui/material";
// import GridViewIcon from "@mui/icons-material/GridView";
// import InsertChartIcon from "@mui/icons-material/InsertChart";
// import TextFieldsIcon from "@mui/icons-material/TextFields";
// import LabelIcon from "@mui/icons-material/Label";
// import ImageIcon from "@mui/icons-material/Image";

// const WidgetBar = ({ onWidgetSelect }) => {
//   const widgets = [
//     { id: "table-grid", icon: GridViewIcon, label: "Table Grid" },
//     // { id: "chart", icon: InsertChartIcon, label: "Chart" },
//     // { id: "text-field", icon: TextFieldsIcon, label: "Text Field" },
//     // { id: "label", icon: LabelIcon, label: "Label" },
//     // { id: "image", icon: ImageIcon, label: "Image" },
//   ];

//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: "8px",
//         marginBottom: "16px",
//         padding: "8px",
//         backgroundColor: "#f5f5f5",
//         borderRadius: "4px",
//       }}
//     >
//       {widgets.map((widget) => {
//         const Icon = widget.icon;
//         return (
//           <Tooltip key={widget.id} title={widget.label}>
//             <IconButton size="medium" onClick={() => onWidgetSelect(widget.id)}>
//               <Icon />
//             </IconButton>
//           </Tooltip>
//         );
//       })}
//     </div>
//   );
// };

// export default WidgetBar;
