import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { parse } from "url";
import { v4 as uuidv4 } from "uuid";
import next from "next";
import { WebSocketServer, type WebSocket } from "ws";
import {
  sendMessage,
  initializeSession,
  processMessage,
  initializeClient,
  cleanupClient,
  broadcastState,
} from "./session";
import { shutdownTimeout, heartbeatInterval, heartbeatTimeout } from "./constants";
import LongPollHandler from "./longpoll";
import type { ServerSocket } from "../src/types";

// Dedicated, multi-segment path for the WebSocket transport. It must NOT collide
// with a Next.js route (e.g. the single-segment `[session]` page): Next.js 16
// claims WebSocket upgrades whose path matches one of its routes, which would
// reset the connection. The session name travels as a query parameter, the same
// way the long-poll transport carries it.
const WS_PATH = "/ppws/socket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let shuttingDown = false;

function handleConnection(
  sessionName: string,
  socket: ServerSocket,
  req: IncomingMessage,
  useHeartbeat: boolean,
): void {
  const now = new Date();
  const parsedUrl = parse(req.url ?? "", true);
  const clientId = new URLSearchParams(parsedUrl.search ?? "").get("client_id") || uuidv4();
  const sessionState = initializeSession(now, sessionName);

  if (sessionState.finished) {
    // We do not allow a full reconnection if the session is in finished state, but we
    // still keep the heartbeat on the session alive.
    socket.send(
      JSON.stringify({
        action: "finished",
        serverTime: now,
      }),
    );
    socket.close();
  } else {
    const clientState = initializeClient(now, sessionState, socket, clientId, useHeartbeat);

    socket.on("message", (data: Buffer | string) => {
      const now = new Date();
      try {
        const action = JSON.parse(data.toString());
        processMessage(now, clientState, action);
      } catch (error) {
        console.error(error);
        sendMessage(now, clientState, {
          action: "error",
          error: String(error),
        });
      }
    });

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
  }
}

app.prepare().then(() => {
  // Must be obtained after prepare().
  const upgradeHandler = app.getUpgradeHandler();

  const longPollHandler = new LongPollHandler(heartbeatInterval, heartbeatTimeout);
  longPollHandler.on("connection", (socket: ServerSocket, req: IncomingMessage) => {
    const parsedUrl = parse(req.url ?? "", true);
    const sessionName = new URLSearchParams(parsedUrl.search ?? "").get("session_name") || "";
    handleConnection(sessionName, socket, req, false);
  });

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url ?? "", true);

    if (req.method === "GET" && parsedUrl.pathname === "/health") {
      if (shuttingDown) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ errorCode: "shutting-down" }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({}));
      }
    } else if (parsedUrl.pathname?.startsWith("/lp/")) {
      return longPollHandler.handle(req, res);
    } else {
      return handle(req, res, parsedUrl);
    }
  });

  const wss = new WebSocketServer({ noServer: true });
  wss.on("connection", (socket: WebSocket, req: IncomingMessage) => {
    const parsedUrl = parse(req.url ?? "", true);
    const sessionName = new URLSearchParams(parsedUrl.search ?? "").get("session_name") || "";
    handleConnection(sessionName, socket as unknown as ServerSocket, req, true);
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url ?? "");
    if (pathname === WS_PATH) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      // Next.js dev HMR (/_next/webpack-hmr) and any other upgrades belong to Next.
      upgradeHandler(req, socket, head);
    }
  });

  server.listen(3000, () => {
    console.log("Listening on :3000");
  });

  process.on("unhandledRejection", (reason: unknown) => {
    console.log("Unhandled Rejection at:", (reason as Error)?.stack || reason);
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
      // Forcibly terminate any lingering keep-alive connections (replaces the
      // previous `killable` dependency; available since Node 18.2).
      server.closeAllConnections();
    }, shutdownTimeout);
  });
});
