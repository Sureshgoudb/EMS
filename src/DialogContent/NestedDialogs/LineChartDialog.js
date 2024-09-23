import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Button,
  TextField,
  Grid,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Divider,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RightDrawerDialog from "../../common/RightDrawerDialog";
import useForm from "../../Hooks/useForm";
import { validator } from "../../Helpers/validator";
const chatOptionData = [
  "catmullRom",
  "linear",
  "monotoneX",
  "monotoneY",
  "natural",
  "step",
  "stepBefore",
  "stepAfter",
];

const LineChartDialog = ({
  customerid,
  closeDialog,
  open,
  isChatDialog,
  handleChartObjChange,
  openEditDialog,
  closeEditDrawer,
  editData
}) => {
  const user = useSelector((store) => store.user);
  const [selectedDevice, setSelectedDevice] = useState({});
  const [selectedVariable, setSelectedVariable] = useState({});
  const [inputFields, setInputFields] = useState([
    //  { variableid: '', chartLabel: '', stack: '', area: false, showMark: false, color: '', showavg: false, displayavg: false }
  ])
  const [selectedVariables, setSelectedVariables] = React.useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [color, setColor] = useState("#23bcc7");
  const [stack, setStack] = useState("");
  const [showArea, setShowArea] = useState(false);
  const [showMark, setShowMark] = useState(false);
  const [showavg, setShowavg] = useState(false);
  const [displayavg, setDisplayavg] = useState(false);
  const [xAxisValue, setXAxisValue] = useState("");
  const [yAxisValue, setYAxisValue] = useState("");
  const [name, setName] = useState("");
  const [bgcolor, setbgColor] = useState("#ffffff");
  const [blkrefresh, setblkrefresh] = useState(false);
  const [dayrefresh, setdayrefresh] = useState(false);
  const [label, setLabel] = useState("");
  const [devices, setDevices] = useState([]);
  const [variables, setVariables] = useState([]);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;


  const handleMultiSelectChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedVariables(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleDeviceClick = async (e) => {
    setSelectedDevice(e.target.value);
    await getVariables(e.target.value);
  };

  async function getVariables(deviceid) {
    let url = apiKey + "variable/list/" + deviceid;
    await axios.get(url).then(async (response) => {
      setVariables(response.data);
    });
  }
  const handleChartClick = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleVariableClick = (e) => {
    setSelectedVariable(e.target.value);
    const variable = variables.filter(
      (item) => item.variableid === e.target.value
    );
    if (variable !== null || variable !== undefined && variable.length > 0) {
      setDisplayavg(variable[0].calcavg);
    }
  };
  const handleFormChange = (index, event) => {
    let data = [...inputFields];
    if (event.target.name === 'variableid') {
      const variable = variables.filter(
        (item) => item.variableid === event.target.value
      );
      if (variable !== null || variable !== undefined && variable.length > 0) {
        data[index].displayavg = variable[0].calcavg;
      }
    }
    if (event.target.name === 'area' || event.target.name === 'showMark' || event.target.name === 'showavg' || event.target.name === 'day'|| event.target.name === 'blockwise') {
      data[index][event.target.name] = event.target.checked;
    }
    else
      data[index][event.target.name] = event.target.value;
    setInputFields(data);
  }

  const addFields = () => {
    let newfield = { variableid: '', chartLabel: '', stack: '', area: false, showMark: false, color: '', showavg: false, displayavg: false }
    setInputFields([...inputFields, newfield])
  }

  const removeFields = (index) => {
    let data = [...inputFields];
    data.splice(index, 1)
    setInputFields(data)
  }

  const handleChartSubmit = (e) => {
    let id = editData != undefined ? editData.id : "";
    //const newXAxisValue = parseFloat(e.target.form.xAxisValue.value.trim());
    //const newYAxisValue = parseFloat(e.target.form.yAxisValue.value.trim());

    //if (!isNaN(newXAxisValue) && !isNaN(newYAxisValue)) {
    let propertydata = inputFields.map(x => {
      return {
        "variableid": x.variableid,
        "label": x.chartLabel,
        "stack": x.stack,
        "area": x.area,
        "showMark": x.showMark,
        "showavg": x.showavg,
        "color": x.color === '' ? "#000000" : x.color
      }
    });
    const lineChartObj = {
      controls: [
        {
          controlId: id,
          name: e.target.form.name.value,
          label: e.target.form.label.value,
          style: e.target.form.style.value,
          deviceid: selectedDevice,
          //variableid: selectedVariable,
          controlType: "Line",
          position: "[3,2,0,0]",
          bgcolor: e.target.form.bgcolor.value,
          blockwise : e.target.form.blockwise.checked,
          day : e.target.form.day.checked,
          properties: propertydata,
          /*{

            style: e.target.form.style.value,
            label: e.target.form.chartLabel.value,
            stack: e.target.form.stack.value,
            area: e.target.form.area.checked,
            showMark: e.target.form.showMark.checked,
            showavg: e.target.form.avg === undefined ? false : e.target.form.avg.checked,
            color: e.target.form.color.value
          },*/
        },
      ],
    };
    handleChartObjChange(lineChartObj, id);
    console.log(JSON.stringify(lineChartObj));
    if (openEditDialog) {
      closeEditDrawer();
    } else {
      closeDialog();
    }


    //} else {
    //console.error("Invalid input format values");
    //}
  };
  async function getData() {

    let url;
    if (user.parentId != null || user.parentId != undefined) {
      url = apiKey + "device/list/" + customerid
    }
    else {
      url = apiKey + "device/list/"
    }

    await axios.get(url).then(async (response) => {
      setDevices(response.data);
      if (editData != undefined) {

        setSelectedDevice(editData.deviceid);
        await getVariables(editData.deviceid);
        editData.properties.map(item => {
          if (item.showavg) {
            item.displayavg = true;
          }
          else {
            item.displayavg = false;
          }          
        });
        setInputFields(editData.properties);
        /*
        setSelectedVariable(editData.variableid);
        setDisplayavg(editData.showavg);*/
      }
    });
  }
  useEffect(() => {
    if (editData != undefined) {
      setInputFields(editData.properties);
    }
    else {
      addFields();
    }
    getData();
    console.log("useEffect" + editData);
    console.log("customerid" + customerid);
  }, [editData]);

  const [initState, setInitState] = useState(editData ? {
    name: editData.name,
    label: editData.label,
    style: editData.style,
    device: editData.deviceid
  }: {
      name: "",
      label: "",
      style: "",
      device: ""
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
    callback: handleChartSubmit,
    validator,
  });

  return (
    <>
      <RightDrawerDialog
        open={open || openEditDialog}
        onClose={closeDialog || closeEditDrawer}
        isChatDialog={isChatDialog}
        title={"Line Chart Details"}
      >
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <Grid container spacing={2} my={1}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                error={errors.name ? true : false}
                helperText={errors.name}
                defaultValue={editData != null ? editData.name : ""}
                onChange={(event) => {setName(event.target.value); handleChange(event);}}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="label"
                name="label"
                label="label"
                error={errors.label? true : false}
                helperText={errors.label}
                defaultValue={editData != null ? editData.label : ""}
                onChange={(event) => {setLabel(event.target.value); handleChange(event);}}
              />
            </Grid>
            {/*
          <Grid item xs={6}>
            <TextField
               id="xAxisValue"
               name="xAxisValue"
              fullWidth
              defaultValue={editData!=null ? editData.xAxisValues : ""}
              label="X-Axis Value"
              onChange={(event) => setXAxisValue(event.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
             id="yAxisValue"
             name="yAxisValue"
                    defaultValue={editData!=null ? editData.yAxisValues :""}
              fullWidth
              label="Y-Axis Value"
              onChange={(event) => setYAxisValue(event.target.value)}
            />
          </Grid>*/
            }
            <Grid item xs={6}>
              <FormControl fullWidth error={errors.style ? true : false}>
                <InputLabel id="demo-simple-select-label">Chart Style</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="style"
                  name="style"
                  defaultValue={editData != null ? editData.style : ""}

                  label="Select Device"
                  onChange={(e) => {handleChartClick(e); handleChange(e);}}
                >
                  {chatOptionData.map((item, index) => (
                    <MenuItem key={index} value={item} sx={{ font: 12 }}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.style}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth error={errors.device ? true : false}>
                <InputLabel>Device</InputLabel>
                <Select
                  id="device"
                  name="device"
                  defaultValue={editData != null ? editData.deviceid : ""}
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
                    <TextField
                      id="bgcolor"
                      name="bgcolor"
                      type="color"
                      label="Background"
                      defaultValue={editData != null ? editData.bgcolor : "#ffffff"}
                      onChange={(event) => setbgColor(event.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="blockwise"
                            name="blockwise"
                            defaultChecked={editData != null ? editData.blockwise : ""}
                            //onChange={(event) => setShowavg(event.target.checked)}
                            onChange={event => setblkrefresh(event.target.value)}
                          />
                        }
                        label="Block Refresh"
                      />
                       <FormControlLabel
                      control={
                        <Checkbox
                          id="day"
                          name="day"
                          defaultChecked={editData != null ? editData.day : ""}
                          //onChange={(event) => setShowMark(event.target.checked)}
                          onChange={event => setdayrefresh(event.target.value)}
                        />
                      }
                      label="24 Hour"
                    />
                    </Grid>
            <Grid item xs={12}>
              <Divider spacing={2}>
                <Button variant="text" onClick={addFields}>Add Another Series</Button>
              </Divider>
            </Grid>
            {inputFields.map((input, index) => {
              return (
                <Grid container spacing={2} my={1} mx={1} key={index} >
                  <Grid item xs={12}>
                    <Divider spacing={2}>
                      <InputLabel id="demo-simple-select-label">Variable Details</InputLabel>
                    </Divider>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Variable</InputLabel>
                      <Select
                        id="variableid"
                        name="variableid"
                        defaultValue={input != null ? input.variableid : ""}
                        // value={selectedVariables}
                        label="Variable"
                        // onChange={handleMultiSelectChange}
                        //onChange={handleVariableClick}
                        onChange={event => handleFormChange(index, event)}
                      >
                        {variables.map((item, index) => (
                          <MenuItem key={item.variableid} value={item.variableid} sx={{ font: 12 }}>
                            {item.variablename}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Custom Label"
                      id="chartLabel"
                      name="chartLabel"
                      defaultValue={input != null ? input.chartLabel : ""}
                      //onChange={(event) => setCustomLabel(event.target.value)}
                      onChange={event => handleFormChange(index, event)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Stack"
                      id="stack"
                      name="stack"
                      defaultValue={input != null ? input.stack : ""}
                      //onChange={(event) => setStack(event.target.value)}
                      onChange={event => handleFormChange(index, event)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      id="color"
                      name="color"
                      type="color"
                      label="Color"
                      defaultValue={input != null ? input.color : "#23bcc7"}
                      //onChange={(event) => setColor(event.target.value)}
                      onChange={event => handleFormChange(index, event)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="area"
                          name="area"
                          defaultChecked={input != null ? input.area : ""}
                          //onChange={(event) => setShowArea(event.target.checked)}
                          onChange={event => handleFormChange(index, event)}
                        />
                      }
                      label="Show Area"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="showMark"
                          name="showMark"
                          defaultChecked={input != null ? input.showMark : ""}
                          //onChange={(event) => setShowMark(event.target.checked)}
                          onChange={event => handleFormChange(index, event)}
                        />
                      }
                      label="Show Mark"
                    />
                   
                  </Grid>
               
                
                  {input.displayavg && (
                    <Grid item xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="showavg"
                            name="showavg"
                            defaultChecked={input != null ? input.showavg : ""}
                            //onChange={(event) => setShowavg(event.target.checked)}
                            onChange={event => handleFormChange(index, event)}
                          />
                        }
                        label="Show Average"
                      />
                    </Grid>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => removeFields(index)}
                      sx={{ color: "#e2640b " }}
                    >
                      <DeleteIcon fontSize="6px" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )
            })}


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

export default LineChartDialog;
