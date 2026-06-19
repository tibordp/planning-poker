/**
 * MIT License
 *
 * Copyright (c) 2020 Tibor Djurica Potpara
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
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
