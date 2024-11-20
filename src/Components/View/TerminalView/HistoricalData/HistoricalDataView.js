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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);

      const userDataString = localStorage.getItem("user");
      if (!userDataString) {
        throw new Error("User data not found in localStorage");
      }

      const userData = JSON.parse(userDataString);
      const { user_Type, customerID } = userData;
      setIsAdmin(user_Type === "Admin");

      let response;
      if (user_Type === "Admin") {
        response = await axios.get(`${apiKey}terminal/table/list`);
      } else {
        if (!customerID) {
          throw new Error("Customer ID not found");
        }
        response = await axios.get(
          `${apiKey}terminal/table/allTables/${customerID}`
        );
      }

      const tableData = response.data;
      if (!Array.isArray(tableData)) {
        console.error("Received non-array data:", tableData);
        setTables([]);
        setError("Invalid data format received from server");
        return;
      }

      setTables(tableData);
      setError(null);
    } catch (err) {
      console.error("Error fetching tables:", err);
      const errorMessage =
        err.message === "User data not found in localStorage"
          ? "Please log in to view tables"
          : err.message === "Customer ID not found"
          ? "Customer ID not found. Please contact support"
          : "Failed to load tables. Please try again later.";
      setError(errorMessage);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (tableId) => {
    navigate(`/data-table/${tableId}`);
  };

  const handleAddTable = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateTable = async (tableData) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!isAdmin && userData?.customerID) {
        tableData.customerID = userData.customerID;
      }

      const response = await axios.post(
        `${apiKey}terminal/createTable`,
        tableData
      );

      toast.success("Table created successfully");
      await fetchTables();
      navigate(`/data-table/${response.data._id}`);
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error(error.response?.data?.error || "Failed to create table");
    } finally {
      setOpenDialog(false);
    }
  };

  const handleDeleteTable = async () => {
    try {
      await axios.delete(`${apiKey}terminal/table/delete/${tableToDelete}`);
      fetchTables();
      toast.success("Table deleted successfully");
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Failed to delete table");
    }
  };

  const openDeleteConfirmation = (tableId, event) => {
    event.stopPropagation();
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
            {Array.isArray(tables) && tables.length > 0 ? (
              tables.map((table) => (
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

                    <Typography variant="body2" sx={{ color: "#666" }}>
                      <span style={{ fontWeight: "bold" }}>Profile:</span>{" "}
                      {table.profile}
                    </Typography>

                    {(isAdmin || !isAdmin) && (
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
                            onClick={(e) =>
                              openDeleteConfirmation(table._id, e)
                            }
                          >
                            <DeleteIcon sx={{ color: "#e57373" }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" textAlign="center">
                  No tables found
                </Typography>
              </Grid>
            )}
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
      <TableColumnCreate
        open={openDialog}
        onClose={handleCloseDialog}
        onCreateColumn={handleCreateTable}
      />
    </Box>
  );
};

export default HistoricalDataView;
