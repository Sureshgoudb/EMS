import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AreaGraph = ({ data, expanded }) => {
  // Conditionally slice data based on expanded state
  const displayedData = expanded ? data : data.slice(0, 4); // Show only the first 4 entries if not expanded

  return (
    <AreaChart
      width={600}
      height={300}
      data={displayedData}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }} // Increased margins
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="name"
        tick={{ fontSize: 12 }} // Adjust font size if needed
        angle={-45} // Rotate labels if they overlap
        textAnchor="end" // Align text
      />
      <YAxis />
      <Tooltip />
      <Legend />
      <Area
        type="monotone"
        dataKey="value"
        stroke="#007c89"
        fillOpacity={0.3}
        fill="#007c89"
      />
    </AreaChart>
  );
};

export default AreaGraph;
