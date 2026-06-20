import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Logo from "../src/Logo";
import Footer from "../src/Footer";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Logo />
      <Box sx={{ my: 2 }}>
        <Alert variant="filled" severity="error">
          <AlertTitle>Not found!</AlertTitle>
          This page is not found. The sadness :(
        </Alert>
      </Box>
      <Footer />
    </Container>
  );
}
