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
import { fade } from "@material-ui/core/styles/colorManipulator";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import { useReconnector, connectionState, IS_SSR } from "../../src/remoteState";
import { Session } from "../../src/Session";
import { makeStyles } from "@material-ui/core/styles";
import { SessionUrl } from "../../src/SessionUrl";
import Logo from "../../src/Logo";
import Head from "next/head";
import removeMarkdown from "remove-markdown";
import ellipsis from "text-ellipsis";
import Footer from "../../src/Footer";
import { useSnackbar } from "notistack";
import { state } from "../../server/state";
import { serializeSession } from "../../server/serialization";
import { createNewSession } from "../../server/session";
import absoluteUrl from "next-absolute-url";

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
  overlay: {
    position: "absolute",
    zIndex: 2,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: fade(theme.palette.background.default, 0.7),
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

// Something to make it easier to hook TamperMonkey scripts
function useBrowserApi(sessionName, remoteState, dispatch) {
  const remoteStateRef = React.useRef();
  React.useEffect(() => {
    if (!IS_SSR) {
      window.__PP_DISPATCH = dispatch;
      window.__PP_SESSION_NAME = sessionName;
    }
  }, [dispatch, sessionName]);

  React.useEffect(() => {
    if (!IS_SSR) {
      window.__PP_STATE = remoteState;
      window.dispatchEvent(
        new CustomEvent("ppStateChanged", {
          bubbles: false,
          detail: {
            current: remoteState,
            previous: remoteStateRef.current,
          },
        })
      );
      remoteStateRef.current = remoteState;
    }
  }, [remoteState]);
}

function SessionPage({ sessionName, initialRemoteState, origin }) {
  const classes = useStyles();
  const nudgeAudioRef = React.useRef();
  const { enqueueSnackbar } = useSnackbar();

  const [remoteState, dispatch, connectionStatus] = useReconnector(sessionName, (message) => {
    switch (message.action) {
      case "nudge":
        nudgeAudioRef.current?.play();
        document.body.classList.add(classes.shaking);
        setTimeout(() => document.body.classList.remove(classes.shaking), 500);
        break;
      case "kicked":
        enqueueSnackbar("You have been kicked from the session!", { variant: "warning" });
        break;
      case "error":
        enqueueSnackbar(message.error, { variant: "error" });
        break;
    }
  });
  useBrowserApi(sessionName, remoteState, dispatch);

  const [cachedRemoteState, setCachedRemoteState] = React.useState(initialRemoteState);
  React.useEffect(() => {
    if (remoteState) {
      setCachedRemoteState(remoteState);
    }
  }, [remoteState]);

  return (
    <>
      <Head>
        {cachedRemoteState?.description && (
          <title>
            Planning Poker - {ellipsis(removeMarkdown(cachedRemoteState.description), 20)}
          </title>
        )}
      </Head>
      <Container maxWidth="sm">
        <Logo />
        <Box position="relative">
          {connectionStatus !== connectionState.CONNECTED && (
            <Box
              className={classes.overlay}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box className={classes.connecting}>
                <CircularProgress color="secondary" className={classes.spinner} size="3rem" />
                <Typography variant="subtitle1" component="span" gutterBottom>
                  {connectionStatus === connectionState.CONNECTING && "Connecting..."}
                  {connectionStatus === connectionState.OFFLINE &&
                    "You are offline. Waiting for you to come back online..."}
                </Typography>
              </Box>
            </Box>
          )}
          <Session sessionName={sessionName} remoteState={cachedRemoteState} dispatch={dispatch} />
        </Box>
        <SessionUrl origin={origin} sessionName={sessionName} />
        <Footer remoteState={remoteState} dispatch={dispatch} />
      </Container>
      <audio src="nudge.mp3" ref={nudgeAudioRef} />
    </>
  );
}

SessionPage.propTypes = {
  sessionName: PropTypes.string.isRequired,
  initialRemoteState: PropTypes.object.isRequired,
  origin: PropTypes.shape({ protocol: PropTypes.string, host: PropTypes.string }).isRequired,
};

export async function getServerSideProps({ params, req }) {
  const { session: sessionName } = params;

  // Here we generate a fake remote state that as closely resembles the state the
  // user will see when finally connected in order to be able to server-side
  // render the closest approximation of what the user will eventually see
  // without actually initializing the session until the user actually connects the
  // socket.
  const session = state[sessionName] || createNewSession(new Date(), sessionName, null);
  const initialRemoteState = {
    ...serializeSession(session),
    me: { clientId: null, score: null, name: null },
  };

  return {
    props: {
      sessionName,
      origin: absoluteUrl(req),
      // Nasty hack for https://github.com/vercel/next.js/discussions/11498
      // we actually do serialize Date objects directly when sending them over
      // the WebSocket, so it's OK if they are passed as ISO strings when
      // generated in SSR context.
      initialRemoteState: JSON.parse(JSON.stringify(initialRemoteState)),
    },
  };
}

export default SessionPage;
