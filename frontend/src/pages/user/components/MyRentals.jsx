import React from "react";
import { Container, Typography } from "@mui/material";

const MyRentals = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>My Rentals</Typography>
      <Typography variant="body1">Your rental history will appear here.</Typography>
    </Container>
  );
};

export default MyRentals;
