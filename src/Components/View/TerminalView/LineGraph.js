import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { keyframes } from "@emotion/react";

const colors = [
  "#1976d2",
  "#00C49F",
  "#0088FE",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <p style={{ margin: 0 }}>{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: "5px 0" }}>
            {`${entry.name}: ${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LineGraph = ({
  data = [],
  comparisonData = {},
  expanded = false,
  backgroundColor = "#f5f5f5",
  scriptName = "Script",
}) => {
  const allScripts = useMemo(
    () => [scriptName, ...Object.keys(comparisonData)],
    [comparisonData, scriptName]
  );

  const combinedData = useMemo(() => {
    return data
      .map((item, index) => {
        const newItem = { ...item, [scriptName]: item.y };
        delete newItem.y;
        Object.keys(comparisonData).forEach((compScript) => {
          if (comparisonData[compScript] && comparisonData[compScript][index]) {
            newItem[compScript] = comparisonData[compScript][index].y;
          }
        });
        return newItem;
      })
      .reverse();
  }, [data, comparisonData, scriptName]);

  const latestValues = useMemo(
    () =>
      allScripts.reduce((acc, script) => {
        const latestData =
          script === scriptName
            ? data[data.length - 1]
            : comparisonData[script]?.[comparisonData[script].length - 1];
        acc[script] = latestData
          ? script === scriptName
            ? latestData.y
            : latestData.y
          : null;
        return acc;
      }, {}),
    [allScripts, data, comparisonData, scriptName]
  );

  return (
    <ResponsiveContainer width="100%" height={expanded ? 400 : 200}>
      <AreaChart
        data={combinedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          {allScripts.map((script, index) => (
            <linearGradient
              key={script}
              id={`color${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={colors[index % colors.length]}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={colors[index % colors.length]}
                stopOpacity={0.1}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
        <XAxis
          dataKey="x"
          stroke="#666"
          tickFormatter={formatDate}
          tick={{ fontSize: 10 }}
          hide={!expanded}
        />
        <YAxis stroke="#666" tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {allScripts.map((script, index) => (
          <React.Fragment key={script}>
            <Area
              type="monotone"
              dataKey={script === scriptName ? scriptName : script}
              name={script}
              stroke={colors[index % colors.length]}
              fillOpacity={1}
              fill={`url(#color${index})`}
              strokeWidth={2}
              isAnimationActive={false}
            />
            {latestValues[script] !== null && (
              <ReferenceLine
                x={combinedData[combinedData.length - 1]?.x}
                stroke={colors[index % colors.length]}
                strokeDasharray="3 3"
                label={{
                  value: latestValues[script].toFixed(2),
                  fill: colors[index % colors.length],
                  fontSize: 12,
                  position: "right",
                }}
                style={{ animation: `${blinkAnimation} 1.5s infinite` }}
              />
            )}
          </React.Fragment>
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

LineGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
      y: PropTypes.number,
    })
  ),
  comparisonData: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
          .isRequired,
        y: PropTypes.number,
      })
    )
  ),
  expanded: PropTypes.bool,
  backgroundColor: PropTypes.string,
  scriptName: PropTypes.string,
};

export default LineGraph;
