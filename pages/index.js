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
import { makeStyles } from "@material-ui/core/styles";
import Logo from "../src/Logo";
import Footer from "../src/Footer";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Skeleton from "@material-ui/lab/Skeleton";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import randomWords from "random-words";
import useSWR from "swr";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    marginTop: theme.spacing(2),
  },
}));

function Statistics() {
  const classes = useStyles();
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data, error } = useSWR("/api/stats", fetcher);

  return (
    <>
      {error && (
        <Box my={2}>
          <Alert variant="filled" severity="error">
            <AlertTitle>Could not load statistics!</AlertTitle>
            It&apos;s your fault probably.
          </Alert>
        </Box>
      )}
      {!error && (
        <TableContainer component={Paper} variant="outlined" className={classes.tableContainer}>
          {!data && (
            <Box my={2} mx={2}>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </Box>
          )}
          {data && (
            <Table aria-label="simple table">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Number of active sessions
                  </TableCell>
                  <TableCell align="right">{data.numSessions}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Total number of players
                  </TableCell>
                  <TableCell align="right">{data.numPlayers}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Number of voters
                  </TableCell>
                  <TableCell align="right">{data.numVoters}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Number of observers
                  </TableCell>
                  <TableCell align="right">{data.numObservers}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
    </>
  );
}

export default function Index() {
  const handleNewSession = () => {
    const sessionId = randomWords({
      exactly: 1,
      wordsPerString: 3,
      separator: "-",
    })[0];
    window.open(`/${sessionId}`, "_blank");
  };

  return (
    <Container maxWidth="sm">
      <Logo />
      <Box my={2}>
        <Button
          color="secondary"
          onClick={handleNewSession}
          fullWidth
          size="large"
          variant="contained"
        >
          New session
        </Button>
        <Statistics />
      </Box>
      <Footer />
    </Container>
  );
}
