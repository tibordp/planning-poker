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
import { state } from "./state";
import {
  defaultSettings,
  heartbeatTimeout,
  sessionTtl,
  finishedSessionTtl,
  actionSchema,
} from "./constants";
import { serializeSession } from "./serialization";
import type {
  Action,
  ClientState,
  Page,
  ServerSocket,
  SessionState,
  TimerState,
} from "../src/types";

export function sendMessage(
  now: Date,
  clientState: ClientState,
  action: Record<string, unknown>
): void {
  const { socket } = clientState;
  socket.send(
    JSON.stringify({
      ...action,
      serverTime: now,
    })
  );
}

export function broadcastState(now: Date, sessionState: SessionState): void {
  Object.entries(sessionState.clients).forEach((client) => {
    const serializedState = serializeSession(sessionState, client);

    const [, clientState] = client;
    sendMessage(now, clientState, {
      action: "updateState",
      value: serializedState,
    });
  });
}

function resetBoard(now: Date, sessionState: SessionState, shouldResetTimer = false): void {
  sessionState.votesVisible = false;
  sessionState.epoch += 1;
  if (shouldResetTimer) {
    resetTimer(now, sessionState.timerState);
  }
  Object.values(sessionState.clients).forEach((c) => {
    c.score = null;
  });
  sessionState.pagination.pages[sessionState.pagination.pageIndex].votes = {};
}

function savePaginationData(now: Date, sessionState: SessionState): void {
  const { description, pagination, clients, timerState } = sessionState;

  // Always just merge the scores in to avoid losing info about clients who disconnect
  const newVotes = pagination.pages[pagination.pageIndex].votes || {};
  Object.values(clients).forEach(({ name, score }) => {
    if (name) {
      if (score) {
        newVotes[name] = score;
      } else {
        delete newVotes[name];
      }
    }
  });

  const updatedObject: Page = {
    description,
    timerState: {
      ...timerState,
      pausedTime: timerState.pausedTime || now,
    },
    votes: newVotes,
  };

  pagination.pages[pagination.pageIndex] = updatedObject;
}

function restorePaginationData(now: Date, sessionState: SessionState): void {
  const { pagination, clients } = sessionState;
  const { description, timerState, votes } = pagination.pages[pagination.pageIndex];
  sessionState.description = description;
  sessionState.timerState = { ...timerState };
  Object.values(sessionState.clients).forEach((c) => {
    const score = votes[c.name as string];
    if (typeof score !== "undefined") {
      c.score = score;
    } else {
      c.score = null;
    }
  });
  const participants = Object.values(clients).filter(({ name }) => name);
  sessionState.votesVisible = participants.length > 1 && participants.every(({ score }) => score);
}

export function createNewSession(now: Date, sessionName: string): SessionState {
  const sessionState: SessionState = {
    sessionName,
    description: "",
    ttlTimer: null,
    finished: false,
    settings: { ...defaultSettings },
    pagination: {
      pages: [{} as Page],
      pageIndex: 0,
    },
    timerState: {
      startTime: now,
      pausedTime: null,
      pausedTotal: 0,
    },
    votesVisible: false,
    host: null,
    epoch: 0,
    clients: {},
  };
  savePaginationData(now, sessionState);
  return sessionState;
}

export function initializeSession(now: Date, sessionName: string): SessionState {
  let sessionState = state[sessionName];
  if (!sessionState) {
    console.log(`[${sessionName}] Creating new session.`);
    sessionState = state[sessionName] = createNewSession(now, sessionName);
    ensureSessionTimeout(sessionState);
  }
  return sessionState;
}

export function initializeClient(
  now: Date,
  sessionState: SessionState,
  socket: ServerSocket,
  clientId: string,
  useHeartbeat: boolean
): ClientState {
  let clientState = sessionState.clients[clientId];
  if (clientState) {
    console.log(
      `[${sessionState.sessionName}] Client ${clientId} reconnected using a different socket.`
    );
    const previousSocket = clientState.socket;
    // E.g. if the client re-connects from WS connection to a long-poll connection
    clientState.useHeartbeat = useHeartbeat;
    clientState.socket = socket;
    previousSocket.terminate();
  } else {
    console.log(`[${sessionState.sessionName}] New client ${clientId} connected.`);
    clientState = {
      useHeartbeat,
      session: sessionState,
      clientId,
      socket,
      privatePreview: null,
      score: null,
      name: null,
      lastHeartbeat: null,
    };
    sessionState.clients[clientId] = clientState;
  }

  if (sessionState.host === null) {
    sessionState.host = clientId;
  }

  ensureSessionTimeout(sessionState);

  setHeartbeat(clientState);
  return clientState;
}

