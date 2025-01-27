import React, { useEffect, useState } from "react";
import LinearProgress from '@mui/material/LinearProgress';
import { useSelector } from "react-redux";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import axios from "axios";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Fab,
  TextField,
  Link,
  DialogActions,
  Typography,
  Grid,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import AddIcon from "@mui/icons-material/Add";
import { validator } from "../Helpers/validator";
import useForm from "../Hooks/useForm";
import CardLayout from "../common/CardLayout";
import CenterDialog from "../common/CenterDialog";
import useDialogActions from "../common/useDialogActions";
import CardTitleBar from "../common/CardTitleBar";

const columns = [
  { field: "id", headerName: "ID", width: 90, hide: true, flex: 1 },
  {
    field: "revisionno",
    headerName: "Revision No",
    width: 150,
    editable: false, flex: 1
  },
  {
    field: "blockno",
    headerName: "Block",
    width: 150,
    editable: false, flex: 1
  },
  {
    field: "date",
    headerName: "Date",
    width: 250,
    editable: false, flex: 1
  },
  {
    field: "deviceid",
    headerName: "Device",
    width: 250,
    editable: false, flex: 1
  },
  {
    field: "avc",
    headerName: "AVC",
    width: 200,
    editable: false, flex: 1
  },
  {
    field: "sg",
    headerName: "SG",
    width: 200,
    editable: false, flex: 1
  },
];

