import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Paper,
  FormHelperText,
  alpha,
  useTheme,
  Container,
  Fade,
} from "@mui/material";
import { AccessTime, Person, Category, Badge } from "@mui/icons-material";
import dayjs from "dayjs";

const ApprovalForm = ({ onApprovalDetailsChange, customerName }) => {
  const theme = useTheme();

  const [approvalDetails, setApprovalDetails] = useState({
    type: "",
    operatorName: "",
    customerName: customerName || "",
    approvalDateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    isValid: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setApprovalDetails((prev) => ({
        ...prev,
        approvalDateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const isValid =
      approvalDetails.type && approvalDetails.operatorName.trim() !== "";
    setApprovalDetails((prev) => ({ ...prev, isValid }));
    onApprovalDetailsChange({ ...approvalDetails, isValid });
  }, [approvalDetails.type, approvalDetails.operatorName]);

  const handleOperatorNameChange = (event) => {
    setApprovalDetails((prev) => ({
      ...prev,
      operatorName: event.target.value,
    }));
  };

  const handleTypeChange = (event) => {
    setApprovalDetails((prev) => ({
      ...prev,
      type: event.target.value,
    }));
  };

  const formFieldStyle = {
    "& .MuiOutlinedInput-root": {
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        "& fieldset": {
          borderColor: theme.palette.primary.main,
          borderWidth: "0.5px",
        },
      },
      "&.Mui-focused": {
        "& fieldset": {
          borderColor: theme.palette.primary.main,
          borderWidth: "0.5px",
          boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
      },
    },
  };

  return (
    <Fade in timeout={800}>
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 3,
            borderRadius: 3,
            background: `linear-gradient(145deg, ${alpha(
              theme.palette.background.paper,
              0.9
            )}, ${alpha(theme.palette.background.paper, 0.95)})`,
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              gap: 2,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              pb: 2,
            }}
          >
            <Badge color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="600" color="primary">
              Approval Details
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormControl fullWidth>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Person fontSize="small" color="primary" />
                <Typography variant="subtitle1" color="text.primary">
                  Customer Name
                </Typography>
              </Box>
              <TextField
                value={approvalDetails.customerName}
                disabled
                size="small"
                sx={{
                  ...formFieldStyle,
                  backgroundColor: alpha(theme.palette.action.disabled, 0.05),
                }}
              />
            </FormControl>

            <FormControl>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Category fontSize="small" color="primary" />
                <Typography variant="subtitle1" color="text.primary">
                  Revision Type
                </Typography>
              </Box>
              <RadioGroup
                row
                value={approvalDetails.type}
                onChange={handleTypeChange}
                sx={{ ml: 1 }}
              >
                <FormControlLabel
                  value="offline"
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label="Revision Updated - Offline"
                />
                <FormControlLabel
                  value="online"
                  control={<Radio />}
                  label="Revision Updated - Online"
                  disabled
                />
              </RadioGroup>
            </FormControl>

            <FormControl>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Badge fontSize="small" color="primary" />
                <Typography variant="subtitle1" color="text.primary">
                  Operator Name
                </Typography>
              </Box>
              <TextField
                placeholder="Enter operator name"
                value={approvalDetails.operatorName}
                onChange={handleOperatorNameChange}
                fullWidth
                size="small"
                required
                error={approvalDetails.operatorName.trim() === ""}
                helperText={
                  approvalDetails.operatorName.trim() === ""
                    ? "Operator name is required"
                    : ""
                }
                sx={formFieldStyle}
              />
            </FormControl>

            <FormControl>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <AccessTime fontSize="small" color="primary" />
                <Typography variant="subtitle1" color="text.primary">
                  Approval Date/Time
                </Typography>
              </Box>
              <TextField
                value={approvalDetails.approvalDateTime}
                disabled
                size="small"
                sx={{
                  ...formFieldStyle,
                  backgroundColor: alpha(theme.palette.action.disabled, 0.05),
                }}
              />
              <FormHelperText sx={{ ml: 1 }}>
                System date and time (auto-updated)
              </FormHelperText>
            </FormControl>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ApprovalForm;
