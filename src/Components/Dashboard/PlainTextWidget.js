import React from 'react';
import { Paper } from '@mui/material';

function PlainTextWidget({ widget }) {
  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        backgroundColor: widget.properties.backgroundColor,
        color: widget.properties.fontColor,
        fontFamily: widget.properties.fontFamily,
        fontSize: widget.properties.fontSize,
        fontStyle: widget.properties.fontStyle,
        fontWeight: widget.properties.fontWeight,
        userSelect: 'none',
        '&:hover': {
          boxShadow: 3,
        }
      }}
    >
      {widget.customText}
    </Paper>
  );
}

export default PlainTextWidget;
