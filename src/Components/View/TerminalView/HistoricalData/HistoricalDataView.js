import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import TableColumnCreate from "./TableColumnCreate";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const HistoricalDataView = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  // --------------- Fetching tables ---------------
  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiKey}terminal/table/list`);
      setTables(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Failed to load tables. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // --------------- Creating table ---------------
  const handleCreateTable = async (terminal, script, profile) => {
    try {
      const response = await axios.post(`${apiKey}terminal/createTable`, {
        name: `${terminal} - ${script}`,
        terminal,
        columns: ["timestamp", script],
      });

      await fetchTables();
      navigate(`/data-table/${response.data._id}`);
    } catch (error) {
      console.error("Error creating table:", error);
    }
  };

  const handleTableClick = (tableId) => {
    navigate(`/data-table/${tableId}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#e3f2fd", minHeight: "100vh" }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {tables.map((table) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={table._id}
                sx={{ minWidth: "200px" }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                    boxShadow: 3,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      background:
                        "linear-gradient(to bottom right, rgba(0, 124, 137, 0.3), rgba(77, 208, 225, 0.3))",
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleTableClick(table._id)}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333" }}
                  >
                    {table.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                    Terminal:{" "}
                    <span style={{ fontWeight: "bold" }}>{table.terminal}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                    Columns:{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {table.columns.join(", ")}
                    </span>
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      bgcolor: "#f5f5f5",
                      borderRadius: "8px",
                      textAlign: "center",
                      boxShadow: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#888",
                      }}
                    >
                      Click to View
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          sx={{ mt: 3 }}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#007c89",
              color: "white",
              mt: 2,
              "&:hover": {
                backgroundColor: "#005f6a",
              },
            }}
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTable}
          >
            Add New Table
          </Button>
        </Grid>
      </Grid>

      <TableColumnCreate
        open={openDialog}
        onClose={handleCloseDialog}
        onCreateColumn={handleCreateTable}
      />
    </Box>
  );
};

export default HistoricalDataView;
