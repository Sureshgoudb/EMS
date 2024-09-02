import React, { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';
import {
  Card,
  Fab,
  FormLabel,
  Dialog,
  DialogTitle,
  IconButton,
  Tooltip,
  TextField,
  Grid, Button, CardActions, CardActionArea, CardContent, Typography
} from "@mui/material";
import styled from "@emotion/styled";
import axios from "axios";
import dayjs from "dayjs";

const StyledTextField = styled(TextField)({
  "& .MuiInputLabel-root": {
    right: 0,
    textAlign: "center",
    background: "blue"

  },
  "& .MuiInputLabel-shrink": {
    margin: "0 auto",
    position: "absolute",
    right: "0",
    left: "0",
    top: "-3px",
    width: "250px", // Need to give it a width so the positioning will work
    background: "red" // Add a white bg
    // display: "none" //if you want to hide it completly
  },
  "& .MuiOutlinedInput-root": {
    "& legend ": {
      display: "none" // If you want it then you need to position it similar with above
    }
  }
});
const TextFieldComponent = (props) => {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [showtime, setShowTime] = useState(false);
  const [label, setLabel] = useState("");
  const timeout = useRef(null);
  const [socketVar, setSocketVar] = useState(null);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  const apiCallForVariableData = async (variableid) => {
    await axios.get(apiKey + "variablevalues/" + variableid)
      .then(async (response) => {
        setText(response.data[0].value);
        props.handleCallback(new Date());
      });
  }

  const socketCallForVariableData = async () => {
    socketVar.on('new-record', (response) => {
      if (response.variableid === props.control.variableid) {
        setText(props.control.showavg ? response.avg : response.value);
        console.log(JSON.stringify(response));
        props.handleCallback(new Date());
      }
    })

  }

  const FetchRealTimeData = () => {
    //apiCallForVariableData(props.control.variableid);
    socketCallForVariableData();
  };

  const disableRealTime = (event) => {
    clearInterval(timeout.current);
  };


  const EnableRealTime = async () => {
    if (props.live == true) {
      //timeout.current = setInterval(FetchRealTimeData, 3000);
      FetchRealTimeData();
    }
    else if (props.live == false) {
      if (socketVar !== null)
        socketVar.off('new-record');
      clearInterval(timeout.current);
    }

    else if (props.live == null)
      FetchRealTimeData();
  };

  /*useEffect(() => {
    const socket = io.connect(apiKey, { query: "variableid=" + props.control.variableid });
    setSocketVar(socket);
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

 useEffect(() => {
    try {
      EnableRealTime();
    } catch (error) {
      console.error("Error updating chart values:", error);
    }
  }, [props.live]);
*/

  const getvariableData = async () => {
    try {
      let url = apiKey + "variable/item/" + props.control.variableid;
      await axios.get(url)
        .then(async (response) => {
          props.control.sf = response.data.scale === undefined ? 1 : response.data.scale;
        });
    }
    catch (err) {

    }
  };
  useEffect(() => {
    getvariableData();
  }, []);

  useEffect(() => {
    try {
      let value = eval(props.control.value * props.control.sf);
      setText(parseFloat(value).toFixed(props.control.decimalpoints))
    }
    catch (err) {
      setText(parseFloat(props.control.value).toFixed(props.control.decimalpoints))
    }
    setTime(props.control.timestamp)
    setLabel(props.control.name);
    setShowTime(props.control.lastupdated);
  }, [props.control.value]);

  return (
    <>
      <Card class="flex items-center justify-center h-screen mx-auto" style={{ width: "100%", height: "100%", background: props.control.bgcolor }}>
        <CardContent >
          <Typography sx={{ mt: 1 }} gutterBottom fontSize={props.control.fontSize} color={props.control.labelcolor} fontFamily={props.control.fontFamily} fontStyle={props.control.fontStyle} fontWeight={props.control.fontWeight}>
            {label}
          </Typography>
          <Typography color={props.control.color} fontSize={props.control.fontSize} fontFamily={props.control.fontFamily} fontStyle={props.control.fontStyle} fontWeight={props.control.fontWeight}>
            {text}
          </Typography>
          {showtime && (
            <Typography sx={{ mt: 1 }} color={props.control.timecolor} fontSize={Number(props.control.fontSize.replace('px', '')) - 5} fontFamily={props.control.fontFamily} fontStyle={props.control.fontStyle} fontWeight={props.control.fontWeight} >
              {time}
            </Typography>
          )}
        </CardContent>

      </Card>

    </>)
}
export default TextFieldComponent;