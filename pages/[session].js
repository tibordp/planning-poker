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
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import { useRouter } from "next/router";
import { useReconnector, useInternetConnectivity } from "../src/remoteState";
import { MainBoard } from "../src/MainBoard";
import { makeStyles } from "@material-ui/core/styles";
import { SessionPanel } from "../src/SessionPanel";
import { SessionUrlDisplay } from "../src/SessionUrlDisplay";
import Logo from "../src/Logo";

export const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
  },
  connecting: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
}));

export default function Session() {
  const classes = useStyles();
  const router = useRouter();
  const { session } = router.query;
  const [remoteState, dispatch, isReconnecting] = useReconnector(session);
  const haveConnectivity = useInternetConnectivity();

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Logo />
        {!remoteState && (
          <Card variant="outlined" className={classes.card}>
            <Box className={classes.connecting}>
              <Typography variant="h6" component="h2" gutterBottom>
                {haveConnectivity && !isReconnecting && "Connecting..."}
                {haveConnectivity && isReconnecting && "Reconnecting..."}
                {!haveConnectivity && "You are offline. Waiting for you to come back online..."}
              </Typography>
              <CircularProgress />
            </Box>
          </Card>
        )}
        {remoteState && (
          <>
            <MainBoard remoteState={remoteState} dispatch={dispatch} />
            <SessionPanel remoteState={remoteState} dispatch={dispatch} />
          </>
        )}
        <Box my={4}>
          <SessionUrlDisplay />
        </Box>
      </Box>
    </Container>
  );
}
