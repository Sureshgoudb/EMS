import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Fab,
  Card,
  FormLabel,
  Tooltip,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PauseIcon from "@mui/icons-material/Pause";
import { Responsive, WidthProvider } from "react-grid-layout";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import "./Devices/devices.css";
import CardLayout from "../common/CardLayout";
import RightDrawerDialog from "../common/RightDrawerDialog";
import useDialogActions from "../common/useDialogActions";
import RightDialogdContent from "../DialogContent/RightDialogdContent";
import CardTitleBar from "../common/CardTitleBar";
import LeftDrawerDialog from "../common/LeftDrawerDialog";
import LeftDialogContent from "../DialogContent/LeftDialogContent";
import BarChartDialog from "../DialogContent/NestedDialogs/BarChartDialog";
import LineChartDialog from "../DialogContent/NestedDialogs/LineChartDialog";
import TextFieldDialog from "../DialogContent/NestedDialogs/TextFiledDialog";
import LabelDialog from "../DialogContent/NestedDialogs/LabelDialog";
import ImageDialog from "../DialogContent/NestedDialogs/ImageDialog";
import { useSelector, useDispatch } from "react-redux";
import LineChartComponent from "./LineChartComponent.js";
import BarChartComponent from "./BarChartComponent.js";
import TextFieldComponent from "./TextFieldComponent.js";
import axios from "axios";
import ImageComponent from "./ImageComponent.js";
import WidgetBar from "./Dashboard/DashboardWidgetBar.js";
import TableGridDialog from "./Dashboard/TableGridDialog.js";
import TableGrid from "./Dashboard/TableGrid.js";

const StyledCard = styled(Card)({
  position: "relative",
  "&:hover .actionButtons": {
    opacity: 1,
  },
});

