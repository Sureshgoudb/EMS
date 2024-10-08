import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
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
      <div className="bg-white bg-opacity-80 p-2 border border-gray-300 rounded">
        <p className="m-0">{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <p
            style={{
              color: entry.color,
              margin: "5px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
            key={index}
            className={`text-${entry.color} my-1`}
          >
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
  const [zoomState, setZoomState] = useState({
    startIndex: 0,
    endIndex: data.length - 1,
  });
  const chartRef = useRef(null);

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

  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9; // Zoom out (>1) or in (<1)
      const dataLength = combinedData.length;
      const currentRange = zoomState.endIndex - zoomState.startIndex;
      const newRange = Math.max(
        2,
        Math.min(dataLength, Math.round(currentRange * zoomFactor))
      );

      const mouseX = event.nativeEvent.offsetX;
      const chartWidth = chartRef.current.offsetWidth;
      const zoomCenter =
        zoomState.startIndex + (mouseX / chartWidth) * currentRange;

      let newStartIndex = Math.max(0, Math.round(zoomCenter - newRange / 2));
      let newEndIndex = Math.min(dataLength - 1, newStartIndex + newRange);

      if (newEndIndex - newStartIndex < newRange) {
        newStartIndex = Math.max(0, newEndIndex - newRange);
      }

      setZoomState({ startIndex: newStartIndex, endIndex: newEndIndex });
    },
    [zoomState, combinedData.length]
  );

  const zoomedData = combinedData.slice(
    zoomState.startIndex,
    zoomState.endIndex + 1
  );

  // Reset zoom state when graph is expanded
  useEffect(() => {
    if (expanded) {
      setZoomState({
        startIndex: 0,
        endIndex: combinedData.length - 1,
      });
    }
  }, [expanded, combinedData.length]);

  return (
    <div className="w-full" ref={chartRef} onWheel={handleWheel}>
      <ResponsiveContainer width="100%" height={expanded ? 400 : 200}>
        <AreaChart
          data={zoomedData}
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
            allowDataOverflow
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
                  x={zoomedData[zoomedData.length - 1]?.x}
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
    </div>
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
