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
const killable = require("killable");
const WebSocket = require("ws");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const {
  sendMessage,
  initializeSession,
  processMessage,
  initializeClient,
  cleanupClient,
  broadcastState,
} = require("./session");
const { shutdownTimeout } = require("./constants");

let shuttingDown = false;

app.prepare().then(() => {
  const server = killable(
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);

      if (req.method === "GET" && parsedUrl.pathname === "/health") {
        if (shuttingDown) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ errorCode: "shutting-down" }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({}));
        }
      } else {
        return handle(req, res, parsedUrl);
      }
    })
  );

  const wss = new WebSocket.Server({ server });
  wss.on("connection", (socket, req) => {
    const now = new Date();
    const parsedUrl = parse(req.url);
    const sessionName = parsedUrl.pathname.slice(1); // Strip the slash
    const clientId = new URLSearchParams(parsedUrl.search).get("client_id") || "";
    const sessionState = initializeSession(now, sessionName, clientId);
    const clientState = initializeClient(sessionState, socket, clientId);

    socket.on("message", (data) => {
      const now = new Date();
      try {
        const action = JSON.parse(data);
        processMessage(now, clientState, action);
      } catch (error) {
        console.error(error);
        sendMessage(now, clientState, {
          action: "error",
          error: error.toString(),
        });
      }
    });

    socket.on("");

    socket.on("close", () => {
      // If another connection took over with the same client ID, we don't
      // cleanup anything here as it will be cleaned up when the new socket
      // disconnects.
      if (clientState.socket === socket) {
        const now = new Date();
        cleanupClient(now, clientState);
      }
    });

    broadcastState(now, sessionState);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("Listening on :3000");
  });

  process.on("SIGTERM", () => {
    console.log("Starting graceful shutdown");
    shuttingDown = true;

    setTimeout(() => {
      server.close((err) => {
        if (err) throw err;
        console.info("Successful graceful shutdown");
        process.exit(0);
      });
      server.kill();
    }, shutdownTimeout);
  });
});
