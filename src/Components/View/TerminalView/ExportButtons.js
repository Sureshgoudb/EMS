import React from "react";
import { Box, Button, styled, keyframes, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const PdfButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #FF5252 0%, #FF1744 100%)",
  color: theme.palette.common.white,
  width: "100%",

  textTransform: "none",
  fontWeight: "bold",
  boxShadow: "0 4px 8px rgba(255, 23, 68, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #FF1744 0%, #D50000 100%)",
    animation: `${pulseAnimation} 0.7s ease-in-out`,
    boxShadow: "0 6px 12px rgba(255, 23, 68, 0.6)",
  },
}));

const ExcelButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)",
  color: theme.palette.common.white,
  width: "100%",
  textTransform: "none",
  fontWeight: "bold",
  boxShadow: "0 4px 8px rgba(67, 160, 71, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #43A047 0%, #2E7D32 100%)",
    animation: `${pulseAnimation} 0.7s ease-in-out`,
    boxShadow: "0 6px 12px rgba(67, 160, 71, 0.6)",
  },
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(4),
  marginTop: theme.spacing(2),
}));

const ExportButtons = ({ exporting = false, exportToPdf, exportToExcel }) => {
  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Export Options
      </Typography>
      <ButtonsContainer>
        <PdfButton
          variant="contained"
          onClick={exportToPdf}
          disabled={exporting}
          startIcon={<PictureAsPdfIcon fontSize="large" />}
        >
          PDF
        </PdfButton>
        <ExcelButton
          variant="contained"
          onClick={exportToExcel}
          disabled={exporting}
          startIcon={<DocumentScannerIcon fontSize="large" />}
        >
          Excel
        </ExcelButton>
      </ButtonsContainer>
    </Box>
  );
};

export default ExportButtons;
