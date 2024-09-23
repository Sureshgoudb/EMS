import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
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
  FormControlLabel,
  Checkbox,
  Slider,
  FormControl,
  Select,
  FormHelperText,
} from "@mui/material";
import RightDrawerDialog from "../../common/RightDrawerDialog";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import useForm from "../../Hooks/useForm";
import { validator } from "../../Helpers/validator";

const TextFieldDialog = ({   customerid,closeDialog, open, isChatDialog,   handleChartObjChange,editData }) => {
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
    fontWeight: "normal",
    lineHeight: "1",
    color: "#000000",
    labelcolor: "#000000",
    timecolor: "#000000",
    bgcolor: "#ffffff",
    name:"",
    variableid:"",
    position : "[3,2,0,0]",
    deviceid: "",
    controlType: "TextField",
    controlId:"",
    showavg:false,
    lastupdated:true,
    decimalpoints:2
  });

  const [devices, setDevices] = useState([]);
  const [variables, setVariables] = useState([]);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const user = useSelector((store) => store.user);
  const [selectedDevice, setSelectedDevice] = useState({});
  const [selectedVariable, setSelectedVariable] = useState({});
  const [showavg, setShowavg] = useState(false);
  
  const [displayavg, setDisplayavg] = useState(false);
  // const [isAdd, setIsAdd] = useState(editData ? false : true);

  const handleDeviceClick = (e) => {
    setSelectedDevice(e.target.value);
    setTextProperties({ ...textProperties, deviceid: e.target.value });
    getVariables(e.target.value);
  };

  const handleVariableClick = (e) => {
    try{
    setTextProperties({ ...textProperties, variableid: e.target.value });
    setSelectedVariable(e.target.value);
    const variable = variables.filter(
      (item) => item.variableid === e.target.value
    );
    if (variable !== null || variable !== undefined && variable.length>0) {
      setDisplayavg(variable[0].calcavg);
    }
  }
  catch(error)
  {

  }

  };

  async function getVariables(deviceid) {
    let url = apiKey + "variable/list/" + deviceid;
    await axios.get(url).then(async (response) => {
      setVariables(response.data);
    });
  }

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

  const handleLabelColorChange = (event) => {
    setTextProperties({ ...textProperties, labelcolor: event.target.value });
  };
  const handledecimalChange = (event) => {
    setTextProperties({ ...textProperties, decimalpoints: event.target.value });
  };
  
  const handleTimeColorChange = (event) => {
    setTextProperties({ ...textProperties, timecolor: event.target.value });
  };

  const handlebgColorChange = (event) => {
    setTextProperties({ ...textProperties, bgcolor: event.target.value });
  };

  const handleshowavgChange = (event) => {
    setTextProperties({ ...textProperties, showavg: event });
  };
  const handleshowlastUpdatedChange = (event) => {
    setTextProperties({ ...textProperties, lastupdated: event });
  };
  

  const handleNameLable = (event) => {
    setTextProperties({ ...textProperties, name: event.target.value });
  };
  /*const handlePropertyChange = (event) => {
    setTextProperties({ ...textProperties, property: event.target.value });
  };*/
  
  const handleTextSubmit = () => {
    let id = editData!=undefined ? editData.id : "";
    setTextProperties({ ...textProperties, controlId: id});
    const tetxObj = {
      controls: [
        {
          controlId : textProperties.controlId,
          name : textProperties.name,
          deviceid: textProperties.deviceid,
          //variableid: textProperties.variableid,
          controlType: textProperties.controlType,
          position : "[3,2,0,0]",
          bgcolor:textProperties.bgcolor,
          properties: [{
            variableid: textProperties.variableid,
            labelcolor: textProperties.labelcolor,
            timecolor: textProperties.timecolor,
            color:textProperties.color,
            showavg: textProperties.showavg,
            lastUpdated:textProperties.lastupdated,
            fontSize : textProperties.fontSize,
            fontStyle: textProperties.fontStyle,
            fontFamily: textProperties.font,
            fontWeight: textProperties.fontWeight,
            decimalpoints:textProperties.decimalpoints,
          }],
        },
      ],
    };
    console.log(tetxObj, "tetxObj");
    handleChartObjChange(tetxObj, id);
    closeDialog();
  };

  useEffect(() => {
    async function getData() {
      let url;
      if(user.parentId != null || user.parentId  != undefined)
      {
          url = apiKey + "device/list/" + customerid
      }
      else
      {
        url = apiKey + "device/list/"
      }
      await axios.get(url).then(async (response) => {
        setDevices(response.data);
        if( editData != undefined){
          setSelectedDevice(editData.deviceid);
          await getVariables(editData.deviceid);
          setSelectedVariable(editData.variableid);
          setDisplayavg(editData.showavg);
          setTextProperties({
            font: editData.fontFamily,
            fontSize: editData.fontSize,
            fontStyle: editData.fontStyle,
            fontWeight: editData.fontWeight,
            lineHeight: "1",
            color: editData.color,
            labelcolor: editData.labelcolor,
            timecolor:editData.timecolor,
            name:editData.name ,
            deviceid: editData.deviceid,
            variableid: editData.variableid,
            controlType: "TextField",
            controlId:editData.id,
            showavg:editData.showavg,
            lastUpdated:editData.lastupdated,
            decimalpoints:editData.decimalpoints,
          });
        }
      });
    }
    getData();
   }, [editData]);

  //  const [initState, setInitState] = useState({
  //   labelData : "",
  //   device: "",
  //   variable: "",
  // });

  const [initState, setInitState] = useState(editData ? {
    labelData : editData.name,
    device : editData.deviceid,
    variable : editData.variableid,
  } : {
    labelData : "",
    device : "",
    variable : "",
  })

  const {
    handleChange,
    handleSubmit,
    state,
    errors,
    setErrors,
    resetErrors,
  } = useForm({
    initState,
    callback: handleTextSubmit,
    validator,
  });

  // useEffect(() => {
  //   if(isAdd) {
  //     setInitState({
  //       labelData : "",
  //       device : "",
  //       variable : "",
  //     });
  //   }
  //   else if(editData) {
  //     setInitState({
  //       labelData : editData.name,
  //       device : editData.deviceid,
  //       variable : editData.variableid,
  //     });
  //   }
  // },[isAdd]);

  return (
    <>
      <RightDrawerDialog
        open={open}
        onClose={() => {closeDialog(); }}
        isChatDialog={isChatDialog}
        title={"Add Text Field Detail"}
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
          <Grid item xs={6}>
            <TextField
              name="labelData"
              fullWidth
              id="standard-basic"
              label="Name"
              variant="standard"
              error={errors.labelData ? true : false}
              helperText={errors.labelData}
              defaultValue={editData!=null ? editData.name : ""}
              onChange={(e) => {handleNameLable(e); handleChange(e);}}
            />
          </Grid>

          <Grid item xs={6}>
                    <TextField
                      id="bgcolor"
                      name="bgcolor"
                      type="color"
                      label="Background"
                      defaultValue={editData != null ? editData.bgcolor : "#ffffff"}
                      onChange={handlebgColorChange}
                      fullWidth
                    />
                  </Grid>

          <Grid item xs={6}>
          <FormControl fullWidth error={errors.device ? true : false}>
              <InputLabel>Device</InputLabel>
              <Select
                id="device"
                name="device"
                defaultValue={editData!=null ? editData.deviceid : ""}
                label="Device"
                onChange={(e) => {handleDeviceClick(e); handleChange(e);}}
              >
               {devices.map((item, index) => (
                  <MenuItem key={item.deviceid} value={item.deviceid} sx={{ font: 12 }}>
                    {item.devicename}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.device}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
          <FormControl fullWidth error={errors.variable ? true : false}>
              <InputLabel>Variable</InputLabel>
              <Select
                id="variable"
                name="variable"
                defaultValue={editData!=null ? editData.variableid : ""}
                label="Variable"
                onChange={(e) => {handleVariableClick(e); handleChange(e);}}
              >
                 {variables.map((item, index) => (
                  <MenuItem key={item.variableid} value={item.variableid} sx={{ font: 12 }}>
                    {item.variablename}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.variable}</FormHelperText>
            </FormControl>
          </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Decimal Points"
                      id="decimalpoint"
                      name="decimalpoint"
                      defaultValue={editData != null ? editData.decimalpoints : ""}
                      onChange={handledecimalChange}
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
              label="Label Color"
              defaultValue={editData!=null ? editData.labelcolor : ""}
              onChange={handleLabelColorChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="color"
              label="Text Color"
              defaultValue={editData!=null ? editData.color : ""}
              onChange={handleColorChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
          <TextField
              type="color"
              label="Time Color"
              defaultValue={editData!=null ? editData.timecolor : ""}
              onChange={handleTimeColorChange}
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

              <Typography>
              {`${textProperties.fontSize}`}</Typography>

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
          <Grid item xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="lastupdated"
                      name="lastupdated"
                      defaultChecked={editData != null ? editData.lastupdated : ""}
                      onChange={(event) => handleshowlastUpdatedChange(event.target.checked)}
                    />
                  }
                  label="LastUpdated"
                />
              </Grid>
          {displayavg && (
              <Grid item xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="avg"
                      name="avg"
                      defaultChecked={editData != null ? editData.showavg : ""}
                      onChange={(event) => handleshowavgChange(event.target.checked)}
                    />
                  }
                  label="Show Average"
                />
              </Grid>
            )}
          <Grid item xs={12}>
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

export default TextFieldDialog;
