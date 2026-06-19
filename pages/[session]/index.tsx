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
import Typography from "@mui/material/Typography";
import GlobalStyles from "@mui/material/GlobalStyles";
import { alpha } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useReconnector, connectionState, IS_SSR } from "../../src/remoteState";
import type { Dispatch } from "../../src/remoteState";
import { Session } from "../../src/Session";
import { SessionUrl, type Origin } from "../../src/SessionUrl";
import Logo from "../../src/Logo";
import Head from "next/head";
import removeMarkdown from "remove-markdown";
import ellipsis from "text-ellipsis";
import Footer from "../../src/Footer";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";
import { generate } from "random-words";
import type { GetServerSideProps } from "next";
import { state } from "../../server/state";
import { serializeSession } from "../../server/serialization";
import { initializeSession } from "../../server/session";
import { settingsSchema } from "../../server/constants";
import absoluteUrl from "next-absolute-url";
import type { RemoteState, ServerMessage } from "../../src/types";

const shakeStyles = (
  <GlobalStyles
    styles={{
      "@keyframes pp-shake": {
        "0%": { transform: "translate(1px, 1px) rotate(0deg)" },
        "10%": { transform: "translate(-1px, -2px) rotate(-1deg)" },
        "20%": { transform: "translate(-3px, 0px) rotate(1deg)" },
        "30%": { transform: "translate(3px, 2px) rotate(0deg)" },
        "40%": { transform: "translate(1px, -1px) rotate(1deg)" },
        "50%": { transform: "translate(-1px, 2px) rotate(-1deg)" },
        "60%": { transform: "translate(-3px, 1px) rotate(0deg)" },
        "70%": { transform: "translate(3px, 1px) rotate(-1deg)" },
        "80%": { transform: "translate(-1px, -1px) rotate(1deg)" },
        "90%": { transform: "translate(1px, 2px) rotate(0deg)" },
        "100%": { transform: "translate(1px, -2px) rotate(-1deg)" },
      },
      ".pp-shaking": {
        animationName: "pp-shake",
        animationDuration: "0.5s",
      },
    }}
  />
);

interface SessionPageProps {
  sessionName: string;
  initialRemoteState: RemoteState;
  origin: Origin;
}

// Something to make it easier to hook TamperMonkey scripts
function useBrowserApi(
  sessionName: string,
  remoteState: RemoteState | null,
  dispatch: Dispatch | null
) {
  const remoteStateRef = React.useRef<RemoteState | null>(null);
  React.useEffect(() => {
    if (!IS_SSR) {
      window.__PP_DISPATCH = dispatch ?? undefined;
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

function SessionPage({ sessionName, initialRemoteState, origin }: SessionPageProps) {
  const nudgeAudioRef = React.useRef<HTMLAudioElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();
  const [sessionFinished, setSessionFinished] = React.useState(false);

  const [remoteState, dispatch, connectionStatus] = useReconnector(
    sessionName,
    (message: ServerMessage) => {
      switch (message.action) {
        case "nudge":
          nudgeAudioRef.current?.play();
          document.body.classList.add("pp-shaking");
          setTimeout(() => document.body.classList.remove("pp-shaking"), 500);
          break;
        case "kicked":
          enqueueSnackbar("You have been kicked from the session!", { variant: "warning" });
          break;
        case "finished":
          if (!sessionFinished) {
            setSessionFinished(true);
            enqueueSnackbar("Session finished!", { variant: "info" });
            router.replace({
              pathname: "/[session]/report",
              query: { session: sessionName },
            });
          }
          break;
        case "error":
          enqueueSnackbar(message.error, { variant: "error" });
          break;
      }
    }
  );
  useBrowserApi(sessionName, remoteState, dispatch);

  const [cachedRemoteState, setCachedRemoteState] = React.useState(initialRemoteState);
  React.useEffect(() => {
    if (remoteState) {
      setCachedRemoteState(remoteState);
    }
  }, [remoteState]);

  return (
    <>
      {shakeStyles}
      <Head>
        {cachedRemoteState?.description && (
          <title>
            Planning Poker - {ellipsis(removeMarkdown(cachedRemoteState.description), 20)}
          </title>
        )}
      </Head>
      <Container maxWidth="sm">
        <Logo />
        <Box sx={{ position: "relative" }}>
          {connectionStatus !== connectionState.CONNECTED && (
            <Box
              sx={(theme) => ({
                position: "absolute",
                zIndex: 2,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.background.default, 0.7),
              })}
            >
              <Box sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                {sessionFinished && (
                  <Typography variant="subtitle1" component="span" gutterBottom>
                    Session finished.
                  </Typography>
                )}
                {!sessionFinished && (
                  <>
                    <CircularProgress color="secondary" sx={{ m: 2 }} size="3rem" />
                    <Typography variant="subtitle1" component="span" gutterBottom>
                      {connectionStatus === connectionState.CONNECTING && "Connecting..."}
                      {connectionStatus === connectionState.OFFLINE &&
                        "You are offline. Waiting for you to come back online..."}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}
          <Session sessionName={sessionName} remoteState={cachedRemoteState} dispatch={dispatch} />
        </Box>
        <SessionUrl origin={origin} sessionName={sessionName} />
        <Footer remoteState={remoteState} dispatch={dispatch} />
      </Container>
      <audio src="nudge.mp3" preload="auto" ref={nudgeAudioRef} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, req, query }) => {
  let sessionName = String(params?.session);

  let newSession = false;
  if (sessionName == "new") {
    newSession = true;
    do {
      sessionName = (
        generate({
          exactly: 1,
          wordsPerString: 3,
          separator: "-",
        }) as string[]
      )[0];
    } while (state[sessionName]);
  }

  // Here we generate a fake remote state that as closely resembles the state the
  // user will see when finally connected in order to be able to server-side
  // render the closest approximation of what the user will eventually see
  // without actually initializing the session until the user actually connects the
  // socket.
  const now = new Date();
  const session = initializeSession(now, sessionName);

  if (newSession) {
    if (query.settings) {
      try {
        const { error, value: settings } = settingsSchema.validate(
          JSON.parse(String(query.settings))
        );
        if (!error) {
          session.settings = settings;
        }
      } catch {
        // eslint: ignore
      }
    }

    return {
      redirect: {
        permanent: false,
        destination: `/${encodeURIComponent(sessionName)}`,
      },
    };
  }

  if (session.finished) {
    return {
      redirect: {
        permanent: false,
        destination: `/${encodeURIComponent(sessionName)}/report`,
      },
    };
  }

  const initialRemoteState = {
    ...serializeSession(session),
    me: { clientId: null, score: null, name: null },
    privatePreview: null,
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
};

export default SessionPage;
