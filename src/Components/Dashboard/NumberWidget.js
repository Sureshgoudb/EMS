import React, { useEffect, useState } from 'react';
import { Paper } from '@mui/material';

function NumberWidget({ widget }) {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the script array is not empty
  const script = Array.isArray(widget.script) && widget.script.length > 0 ? widget.script[0] : null;

  // Safely access properties or provide defaults
  const properties = script ? script.properties : {
    fontFamily: "Arial",
    fontSize: "40px",
    fontColor: "#000000",
    backgroundColor: "#ffffff",
    fontStyle: "normal",
    fontWeight: "400",
  };

  useEffect(() => {
    const fetchValue = async () => {
      if (script) {
        const terminalID = widget.terminal.terminalId;
        const scriptName = script.scriptName;

        try {
          const response = await fetch(`http://localhost:4001/terminal/${terminalID}/script/${scriptName}/currentValue`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setValue(data[scriptName]);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchValue();
    
    // Add interval for periodic updates
    const interval = setInterval(fetchValue, 5000); // Update every 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [script, widget.terminal.terminalId]);

  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        backgroundColor: properties.backgroundColor,
        color: properties.fontColor,
        fontFamily: properties.fontFamily,
        fontSize: properties.fontSize,
        fontStyle: properties.fontStyle,
        fontWeight: properties.fontWeight,
        userSelect: 'none',
        '&:hover': {
          boxShadow: 3,
        },
        p: 2 // Add some padding
      }}
    >
      {/* Display Name */}
      <div style={{ 
        width: '100%',
        textAlign: 'center',
        marginBottom: '8px',
        fontSize: '0.9em'  // Slightly smaller than the value
      }}>
        {script ? script.displayName : "Default Display Name"}
      </div>

      {/* Divider */}
      <hr style={{
        width: '100%',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        margin: '0 0 8px 0'
      }} />

      {/* Value */}
      <div style={{
        width: '100%',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span>Error: {error}</span>
        ) : (
          <div>
            {value !== null ? (
              <>
                {Number(value).toFixed(script?.decimalPlaces || 2)}
                {script?.unit && <span style={{ marginLeft: '4px', fontSize: '0.8em' }}>{script.unit}</span>}
              </>
            ) : (
              "No Value Available"
            )}
          </div>
        )}
      </div>
    </Paper>
  );
}

export default NumberWidget;