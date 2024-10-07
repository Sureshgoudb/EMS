import React, { useState, useEffect, useRef } from "react";
import LinearProgress from '@mui/material/LinearProgress';
import { useSelector, useDispatch } from "react-redux";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from "axios";
import {
  FormControl,
  InputLabel,
  MenuItem,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Select,
  Button,
  Grid,
  CircularProgress
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { addDevice, removeDevice } from "../store/slices/deviceSlice";
import CardLayout from "../common/CardLayout";
import CardTitleBar from "../common/CardTitleBar";
import dayjs from "dayjs";
import { io } from 'socket.io-client';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
export default function DeviceData() {
  //const [socketVar, setSocketVar] = useState(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeout = useRef(null);
  const [values, setValues] = useState([]);
  const [hideElement, sethideElement] = useState(false);
  const [valuesforgrid, setValuesForGrid] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [columns, setColumns] = useState([]);
  const basicColumns = [
    { field: "id", headerName: "ID", width: 90, hide: true },
    {
      field: "timestamp",
      editable: false,
      headerName: "Time",
      width: 220, flex: 1
    },
    {
      field: "device", editable: false,
      headerName: "Device",
      width: 150, flex: 1
    },
  ];
  const dispatch = useDispatch();
  let user = useSelector((store) => store.user);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  user =
    user != null || user != undefined
      ? user
      : JSON.parse(localStorage.getItem("user"));

  const handleDragStart = (e, index) => {
    setDraggedItem(values[index]);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);
    e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
  };

  const handleDragOver = (index) => {
    const draggedOverItem = values[index];

    // If the dragged item is dragged over itself, ignore
    if (draggedItem === draggedOverItem) {
      return;
    }

    // Filter out the dragged item from the array
    const newItems = values.filter((item) => item !== draggedItem);

    // Insert the dragged item at the new index
    newItems.splice(index, 0, draggedItem);

    // Update the state with the new order
    setValues(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleChange = (event) => {
    if (event.target.value == "trends") {
      //if(socketVar!=null)
      //socketVar.off('instant-record');
      sethideElement(true);
      setLive(false);
      clearInterval(timeout.current);
    } else {
      setLive(true);
      sethideElement(false);
    }
    setValues([]);
  };



  const handleDeviceClick = async (e) => {
    //if(socketVar!=null)
    // socketVar.off('instant-record');
    setSelectedOption(e.target.value);
  };

  const apiCall = async (e) => {

    if (live && selectedOption.length > 0) {
      let url = apiKey + "instant/list/" + selectedOption;
      await axios
        .get(url)
        .then(async (response) => {
          console.log(apiKey + "instant/list/" + selectedOption + " - hit")
          setValues(response.data);
          setLoading(false);
        })
        .catch((error) => { });
      /*
              socketVar.on('instant-record',(response)=>{
                if (response.deviceid === selectedOption) {
                  console.log("deviceid:" + selectedOption+"\n ")
                  setValues(response);
              }
              });
              */

    }
  };


  const handleSubmitClick = async (e) => {
    console.log("live value : " + live)
    if (live) {
      setLoading(true);
      clearInterval(timeout.current);
      timeout.current = setInterval(apiCall, 3000);
      //apiCall();
    } else {
      setLoading(true);
      //if(socketVar!=null)
      // socketVar.off('instant-record');
      let url =
        apiKey +
        "trends/list/" +
        selectedOption +
        "?from=" +
        e.target.form.from.value +
        "&to=" +
        e.target.form.to.value;
      await axios
        .get(url)
        .then(async (response) => {
          setLoading(false);
          let data = response.data;
          let fieldsColumns = basicColumns;
          let dataforGrid = [];
          data.map((item, index) => {
            let todate = new Date(item.timestamp);
            /*if (todate.getTimezoneOffset() === -330) {
              todate.setHours(todate.getHours() + 5);
              todate.setMinutes(todate.getMinutes() + 30);
              console.log("After adding 5:30 hours todate: " + JSON.stringify(todate));
            }*/
            let record = {
              id: index + 1,
              //timestamp: todate.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',second:'2-digit'}),
              timestamp: dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss"),
              device: item.device.devicename,
            };
            item.fields.map((param) => {
              let paramname = param.name;
              let paramvalue = param.value;
              if (index == 0) {
                fieldsColumns.push({
                  field: paramname,
                  headerName:
                    paramname.charAt(0).toUpperCase() + paramname.slice(1),
                  width: 150,
                  editable: false,
                  flex: 1
                });
                setColumns(fieldsColumns);
              }
              record[paramname] = paramvalue;
            });
            dataforGrid.push(record);
          });
          setValuesForGrid(dataforGrid);
        })
        .catch((error) => { });
    }
  };


  useEffect(() => {
    let url;
    //const socket = io.connect(apiKey+"instant"); 
    //setSocketVar(socket);
    async function getData() {
      if (user.parentId != null || user.parentId != undefined) {
        url = apiKey + "device/list/" + user.customerID
      }
      else {
        url = apiKey + "device/list/"
      }
      await axios.get(url).then(async (response) => {
        setDevices(response.data);
        dispatch(addDevice(response.data));
        localStorage.setItem("devices", JSON.stringify(response.data));
      });
    }
    getData();
    return () => {
      clearInterval(timeout.current);
      //if (socket) {
      // socket.disconnect();
      //}
    };

  }, []);

  return (
    <>
      <div>
        <CardTitleBar title={"Device Data"} />
        <CardLayout title={"Device Data"} action={""}>
          <form>
            <Grid container spacing={2} mb={1}>
              <Grid item xs={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label">
                    Select Device
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedOption}
                    label="Select Device"
                    onChange={handleDeviceClick}
                  >
                    {devices.map((option) => (
                      <MenuItem
                        key={option.devicename}
                        value={option.deviceid}
                        sx={{ font: 12 }}
                      >
                        {option.devicename}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormLabel component="legend">Monitoring Type</FormLabel>

                <RadioGroup
                  aria-label="monitoringtype"
                  name="monitoringtype"
                  onChange={handleChange}
                  row
                >
                  <FormControlLabel
                    value="realtime"
                    control={<Radio />}
                    label="Real Time"
                  />
                  <FormControlLabel
                    value="trends"
                    control={<Radio />}
                    label="History"
                  />
                </RadioGroup>
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitClick}
                  sx={{ background: "rgba(0, 0, 0, 0.6)" }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>

            <Grid container spacing={3} alignItems="center" my={1}>
              <Grid item xs={12} style={{ paddingTop: "0px" }}>
                {hideElement && (
                  <>


                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker id="from"
                        name="from"
                        timeSteps={{ minutes: 15 }} slotProps={{ textField: { size: 'small' } }} />
                    </LocalizationProvider>


                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker id="to"
                        name="to"
                        timeSteps={{ minutes: 15 }} slotProps={{ textField: { size: 'small' } }} />
                    </LocalizationProvider>

                  </>
                )}
              </Grid>
            </Grid>
          </form>
          {hideElement && (
            loading ? <LinearProgress /> :
              <DataGrid
                slots={{ toolbar: GridToolbar }}
                rows={valuesforgrid}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 16,
                    },
                  },
                  columns: {
                    columnVisibilityModel: {
                      // Hide the 'id' column
                      id: false,
                    },
                  },
                }}
                pageSizeOptions={[16, 32, 48, 64, 80, 96]}

                disableRowSelectionOnClick
                slotProps={{ toolbar: { showQuickFilter: true } }}
                sx={{ "&, [class^=MuiDataGrid-root ]": { border: "none" } }}
              />
          )}

          {loading && live ? <div class='flex items-center justify-center'> <CircularProgress /></div> : (values.length > 0 ?
            (<div className=" flex flex-wrap mx-10 my-36 md:mx-10 md:my-36 lg:mx-20 lg:my-36 ">
              {
                values.map((item, index) =>
                  item.fields.map((field) => (
                    <div className="mt-4 ml-5 mr-5 mb-2 `order-{index}`  card-list w-full  md:w-40 lg:w-52 xl:w-52 rounded ">
                      <div
                        className="card h-20 rounded cursor-pointer "
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={() => handleDragOver(index)}
                        onDragEnd={handleDragEnd}
                        style={{
                          backgroundColor: item === draggedItem ? "#850085" : "",
                        }}
                      >
                        <div className=" text-center ">
                          <div className="card-body text-center p-10">
                            <p className="card-text">{field.name} </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer h-12 py-3 bg-black text-white dark:bg-white dark:text-black mb-0 text-center rounded " style={{ fontWeight: 'bold' }}>
                        <span> {parseFloat(field.value).toFixed(2)}</span>
                      </div>
                      <div className="card-footer h-12 py-3 text-white dark:bg-white dark:text-black mb-0 text-center rounded " style={{ background: '#007c89' }}>
                        <span> {
                          dayjs.utc(item.timestamp).format("YYYY-MM-DD HH:mm:ss")
                        }
                        </span>
                      </div>
                    </div>
                  ))
                )
              }</div>) : (


              <div class='flex items-center justify-center'>
                { live && ( <span>
                  No data available
                </span>)}
              </div>


            ))}

        </CardLayout>
      </div>
    </>
  );
}
