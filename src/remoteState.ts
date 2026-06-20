import React from "react";

import { HeartbeatingWebsocket } from "./connection/websocket";
import { LongPollSocket } from "./connection/longpoll";
import { getClientConfig } from "./config";
import { v4 as uuidv4 } from "uuid";
import type { Action, ClientSocket, RemoteState, ServerMessage } from "./types";

export type Dispatch = (message: Action) => void;
export type OnAction = (message: ServerMessage) => void;

export const IS_SSR = typeof navigator === "undefined" || typeof window === "undefined";

export function useInternetConnectivity(): boolean {
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

function getSocket(sessionName: string): ClientSocket {
  const publicRuntimeConfig = getClientConfig();
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
      publicRuntimeConfig.heartbeatTimeout,
    );
  } else {
    const url = new URL(location.href);
    url.protocol = url.protocol.replace("http", "ws");
    // Dedicated WebSocket path with the session name in the query string. It must
    // not collide with a Next.js page route (see WS_PATH in server/index.ts).
    url.pathname = `/ppws/socket`;
    url.search = new URLSearchParams({
      client_id: clientId,
      session_name: sessionName,
    }).toString();
    url.hash = "";
    return new HeartbeatingWebsocket(
      url.toString(),
      publicRuntimeConfig.heartbeatInterval,
      publicRuntimeConfig.heartbeatTimeout,
    );
  }
}

export function useRemoteState(
  sessionName: string,
  onAction?: OnAction,
): [RemoteState | null, Dispatch | null] {
  const [dispatch, setDispatch] = React.useState<Dispatch | null>(null);
  const [remoteState, setRemoteState] = React.useState<RemoteState | null>(null);

  const haveConnectivity = useInternetConnectivity();

  React.useEffect(() => {
    if (IS_SSR || !haveConnectivity) {
      // If we are in SSR context or offline, do not try to continuously reconnect
      return () => {};
    }
    const socket = getSocket(sessionName);

    socket.onopen = () => {
      setDispatch(() => (message: Action) => socket.send(message));
    };

    socket.onmessage = (message: ServerMessage) => {
      switch (message.action) {
        case "updateState":
          setRemoteState(message.value);
          break;
        default:
          onAction?.(message);
          break;
      }
      // Store the last known time offset between server and client globally
      window.__PP_TIME_OFFSET = Number(new Date()) - Number(new Date(message.serverTime));
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
} as const;

export type ConnectionState = (typeof connectionState)[keyof typeof connectionState];

/**
 * Stores part of the state in sessionStorage (vote for the current epoch and
 * whether we are participant or not (along with name), so we can refresh the
 * page and stay connected seamlessly.
 */
export function useReconnector(
  sessionName: string,
  onAction?: OnAction,
): [RemoteState | null, Dispatch | null, ConnectionState] {
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
          }),
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

  let state: ConnectionState;
  if (remoteState) {
    state = connectionState.CONNECTED;
  } else if (!haveConnectivity) {
    state = connectionState.OFFLINE;
  } else {
    state = connectionState.CONNECTING;
  }

  return [remoteState, dispatch, state];
}
