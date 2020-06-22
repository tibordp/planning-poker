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
import PropTypes from "prop-types";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import { useReconnector, connectionState } from "../src/remoteState";
import { Session } from "../src/Session";
import { makeStyles } from "@material-ui/core/styles";
import { SessionUrl } from "../src/SessionUrl";
import Logo from "../src/Logo";
import Head from "next/head";
import removeMarkdown from "remove-markdown";
import ellipsis from "text-ellipsis";
import Footer from "../src/Footer";

import { useSnackbar } from "notistack";

export const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(4),
  },
  "@keyframes shake": {
    "0%": { transform: "translate(1px, 1px) rotate(0deg);" },
    "10%": { transform: "translate(-1px, -2px) rotate(-1deg);" },
    "20%": { transform: "translate(-3px, 0px) rotate(1deg);" },
    "30%": { transform: "translate(3px, 2px) rotate(0deg);" },
    "40%": { transform: "translate(1px, -1px) rotate(1deg);" },
    "50%": { transform: "translate(-1px, 2px) rotate(-1deg);" },
    "60%": { transform: "translate(-3px, 1px) rotate(0deg);" },
    "70%": { transform: "translate(3px, 1px) rotate(-1deg);" },
    "80%": { transform: "translate(-1px, -1px) rotate(1deg);" },
    "90%": { transform: "translate(1px, 2px) rotate(0deg);" },
    "100%": { transform: "translate(1px, -2px) rotate(-1deg);" },
  },
  shaking: {
    animationName: "$shake",
    animationDuration: "0.5s",
  },
  connecting: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  spinner: {
    margin: theme.spacing(2),
  },
}));

function SessionPage({ session }) {
  const classes = useStyles();
  const nudgeAudioRef = React.useRef();
  const { enqueueSnackbar } = useSnackbar();

  const [remoteState, dispatch, connectionStatus, timeDrift] = useReconnector(
    session,
    (message) => {
      switch (message.action) {
        case "nudge":
          nudgeAudioRef.current?.play();
          document.body.classList.add(classes.shaking);
          setTimeout(() => document.body.classList.remove(classes.shaking), 500);
          break;
        case "error":
          enqueueSnackbar(message.error, { variant: "error" });
          break;
      }
    }
  );

  return (
    <>
      <Head>
        {remoteState?.description && (
          <title>Planning Poker - {ellipsis(removeMarkdown(remoteState.description), 20)}</title>
        )}
      </Head>
      <Container maxWidth="sm">
        <Logo />
        <Box my={2}>
          {connectionStatus !== connectionState.CONNECTED && (
            <Card variant="outlined" className={classes.card}>
              <Box className={classes.connecting}>
                <CircularProgress color="secondary" className={classes.spinner} size="3rem" />
                <Typography variant="subtitle1" component="span" gutterBottom>
                  {connectionStatus === connectionState.CONNECTING && "Connecting..."}
                  {connectionStatus === connectionState.RECONNECTING && "Reconnecting..."}
                  {connectionStatus === connectionState.OFFLINE &&
                    "You are offline. Waiting for you to come back online..."}
                </Typography>
              </Box>
            </Card>
          )}
          {remoteState && <Session remoteState={remoteState} dispatch={dispatch} />}
          <SessionUrl sessionName={session} />
        </Box>
        <Footer
          showTimer={remoteState?.settings.showTimer}
          timerState={remoteState?.timerState}
          dispatch={dispatch}
          timeDrift={timeDrift}
        />
      </Container>
      <audio src="nudge.mp3" ref={nudgeAudioRef} />
    </>
  );
}

SessionPage.propTypes = {
  session: PropTypes.string.isRequired,
};

SessionPage.getInitialProps = ({ query }) => {
  const { session } = query;
  return { session };
};

export default SessionPage;
