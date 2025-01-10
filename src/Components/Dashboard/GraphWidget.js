import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";

function GraphWidget({ widget }) {
  const [data, setData] = useState([]);
  const [currentValue, setCurrentValue] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (widget?.terminal?.terminalId && widget?.script?.length > 0) {
          const promises = widget.script.map((script) =>
            axios.get(
              `${process.env.REACT_APP_API_LOCAL_URL}/terminal/${widget.terminal.terminalId}/script/${script.scriptName}/currentValue`
            )
          );

          const responses = await Promise.all(promises);
          const transformedData = responses.map((response) =>
            response.data.map((item) => ({
              timestamp: new Date(item.timestamp).toLocaleTimeString(),
            }))
          );

          const combinedData = transformedData[0].map((item, index) => {
            const combinedItem = { ...item };
            transformedData.slice(1).forEach((dataSet) => {
              combinedItem[dataSet[index].name] =
                dataSet[index][dataSet[index].name];
            });
            return combinedItem;
          });

          setData(combinedData);

          if (combinedData.length > 0) {
            setCurrentValue(
              combinedData[combinedData.length - 1][widget.script[0].scriptName]
            );
          }
        }
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [widget]);

  const renderChart = () => {
    if (widget.graphType === "multi-axis") {
      return (
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            {widget.script.map((script) => (
              <linearGradient
                key={script.scriptName}
                id={`color${script.scriptName}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          {widget.script.map((script) => (
            <YAxis
              key={script.scriptName}
              yAxisId={script.scriptName}
              orientation="left"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            formatter={(value, name, props) => [
              `${value} ${props.payload.unit || ""}`,
              name,
            ]}
          />
          <Legend />
          {widget.script.map((script) => (
            <Line
              key={script.scriptName}
              type="monotone"
              dataKey={script.scriptName}
              stroke="#82ca9d"
              fillOpacity={1}
              yAxisId={script.scriptName}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      );
    } else {
      return (
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient
              id={`colorValue-${widget?.terminal?.terminalId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            formatter={(value) => [
              `${value} ${widget?.script?.[0]?.unit || ""}`,
              widget?.script?.[0]?.scriptName || "Value",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#82ca9d"
            fillOpacity={1}
            fill={`url(#colorValue-${widget?.terminal?.terminalId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      );
    }
  };

  return (
    <Paper sx={{ height: "100%", p: 2 }}>
      <Box sx={{ height: "100%", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default GraphWidget;
