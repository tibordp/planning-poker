import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Logo from "../src/Logo";
import Link from "next/link";
import Footer from "../src/Footer";
import Typography from "@mui/material/Typography";

export default function Index() {
  return (
    <Container maxWidth="sm">
      <Logo />
      <Box sx={{ my: 2 }}>
        <Typography sx={{ pb: 1 }} variant="body1">
          This is a a Planning Poker app, useful for Scrum grooming sessions to avoid anchoring in
          point estimates.
        </Typography>
        <Typography sx={{ pb: 1 }} variant="body1">
          To start a new session, click the button below.
        </Typography>
        <Button
          component={Link}
          href="/new"
          color="secondary"
          fullWidth
          size="large"
          variant="contained"
        >
          New session
        </Button>
      </Box>
      <Footer />
    </Container>
  );
}
