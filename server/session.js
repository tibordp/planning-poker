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
const { defaultSettings, heartbeatTimeout, sessionTtl } = require("./constants");
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

function resetBoard(now, sessionState) {
  sessionState.votesVisible = false;
  sessionState.epoch += 1;
  sessionState.startedOn = now;
  if (sessionState.settings.resetTimerOnNewEpoch) {
    resetTimer(now, sessionState.timerState);
  }
  Object.values(sessionState.clients).forEach((c) => {
    c.score = null;
  });
}

function initializeSession(now, sessionName, clientId) {
  let sessionState = state[sessionName];
  if (!sessionState) {
    console.log(`[${sessionName}] Creating new session.`);
    sessionState = state[sessionName] = {
      sessionName,
      description: "",
      ttlTimer: null,
      settings: { ...defaultSettings },
      timerState: {
        startTime: now,
        pausedTime: null,
        pausedTotal: 0,
      },
      votesVisible: false,
      startedOn: now,
      host: clientId,
      epoch: 0,
      clients: {},
    };
  } else {
    clearTimeout(sessionState.ttlTimer);
    sessionState.ttlTimer = null;
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
  }, heartbeatTimeout);
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

function cleanupSession(sessionState) {
  console.log(`[${sessionState.sessionName}] Deleting session.`);
  delete state[sessionState.sessionName];
}

function processMessage(now, clientState, action) {
  const sessionState = clientState.session;

  setHeartbeat(clientState);
  switch (action.action) {
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
    case "vote": {
      const hasNotVotedYet = !clientState.score;
      clientState.score = action.score;
      // Show votes after all participants have voted, but only if the board is not already
      // full so we can hide the scores and let people re-vote without clearing everything.
      const participants = Object.values(sessionState.clients).filter(({ name }) => name);
      if (hasNotVotedYet && participants.length > 1 && participants.every(({ score }) => score)) {
        sessionState.votesVisible = true;
      }
      break;
    }
    case "setVisibility":
      sessionState.votesVisible = action.votesVisible;
      break;
    case "setSettings":
      sessionState.settings = action.settings;
      resetBoard(now, sessionState);
      break;
    case "setHost":
      sessionState.host = action.clientId;
      break;
    case "kick": {
      const target = sessionState.clients[action.clientId];
      if (target) {
        target.name = null;
        target.score = null;
      }
      break;
    }
    case "reconnect":
      clientState.name = action.name;
      // Only try to restore the score on reconnection if we are still on the same
      // thing we are scoring (implied by the fact that the board has not been reset).
      // Received epoch can be larger than the local one in case the last connected
      // client disconnected and we deleted the session.
      if (action.epoch >= sessionState.epoch) {
        clientState.score = action.score;
        sessionState.description = action.description;
        sessionState.settings = action.settings;
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
  }
  broadcastState(now, sessionState);
}

function initializeClient(sessionState, socket, clientId) {
  let clientState = sessionState.clients[clientId];
  if (clientState) {
    console.log(
      `[${sessionState.sessionName}] Client ${clientId} reconnected using a different socket.`
    );
    const previousSocket = clientState.socket;
    clientState.socket = socket;
    previousSocket.terminate();
  } else {
    console.log(`[${sessionState.sessionName}] New client ${clientId} connected.`);
    clientState = {
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

function cleanupClient(now, clientState) {
  const sessionState = clientState.session;
  console.log(`[${sessionState.sessionName}] Client ${clientState.clientId} disconnected.`);

  clearHeartbeat(clientState);
  delete sessionState.clients[clientState.clientId];

  // Delete the session after last client disconnects, but allow for a grace period
  // in case e.g. the host had some connectivity issues. The reconnection logic will
  // restore the session state even if we already reaped the session, but certain things,
  // like the timer state are not preserved.
  if (!Object.keys(sessionState.clients).length) {
    console.log(`[${sessionState.sessionName}] Scheduling session for deletion.`);
    sessionState.ttlTimer = setTimeout(cleanupSession, sessionTtl, sessionState);
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