const ActionButtons = styled("div")({
  position: "absolute",
  top: "5px",
  right: "5px",
  display: "flex",
  gap: "5px",
  opacity: 0,
  transition: "opacity 0.3s",
});

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const Dashboard = () => {
  const user = useSelector((store) => store.user);
  const [delopen, setDelOpen] = useState(false);
  const [live, setLive] = useState(false);
  const [time, setTime] = useState(new Date());

  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const [layout, setLayout] = useState([]);

  const [assignDevice, setAssignDevice] = useState(false);
  const [update, setUpdate] = useState("");
  const [selectedDevice, setselectedDevices] = useState({});
  const { open, openDialog, closeDialog } = useDialogActions();
  const [socketVar, setSocketVar] = useState(null);
  const {
    open: openLeftDialog,
    openDialog: openLeftDrawer,
    closeDialog: closeLeftDrawer,
  } = useDialogActions();
  const {
    open: openEditDialog,
    openDialog: openEditDrawer,
    closeDialog: closeEditDrawer,
  } = useDialogActions();

  const [dashBoardData, setDashBoardData] = useState(() => {
    try {
      const storedData = sessionStorage.getItem("selectedDashboardItem");
      return storedData ? storedData : [];
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  });
  const [functionality, setFunctionality] = useState("");
  const [control, setControl] = useState({});
  const [selectedDashBoard, setSelectedDashBoard] = useState(null);
  const [controls, setControls] = useState({
    controlList: [{}],
  });
  const [selectedControl, setSelectedControl] = useState({});

  const [tableGridDialogOpen, setTableGridDialogOpen] = useState(false);

  // Generate auto grids
  const generateLayout = (items) => {
    if (!items || !items.controls) return [];

    return items.controls.map((control, index) => {
      let pos = control.position ? JSON.parse(control.position) : [2, 2, 0, 0];
      return {
        i: control.controlId || `item-${index}`,
        w: pos[0] || 2,
        h: pos[1] || 2,
        x: pos[2] || 0,
        y: pos[3] || 0,
      };
    });
  };

  const processChartData = (data) => {
    const updatedChartList = [];
    data.forEach((control) => {
      if (!control) return; // Skip if control is undefined

      const controlProperties = control.properties || [];
      const cType = control.controlType;
      if (cType === "table-grid") {
        const updatedGridValues = {
          id: control.controlId || "",
          type: control.controlType || "",
          name: control.name || "",
          label: control.label || "",
          bgcolor: control.bgcolor || "#ffffff",
          terminals: control.terminals || [],
          scripts: control.scripts || [],
        };
        updatedChartList.push(updatedGridValues);
      } else if (cType === "Line") {
        const updatedChartValues = {
          id: "",
          name: "",
          label: "",
          type: "",
          blockno: "",
          day: false,
          blockwise: false,
          timestamp: "",
          bgcolor: "#ffffff",
          xAxisValues: [],
          yAxisValues: [],

          deviceid: "",
          variableid: "",
          properties: [],

          data: [],
        };
        updatedChartValues.id = control.controlId || "";
        updatedChartValues.type = control.controlType || "";
        updatedChartValues.name = control.name || "";
        updatedChartValues.label = control.label || "";
        updatedChartValues.style = control.style || "";
        updatedChartValues.bgcolor =
          control.bgcolor != undefined ? control.bgcolor : "#ffffff";
        updatedChartValues.blockwise =
          control.blockwise != undefined ? control.blockwise : false;

        updatedChartValues.deviceid = control.deviceid || "";
        controlProperties.map((x, index) => {
          updatedChartValues.day = x.day;
          updatedChartValues.variableid = x.variableid;
          updatedChartValues.properties.push({
            variableid: x.variableid,
            chartLabel: x.label,
            area: x.area,
            showMark: x.showMark,
            stack: x.stack,
            color: x.color,
            showavg: x.showavg,
            day: x.day,
            data: [],
            data1: [],
            sf: 1,
          });
        });

        updatedChartList.push(updatedChartValues);
      } else if (cType === "Bar") {
        const updatedBarChatValues = {
          id: "",
          name: "",
          label: "",
          type: "",
          xAxisValues: [],
          yAxisValues: [],
          chartSetting: {},
          chartLabel: "",
          skipAnimation: false,
          showavg: false,
          layout: "",
          categoryGapRatio: "",
          barGapRatio: "",
          deviceid: "",

          properties: [],
          data: [],
        };
        updatedBarChatValues.id = control.controlId || "";
        updatedBarChatValues.type = control.controlType || "";
        updatedBarChatValues.name = control.name || "";
        updatedBarChatValues.label = control.label || "";
        updatedBarChatValues.chartSetting = control.chartSetting || "";
        updatedBarChatValues.chartLabel =
          controlProperties != undefined ? controlProperties[0].label : "";
        updatedBarChatValues.skipAnimation =
          controlProperties.skipAnimation || false;
        updatedBarChatValues.layout =
          controlProperties != undefined ? controlProperties[0].layout : "";
        updatedBarChatValues.categoryGapRatio =
          controlProperties.categoryGapRatio || "";
        updatedBarChatValues.barGapRatio =
          controlProperties != undefined
            ? controlProperties[0].barGapRatio
            : "";
        updatedBarChatValues.showavg =
          controlProperties != undefined
            ? controlProperties[0].showavg === undefined
              ? false
              : controlProperties[0].showavg
            : false;
        //updatedBarChatValues.variableid = control.variableid || "";
        updatedBarChatValues.deviceid = control.deviceid || "";
        updatedBarChatValues.properties =
          controlProperties != undefined ? controlProperties : [];
        updatedChartList.push(updatedBarChatValues);
      } else if (cType === "table-grid") {
        const updatedGridValues = {
          id: control.controlId || "",
          type: control.controlType || "",
          name: control.name || "",
          label: control.label || "",
          bgcolor: control.bgcolor || "#ffffff",
          properties: {
            rows: control.properties.rows || 2,
            columns: control.properties.columns || 2,
          },
          cells:
            control.cells ||
            Array(control.properties.rows || 2)
              .fill()
              .map(() =>
                Array(control.properties.columns || 2)
                  .fill()
                  .map(() => ({ terminal: "", variable: "" }))
              ),
        };
        updatedChartList.push(updatedGridValues);
      } else if (cType === "TextField") {
        const updatedTextFieldValues = {
          id: "",
          type: "",
          label: "",
          name: "",
          value: "",
          timestamp: "",
          bgcolor: "#ffffff",
          lastupdated: "",
          avgvalue: "",
          deviceid: "",
          fontStyle: "not-italic",
          fontFamily: "Courier New",
          fontWeight: "normal",

          properties: [],
          color: "",
          labelcolor: "",
          timecolor: "",
          fontSize: 12,
          showavg: false,
          sf: 1,
          decimalpoints: 2,
        };
        updatedTextFieldValues.id = control.controlId || "";
        updatedTextFieldValues.type = control.controlType || "";
        updatedTextFieldValues.name = control.name;
        updatedTextFieldValues.value = control.value;
        updatedTextFieldValues.avgvalue = control.avgvalue;
        updatedTextFieldValues.label = control.label;
        updatedTextFieldValues.color =
          controlProperties != undefined
            ? controlProperties[0].color
            : "#000000";
        updatedTextFieldValues.bgcolor =
          control.bgcolor != undefined ? control.bgcolor : "#ffffff";
        updatedTextFieldValues.labelcolor =
          controlProperties != undefined
            ? controlProperties[0].labelcolor
            : "#000000";
        updatedTextFieldValues.fontSize =
          controlProperties != undefined
            ? controlProperties[0].fontSize
            : "12px";
        updatedTextFieldValues.timecolor =
          controlProperties != undefined
            ? controlProperties[0].timecolor
            : "#000000";
        updatedTextFieldValues.showavg =
          controlProperties != undefined
            ? controlProperties[0].showavg !== undefined
              ? controlProperties[0].showavg
              : false
            : false;
        updatedTextFieldValues.lastupdated =
          controlProperties != undefined
            ? controlProperties[0].lastUpdated !== undefined
              ? controlProperties[0].lastUpdated
              : false
            : false;
        updatedTextFieldValues.variableid =
          controlProperties != undefined ? controlProperties[0].variableid : "";
        updatedTextFieldValues.fontStyle =
          controlProperties != undefined
            ? controlProperties[0].fontStyle
            : "not-italic";
        updatedTextFieldValues.fontFamily =
          controlProperties != undefined
            ? controlProperties[0].fontFamily
            : "Courier New";
        updatedTextFieldValues.fontWeight =
          controlProperties != undefined
            ? controlProperties[0].fontWeight
            : "normal";
        updatedTextFieldValues.decimalpoints =
          controlProperties != undefined
            ? controlProperties[0].decimalpoints !== undefined
              ? controlProperties[0].decimalpoints
              : 2
            : 2;
        //updatedTextFieldValues.variableid = control.variableid || "";
        updatedTextFieldValues.properties =
          controlProperties != undefined ? controlProperties : [];
        updatedTextFieldValues.deviceid = control.deviceid || "";
        updatedChartList.push(updatedTextFieldValues);
      } else if (cType === "Label") {
        const updatedLabelValues = {
          id: "",
          type: "",
          label: "",
          name: "",
          properties: [],
          color: "#000000",
          bgcolor: "#ffffff",
          fontSize: "12px",
          fontStyle: "not-italic",
          fontFamily: "Courier New",
          fontWeight: "normal",
        };
        updatedLabelValues.id = control.controlId || "";
        updatedLabelValues.type = control.controlType || "";
        updatedLabelValues.name = control.name;
        updatedLabelValues.label = control.label;
        updatedLabelValues.fontSize =
          controlProperties != undefined
            ? controlProperties[0].fontSize
            : "12px";
        updatedLabelValues.bgcolor =
          control.bgcolor != undefined ? control.bgcolor : "#ffffff";
        updatedLabelValues.fontStyle =
          controlProperties != undefined
            ? controlProperties[0].fontStyle
            : "not-italic";
        updatedLabelValues.fontFamily =
          controlProperties != undefined
            ? controlProperties[0].fontFamily
            : "Courier New";
        updatedLabelValues.color =
          controlProperties != undefined
            ? controlProperties[0].color
            : "#000000";
        updatedLabelValues.fontWeight =
          controlProperties != undefined
            ? controlProperties[0].fontWeight
            : "normal";
        updatedChartList.push(updatedLabelValues);
      } else if (cType === "Image") {
        const updatedImageValues = {
          id: "",
          type: "",
          label: "",
          name: "",
          url: "",
          bgcolor: "#ffffff",
        };
        updatedImageValues.id = control.controlId || "";
        updatedImageValues.type = control.controlType || "";
        updatedImageValues.name = control.name;
        updatedImageValues.label = control.label;
        updatedImageValues.url =
          control.url.startsWith("image") === true
            ? apiKey + control.url
            : control.url;
        updatedImageValues.bgcolor =
          control.bgcolor != undefined ? control.bgcolor : "#ffffff";
        updatedChartList.push(updatedImageValues);
      }
    });

    return { controlList: updatedChartList };
  };

  const socketCallForVariableData = async () => {
    socketVar.on("new-record", (response) => {
      if (controls.controlList.length > 0) {
        controls.controlList.forEach((control) => {
          if (
            control.properties !== undefined &&
            control.properties.length > 0
          ) {
            control.properties.forEach((property) => {
              if (response.variableid === property.variableid) {
                switch (control.type) {
                  case "Line":
                    let lineData = property.data;
                    if (control.blockwise) {
                      if (control.blockno !== response.blockno) {
                        lineData = [];
                        lineData.push(response);
                      } else {
                        lineData.push(response);
                      }
                    } else {
                      lineData.push(response);
                    }

                    control.blockno = response.blockno;
                    control.timestamp = response.timestamp;
                    property.data = lineData;
                    break;
                  case "Bar":
                    let barData = control.data;
                    barData.push(response);
                    property.data = barData;
                    break;
                  case "TextField":
                    control.value = control.showavg
                      ? response.avg
                      : response.value;
                    control.timestamp = response.timestamp;
                    break;
                  case "TextField":
                    control.value = control.showavg
                      ? response.avg
                      : response.value;
                    control.timestamp = response.timestamp;
                    break;
                }
              }
            });
          }
        });
      }
    });
  };

  useEffect(() => {
    const socket = io.connect(apiKey + "variables");
    setSocketVar(socket);
    var timer = setInterval(() => setTime(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    try {
      if (dashBoardData) {
        const parsedData = JSON.parse(dashBoardData);
        setSelectedDashBoard(parsedData);
        const newLayout = generateLayout(parsedData);
        setLayout(newLayout);
        const updatedValues = processChartData(parsedData.controls);
        setControls(updatedValues);
        disableRealTime();
      }
    } catch (error) {
      console.error("Error updating chart values:", error);
    }
  }, [dashBoardData, update]);

  const handleChartObjChange = (newChartObj, id) => {
    console.log(functionality);
    if (newChartObj) {
      try {
        const storedData = selectedDashBoard;

        if (functionality === "Add") {
          storedData.controls.push(newChartObj.controls[0]);
        }
        if (functionality === "Edit") {
          let objIndex = storedData.controls.findIndex(
            (control) => control.controlId == id
          );
          storedData.controls[objIndex] = newChartObj.controls[0];
        }
        addControl(storedData, newChartObj.controls[0]);
      } catch (error) {
        console.error("Error updating session storage:", error);
      }
    } else {
      console.log("No chart data provided.");
    }
  };

  useEffect(() => {
    try {
      if (dashBoardData.length > 0) {
        setControls([]);
        const parsedData = JSON.parse(dashBoardData);
        parsedData.controls = parsedData.controls || [];
        setSelectedDashBoard(parsedData);
        const newLayout = generateLayout(parsedData);
        setLayout(newLayout);
        const updatedValues = processChartData(parsedData.controls);
        setControls(updatedValues);
        disableRealTime();
      }
    } catch (error) {
      console.error("Error updating chart values:", error);
    }
  }, [dashBoardData, update]);

  const handleTableGridSave = (controlData) => {
    // Ensure the control data has the correct structure
    const formattedControlData = {
      ...controlData,
      controlType: "table-grid",
      terminals: Array.isArray(controlData.terminals)
        ? controlData.terminals
        : [],
      scripts: Array.isArray(controlData.scripts) ? controlData.scripts : [],
    };

    if (editingControl) {
      // Update existing control
      const updatedControls = selectedDashBoard.controls.map((c) =>
        c.controlId === editingControl.controlId ? formattedControlData : c
      );
      const updatedDashboard = {
        ...selectedDashBoard,
        controls: updatedControls,
      };
      updateDashboard(updatedDashboard);
    } else {
      // Add new control
      const updatedDashboard = {
        ...selectedDashBoard,
        controls: [...selectedDashBoard.controls, formattedControlData],
      };
      updateDashboard(updatedDashboard);
    }
    setTableGridDialogOpen(false);
  };

  const addControl = async (dashboard, data) => {
    await axios
      .put(
        apiKey + "dashboard/update/" + dashboard.dashboardid + "/control",
        data
      )
      .then((response) => {
        let newLayout = generateLayout(response.data);
        setLayout(newLayout);
        let updatedValues = processChartData(response.data.controls);
        setControls(updatedValues);
        setSelectedDashBoard(response.data);

        let dashboardSelectedItem = JSON.stringify(response.data);
        setDashBoardData(dashboardSelectedItem);
        sessionStorage.setItem("selectedDashboardItem", dashboardSelectedItem);

        closeDialog();
      })
      .catch((error) => {});
  };

  const removeControl = async (dashboardId, controlId, index) => {
    await axios
      .delete(apiKey + "dashboard/remove/" + dashboardId + "/" + controlId)
      .then((response) => {
        const newLayout = generateLayout(response.data);
        setLayout(newLayout);

        const updatedValues = processChartData(response.data.controls);
        setControls(updatedValues);
        setSelectedDashBoard(response.data);

        let dashboardSelectedItem = JSON.stringify(response.data);
        setDashBoardData(dashboardSelectedItem);
        sessionStorage.setItem("selectedDashboardItem", dashboardSelectedItem);
        setDelOpen(false);
        //}
      })
      .catch((error) => {});
  };

  const handleClose = () => {
    setAssignDevice(false);
  };

  const handleAdd = (index) => {
    setFunctionality("Add");
    openDialog();
  };

  const handleEdit = (index) => {
    setFunctionality("Edit");
    openEditDrawer();
    setControl(index);
  };

  const updatePositions = async (dashboardId, data) => {
    await axios
      .put(apiKey + "dashboard/update/position/" + dashboardId, data)
      .then((response) => {
        console.log("Updated positions:", JSON.stringify(response));
      })
      .catch((error) => {});
  };

  const drggagingDone = (layoutData) => {
    let positions = [];
    layoutData &&
      layoutData.forEach((control) => {
        let positionData = {
          id: control.i,
          position:
            "[" +
            control.w +
            "," +
            control.h +
            "," +
            control.x +
            "," +
            control.y +
            "]",
        };
        positions.push(positionData);
      });
    let positionObj = {
      positions: positions,
    };
    if (user.user_Type !== "User") {
      updatePositions(selectedDashBoard.dashboardid, positionObj);
      console.log("Updated positions:", JSON.stringify(positionObj));
    }
  };

  const handleDeleteOpen = (control, index) => {
    try {
      setDelOpen(true);
      setSelectedControl(control);
    } catch (error) {
      console.error("Error deleting control:", error);
    }
  };
  const handleDelete = () => {
    try {
      removeControl(selectedDashBoard.dashboardid, selectedControl.id, 0);
    } catch (error) {
      console.error("Error deleting control:", error);
    }
  };

  const handleDeleteClose = () => {
    setDelOpen(false);
  };

  // const updateDashboard = (param) => {
  //   setUpdate(param);
  // };

  const updateDashboard = async (dashboardData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_LOCAL_URL}dashboard/update/${dashboardData.dashboardid}`,
        dashboardData
      );
      setSelectedDashBoard(response.data);
      sessionStorage.setItem(
        "selectedDashboardItem",
        JSON.stringify(response.data)
      );
      setDashBoardData(JSON.stringify(response.data));
    } catch (error) {
      console.error("Error updating dashboard:", error);
    }
  };

  const disableRealTime = (event) => {
    setLive(false);
    if (socketVar != null) socketVar.off("new-record");
  };

  const EnableRealTime = (event) => {
    setLive(true);
    socketCallForVariableData();
  };

  const [editingControl, setEditingControl] = useState(null);

  const handleWidgetSelect = (widgetType) => {
    if (widgetType === "table-grid") {
      setEditingControl(null);
      setTableGridDialogOpen(true);
    }
  };
  const handleEditTableGrid = (control) => {
    setEditingControl(control);
    setTableGridDialogOpen(true);
  };

  return (
    <div>
      <CardTitleBar
        title={
          <>
            <IconButton
              edge="end"
              aria-label="menu"
              sx={{
                p: 0,
                color: "white",
              }}
              size="small"
              onClick={openLeftDrawer}
            >
              <MenuIcon sx={{ margin: "-3px 4px 0px" }} />
            </IconButton>
            Dashboard
          </>
        }
        middle={
          <>
            <p>
              {time.toLocaleDateString() +
                " " +
                time.toLocaleTimeString() +
                " "}{" "}
            </p>
          </>
        }
        children={
          dashBoardData.length >= 0 &&
          layout.length >= 0 &&
          selectedDashBoard != null && (
            <>
              {!live && (
                <>
                  <Tooltip title="Enable Real-Time">
                    <IconButton
                      size="small"
                      sx={{
                        color: "white",
                      }}
                    >
                      <PlayArrowIcon onClick={EnableRealTime} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {live && (
                <Tooltip title="Disable Real-Time">
                  <IconButton
                    size="small"
                    sx={{
                      color: "white",
                    }}
                  >
                    <PauseIcon onClick={disableRealTime} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )
        }
      ></CardTitleBar>
      {dashBoardData.length >= 0 &&
        layout.length >= 0 &&
        selectedDashBoard != null && (
          <CardLayout
            title={
              selectedDashBoard == null ? "Dashboard" : selectedDashBoard.name
            }
            className="main_dashboard"
            action={
              <div>
                {user && user.user_Type !== "User" && (
                  <Fab
                    sx={{ mx: 2 }}
                    onClick={handleAdd}
                    aria-label="Add"
                    className="add_from_section"
                    size="medium"
                  >
                    <Tooltip title="Add control to the dashboard">
                      <AddIcon className="add_from_Icon" />
                    </Tooltip>
                  </Fab>
                )}
              </div>
            }
          >
            <WidgetBar onWidgetSelect={handleWidgetSelect} />

            <ResponsiveReactGridLayout
              className="layout"
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={10}
              layouts={{ lg: layout }}
              isDroppable={true}
              onDragStart={(layout, oldItem, newItem) => {}}
              onDrag={(layout, oldItem, newItem) => {}}
              onDragStop={(layout, oldItem, newItem) => {
                let layoutData = layout;
                drggagingDone(layoutData);
              }}
            >
              {layout.map((item, i) => {
                const control = controls.controlList[i];
                if (!control) return null;

                return (
                  <StyledCard
                    key={item.i}
                    data-grid={item}
                    variant="outlined"
                    className="main_dashboard_cards"
                    sx={{ width: "100%", height: "100%", zIndex: 100 }}
                  >
                    {control.type === "table-grid" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: control.bgcolor,
                        }}
                      >
                        <TableGrid
                          control={control}
                          key={`${control.id}-${JSON.stringify(
                            control.terminals
                          )}-${JSON.stringify(control.scripts)}`}
                        />
                      </div>
                    )}
                    {control.type === "Line" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: control.bgcolor,
                        }}
                      >
                        <LineChartComponent
                          handleCallback={updateDashboard}
                          live={live}
                          control={control}
                        />
                      </div>
                    )}
                    {control.type === "Bar" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: control.bgcolor,
                        }}
                      >
                        <BarChartComponent
                          handleCallback={updateDashboard}
                          live={live}
                          control={control}
                        />
                      </div>
                    )}
                    {control.type === "TextField" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: control.bgcolor,
                        }}
                      >
                        <TextFieldComponent
                          handleCallback={updateDashboard}
                          live={live}
                          control={control}
                        />
                      </div>
                    )}
                    {control.type === "Label" && (
                      <div
                        className="flex items-center justify-center h-screen mx-auto"
                        style={{
                          width: "100%",
                          height: "100%",
                          background: control.bgcolor,
                        }}
                      >
                        <FormLabel
                          sx={{
                            fontSize: control.fontSize,
                            color: control.color,
                            fontFamily: control.fontFamily,
                            fontWeight: control.fontWeight,
                            fontStyle: control.fontStyle,
                          }}
                        >
                          {control.label}
                        </FormLabel>
                      </div>
                    )}
                    {control.type === "Image" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: control.bgcolor,
                        }}
                      >
                        <ImageComponent control={control} />
                      </div>
                    )}

                    {user && user.user_Type !== "User" && (
                      <ActionButtons className="actionButtons">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEdit(control)}
                            size="small"
                            sx={{ color: "#007c89" }}
                          >
                            <EditIcon fontSize="3px" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteOpen(control, i)}
                            size="small"
                            sx={{ color: "#e2640b " }}
                          >
                            <DeleteIcon fontSize="3px" />
                          </IconButton>
                        </Tooltip>
                      </ActionButtons>
                    )}
                  </StyledCard>
                );
              })}
            </ResponsiveReactGridLayout>
          </CardLayout>
        )}
      {selectedDashBoard && tableGridDialogOpen && (
        <TableGridDialog
          open={tableGridDialogOpen}
          onClose={() => setTableGridDialogOpen(false)}
          onSave={handleTableGridSave}
          dashboardId={selectedDashBoard?.dashboardid}
          existingControl={editingControl}
        />
      )}
      {/* Rightside Dialog */}
      {selectedDashBoard != null && (
        <RightDrawerDialog
          open={open}
          onClose={closeDialog}
          title={"Add new widget"}
        >
          <RightDialogdContent
            handleChartObjChange={handleChartObjChange}
            customerid={selectedDashBoard.customerid}
          />
        </RightDrawerDialog>
      )}
      {control.type === "Line" && selectedDashBoard != null && (
        <LineChartDialog
          customerid={selectedDashBoard.customerid}
          openEditDialog={openEditDialog}
          closeEditDrawer={closeEditDrawer}
          handleChartObjChange={handleChartObjChange}
          editData={control}
        />
      )}
      {control.type === "Bar" && selectedDashBoard != null && (
        <BarChartDialog
          customerid={selectedDashBoard.customerid}
          openEditDialog={openEditDialog}
          closeEditDrawer={closeEditDrawer}
          handleChartObjChange={handleChartObjChange}
          editData={control}
        />
      )}
      {control.type === "TextField" && selectedDashBoard != null && (
        <TextFieldDialog
          customerid={selectedDashBoard.customerid}
          open={openEditDialog}
          closeDialog={closeEditDrawer}
          handleChartObjChange={handleChartObjChange}
          editData={control}
        />
      )}
      {control.type === "Label" && selectedDashBoard != null && (
        <LabelDialog
          customerid={selectedDashBoard.customerid}
          open={openEditDialog}
          closeDialog={closeEditDrawer}
          handleChartObjChange={handleChartObjChange}
          editData={control}
        />
      )}
      {control.type === "Image" && selectedDashBoard != null && (
        <ImageDialog
          customerid={selectedDashBoard.customerid}
          open={openEditDialog}
          closeDialog={closeEditDrawer}
          handleChartObjChange={handleChartObjChange}
          editData={control}
        />
      )}
      {/* LeftSide dialog */}
      <LeftDrawerDialog
        open={openLeftDialog}
        onClose={closeLeftDrawer}
        title="Dashboards"
      >
        <LeftDialogContent
          closeLeftDrawer={closeLeftDrawer}
          setDashBoardData={setDashBoardData}
        />
      </LeftDrawerDialog>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={assignDevice}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            background: "#007c89",
            color: "#fff",
            textAlign: "center",
          }}
          id="customized-dialog-title"
        >
          {selectedDevice.devicename}
          <br />
          Assign to Customer
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#fff",
          }}
        >
          <CloseIcon />
        </IconButton>
      </BootstrapDialog>
      <Dialog open={delopen} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, background: "#007c89", color: "#fff" }}>
          Confirmation Alert
        </DialogTitle>
        <Box position="absolute" top={0} right={0}>
          <IconButton>
            <Close onClick={handleDeleteClose} />
          </IconButton>
        </Box>
        <DialogContent>
          <Typography>Sure you want Delete? </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            className="action-cancel-btn"
            variant="contained"
            onClick={handleDeleteClose}
          >
            Cancel
          </Button>
          <Button
            className="share-device-btn"
            variant="contained"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