function ensureSessionTimeout(sessionState: SessionState): void {
  clearTimeout(sessionState.ttlTimer ?? undefined);
  if (!Object.keys(sessionState.clients).length) {
    if (sessionState.finished) {
      sessionState.ttlTimer = setTimeout(cleanupSession, finishedSessionTtl, sessionState);
    } else {
      sessionState.ttlTimer = setTimeout(cleanupSession, sessionTtl, sessionState);
    }
  } else {
    sessionState.ttlTimer = null;
  }
}

function clearHeartbeat(clientState: ClientState): void {
  clearTimeout(clientState.lastHeartbeat ?? undefined);
  clientState.lastHeartbeat = null;
}

function setHeartbeat(clientState: ClientState): void {
  if (clientState.useHeartbeat) {
    clearHeartbeat(clientState);
    clientState.lastHeartbeat = setTimeout(() => {
      clientState.socket.close();
    }, heartbeatTimeout);
  }
}

function startTimer(now: Date, timerState: TimerState): void {
  if (timerState.pausedTime) {
    const pausedDuration = Number(now) - Number(timerState.pausedTime);
    timerState.pausedTime = null;
    timerState.pausedTotal += pausedDuration;
  }
}

function pauseTimer(now: Date, timerState: TimerState): void {
  if (!timerState.pausedTime) {
    timerState.pausedTime = now;
  }
}

function resetTimer(now: Date, timerState: TimerState): void {
  timerState.startTime = now;
  timerState.pausedTime = timerState.pausedTime ? now : null;
  timerState.pausedTotal = 0;
}

function finishSession(now: Date, sessionState: SessionState): void {
  pauseTimer(now, sessionState.timerState);
  savePaginationData(now, sessionState);
  sessionState.epoch += 1;
  sessionState.finished = true;
  console.log(`[${sessionState.sessionName}] Session finished.`);
  Object.entries(sessionState.clients).forEach((client) => {
    const [, clientState] = client;
    sendMessage(now, clientState, {
      action: "finished",
    });
    clientState.socket.close();
  });
  ensureSessionTimeout(sessionState);
}

export function reactivateSession(sessionState: SessionState): void {
  sessionState.finished = false;
  ensureSessionTimeout(sessionState);
}

function cleanupSession(sessionState: SessionState): void {
  const now = new Date();
  if (sessionState.host === null) {
    console.log(`[${sessionState.sessionName}] Deleting orphaned session.`);
    delete state[sessionState.sessionName];
  } else if (sessionState.finished) {
    console.log(`[${sessionState.sessionName}] Deleting session.`);
    delete state[sessionState.sessionName];
  } else {
    finishSession(now, sessionState);
  }
}

