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
// server.js
const { createServer } = require("http");
const { parse } = require("url");
const { v4: uuidv4 } = require("uuid");
const next = require("next");
const state = require("./state").state;
const WebSocket = require("ws");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

function broadcastState(sessionState) {
  const { epoch, description, clients, votesVisible, startedOn, availableScores } = sessionState;

  Object.entries(clients).forEach(([identifier, { socket, score, name }]) => {
    const serializedState = {
      epoch,
      availableScores,
      startedOn,
      description,
      me: { identifier, score, name },
      votesVisible: votesVisible,
      clients: Object.entries(clients).map(([identifier, { score, name }]) => ({
        identifier,
        score,
        name,
      })),
    };
    socket.send(
      JSON.stringify({
        action: "updateState",
        value: serializedState,
      })
    );
  });
}

const scorePresets = {
  FIBONACCI: [0.5, 1, 2, 3, 5, 8, 13, 21, 100, "Pass"],
  TSHIRT: ["XS", "S", "M", "L", "XL", "XXL", "Pass"],
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  const wss = new WebSocket.Server({ server: server });
  wss.on("connection", (ws, req) => {
    const sessionName = req.url;
    const identifier = uuidv4();

    let sessionState = state[sessionName];
    if (sessionState === undefined) {
      sessionState = state[sessionName] = {
        description: "",
        availableScores: scorePresets.FIBONACCI,
        votesVisible: false,
        startedOn: new Date(),
        epoch: 0,
        clients: {},
      };
    }
    sessionState.clients[identifier] = {
      socket: ws,
      score: null,
      name: null,
    };
    let myState = sessionState.clients[identifier];

    broadcastState(sessionState);

    ws.on("message", (data) => {
      const action = JSON.parse(data);
      switch (action.action) {
        case "ping":
          ws.send(JSON.stringify({ action: "pong" }));
          return;
        case "setDescription":
          sessionState.description = action.value;
          break;
        case "join":
          myState.name = action.name;
          break;
        case "leave":
          myState.name = null;
          myState.score = null;
          break;
        case "vote":
          myState.score = action.score;
          // Show votes after all participants have voted
          const participants = Object.values(sessionState.clients).filter(({ name }) => name);
          if (participants.length > 1 && participants.every(({ score }) => score)) {
            sessionState.votesVisible = true;
          }
          break;
        case "setVisibility":
          sessionState.votesVisible = action.votesVisible;
          break;
        case "reconnect":
          myState.name = action.name;
          // Only try to restore the score on reconnection if we are still on the same
          // thing we are scoring (implied by the fact that the board has not been reset)
          if (action.epoch === sessionState.epoch) {
            myState.score = action.score;
          }
          if (sessionState.clients[action.identifier] && action.identifier !== identifier) {
            // If the client has reconnected using a different socket, we boot off the previous
            // session to avoid name duplication
            sessionState.clients[action.identifier].socket.close();
          }
          break;
        case "resetBoard":
          sessionState.votesVisible = false;
          sessionState.epoch += 1;
          sessionState.startedOn = new Date();
          Object.values(sessionState.clients).forEach((c) => {
            c.score = null;
          });
          break;
      }
      broadcastState(sessionState);
    });

    ws.on("close", () => {
      delete sessionState.clients[identifier];
      broadcastState(sessionState);

      if (!Object.keys(sessionState.clients).length) {
        delete state[sessionName];
      }
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
