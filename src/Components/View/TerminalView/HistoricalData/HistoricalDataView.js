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
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import TableColumnCreate from "./CreateNewTableDialog";
import ConfirmationDialog from "../ConfirmationDialog";
import axios from "axios";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const userDataString = localStorage.getItem("user");
      if (!userDataString)
        throw new Error("User data not found in localStorage");

      const userData = JSON.parse(userDataString);
      const { user_Type, customerID } = userData;
      setIsAdmin(user_Type === "Admin");

      const response =
        user_Type === "Admin"
          ? await axios.get(`${apiKey}terminal/table/list`)
          : await axios.get(`${apiKey}terminal/table/allTables/${customerID}`);

      const tableData = response.data;
      if (!Array.isArray(tableData)) {
        setError("Invalid data format received from server");
        return;
      }
      setTables(tableData);
      setError(null);
    } catch (err) {
      setError("Failed to load tables. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (tableId) => navigate(`/data-table/${tableId}`);
  const handleAddTable = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleCreateTable = async (tableData) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!isAdmin && userData?.customerID)
        tableData.customerID = userData.customerID;

      const response = await axios.post(
        `${apiKey}terminal/createTable`,
        tableData
      );
      setSnackbar({
        open: true,
        message: "Table created successfully",
        severity: "success",
      });
      await fetchTables();
      navigate(`/data-table/${response.data._id}`);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to create table",
        severity: "error",
      });
    } finally {
      setOpenDialog(false);
    }
  };

  const handleDeleteTable = async () => {
    try {
      await axios.delete(`${apiKey}terminal/table/delete/${tableToDelete}`);
      setSnackbar({
        open: true,
        message: "Table deleted successfully",
        severity: "success",
      });
      fetchTables();
      setDeleteDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete table",
        severity: "error",
      });
    }
  };

  const openDeleteConfirmation = (tableId, event) => {
    event.stopPropagation();
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box p={4} minHeight="100vh" bgcolor="background.default">
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                {tables.length > 0 ? (
                  tables.map((table) => (
                    <Grid item xs={12} sm={6} md={4} key={table._id}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          borderRadius: "12px",
                          cursor: "pointer",
                          position: "relative",
                          transition:
                            "transform 0.2s ease-in-out, box-shadow 0.3s",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            transform: "translateY(-4px)",
                          },
                        }}
                        onClick={() => handleTableClick(table._id)}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#1976d2",
                            fontSize: "1rem",
                            fontWeight: 500,
                            mb: 0.5,
                          }}
                        >
                          {table.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#637381",
                            fontSize: "0.75rem",
                            mb: 0.5,
                          }}
                        >
                          Profile: {table.profile}
                        </Typography>
                        {isAdmin && (
                          <Tooltip title="Delete Table">
                            <IconButton
                              onClick={(e) =>
                                openDeleteConfirmation(table._id, e)
                              }
                              sx={{ position: "absolute", top: 8, right: 8 }}
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12} textAlign="center">
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#637381",
                        mb: 2,
                      }}
                    >
                      No terminals with table found
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#637381",
                        mb: 2,
                      }}
                    >
                      Create a new display to get started
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  boxShadow: "0 2px 4px rgba(156,39,176,0.2)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(156,39,176,0.3)",
                  },
                }}
                onClick={handleAddTable}
              >
                Create New Table
              </Button>
            </Grid>
          </Grid>

          <ConfirmationDialog
            open={deleteDialogOpen}
            onConfirm={handleDeleteTable}
            onCancel={() => setDeleteDialogOpen(false)}
          >
            Are you sure you want to delete this table? This action cannot be
            undone.
          </ConfirmationDialog>
          <TableColumnCreate
            open={openDialog}
            onClose={handleCloseDialog}
            onCreateColumn={handleCreateTable}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default HistoricalDataView;
