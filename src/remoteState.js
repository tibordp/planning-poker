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
import ReconnectingWebSocket from "reconnecting-websocket";

export const IS_SSR = typeof navigator === "undefined" || typeof window === "undefined";

export function useInternetConnectivity() {
  const [haveConnectivity, setHaveConnectivity] = React.useState(!IS_SSR && navigator.onLine);

  React.useEffect(() => {
    if (IS_SSR) {
      return () => {};
    }

    const setOnline = () => setHaveConnectivity(true);
    const setOffline = () => setHaveConnectivity(false);

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
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
      return () => {};
    }

    const protocol = location.protocol.replace("http", "ws");
    const host = `${location.hostname}:${location.port}`;
    const socket = new ReconnectingWebSocket(`${protocol}//${host}/${session}`);

    function closeConnection() {
      clearInterval(socket.pinger);
      setRemoteState(null);
      setDispatch(null);
    }

    socket.onopen = () => {
      setDispatch(() => (action) => {
        console.log(action);
        socket.send(JSON.stringify(action));
      });
      socket.pinger = setInterval(() => {
        socket.send(JSON.stringify({ action: "ping" }));
      }, 5000);
    };
    socket.onmessage = (evt) => {
      const message = JSON.parse(evt.data);
      switch (message.action) {
        case "pong":
          break;
        case "updateState":
          setRemoteState(message.value);
          break;
      }
    };
    socket.onerror = closeConnection;
    socket.onclose = closeConnection;
    return () => {
      socket.close();
    };
  }, [session, haveConnectivity]);

  return [remoteState, dispatch];
}

/**
 * Stores part of the state in localStorage (vote for the current epoch and
 * whether we are participant or not (along with name), so we can refresh the
 * page and stay connected seamlessly.
 */
export function useReconnector(session) {
  const [remoteState, dispatch] = useRemoteState(session);

  React.useEffect(() => {
    if (!IS_SSR) {
      if (remoteState?.me) {
        window.sessionStorage.setItem(
          session,
          JSON.stringify({
            epoch: remoteState.epoch,
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

  return [remoteState, dispatch, !remoteState && !IS_SSR && window.sessionStorage.getItem(session)];
}
