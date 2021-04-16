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
import getConfig from "next/config";

import { HeartbeatingWebsocket } from "./connection/websocket";
import { LongPollSocket } from "./connection/longpoll";
import { v4 as uuidv4 } from "uuid";

export const IS_SSR = typeof navigator === "undefined" || typeof window === "undefined";
const { publicRuntimeConfig } = getConfig();

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

function getSocket(sessionName) {
  let clientId = window.sessionStorage.getItem("client_id");
  if (!clientId) {
    clientId = uuidv4();
    window.sessionStorage.setItem("client_id", clientId);
  }

  if (publicRuntimeConfig.useLongPolling) {
    const url = new URL(location.href);
    url.pathname = `/lp/`;
    return new LongPollSocket(
      url.toString(),
      {
        client_id: clientId,
        session_name: sessionName,
      },
      publicRuntimeConfig.heartbeatTimeout
    );
  } else {
    const url = new URL(location.href);
    url.protocol = url.protocol.replace("http", "ws");
    url.pathname = `/${encodeURIComponent(sessionName)}`;
    url.search = new URLSearchParams({
      client_id: clientId,
    }).toString();
    url.hash = "";
    return new HeartbeatingWebsocket(
      url.toString(),
      publicRuntimeConfig.heartbeatInterval,
      publicRuntimeConfig.heartbeatTimeout
    );
  }
}

export function useRemoteState(sessionName, onAction) {
  const [dispatch, setDispatch] = React.useState(null);
  const [remoteState, setRemoteState] = React.useState(null);

  const haveConnectivity = useInternetConnectivity();

  React.useEffect(() => {
    if (IS_SSR || !haveConnectivity) {
      // If we are in SSR context or offline, do not try to continuously reconnect
      return () => {};
    }
    const socket = getSocket(sessionName);

    socket.onopen = () => {
      setDispatch(() => (message) => socket.send(message));
    };

    socket.onmessage = (message) => {
      switch (message.action) {
        case "updateState":
          setRemoteState(message.value);
          break;
        default:
          onAction?.(message);
          break;
      }
      // Store the last known time offset between server and client globally
      window.__PP_TIME_OFFSET = new Date() - new Date(message.serverTime);
    };
    socket.onclose = () => {
      setRemoteState(null);
      setDispatch(null);
    };

    return () => {
      socket.close();
    };
  }, [haveConnectivity]);

  return [remoteState, dispatch];
}

export const connectionState = {
  OFFLINE: "offline",
  CONNECTING: "connecting",
  CONNECTED: "connected",
};

/**
 * Stores part of the state in sessionStorage (vote for the current epoch and
 * whether we are participant or not (along with name), so we can refresh the
 * page and stay connected seamlessly.
 */
export function useReconnector(sessionName, onAction) {
  const [remoteState, dispatch] = useRemoteState(sessionName, onAction);
  const haveConnectivity = useInternetConnectivity();

  React.useEffect(() => {
    if (!IS_SSR) {
      if (remoteState?.me) {
        window.sessionStorage.setItem(
          `session_data:${sessionName}`,
          JSON.stringify({
            epoch: remoteState.epoch,
            name: remoteState.me.name,
            score: remoteState.me.score,
          })
        );
      }
    }
  }, [remoteState]);

  React.useEffect(() => {
    if (!IS_SSR) {
      const storedSession = window.sessionStorage.getItem(`session_data:${sessionName}`);
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
  } else {
    state = connectionState.CONNECTING;
  }

  return [remoteState, dispatch, state];
}
