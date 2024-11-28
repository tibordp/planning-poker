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
import React from "react";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Logo from "../src/Logo";
import Link from "next/link";
import Footer from "../src/Footer";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  description: {
    paddingBottom: theme.spacing(1),
  },
}));

export default function Index() {
  const classes = useStyles();

  return (
    <Container maxWidth="sm">
      <Logo />
      <Box my={2}>
        <Typography className={classes.description} variant="body1">
          This is a a Planning Poker app, useful for Scrum grooming sessions to avoid anchoring in
          point estimates.
        </Typography>
        <Typography className={classes.description} variant="body1">
          To start a new session, click the button below.
        </Typography>
        <Link href="/new" passHref>
          <Button color="secondary" fullWidth size="large" variant="contained">
            New session
          </Button>
        </Link>
      </Box>
      <Footer />
    </Container>
  );
}

Index.propTypes = {
  initialData: PropTypes.object,
};
