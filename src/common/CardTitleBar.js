import React from "react";
import { Card, Grid, Typography } from "@mui/material";

const CardTitleBar = ({ title, children,middle }) => {
  return (
    <Card
      sx={{
        background: "#007c89",
        color: "white",
        borderRadius: 0,
        padding: "8px 22px",
        margin: "-28px -20px 32px",
      }}
    >
      <Typography variant="h6" component="h2">
        {title}
        <div className="float-right inline-grid grid-cols-2 gap-4">
         <p>{middle}</p>
        <div >{children}</div> 
      </div>

      </Typography>
    
 
    </Card>
  );
};

export default CardTitleBar;
