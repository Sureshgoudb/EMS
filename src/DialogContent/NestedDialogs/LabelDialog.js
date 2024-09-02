import React, { useEffect, useState } from "react";
import {
  InputLabel,
  TextField,
  Grid,
  Button,
  MenuItem,
  IconButton,
  ButtonGroup,
  Divider,
  Typography,
} from "@mui/material";
import RightDrawerDialog from "../../common/RightDrawerDialog";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const LabelDialog = ({   customerid,closeDialog, open, isChatDialog, handleChartObjChange,editData }) => {

  const fontFamilies = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Tahoma",
  ];

  const [textProperties, setTextProperties] = useState({
    font: "Courier New",
    fontSize: "12px",
    fontStyle: "not-italic",
    lineHeight: "1",
    color: "#000000",
    bgcolor: "#ffffff",
    fontWeight: "normal",
    name:"",
    label:"",
    position : "[3,2,0,0]",
    controlType: "Label",
    controlId:""
  });

  const handleFontChange = (event) => {
    setTextProperties({ ...textProperties, font: event.target.value });
  };


  const handleFontSizeChange = (value) => {
    let str = textProperties.fontSize;
     str = str.replace("px","");
    setTextProperties({
      ...textProperties,
      fontSize: (Number(str) + value) +"px",
    });
  };

  const handleFontStyleChange = (event) => {
    setTextProperties({ ...textProperties, fontStyle: event.target.value });
  };

  const handleFontWeightChange = (event) => {
    setTextProperties({ ...textProperties, fontWeight: event.target.value });
  };

  const handleColorChange = (event) => {
    setTextProperties({ ...textProperties, color: event.target.value });
  };
  const handlebgColorChange = (event) => {
    setTextProperties({ ...textProperties, bgcolor: event.target.value });
  };

  
  const handleNameLable = (event) => {
    setTextProperties({ ...textProperties, name: event.target.value });
  };

  const handleLable = (event) => {
    setTextProperties({ ...textProperties, label: event.target.value });
  };
  
  const handleSubmit = () => {
    let id = editData!=undefined ? editData.id : "";
    setTextProperties({ ...textProperties, controlId: id});
    const tetxObj = {
      controls: [
        {
          controlId : textProperties.controlId,
          name : textProperties.name,
          controlType: "Label",
          position : "[3,2,0,0]",
          label : textProperties.label,
          bgcolor:textProperties.bgcolor,
          properties: [{
            color:textProperties.color,
            fontSize : textProperties.fontSize,
            fontStyle: textProperties.fontStyle,
            fontFamily: textProperties.font,
            fontWeight: textProperties.fontWeight,
          }],
        },
      ],
    };
    console.log(tetxObj, "tetxObj");
    handleChartObjChange(tetxObj, id);
    closeDialog();
  };

  useEffect(() => {
    console.log("useEffect"+ editData);
    if( editData != undefined){
    setTextProperties({
      font: editData.fontFamily,
      fontSize: editData.fontSize,
      fontStyle: editData.fontStyle,
      color: editData.color,
      fontWeight: editData.fontWeight,
      name:editData.name,
      controlId:editData.id,
label:editData.label,
bgcolor:editData.bgcolor
    });
  }
   }, [editData]);

  return (
    <>
      <RightDrawerDialog
        open={open}
        onClose={closeDialog}
        isChatDialog={isChatDialog}
        title={"Add Label Details"}
      >
        <Grid container spacing={2} my={1}>
          <Grid item xs={6}>
            <TextField
              select
              label="Font Family"
              value={textProperties.font}
              onChange={handleFontChange}
              fullWidth
            >
              {fontFamilies.map((fontFamily) => (
                <MenuItem key={fontFamily} value={fontFamily}>
                  {fontFamily}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Font Style"
              value={textProperties.fontStyle}
              onChange={handleFontStyleChange}
              fullWidth
            >
              <MenuItem value="not-italic">Normal</MenuItem>
              <MenuItem value="italic">Italic</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="name"
              fullWidth
              id="name"
              label="Name"
              variant="standard"
              defaultValue={editData!=null ? editData.name : ""}
              onChange={handleNameLable}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="label"
              fullWidth
              id="label"
              label="label"
              variant="standard"
              defaultValue={editData!=null ?editData.label : ""}
              onChange={handleLable}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Font Weight"
              value={textProperties.fontWeight}
              onChange={handleFontWeightChange}
              fullWidth
            >
              <MenuItem value="thin">Thin</MenuItem>
              <MenuItem value="extralight">Extralight</MenuItem>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="semibold">Semibold</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
              <MenuItem value="extrabold">Extrabold</MenuItem>
              <MenuItem value="black">Black</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              type="color"
              label="Color"
              value={textProperties.color}
              onChange={handleColorChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
                    <TextField
                      id="bgcolor"
                      name="bgcolor"
                      type="color"
                      label="Background"
                      value={textProperties.bgcolor}
                      onChange={handlebgColorChange}
                      fullWidth
                    />
                  </Grid>

          <Grid item xs={6}>
            <ButtonGroup
              variant="contained"
              aria-label="Basic button group"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <IconButton
                sx={{
                  background: "#007c89",
                  color: "white",
                  m: 1,
                  ":hover": {
                    backgroundColor: "#7dafb5",
                  },
                }}
                onClick={() => handleFontSizeChange(-1)}
                aria-label="Decrease Font Size"
              >
                <RemoveIcon />
              </IconButton>

              <Divider orientation="vertical" flexItem sx={{ mx: "-25px" }} />
              <Typography> {`${textProperties.fontSize}`}</Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: "-25px" }} />
              <IconButton
                sx={{
                  background: "#007c89",
                  color: "white",
                  m: 1,
                  ":hover": {
                    backgroundColor: "#7dafb5",
                  },
                }}
                onClick={() => handleFontSizeChange(1)}
                aria-label="Increase Font Size"
              >
                <AddIcon />
              </IconButton>
            </ButtonGroup>
          </Grid>
          <Grid item xs={6}></Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary"
              sx={{ background: "rgba(0, 0, 0, 0.6)" }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </RightDrawerDialog>
    </>
  );
};

export default LabelDialog;