function Schedule() {
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [dcsgData, setdcsgData] = useState([]);
  const [status, setStatus] = useState("");
  const [devices, setDevices] = useState([]);
  const [revisionNo, setRevisionNo] = useState(1);
  const [adddcsgs, setadddcsgs] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const user = useSelector((store) => store.user);
  const customerID =
    user != null || user != undefined
      ? user.customerID
      : JSON.parse(localStorage.getItem("user")).customerID;

  const getDeviceList = async (add) => {
    let url;
    if (user != null) {
      if (user.parentId != null || user.parentId != undefined) {
        url = apiKey + "device/list/" + customerID
      }
      else {
        url = apiKey + "device/list/"
      }
    }
    else {
      let localData = JSON.parse(localStorage.getItem("user"));
      if (localData.parentId != null || localData.parentId != undefined) {
        url = apiKey + "device/list/" + localData.customerID
      }
      else {
        url = apiKey + "device/list/"
      }
    }
    await axios
      .get(url)
      .then(async (response) => {
        setDevices(response.data);
        if (add) setadddcsgs(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getDeviceList();
  }, []);

  const handleadddcsgsClose = () => {
    setStatus("");
    setadddcsgs(false);
  };

  const handleDCSGPull = async (e) => {

    await getDCSGData(e.target.form.device.value, e.target.form.date.value);
  };

  const getDCSGData = async (deviceid, date) => {
    let url = apiKey + "dcsg/" + deviceid + "/" + date
    setLoading(true);
    await axios
      .get(
        url
      )
      .then(async (response) => {
        setLoading(false);
        let devicename = devices.filter(x => x.deviceid === deviceid)[0].devicename;
        let dcsgInfo = response.data.map((item) => {
          return item.data.map((record, index) => {
            let block = record.blockno;
            let today = new Date(item.date);
            today.setSeconds(record.blockno * 900);
            if (today.getTimezoneOffset() == -330) {
              today.setHours(today.getHours() - 5);
              today.setMinutes(today.getMinutes() - 30);
              console.log("After adding 5:30 hours today: " + JSON.stringify(today));
            }
            return {
              id: index + 1,
              deviceid: devicename,
              date: today.toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              revisionno: item.revisionno,
              blockno: record.blockno,
              avc: record.avc,
              sg: record.sg,
            };
          });
        });
        if (dcsgInfo.length > 0) {
          setdcsgData(dcsgInfo[0]);
          setRevisionNo(dcsgInfo[0][0].revisionno + 1);
        }
        else {
          setdcsgData([]);
          setRevisionNo(1);
        }
      })
      .catch((error) => { });
  }

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);

  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleUploadFile = async (file, deviceid, date) => {
    let url = apiKey + "dcsg/" + deviceid + "/" + date
    await axios
      .get(
        url
      )
      .then(async (response) => {
        let dcsgInfo = response.data.map((item) => {
          return item.data.map((record, index) => {
            return {
              id: index + 1,
              deviceid: item.deviceid,
              date: item.date,
              revisionno: item.revisionno,
              blockno: record.blockno,
              avc: record.avc,
              sg: record.sg,
            };
          });
        });
        let revisionNumber = 1;
        if (dcsgInfo.length > 0) {
          revisionNumber = dcsgInfo[0][0].revisionno + 1;
          setRevisionNo(revisionNumber);
        }
        else {
          revisionNumber = 1;
          setRevisionNo(revisionNumber);
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          let dcsgDataValue = {
            deviceid: deviceid,
            date: date,
            revisionno: revisionNumber,
            data: [],
          };
          for (let rowNum = 1; rowNum < 97; rowNum++) {
            const rowAddress = XLSX.utils.encode_row(rowNum);
            dcsgDataValue.data.push({
              blockno: ws[`A${rowAddress}`]?.w,
              avc: ws[`D${rowAddress}`]?.w,
              sg: ws[`C${rowAddress}`]?.w,
            });
            console.log({
              blockno: ws[`A${rowAddress}`]?.w,
              avc: ws[`D${rowAddress}`]?.w,
              sg: ws[`E${rowAddress}`]?.w,
            });
          }
          if (dcsgDataValue.data !== undefined && dcsgDataValue.data.length > 0) {
            let dcsgList = [];
            dcsgList.push(dcsgDataValue);
            const uploadDCSG = async () => {
              await axios
                .post(apiKey + "dcsg/upload", dcsgList)
                .then((response) => {
                  if (response.data.message === "Data inserted successfully") {
                    setStatus(response.data.message);
                    closeDialog();
                  }
                })
                .catch((error) => {
                  setStatus("Data insertion unsuccessfull:", error);
                });
            };
            uploadDCSG();
            setRevisionNo(1);
          }
        };
        reader.readAsBinaryString(file);
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
      });
  };

  const handleUpload = async (e) => {
    setLoader(true);
    setStatus("");
    const [file] = e.target.form.dcsgfile.files;
    let date = e.target.form.date.value;
    await getDCSGData(e.target.form.device.value, date);
    handleUploadFile(file, e.target.form.device.value, date);
  };

  const initState = {
    username: "",
    email: "",
    phone: "",
  };
  const submit = () => {
    console.log(" Submited");
  };
  const { handleChange, handleBlur, errors } = useForm({
    initState,
    callback: submit,
    validator,
  });
  let isValidForm =
    Object.values(errors).filter((error) => typeof error !== "undefined")
      .length === 0;
  const { open, openDialog, closeDialog } = useDialogActions();

  return (
    <div>
      <CardTitleBar title={"Schedule"} />
      <CardLayout
        title="AVC-SG"
        action={
          <div >
            <Fab
              onClick={openDialog}
              aria-label="add"
              className="add_from_section"
              size="medium"
            >
              <AddIcon className="add_from_Icon" />
            </Fab>
          </div>
        }
      >    

        <form>
          <Grid container spacing={2} mb={1}>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="demo-simple-select-label">
                  Select Device
                </InputLabel>
                <Select
                  autoFocus
                  labelId="demo-simple-select-label"
                  id="device"
                  name="device"
                  value={selectedOption}
                  label="Select Device"
                  onChange={handleOptionChange}
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
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker fullWidth id="date" label="Select Date" format="YYYY-MM-DD"
                  name="date" slotProps={{ textField: { size: 'small' } }} />
              </LocalizationProvider>

            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={handleDCSGPull}
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
            rows={dcsgData}
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
      {/*** add Schedule */}
      <CenterDialog open={open} onClose={closeDialog} title=" Upload DCSG">
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={3} alignItems="center" my={1}>
            <Grid item xs={6} md={6}>
              <Typography>Download DCSGs Template</Typography>
              <Link
                href={process.env.PUBLIC_URL + "/dcsg_template_file.xlsx"}
                download="dcsg_template_file.xlsx"
              >
                Download File
              </Link>
            </Grid>
            <Grid item xs={6} md={6}>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker fullWidth id="date" label="Select Date" format="YYYY-MM-DD" disablePast
                  name="date" slotProps={{ textField: { size: 'small' } }} />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6} md={6}>
              <Grid item xs={12} sx={{ m: 1 }}>
                <Typography>Select Device</Typography>
              </Grid>
              <FormControl fullWidth>
                <InputLabel id="device">Device</InputLabel>
                <Select
                  labelId="device"
                  id="device"
                  name="device"
                  label="device"
                  value={selectedDate}
                  onChange={handleDateChange}
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
            <Grid item xs={6} md={6}>
              <Grid item xs={12} sx={{ m: 1 }}>
                <Typography>Upload DCSG File</Typography>
              </Grid>
              <TextField
                required
                margin="dense"
                id="dcsgfile"
                name="dcsgfile"
                label=""
                defaultValue=""
                type="file"
                fullWidth
                variant="standard"
                error={errors.notificationname ? true : false}
                helperText={errors.notificationname}
                onBlur={handleBlur}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button className="action-cancel-btn" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              className="share-device-btn"
              autoFocus
              disabled={!isValidForm}
              onClick={handleUpload}
            >
              Upload
            </Button>
          </DialogActions>
        </form>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loader}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </CenterDialog>

    </div>
  );
}
export default Schedule;
