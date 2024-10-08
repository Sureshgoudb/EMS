import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { keyframes } from "@emotion/react";

const colors = [
  "#ffc658",
  "#ff7300",
  "#1976d2",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")} ${String(
    date.getUTCHours()
  ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(
    date.getUTCSeconds()
  ).padStart(2, "0")}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0 }}>{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              color: entry.color,
              margin: "5px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ marginRight: "10px" }}>
              {`${entry.dataKey}: ${entry.value}`}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MultiAxisGraph = ({
  data,
  comparisonData = {},
  expanded = false,
  backgroundColor = "#ffffff",
  hideXAxis = false,
  scriptName = "",
}) => {
  const [zoomState, setZoomState] = useState({
    startIndex: 0,
    endIndex: data.length - 1,
  });
  const chartRef = useRef(null);
  const textColor = backgroundColor === "#ffffff" ? "#000000" : "#ffffff";

  const allScripts = useMemo(
    () => [scriptName, ...Object.keys(comparisonData)],
    [comparisonData, scriptName]
  );

  const combinedData = useMemo(() => {
    const mainData = data.map((item) => ({
      x: item.x,
      [scriptName]: item.y,
    }));

    Object.entries(comparisonData).forEach(([script, scriptData]) => {
      scriptData.forEach((item, index) => {
        if (index < mainData.length) {
          mainData[index][script] = item.y;
        }
      });
    });

    return mainData.sort((b, a) => new Date(b.x) - new Date(a.x));
  }, [data, comparisonData, scriptName]);

  const latestValues = useMemo(() => {
    return allScripts.reduce((acc, script) => {
      const latestDataPoint = combinedData[0];
      acc[script] = latestDataPoint ? latestDataPoint[script] : null;
      return acc;
    }, {});
  }, [allScripts, combinedData]);

  const handleWheel = useCallback(
    (event) => {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
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

  // Reset zoom state when expanded changes
  useEffect(() => {
    if (expanded) {
      setZoomState({
        startIndex: 0,
        endIndex: combinedData.length - 1,
      });
    }
  }, [expanded, combinedData.length]);

  const zoomedData = combinedData.slice(
    zoomState.startIndex,
    zoomState.endIndex + 1
  );

  return (
    <div className="w-full" ref={chartRef} onWheel={handleWheel}>
      <ResponsiveContainer width="100%" height={expanded ? 400 : 200}>
        <ComposedChart
          data={zoomedData}
          margin={{
            right: 30,
            left: 10,
            bottom: expanded ? 25 : 5,
          }}
        >
          <defs>
            {allScripts.map((script, index) => (
              <linearGradient
                key={script}
                id={`colorGradient${index}`}
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
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.5} />
          <XAxis
            dataKey="x"
            stroke={textColor}
            tickFormatter={formatDate}
            hide={hideXAxis || !expanded}
            tick={{ fontSize: 10 }}
            height={expanded ? 75 : 30}
          />
          {allScripts.map((script, index) => (
            <YAxis
              key={`y-axis-${script}`}
              yAxisId={script}
              orientation={index % 2 === 0 ? "left" : "right"}
              stroke={colors[index % colors.length]}
              tick={{ fontSize: 10 }}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
            }}
          />
          {allScripts.map((script, index) => (
            <React.Fragment key={script}>
              <Area
                type="monotone"
                dataKey={script}
                name={script}
                stroke={colors[index % colors.length]}
                fill={`url(#colorGradient${index})`}
                yAxisId={script}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {latestValues[script] !== null && (
                <ReferenceLine
                  x={zoomedData[0]?.x}
                  y={latestValues[script]}
                  stroke={colors[index % colors.length]}
                  strokeDasharray="3 3"
                  label={{
                    value: latestValues[script],
                    fill: colors[index % colors.length],
                    fontSize: 12,
                    position: "right",
                  }}
                  yAxisId={script}
                  style={{
                    animation: `${blinkAnimation} 1.5s infinite`,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiAxisGraph;
