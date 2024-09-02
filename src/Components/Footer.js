import React from "react";
import { ScrollToTop } from "../Helpers/ScrollToTop";
import { Typography } from "@mui/material";
function Footer() {
  const getYear = () => {
    return new Date().getFullYear();
  };
  // sticky top-[100vh]
  return (
    <>
      <div className="bg-gray-800 text-white p-4 text-center mt-auto">
        <Typography variant="p" fontSize={14}>
          Copy@right:{getYear()}, All rights reserved
        </Typography>
        <ScrollToTop />
      </div>
    </>
  );
}

export default Footer;
