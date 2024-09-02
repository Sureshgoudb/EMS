import React, { useEffect, useState, useRef } from "react";
import Stack from '@mui/material/Stack';
import { io } from 'socket.io-client';
import { LineChart } from "@mui/x-charts";
import axios from "axios";
import dayjs from "dayjs";
import {
  Typography
} from "@mui/material";
const LineChartComponent = (props) => {
  const [chartData, setChartData] = useState([]);
  const [blkNo, setBlkNo] = useState(null);
  const [serieses, setserieses] = useState([]);
  const timeout = useRef(null);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;
  const [socketVar, setSocketVar] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiCallForVariableData = async (variableid) => {
    await axios.get(apiKey + "variablevalues/" + variableid)
      .then(async (response) => {
        let oldState = chartData;
        oldState.push(response.data[0]);
        setChartData(oldState);
        props.handleCallback(new Date());
      });
  }

  const socketCallForVariableData = async () => {
    socketVar.on('new-record', (response) => {
      if (response.variableid === props.control.variableid) {
        let oldState = chartData;
        oldState.push(response);
        setChartData(oldState);
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
    EnableRealTime();
  }, [props.live]);

*/
const FetchData = async () => {
  setLoading(true);  
  let fromdate = new Date(new Date().setHours(0,0,0,0));
  console.log("fromdate:" +fromdate)
  let todate = new Date()
  todate.setDate(fromdate.getDate()+1)
  todate.setHours(0,0,0,0)
  console.log("todate:" +todate)
  props.control.properties.forEach(async(item)=>{
    let url = apiKey + "variablevalues/24trends/" + item.variableid
    +"/?from="+dayjs(fromdate).format("YYYY-MM-DD HH:mm:ss")+"&to="+dayjs(todate).format("YYYY-MM-DD HH:mm:ss");
    console.log(url);
      await axios.get(url)
        .then(async (response) => {
          setLoading(false);
          item.data1 = response.data
          console.log("response data :" + JSON.stringify(response) +"\n ")
        });
  })

    };
    const getvariableData = async()=>{
      try {
      props.control.properties.forEach(async(item)=>{
        let url = apiKey + "variable/item/" + item.variableid;
          await axios.get(url)
            .then(async (response) => {
              setLoading(false);
              item.sf = response.data.scale === undefined ? 1 : response.data.scale;
            });
      })
    }
    catch(err)
    {}
    };
    
    useEffect(() => {
      getvariableData();
    }, []);

  useEffect(() => {

  if(blkNo === null || blkNo === ''){
    setBlkNo(props.control.blockno)
    if(props.control.day){
      FetchData();  
    }
  }
  if(blkNo !== null && blkNo !== props.control.blockno)
  { 
    setBlkNo(props.control.blockno);
    if(props.control.day){
    FetchData();  
    }
  }
  }, [props.control.blockno]);


  return (
    
    <Stack sx={{ width: '100%', height: '100%',background: props.control.bgcolor}}>
    
      {props.control.blockno  !== '' && props.control.timestamp !== '' && (
          <Typography sx={{ ml: '10px', fontWeight:'normal' }}>
        BlockNo : { props.control.blockno } Block Time : {props.control.timestamp !== '' ? props.control.timestamp.substr(11, 2) + ":" + 
        ((Number(props.control.timestamp.substr(14, 2))>0 && Number(props.control.timestamp.substr(14, 2))< 15) ? ('00' + " - " + props.control.timestamp.substr(11, 2) + ":" +'15') :
        ((Number(props.control.timestamp.substr(14, 2))>15 && Number(props.control.timestamp.substr(14, 2))< 30) ? ('15' + " - " + props.control.timestamp.substr(11, 2) + ":" +'30') :
        ((Number(props.control.timestamp.substr(14, 2))>30 && Number(props.control.timestamp.substr(14, 2))< 45) ? ('30' + " - " + props.control.timestamp.substr(11, 2) + ":" +'45' ):
        ((Number(props.control.timestamp.substr(14, 2))>45 && Number(props.control.timestamp.substr(14, 2))< 60) ? ('45' + " - " + (Number(props.control.timestamp.substr(11, 2)) +1) + ":" +'00') : '')
        ))) : ''}
        </Typography>
)}
  <LineChart slotProps={{
        noDataOverlay: { message: 'No data to display in this chart' },
      }} 
      xAxis={props.control.day == true ? [
        {
          data: props.control.properties[0].data1.map(x => {
            return x.blockno;
          }),
          tickInterval: props.control.properties[0].data1.map(x => {
            return x.blockno;
          }),          
        }
      ] : [
        {
          data: props.control.properties[0].data.map(x => {
            let itemDate = new Date(x.timestamp);
            itemDate.setHours(itemDate.getHours() - 5);
            itemDate.setMinutes(itemDate.getMinutes() - 30);
            return itemDate;
          }),
          tickInterval: props.control.properties[0].data.map(x => {

            let itemDate = new Date(x.timestamp);
            itemDate.setHours(itemDate.getHours() - 5);
            itemDate.setMinutes(itemDate.getMinutes() - 30);
            return itemDate;
          }),
          label:"Time",
          scaleType: 'band',
          valueFormatter: (x) => dayjs(x).format("HH:mm:ss"),
        }
      ]}
      series={
        props.control.day == true ? 
        props.control.properties.map(x => {
          return {
            "label": x.chartLabel,
            "stack": x.stack,
            "area": x.area,
            "showMark": x.showMark,
            "curve": x.style,
            "color": x.color,
             "data": x.data1.map(y => x.showavg ? parseFloat(y.avg * eval(x.sf)).toFixed(2) : parseFloat(y.value * eval(x.sf)).toFixed(2))
          }
        }) :
        props.control.properties.map(x => {
        return {
          "label": x.chartLabel,
          "stack": x.stack,
          "area": x.area,
          "showMark": x.showMark,
          "curve": x.style,
          "color": x.color,
          "data": x.data.map(y => x.showavg ? parseFloat(y.avg * eval(x.sf)).toFixed(2) : parseFloat(y.value * eval(x.sf)).toFixed(2))
        }
      })
    }

    />



    </Stack>
  );
}
export default LineChartComponent;