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
const { createServer } = require("http");
const { parse, URLSearchParams } = require("url");
const next = require("next");
const state = require("./state").state;
const scorePresets = require("./scoreSets").scorePresets;
const WebSocket = require("ws");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

function broadcastState(sessionState) {
  const { epoch, description, clients, votesVisible, startedOn, settings } = sessionState;

  const clientsData = Object.entries(clients)
    .map(([identifier, { score, name }]) => ({
      identifier,
      score,
      name,
    }))
    .sort((a, b) => {
      // Sort by name, then by identifier. If the client is not participant, it doesn't matter,
      // as they are invisible, so we put them all at the end.
      if (!a.name || !b.name) {
        return a.name ? -1 : b.name ? 1 : 0;
      } else {
        return a.name.localeCompare(b.name) || a.identifier.localeCompare(b.identifier);
      }
    });

  Object.entries(clients).forEach(([identifier, { socket, score, name }]) => {
    const serializedState = {
      epoch,
      settings,
      startedOn,
      description,
      me: { identifier, score, name },
      votesVisible: votesVisible,
      clients: clientsData,
    };
    socket.send(
      JSON.stringify({
        action: "updateState",
        value: serializedState,
      })
    );
  });
}

function resetBoard(sessionState) {
  sessionState.votesVisible = false;
  sessionState.epoch += 1;
  sessionState.startedOn = new Date();
  Object.values(sessionState.clients).forEach((c) => {
    c.score = null;
  });
}

function initializeSession(sessionName) {
  let sessionState = state[sessionName];
  if (!sessionState) {
    console.log(`Creating new session ${sessionName}.`);
    sessionState = state[sessionName] = {
      description: "",
      settings: {
        scoreSet: scorePresets[0].scores,
      },
      votesVisible: false,
      startedOn: new Date(),
      epoch: 0,
      clients: {},
    };
  }
  return sessionState;
}

function clearHeartbeat(clientState) {
  clearTimeout(clientState.lastHeartbeat);
  clientState.lastHeartbeat = null;
}

function setHeartbeat(clientState) {
  clearHeartbeat(clientState);
  clientState.lastHeartbeat = setTimeout(() => {
    clientState.socket.close();
  }, 10000);
}

function processMessage(sessionState, identifier, action) {
  const clientState = sessionState.clients[identifier];

  setHeartbeat(clientState);
  switch (action.action) {
    case "ping":
      clientState.socket.send(JSON.stringify({ action: "pong" }));
      return;
    case "nudge":
      const recipient = sessionState.clients[action.identifier];
      if (recipient) {
        recipient.socket.send(JSON.stringify({ action: "nudge" }));
      }
      return;
    case "setDescription":
      sessionState.description = action.value;
      break;
    case "join":
      clientState.name = action.name;
      break;
    case "leave":
      clientState.name = null;
      clientState.score = null;
      break;
    case "vote":
      const hasNotVotedYet = !clientState.score;
      clientState.score = action.score;
      // Show votes after all participants have voted, but only if the board is not already
      // full so we can hide the scores and let people re-vote without clearing everything.
      const participants = Object.values(sessionState.clients).filter(({ name }) => name);
      if (hasNotVotedYet && participants.length > 1 && participants.every(({ score }) => score)) {
        sessionState.votesVisible = true;
      }
      break;
    case "setVisibility":
      sessionState.votesVisible = action.votesVisible;
      break;
    case "setSettings":
      sessionState.settings = action.settings;
      resetBoard(sessionState);
      break;
    case "reconnect":
      clientState.name = action.name;
      // Only try to restore the score on reconnection if we are still on the same
      // thing we are scoring (implied by the fact that the board has not been reset).
      // Received epoch can be larger than the local one in case the last connected
      // client disconnected and we deleted the session.
      if (action.epoch >= sessionState.epoch) {
        clientState.score = action.score;
        sessionState.settings = action.settings;
      }
      break;
    case "resetBoard":
      resetBoard(sessionState);
      break;
  }
  broadcastState(sessionState);
}

function initializeClient(sessionState, ws, identifier) {
  let clientState = sessionState.clients[identifier];
  if (clientState) {
    console.log(`Client ${identifier} reconnected using a different socket.`);
    const previousSocket = clientState.socket;
    clientState.socket = ws;
    previousSocket.terminate();
  } else {
    console.log(`New client ${identifier} connected.`);
    clientState = {
      socket: ws,
      score: null,
      name: null,
      lastHeartbeat: null,
    };
    sessionState.clients[identifier] = clientState;
  }
  setHeartbeat(clientState);
  return clientState;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  const wss = new WebSocket.Server({ server: server });
  wss.on("connection", (ws, req) => {
    const parsedUrl = parse(req.url);
    const sessionName = parsedUrl.pathname;
    const identifier = new URLSearchParams(parsedUrl.search).get("client_id");
    const sessionState = initializeSession(sessionName);
    const clientState = initializeClient(sessionState, ws, identifier);

    ws.on("message", (data) => {
      try {
        const action = JSON.parse(data);
        processMessage(sessionState, identifier, action);
      } catch (error) {
        // Guard against clients sending junk, so it doesn't kill the server
        console.error(error);
        ws.close();
      }
    });

    ws.on("close", () => {
      // If another connection took over with the same client ID, we don't
      // cleanup anything here as it will be cleaned up when the new socket
      // disconnects.
      if (clientState.socket === ws) {
        console.log(`Client ${identifier} disconnected.`);
        clearHeartbeat(clientState);
        delete sessionState.clients[identifier];

        // Delete the session after last client disconnects
        if (!Object.keys(sessionState.clients).length) {
          console.log(`Deleting session ${sessionName}.`);
          delete state[sessionName];
        } else {
          broadcastState(sessionState);
        }
      }
    });

    broadcastState(sessionState);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
