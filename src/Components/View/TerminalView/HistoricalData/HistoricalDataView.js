import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import TableColumnCreate from "./TableColumnCreate";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiKey = process.env.REACT_APP_API_LOCAL_URL;

const HistoricalDataView = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);

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
  const handleCreateTable = async (terminal, variable, profile) => {
    try {
      const response = await axios.post(`${apiKey}terminal/createTable`, {
        name: `${profile} - ${terminal} - ${variable}`,
        terminal,
        columns: ["timestamp", variable],
        profile,
      });

      await fetchTables();
      navigate(`/data-table/${response.data._id}`);
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Failed to create table");
    }
  };

  const handleTableClick = (tableId) => {
    navigate(`/data-table/${tableId}`);
  };

  const handleDeleteTable = async () => {
    try {
      await axios.delete(`${apiKey}terminal/table/${tableToDelete}`);

      fetchTables();
      toast.success("Table deleted successfully");
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Failed to delete table");
    }
  };

  const openDeleteConfirmation = (tableId) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
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
      <ToastContainer position="top-right" autoClose={3000} />
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
                sx={{ minWidth: "250px" }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                    boxShadow: 3,
                    width: "100%",
                    height: "100%",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      background:
                        "linear-gradient(to bottom right, rgba(0, 124, 137, 0.3), rgba(77, 208, 225, 0.3))",
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                    position: "relative",
                  }}
                  onClick={() => handleTableClick(table._id)}
                >
                  <Typography variant="h6" sx={{ color: "#333", mb: 1 }}>
                    {table.name}
                  </Typography>
                  {/* <Typography variant="body2" sx={{ color: "#666" }}>
                    <span style={{ fontWeight: "bold" }}>Profile:</span>{" "}
                    {table.profile}
                  </Typography> */}

                  <Box>
                    <Tooltip title="Delete Table">
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          transition: "opacity 0.3s",
                          "&:hover": {
                            opacity: 1,
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirmation(table._id);
                        }}
                      >
                        <DeleteIcon sx={{ color: "#e57373" }} />
                      </IconButton>
                    </Tooltip>
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

      {/* Confirmation Dialog for Deleting Table */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this table? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTable} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoricalDataView;