export function processMessage(now: Date, clientState: ClientState, receivedAction: unknown): void {
  setHeartbeat(clientState);
  const sessionState = clientState.session;
  const currentPage = sessionState.pagination.pages[sessionState.pagination.pageIndex];

  const { error, value } = actionSchema.validate(receivedAction);
  if (error) throw error;
  const action = value as Action;

  if (sessionState.finished) {
    // Finished sessions are inert
    return;
  }

  switch (action.action) {
    // Imperative actions that do not mutate the server state
    // (or mutate it in a special way)
    case "ping":
      sendMessage(now, clientState, { action: "pong" });
      return;
    case "nudge": {
      const recipient = sessionState.clients[action.clientId];
      if (recipient) {
        sendMessage(now, recipient, { action: "nudge" });
      }
      return;
    }
    case "finishSession":
      finishSession(now, sessionState);
      return;
    // Everything else
    case "setDescription":
      if (action.pageIndex !== sessionState.pagination.pageIndex) {
        if (action.pageIndex < sessionState.pagination.pages.length) {
          sessionState.pagination.pages[action.pageIndex].description = action.description;
        }
      } else {
        sessionState.description = action.description;
      }
      break;
    case "join":
      if (
        Object.values(sessionState.clients).filter(({ name }) => name == action.name).length > 0
      ) {
        throw new Error("There is already a participant with this name");
      }
      clientState.name = action.name;
      clientState.score = currentPage.votes[clientState.name] || null;
      break;
    case "leave":
      clientState.name = null;
      clientState.score = null;
      break;
    case "vote": {
      const hasNotVotedYet = !clientState.score;
      if (action.score === null || sessionState.settings.scoreSet.includes(action.score)) {
        clientState.score = action.score;
        // Show votes after all participants have voted, but only if the board is not already
        // full so we can hide the scores and let people re-vote without clearing everything.
        const participants = Object.values(sessionState.clients).filter(({ name }) => name);
        if (hasNotVotedYet && participants.length > 1 && participants.every(({ score }) => score)) {
          sessionState.votesVisible = true;
        }
      }
      break;
    }
    case "setVotesVisible":
      sessionState.votesVisible = action.votesVisible;
      break;
    case "setSettings":
      sessionState.settings = action.settings;
      resetBoard(now, sessionState, true);
      break;
    case "setHost":
      sessionState.host = action.clientId;
      break;
    case "kick": {
      const target = sessionState.clients[action.clientId];
      if (target) {
        delete currentPage.votes[target.name as string];
        target.name = null;
        target.score = null;
        sendMessage(now, target, { action: "kicked" });
      }
      break;
    }
    case "kickDisconnected": {
      delete currentPage.votes[action.name];
      break;
    }
    case "reconnect":
      if (
        Object.values(sessionState.clients).filter(({ name }) => name == action.name).length == 0
      ) {
        clientState.name = action.name;
        // Only try to restore the score on reconnection if we are still on the same
        // thing we are scoring (implied by the fact that the board has not been reset).
        // Received epoch can be larger than the local one in case the last connected
        // client disconnected and we deleted the session. Otherwise we restore from
        // stored scores.
        if (
          action.epoch == sessionState.epoch &&
          (action.score === null || sessionState.settings.scoreSet.includes(action.score))
        ) {
          clientState.score = action.score;
        } else {
          clientState.score = currentPage.votes[clientState.name as string] || null;
        }
      }
      break;
    case "resetBoard":
      resetBoard(now, sessionState);
      break;
    case "startTimer":
      startTimer(now, sessionState.timerState);
      break;
    case "pauseTimer":
      pauseTimer(now, sessionState.timerState);
      break;
    case "resetTimer":
      resetTimer(now, sessionState.timerState);
      break;
    case "importSession":
      sessionState.pagination.pageIndex = 0;
      sessionState.settings = action.sessionData.settings;
      sessionState.pagination.pages = action.sessionData.pages.map(({ description }) => ({
        description,
        timerState: {
          startTime: now,
          pausedTime: now,
          pausedTotal: 0,
        },
        votes: {},
      }));
      restorePaginationData(now, sessionState);
      resetBoard(now, sessionState);

      Object.values(sessionState.clients).forEach((c) => {
        c.privatePreview = null;
      });
      break;
    case "newPage":
      if (!action.navigate) {
        sessionState.pagination.pages.push({
          description: action.description || "",
          timerState: {
            startTime: now,
            pausedTime: now,
            pausedTotal: 0,
          },
          votes: {},
        });
        clientState.privatePreview = sessionState.pagination.pages.length - 1;
      } else {
        savePaginationData(now, sessionState);
        sessionState.description = action.description || "";
        sessionState.pagination.pages.push({} as Page);
        sessionState.pagination.pageIndex = sessionState.pagination.pages.length - 1;
        sessionState.epoch += 1;

        resetBoard(now, sessionState, true);
      }
      break;
    case "deletePage":
      if (
        sessionState.pagination.pages.length >= 1 &&
        action.pageIndex < sessionState.pagination.pages.length
      ) {
        sessionState.pagination.pages.splice(action.pageIndex, 1);
        if (action.pageIndex !== 0 && sessionState.pagination.pageIndex >= action.pageIndex) {
          sessionState.pagination.pageIndex -= 1;
        }
        sessionState.epoch += 1;
        restorePaginationData(now, sessionState);

        Object.values(sessionState.clients).forEach((c) => {
          if (c.privatePreview !== null) {
            if (
              c.privatePreview === action.pageIndex ||
              c.privatePreview === sessionState.pagination.pageIndex
            ) {
              c.privatePreview = null;
            } else if (c.privatePreview > action.pageIndex) {
              c.privatePreview -= 1;
            }
          }
        });
      }
      break;
    case "navigate":
      if (action.pageIndex < sessionState.pagination.pages.length) {
        savePaginationData(now, sessionState);
        sessionState.pagination.pageIndex = action.pageIndex;
        sessionState.epoch += 1;
        restorePaginationData(now, sessionState);

        clientState.privatePreview = null;
        Object.values(sessionState.clients).forEach((c) => {
          if (c.privatePreview === action.pageIndex) {
            c.privatePreview = null;
          }
        });
      }
      break;
    case "privateNavigate":
      if (action.pageIndex < sessionState.pagination.pages.length) {
        if (action.pageIndex === sessionState.pagination.pageIndex) {
          clientState.privatePreview = null;
        } else {
          clientState.privatePreview = action.pageIndex;
        }
      }
      break;
  }
  savePaginationData(now, sessionState);
  broadcastState(now, sessionState);
}

export function cleanupClient(now: Date, clientState: ClientState): void {
  const sessionState = clientState.session;
  console.log(`[${sessionState.sessionName}] Client ${clientState.clientId} disconnected.`);

  clearHeartbeat(clientState);
  delete sessionState.clients[clientState.clientId];

  ensureSessionTimeout(sessionState);
  broadcastState(now, sessionState);
}
