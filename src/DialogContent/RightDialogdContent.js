import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageIcon from "@mui/icons-material/Image";
import LabelIcon from "@mui/icons-material/Label";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import useDialogActions from "../common/useDialogActions";
import LineChartDialog from "./NestedDialogs/LineChartDialog";
import TextFieldDilog from "./NestedDialogs/TextFiledDialog";
import ImageDialog from "./NestedDialogs/ImageDialog";
import LabelDialog from "./NestedDialogs/LabelDialog";
import BarChartDialog from "./NestedDialogs/BarChartDialog";

const RightDialogdContent = ({ handleChartObjChange,customerid}) => {
  const accordionData = [
    { id: "1", name: "Charts" },
    { id: "2", name: "Metrics" },
  ];

  const { open, openDialog, closeDialog } = useDialogActions();
  const [isChatDialog, setIsChatDialog] = useState(false);
  const [nestedDialogType, setNestedDialogType] = useState(null);

  const handleNestedDialog = (dialogType) => {
    setIsChatDialog(true);
    openDialog();
    setNestedDialogType(dialogType);
  };

  return (
    <div>
      {accordionData.map((item, index) => (
        <Accordion key={index} sx={{ marginBottom: "15px" }}>
          <AccordionSummary
            expandIcon={<GridExpandMoreIcon />}
            sx={{ background: "lavender" }}
          >
            <Typography>{item.name}</Typography>
          </AccordionSummary>
          {item?.name?.toLowerCase() === "charts" && (
            <AccordionDetails>
              <Grid container spacing={1} mt={1}>
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleNestedDialog("lineChart")}
                  >
                    <StackedLineChartIcon />
                  </Button>
                  <Typography fontSize={15} sx={{ marginTop: "5px" }}>
                    Line Charts
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleNestedDialog("barChart")}
                  >
                    <InsertChartIcon />
                  </Button>
                  <Typography fontSize={15} sx={{ marginTop: "5px" }}>
                    Bar Charts
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          )}
          {item?.name?.toLowerCase() === "metrics" && (
            <AccordionDetails>
              <Grid container spacing={1} mt={1}>
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleNestedDialog("textField")}
                  >
                    <TextFieldsIcon />
                  </Button>
                  <Typography fontSize={15} sx={{ marginTop: "5px" }}>
                    Text Field
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleNestedDialog("image")}
                  >
                    <ImageIcon />
                  </Button>
                  <Typography fontSize={15} sx={{ marginTop: "5px" }}>
                    Image
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleNestedDialog("label")}
                  >
                    <LabelIcon />
                  </Button>
                  <Typography fontSize={15} sx={{ marginTop: "5px" }}>
                    Label
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          )}
        </Accordion>
      ))}
      {nestedDialogType === "lineChart" && (
        <LineChartDialog
          open={open}
          closeDialog={closeDialog}
          isChatDialog={isChatDialog}
          handleChartObjChange={handleChartObjChange}
          customerid = {customerid}
        />
      )}
      {nestedDialogType === "barChart" && (
        <BarChartDialog
          open={open}
          closeDialog={closeDialog}
          isChatDialog={isChatDialog}
          handleChartObjChange={handleChartObjChange}
          customerid = {customerid}
        />
      )}
      {nestedDialogType === "image" && (
        <ImageDialog
          open={open}
          closeDialog={closeDialog}
          isChatDialog={isChatDialog}
          handleChartObjChange={handleChartObjChange}
          customerid = {customerid}
        />
      )}
      {nestedDialogType === "textField" && (
        <TextFieldDilog
          open={open}
          closeDialog={closeDialog}
          isChatDialog={isChatDialog}
          handleChartObjChange={handleChartObjChange}
          customerid = {customerid}
        />
      )}
      {nestedDialogType === "label" && (
        <LabelDialog
          open={open}
          closeDialog={closeDialog}
          isChatDialog={isChatDialog}
          handleChartObjChange={handleChartObjChange}
          customerid = {customerid}
        />
      )}
    </div>
  );
};

export default RightDialogdContent;
