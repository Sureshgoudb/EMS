import React, { useEffect, useState, useRef } from "react";
import { BarChart } from "@mui/x-charts";
import { io } from 'socket.io-client';
import axios from "axios";
import dayjs from "dayjs";
const BarChartComponent = (props) => {
  const [barchartData, setBarChartData] = useState([]);
  const timeout = useRef(null);
  const [socketVar, setSocketVar] = useState(null);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;


  const apiCallForVariableData = async (variableid) => {
    await axios.get(apiKey + "variablevalues/" + variableid)
      .then(async (response) => {
        let oldState = barchartData;
        oldState.push(response.data[0]);
        setBarChartData(oldState);
        props.handleCallback(new Date());
      });
  }

  const socketCallForVariableData = async () => {
    socketVar.on('new-record', (response) => {
      if (response.variableid === props.control.variableid) {
        let oldState = barchartData;
        oldState.push(response);
        setBarChartData(oldState);
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
    if (props.live == true){
      //timeout.current = setInterval(FetchRealTimeData, 3000);
      FetchRealTimeData();
    }

    else if (props.live == false)
      {      if (socketVar !== null)
        socketVar.off('new-record');
        clearInterval(timeout.current);
      }

    else if (props.live == null)
      FetchRealTimeData();
  };
  useEffect(() => {
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

  return (
    <BarChart
      xAxis={[
        {
          scaleType: "band",
          data: (barchartData != null && barchartData.length > 0) ? barchartData.map(x => props.control.showavg? x.avg.$numberDecimal:x.value.$numberDecimal) : [0],
        }
      ]}
      series={[
        {
          categoryGapRatio: props.control.categoryGapRatio,
          barGapRatio: props.control.barGapRatio,
          data: (barchartData != null && barchartData.length > 0) ? barchartData.map(x => props.control.showavg? x.avg.$numberDecimal:x.value.$numberDecimal) : [0],
        },
      ]}
    />
  );
}
export default BarChartComponent;