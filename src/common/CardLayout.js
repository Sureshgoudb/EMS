import React from "react";
import { Paper, Grid, Typography } from "@mui/material";

const CardLayout = ({ children, title, action, ...restProps }) => {
  return (
    <Paper {...restProps}>
      <Grid container rowSpacing={1} sx={{ px: 2, alignItems: "center" }}>
        <Grid item xs={6} md={6}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="600"
            sx={{ marginBottom: 0 }}
          >
            {title}
          </Typography>
        </Grid>
        <Grid item xs={6} md={6} className="text-right py-2">
          {action}
        </Grid>
      </Grid>
      <hr />
      <div className="p-3">{children}</div>
    </Paper>
  );
};

export default CardLayout;
