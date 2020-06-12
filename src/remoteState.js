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
import { HeartbeatingWebsocket } from "./websocket";

export const IS_SSR = typeof navigator === "undefined" || typeof window === "undefined";

export function useInternetConnectivity() {
  const [haveConnectivity, setHaveConnectivity] = React.useState(IS_SSR || navigator.onLine);
  const setConnectivity = () => setHaveConnectivity(navigator.onLine);

  React.useEffect(() => {
    if (IS_SSR) {
      return () => {};
    }

    window.addEventListener("online", setConnectivity);
    window.addEventListener("offline", setConnectivity);
    setConnectivity();

    return () => {
      window.removeEventListener("online", setConnectivity);
      window.removeEventListener("offline", setConnectivity);
    };
  });

  return haveConnectivity;
}

export function useRemoteState(session) {
  const [dispatch, setDispatch] = React.useState(null);
  const [remoteState, setRemoteState] = React.useState(null);

  const haveConnectivity = useInternetConnectivity();

  React.useEffect(() => {
    if (IS_SSR || !haveConnectivity) {
      // If we are in SSR context or offline, do not try to continuously reconnect
      return () => {};
    }

    const protocol = location.protocol.replace("http", "ws");
    const host = `${location.hostname}:${location.port}`;
    const socket = new HeartbeatingWebsocket(`${protocol}//${host}/${session}`);

    socket.onopen = () => {
      setDispatch(() => (message) => socket.send(message));
    };

    socket.onmessage = (message) => {
      switch (message.action) {
        case "updateState":
          setRemoteState(message.value);
          break;
      }
    };
    socket.onclose = () => {
      setRemoteState(null);
      setDispatch(null);
    };

    return () => {
      socket.close();
    };
  }, [session, haveConnectivity]);

  return [remoteState, dispatch];
}

export const connectionState = {
  OFFLINE: "offline",
  CONNECTING: "connecting",
  RECONNECTING: "reconnecting",
  CONNECTED: "connected",
};

/**
 * Stores part of the state in sessionStorage (vote for the current epoch and
 * whether we are participant or not (along with name), so we can refresh the
 * page and stay connected seamlessly.
 */
export function useReconnector(session) {
  const [remoteState, dispatch] = useRemoteState(session);
  const haveConnectivity = useInternetConnectivity();

  React.useEffect(() => {
    if (!IS_SSR) {
      if (remoteState?.me) {
        window.sessionStorage.setItem(
          session,
          JSON.stringify({
            epoch: remoteState.epoch,
            settings: remoteState.settings,
            ...remoteState.me,
          })
        );
      }
    }
  }, [remoteState]);

  React.useEffect(() => {
    if (!IS_SSR) {
      const storedSession = window.sessionStorage.getItem(session);
      if (dispatch && storedSession) {
        dispatch({ action: "reconnect", ...JSON.parse(storedSession) });
      }
    }
  }, [dispatch]);

  let state;
  if (remoteState) {
    state = connectionState.CONNECTED;
  } else if (!haveConnectivity) {
    state = connectionState.OFFLINE;
  } else if (!IS_SSR && window.sessionStorage.getItem(session)) {
    state = connectionState.RECONNECTING;
  } else {
    state = connectionState.CONNECTING;
  }

  return [remoteState, dispatch, state];
}
