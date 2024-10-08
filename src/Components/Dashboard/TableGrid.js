import React, { useState, useEffect } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Grid,
  Paper,
  InputLabel,
} from "@mui/material";
import axios from "axios";

const TERMINALS = [
  { id: "6697910741b18b476793830b", name: "ALEMBIC PHARMA" },
  { id: "6697910741b18b476793830c", name: "Terminal 2" },
  { id: "6697910741b18b476793830d", name: "Terminal 3" },
];

const VARIABLES = [
  { id: "6697926541b18b4767939067", name: "Inst kW" },
  { id: "669792a241b18b476793928c", name: "Avg kW" },
];

const Cell = ({ rowIndex, colIndex, cell, handleCellChange }) => {
  const { terminal, variable } = cell;

  return (
    <Grid item xs={12 / cell.columns} key={`${rowIndex}-${colIndex}`}>
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel>Terminal</InputLabel>
        <Select
          value={terminal}
          label="Terminal"
          onChange={(e) =>
            handleCellChange(rowIndex, colIndex, "terminal", e.target.value)
          }
        >
          {TERMINALS.map((terminal) => (
            <MenuItem key={terminal.id} value={terminal.id}>
              {terminal.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Variable</InputLabel>
        <Select
          value={variable}
          label="Variable"
          onChange={(e) =>
            handleCellChange(rowIndex, colIndex, "variable", e.target.value)
          }
        >
          {VARIABLES.map((variable) => (
            <MenuItem key={variable.id} value={variable.id}>
              {variable.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};

const TableGrid = ({ control, onUpdate }) => {
  const [gridData, setGridData] = useState(control.cells || []);
  const apiKey = process.env.REACT_APP_API_LOCAL_URL;

  const handleCellChange = async (rowIndex, colIndex, type, value) => {
    const newGridData = gridData.map((row, rIndex) =>
      row.map((cell, cIndex) =>
        rIndex === rowIndex && cIndex === colIndex
          ? { ...cell, [type]: value }
          : cell
      )
    );

    setGridData(newGridData);

    try {
      await axios.put(`${apiKey}widget/${control.controlId}/update-cells`, {
        cells: newGridData,
      });

      if (onUpdate) {
        onUpdate({
          ...control,
          cells: newGridData,
        });
      }
    } catch (error) {
      console.error("Error updating grid cells:", error);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {gridData.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              rowIndex={rowIndex}
              colIndex={colIndex}
              cell={{ ...cell, columns: control.columns }}
              handleCellChange={handleCellChange}
            />
          ))
        )}
      </Grid>
    </Paper>
  );
};

export default TableGrid;
