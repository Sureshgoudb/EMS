import React, { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import axios from 'axios';

function GraphWidget({ widget }) {
  const [data, setData] = useState([]);
  const [currentValue, setCurrentValue] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using the same endpoint structure as device view
        if (widget?.terminal?.terminalId && widget?.script?.[0]?.scriptName) {
          const response = await axios.get(
            `${process.env.REACT_APP_API_LOCAL_URL}/terminal/${widget.terminal.terminalId}/script/${widget.script[0].scriptName}/currentValue`
          );

          // Transform data to match the graph format
          const transformedData = response.data.map(item => ({
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            value: parseFloat(item.value),
            // Maintain any additional properties needed for tooltips
            name: widget.script[0].scriptName,
            unit: widget.script[0].unit
          }));

          setData(transformedData);
          
          // Update current value for display
          if (transformedData.length > 0) {
            setCurrentValue(transformedData[transformedData.length - 1].value);
          }
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling interval (same as device view - 5 seconds)
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [widget]);

  return (
    <Paper sx={{ height: '100%', p: 2 }}>
      <Box sx={{ height: '100%', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`colorValue-${widget?.terminal?.terminalId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']} // Auto-scale based on data
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              formatter={(value) => [`${value} ${widget?.script?.[0]?.unit || ''}`, widget?.script?.[0]?.scriptName || 'Value']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#82ca9d" 
              fillOpacity={1} 
              fill={`url(#colorValue-${widget?.terminal?.terminalId})`}
              isAnimationActive={false} // Disable animation for real-time updates
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default GraphWidget;
