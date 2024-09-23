import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Button,
  TextField,
  Grid,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
    
} from "@mui/material";
import RightDrawerDialog from "../../common/RightDrawerDialog";
import { ErrorSharp } from "@mui/icons-material";
import useForm from "../../Hooks/useForm";
import { validator } from "../../Helpers/validator";

const BarChartDialog = ({
  customerid,
  closeDialog,
  open,
  isChatDialog,
  handleChartObjChange,
  openEditDialog,
  closeEditDrawer,
  editData
}) => {
  const [seriesNb, setSeriesNb] = useState(2);
  const [itemNb, setItemNb] = useState(5);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [layout, setLayout] = useState("");
  const [chartSetting, setChartSetting] = useState({
    name : "",
    label : "",
    controlType: "Bar",
    width: "",
    height: "",
    catRatio: "",
    barGapRatio: "",
    position : "[3,2,0,0]",
  });
  const [devices, setDevices] = useState([]);
  const [variables, setVariables] = useState([]);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const user = useSelector((store) => store.user);
  const [selectedDevice, setSelectedDevice] = useState({});
  const [selectedVariable, setSelectedVariable] = useState({});
  const [showavg, setShowavg] = useState(false);
  const [displayavg, setDisplayavg] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const handleDeviceClick = (e) => {
    setSelectedDevice(e.target.value);
    getVariables(e.target.value.deviceid);
  };

  const handleVariableClick = (e) => {
    setSelectedVariable(e.target.value);
    const variable = variables.filter(
      (item) => item.variableid === e.target.value
    );
    if (variable !== null || variable !== undefined && variable.length>0) {
      setDisplayavg(variable[0].calcavg);
    }
  };

  async function getVariables(deviceid) {
    let url = apiKey + "variable/list/" + deviceid;
    await axios.get(url).then(async (response) => {
      setVariables(response.data);
    });
  }

  const handleItemNbChange = (event, newValue) => {
    if (typeof newValue !== "number") {
      return;
    }
    setItemNb(newValue);
  };
  const handleSeriesNbChange = (event, newValue) => {
    if (typeof newValue !== "number") {
      return;
    }
    setSeriesNb(newValue);
  };

  const handleLayoutChange = (e) => {
    const newLayout = e.target.checked ? "horizontal" : "";
    setLayout(newLayout);
  };
  const settings = {
    xAxis: [
      {
        label: chartSetting.label,
      },
    ],
    width: chartSetting.width,
    height: chartSetting.height,
  };

  const handleChartSettingChange = (prop, value) => {
    setChartSetting({
      ...chartSetting,
      [prop]: value,
    });
  };

  const handleChartSubmit = (e) => {
    // handleSubmit();
    // const isValidated = Object.values(errors).every((value) => value === "");
    // console.log(isValidated);
    // if(isValidated) {
      let id = editData!=undefined ? editData.id : "";
        const barChartObj = {
          controls: [
            { 
              controlId : id,
              deviceid: selectedDevice,
              //variableid: selectedVariable,
              controlType: "Bar",
              position : "[3,2,0,0]",
              properties: [{
                variableid: selectedVariable,
                skipAnimation: e.target.form.skipAnimation.value,
                layout: e.target.form.layout.value,
                chartSetting: { ...settings },
                categoryGapRatio: e.target.form.CategoryGapRatio.value,
                barGapRatio: e.target.form.BarGapRatio.value,
                showavg: e.target.form.avg === undefined ? false :e.target.form.avg.checked,
              }],
            },
          ],
        };
        handleChartObjChange(barChartObj, "Bar");
        if (openEditDialog) {
          closeEditDrawer();
        } else {
          closeDialog();
        }
      // }
   
  };


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
      if (editData != undefined) {
        setSelectedDevice(editData.deviceid);
        await getVariables(editData.deviceid);
        setSelectedVariable(editData.variableid);
        setDisplayavg(editData.showavg);
      }
    });
  }
  useEffect(() => {
    getData();
    console.log("useEffect" + editData);
    console.log("customerid" + customerid);

  }, [editData]);

  const [initState, setInitState] = useState({
    device: "",
    variable: "",
    label: "",
    width: "",
    height: "",
    categoryGapRatio: "",
    barGapRatio: "",
  });

  const {
    handleChange,
    handleSubmit,
    state,
    errors,
    setErrors,
    resetErrors,
  } = useForm({
    initState,
    callback: handleChartSubmit,
    validator,
  });

  useEffect(() => {
    if(!isAdd) {
      setInitState({
        device: "",
        variable: "",
        label: "",
        width: "",
        height: "",
        categoryGapRatio: "",
        barGapRatio: ""
      });
    }
  },[isAdd]);

  return (
    <>
      <RightDrawerDialog
        open={open || openEditDialog}
        onClose={() => {(closeDialog ? closeDialog() : closeEditDrawer()); setIsAdd(false);}}
        isChatDialog={isChatDialog}
        title={"Bar Chart Details"}
      >
       <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
        <Grid container spacing={2} my={1}>

          <Grid item xs={6}>
          <FormControl fullWidth error={errors.device ? true : false}>
              <InputLabel>Device</InputLabel>
              <Select
                id="device"
                name="device"
               
                label="Device"
                onChange={(e) => {handleDeviceClick(e); handleChange(e);}}
              >
                {devices.map((item, index) => (
                  <MenuItem key={index} value={item} sx={{ font: 12 }}>
                    {item.devicename}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.device}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          <FormControl fullWidth error={errors.device ? true : false}>
              <InputLabel>Variable</InputLabel>
              <Select
                id="variable"
                name="variable"
               
                label="Variable"
                onChange={(e) => {handleVariableClick(e); handleChange(e);}}
              >
                {variables.map((item, index) => (
                  <MenuItem key={index} value={item} sx={{ font: 12 }}>
                    {item.variablename}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.variable}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <InputLabel>Chart Settings</InputLabel>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="label"
              id="label"
              name="label"
              error={errors.label ? true : false}
              helperText={errors.label}
              defaultValue={editData!=null ?editData.label:""}
              onChange={(event) => {
                handleChartSettingChange("label", event.target.value);
                handleChange(event);
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              type="number"
              fullWidth
              id="width"
              name="width"
              defaultValue={editData!=null ?editData.chartSetting.width:""}
              label="width"
              onChange={(event) =>
                handleChartSettingChange("width", event.target.value)
              }
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              type="number"
              fullWidth
              id="height"
              name="height"
              label="height"
              defaultValue={editData!=null ? editData.chartSetting.height : ""}
              onChange={(event) =>
                handleChartSettingChange("height", event.target.value)
              }
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              type="number"
              fullWidth
              id="CategoryGapRatio"
              name="CategoryGapRatio"
              label="CategoryGapRatio"
              defaultValue={editData!=null ?editData.categoryGapRatio : ""}
              onChange={(event) =>
                handleChartSettingChange("categoryGapRatio", event.target.value)
              }
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              type="number"
              fullWidth
              id="BarGapRatio"
              name="BarGapRatio"
              label="BarGapRatio"
              defaultValue={editData!=null ?editData.barGapRatio: ""}
              onChange={(event) =>
                handleChartSettingChange("barGapRatio", event.target.value)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <InputLabel>Chart Layout</InputLabel>
            <FormControlLabel
              control={
                <Checkbox
                id="layout"
                name="layout"
                label="layout"
                  defaultChecked={editData!=null ?editData.layout === "horizontal":false}
                  onChange={handleLayoutChange}
                />
              }
              label={`${layout} Layout`}
            />
          </Grid>
          <Grid item xs={12}>
            <InputLabel>Chart Animation</InputLabel>
            <FormControlLabel
              defaultChecked={editData!=null ?editData.skipAnimation :false}
              control={
                <Checkbox
                 id="skipAnimation"
                name="skipAnimation"
                label="skipAnimation"
                  onChange={(event) => setSkipAnimation(event.target.checked)}
                />
              }
              labelPlacement="end"
            />
            <Typography id="input-item-number" gutterBottom>
              Number of items
            </Typography>
            <Slider
              value={itemNb}
              onChange={handleItemNbChange}
              valueLabelDisplay="auto"
              min={1}
              max={20}
              aria-labelledby="input-item-number"
            />
            <Typography id="input-series-number" gutterBottom>
              Number of series
            </Typography>
            <Slider
              value={seriesNb}
              onChange={handleSeriesNbChange}
              valueLabelDisplay="auto"
              min={1}
              max={10}
              aria-labelledby="input-series-number"
            />
          </Grid>
          {displayavg && (
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="avg"
                      name="avg"
                      defaultChecked={editData != null ? editData.showavg : ""}
                      onChange={(event) => setShowavg(event.target.checked)}
                    />
                  }
                  label="Show Average"
                />
              </Grid>
            )}
          <Grid item xs={12}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              sx={{ background: "rgba(0, 0, 0, 0.6)" }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
        </form>
      </RightDrawerDialog>
    </>
  );
};

export default BarChartDialog;
