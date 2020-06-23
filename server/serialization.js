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
  return Object.entries(clients)
    .map(serializeClient)
    .sort((a, b) => {
      // Sort by name, then by clientId. If the client is not participant, it doesn't matter,
      // as they are invisible, so we put them all at the end.
      if (!a.name || !b.name) {
        return a.name ? -1 : b.name ? 1 : 0;
      } else {
        return a.name.localeCompare(b.name) || a.clientId.localeCompare(b.clientId);
      }
    });
}

function serializeSession(sessionState, me) {
  const {
    epoch,
    description,
    clients,
    votesVisible,
    startedOn,
    settings,
    host,
    timerState,
  } = sessionState;

  const clientsData = serializeClients(clients);
  return {
    epoch,
    host,
    settings,
    startedOn,
    description,
    timerState,
    votesVisible: votesVisible,
    clients: clientsData,
    ...(me ? { me: serializeClient(me) } : {}),
  };
}

exports.serializeClient = serializeClient;
exports.serializeClients = serializeClients;
exports.serializeSession = serializeSession;
