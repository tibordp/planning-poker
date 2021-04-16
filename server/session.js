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
const state = require("./state").state;
const {
  defaultSettings,
  heartbeatTimeout,
  sessionTtl,
  finishedSessionTtl,
  actionSchema,
} = require("./constants");
const { serializeSession } = require("./serialization");

function sendMessage(now, clientState, action) {
  const { socket } = clientState;
  socket.send(
    JSON.stringify({
      ...action,
      serverTime: now,
    })
  );
}

function broadcastState(now, sessionState) {
  Object.entries(sessionState.clients).forEach((client) => {
    const serializedState = serializeSession(sessionState, client);

    const [, clientState] = client;
    sendMessage(now, clientState, {
      action: "updateState",
      value: serializedState,
    });
  });
}

function resetBoard(now, sessionState, shouldResetTimer = false) {
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

function savePaginationData(now, sessionState) {
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

  const updatedObject = {
    description,
    timerState: {
      ...timerState,
      pausedTime: timerState.pausedTime || now,
    },
    votes: newVotes,
  };

  pagination.pages[pagination.pageIndex] = updatedObject;
}

function restorePaginationData(now, sessionState) {
  const { pagination, clients } = sessionState;
  const { description, timerState, votes } = pagination.pages[pagination.pageIndex];
  sessionState.description = description;
  sessionState.timerState = { ...timerState };
  Object.values(sessionState.clients).forEach((c) => {
    const score = votes[c.name];
    if (typeof score !== "undefined") {
      c.score = score;
    } else {
      c.score = null;
    }
  });
  const participants = Object.values(clients).filter(({ name }) => name);
  sessionState.votesVisible = participants.length > 1 && participants.every(({ score }) => score);
}

function createNewSession(now, sessionName, clientId) {
  const sessionState = {
    sessionName,
    description: "",
    ttlTimer: null,
    finished: false,
    settings: { ...defaultSettings },
    pagination: {
      pages: [{}],
      pageIndex: 0,
    },
    timerState: {
      startTime: now,
      pausedTime: null,
      pausedTotal: 0,
    },
    votesVisible: false,
    host: clientId,
    epoch: 0,
    clients: {},
  };
  savePaginationData(now, sessionState);
  return sessionState;
}

function initializeSession(now, sessionName, clientId) {
  let sessionState = state[sessionName];
  if (!sessionState) {
    console.log(`[${sessionName}] Creating new session.`);
    sessionState = state[sessionName] = createNewSession(now, sessionName, clientId);
  } else {
    clearTimeout(sessionState.ttlTimer);
    sessionState.ttlTimer = null;
  }
  return sessionState;
}

function initializeClient(now, sessionState, socket, clientId, useHeartbeat) {
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
      score: null,
      name: null,
      lastHeartbeat: null,
    };
    sessionState.clients[clientId] = clientState;
  }

  setHeartbeat(clientState);
  return clientState;
}

function clearHeartbeat(clientState) {
  clearTimeout(clientState.lastHeartbeat);
  clientState.lastHeartbeat = null;
}

function setHeartbeat(clientState) {
  if (clientState.useHeartbeat) {
    clearHeartbeat(clientState);
    clientState.lastHeartbeat = setTimeout(() => {
      clientState.socket.close();
    }, heartbeatTimeout);
  }
}

function startTimer(now, timerState) {
  if (timerState.pausedTime) {
    const pausedDuration = now - timerState.pausedTime;
    timerState.pausedTime = null;
    timerState.pausedTotal += pausedDuration;
  }
}

function pauseTimer(now, timerState) {
  if (!timerState.pausedTime) {
    timerState.pausedTime = now;
  }
}

function resetTimer(now, timerState) {
  timerState.startTime = now;
  timerState.pausedTime = timerState.pausedTime ? now : null;
  timerState.pausedTotal = 0;
}

function finishSession(now, sessionState) {
  sessionState.finished = true;
  Object.entries(sessionState.clients).forEach((client) => {
    const [, clientState] = client;
    sendMessage(now, clientState, {
      action: "finished",
    });
    clientState.socket.close();
  });
}

function reactivateSession(sessionState) {
  sessionState.finished = false;
}

function cleanupSession(sessionState) {
  console.log(`[${sessionState.sessionName}] Deleting session.`);
  delete state[sessionState.sessionName];
}

function processMessage(now, clientState, receivedAction) {
  setHeartbeat(clientState);
  const sessionState = clientState.session;
  const currentPage = sessionState.pagination.pages[sessionState.pagination.pageIndex];

  const { error, value: action } = actionSchema.validate(receivedAction);
  if (error) throw error;

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
      pauseTimer(now, sessionState.timerState);
      savePaginationData(now, sessionState);
      sessionState.epoch += 1;
      finishSession(now, sessionState);
      return;
    // Everything else
    case "setDescription":
      sessionState.description = action.description;
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
        delete currentPage.votes[target.name];
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
          clientState.score = currentPage.votes[clientState.name] || null;
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
      break;
    case "newPage":
      savePaginationData(now, sessionState);
      sessionState.description = action.description || "";
      sessionState.pagination.pages.push({});
      sessionState.pagination.pageIndex = sessionState.pagination.pages.length - 1;
      sessionState.epoch += 1;

      resetBoard(now, sessionState, true);
      break;
    case "deletePage":
      if (sessionState.pagination.pages.length > 1) {
        sessionState.pagination.pages.splice(sessionState.pagination.pageIndex, 1);
        if (sessionState.pagination.pageIndex == sessionState.pagination.pages.length) {
          sessionState.pagination.pageIndex -= 1;
        }
        sessionState.epoch += 1;
        restorePaginationData(now, sessionState);
      }
      break;
    case "navigate":
      if (action.pageIndex < sessionState.pagination.pages.length) {
        savePaginationData(now, sessionState);
        sessionState.pagination.pageIndex = action.pageIndex;
        sessionState.epoch += 1;
        restorePaginationData(now, sessionState);
      }
      break;
  }
  savePaginationData(now, sessionState);
  broadcastState(now, sessionState);
}

function cleanupClient(now, clientState) {
  const sessionState = clientState.session;
  console.log(`[${sessionState.sessionName}] Client ${clientState.clientId} disconnected.`);

  clearHeartbeat(clientState);
  delete sessionState.clients[clientState.clientId];

  // Delete the session after last client disconnects, but allow for a grace period
  // in case e.g. the host had some connectivity issues.
  if (!Object.keys(sessionState.clients).length) {
    console.log(`[${sessionState.sessionName}] Scheduling session for deletion.`);
    if (sessionState.finished) {
      sessionState.ttlTimer = setTimeout(cleanupSession, finishedSessionTtl, sessionState);
    } else {
      sessionState.ttlTimer = setTimeout(cleanupSession, sessionTtl, sessionState);
    }
  } else {
    broadcastState(now, sessionState);
  }
}

exports.sendMessage = sendMessage;
exports.initializeSession = initializeSession;
exports.processMessage = processMessage;
exports.initializeClient = initializeClient;
exports.cleanupClient = cleanupClient;
exports.broadcastState = broadcastState;
exports.createNewSession = createNewSession;
exports.reactivateSession = reactivateSession;
