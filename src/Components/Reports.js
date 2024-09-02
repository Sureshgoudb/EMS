import React, { useState, useEffect } from "react";
import LinearProgress from '@mui/material/LinearProgress';
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import { addDevice } from "../store/slices/deviceSlice";
import {
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Select,
  Grid,
} from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Button from "@mui/material/Button";
import CardLayout from "../common/CardLayout";
import CardTitleBar from "../common/CardTitleBar";
export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [valuesforgrid, setValuesForGrid] = useState([]);
  const [devices, setDevices] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedReport, setSelectedReport] = useState("");

  const [columns, setColumns] = useState([]);
  const basicColumns = [
    { field: "id", headerName: "ID", width: 90, hide: true },
  ];
  const dispatch = useDispatch();
  let user = useSelector((store) => store.user);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  user =
    user != null || user != undefined
      ? user
      : JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    getDevices();
  }, []);

  const getDevices = async () => {
    let url;
    if(user !=null){
    if (user.parentId != null || user.parentId != undefined) {
      url = apiKey + "device/list/" + user.parentId
    }
    else {
      url = apiKey + "device/list/"
    }
  }
  else{
    let localData = JSON.parse(localStorage.getItem("user"));
    if (localData.parentId != null || localData.parentId != undefined) {
      url = apiKey + "device/list/" + localData.parentId
    }
    else {
      url = apiKey + "device/list/"
    }
  }
    await axios.get(url).then(async (response) => {
      setDevices(response.data);
      dispatch(addDevice(response.data));
      localStorage.setItem("devices", JSON.stringify(response.data));
    });
  }

  const getReports = async (deviceid) => {
    let reportsurl = apiKey + "report/list/" + deviceid;
    await axios.get(reportsurl).then(async (response) => {
      setReports(response.data);
      localStorage.setItem("reports", JSON.stringify(response.data));
    });
  }

  const deviceClick = async (e) => {
    setSelectedDevice(e.target.value);
    getReports(e.target.value)
  };

  const reportClick = async (e) => {
    setSelectedReport(e.target.value);
  }



  const handleSubmitClick = async (e) => {
    setLoading(true);
    let fromDate;
    let toDate;
    let url;
    if(e.target.form.from!=undefined){
      fromDate = new Date(e.target.form.from.value);
      fromDate.setDate(fromDate.getDate() + 1)
      url = apiKey +
      "report/execute/"+selectedDevice+"/"+selectedReport.reportid+
      "?from=" +fromDate.toISOString().split("T")[0]
    }

    if(e.target.form.to!=undefined){
      toDate = new Date(e.target.form.to.value);
      toDate.setDate(toDate.getDate() + 1)
      url += "&to=" + toDate.toISOString().split("T")[0];
    }
    console.log(url);
    await axios
      .get(url)
      .then(async (response) => {
        setLoading(false);
        let data = response.data;
        let fieldsColumns = basicColumns;
        let dataforGrid = [];
        data.map((item, index) => {
          let record = {
            id: index + 1,
            date: item.date
          };
          var keys = Object.keys(item);  

          if (index == 0) {
            keys.map(x=>{
              fieldsColumns.push({
                field: x,
                headerName:
                  x.charAt(0).toUpperCase() + x.slice(1),
                width: 150,
                editable: false,
                flex:1
              });
              setColumns(fieldsColumns);
            })
          }
          
              keys.map(x=>{
              record[x] = item[x].$numberDecimal === undefined ? item[x] :parseFloat(item[x].$numberDecimal).toFixed(2);
              })
          dataforGrid.push(record);
        });
        setValuesForGrid(dataforGrid);
      })
      .catch((error) => { });
  };

  return (
    <>
      <div>
        <CardTitleBar title={"Reports"} />
        <CardLayout title={"Reports"} action={""}>
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
                    value={selectedDevice}
                    label="Select Device"
                    onChange={deviceClick}
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
              <Grid item xs={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label">
                    Select Report
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Select Report"
                    value={selectedReport}
                    onChange={reportClick}
                  >
                    {reports.map((option) => (
                      <MenuItem
                        key={option.reportname}
                        value={option}
                        sx={{ font: 12 }}
                      >
                        {option.reportname}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {
                selectedReport != undefined && selectedReport.dateControl != undefined && (
                  <>
                    {selectedReport.dateControl.time && selectedReport.dateControl.sDate && (
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateTimePicker fullWidth id="from" label="From Date"
                            name="from"
                            timeSteps={{ minutes: 15 }} slotProps={{ textField: { size: 'small' } }} />
                        </LocalizationProvider>
                      </Grid>
                    )}
                    {selectedReport.dateControl.time && selectedReport.dateControl.eDate && (
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateTimePicker fullWidth id="to" label="To Date"
                            name="to"
                            timeSteps={{ minutes: 15 }} slotProps={{ textField: { size: 'small' } }} />
                        </LocalizationProvider>
                      </Grid>
                    )}

                    {!selectedReport.dateControl.time && selectedReport.dateControl.sDate && (
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker fullWidth id="from" label="From Date"
                            name="from" slotProps={{ textField: { size: 'small' } }} />
                        </LocalizationProvider>
                      </Grid>
                    )}
                    {!selectedReport.dateControl.time && selectedReport.dateControl.eDate && (
                      <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker fullWidth id="to" label="To Date"
                            name="to" slotProps={{ textField: { size: 'small' } }} />
                        </LocalizationProvider>
                      </Grid>
                    )}
                  </>
                )
              }
              <Grid item xs={2}>
                <Button
                  onClick={handleSubmitClick}
                  variant="contained"
                  color="primary"
                  sx={{ background: "rgba(0, 0, 0, 0.6)" }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
          {loading ? <LinearProgress /> :
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
          }
        </CardLayout>
      </div>
    </>
  );
}
