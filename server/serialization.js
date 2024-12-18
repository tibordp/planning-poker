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
function serializeClient([clientId, data]) {
  const { score, name } = data;
  return {
    clientId,
    score,
    name,
  };
}

function serializeClients(clients) {
  return Object.entries(clients).map(serializeClient);
}

function serializeDisconnectedVotes(sessionState) {
  const { clients, pagination } = sessionState;
  const votes = pagination.pages[pagination.pageIndex].votes;
  const connectedNames = new Set(Object.values(clients).map(({ name }) => name));
  return Object.fromEntries(
    Object.entries(votes).filter(([name, score]) => !connectedNames.has(name) && score)
  );
}

function generatePrivatePreview(sessionState, me) {
  const { epoch, clients, pagination, settings, host, finished } = sessionState;
  const { description, timerState, votes } = pagination.pages[me[1].privatePreview];
  const clientsData = serializeClients(clients);

  Object.values(clientsData).forEach((c) => {
    const score = votes[c.name];
    if (typeof score !== "undefined") {
      c.score = score;
    } else {
      c.score = null;
    }
  });
  const connectedNames = new Set(Object.values(clientsData).map(({ name }) => name));
  const disconnectedClients = Object.fromEntries(
    Object.entries(votes).filter(([name, score]) => !connectedNames.has(name) && score)
  );
  const serializedMe = Object.values(clientsData).filter(
    ({ clientId }) => clientId === me[1].clientId
  )[0];

  return {
    epoch,
    host,
    settings,
    finished,
    pagination: {
      pageIndex: pagination.pageIndex,
      pageCount: pagination.pages.length,
    },
    description,
    timerState: { ...timerState },
    votesVisible: true,
    clients: clientsData,
    disconnectedClients,
    me: serializedMe,
    privatePreview: me[1].privatePreview,
  };
}

function serializeSession(sessionState, me) {
  if (me && me[1].privatePreview !== null) {
    return generatePrivatePreview(sessionState, me);
  }

  const {
    epoch,
    description,
    clients,
    votesVisible,
    pagination,
    settings,
    host,
    timerState,
    finished,
  } = sessionState;

  const clientsData = serializeClients(clients);
  const disconnectedClients = serializeDisconnectedVotes(sessionState);

  return {
    epoch,
    host,
    settings,
    finished,
    pagination: {
      pageIndex: pagination.pageIndex,
      pageCount: pagination.pages.length,
    },
    description,
    timerState,
    votesVisible,
    clients: clientsData,
    disconnectedClients,
    ...(me
      ? {
          me: serializeClient(me),
          privatePreview: null,
        }
      : {}),
  };
}

function exportSession(sessionState) {
  const { pagination, settings, finished } = sessionState;

  return {
    settings,
    finished,
    pages: pagination.pages.map(({ description, votes, timerState }) => ({
      description,
      votes,
      duration: timerState.pausedTime - timerState.startTime - timerState.pausedTotal,
    })),
  };
}

exports.serializeClient = serializeClient;
exports.serializeClients = serializeClients;
exports.serializeSession = serializeSession;
exports.exportSession = exportSession;
