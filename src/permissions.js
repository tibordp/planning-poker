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
export function usePermissions(remoteState) {
  if (!remoteState) {
    return {};
  }

  const { me, clients, settings, host, votesVisible, privatePreview } = remoteState;

  // If the host has disconnected, we allow anyone to control the session until they
  // rejoin.
  const isHost = me.clientId === host;
  const isActingHost = isHost || !clients.find((client) => client.clientId === host);
  const canControlSession = settings.allowParticipantControl || isActingHost;
  const isPrivatelyPreviewing = privatePreview !== null;

  return {
    isHost,
    isActingHost,

    canEditDescription: canControlSession,
    canEditSettings: isActingHost,
    canVote:
      !isPrivatelyPreviewing && me.name !== null && (settings.allowOpenVoting || !votesVisible),
    canPaginate: isActingHost || settings.allowParticipantPagination,
    canAddDeletePages: isActingHost || settings.allowParticipantAddDelete,
    canControlVotes: !isPrivatelyPreviewing && canControlSession,
    canSeeDisconnectedClients: true,
    canNudge: isActingHost,
    canPromoteToHost: isActingHost,
    canControlTimer: !isPrivatelyPreviewing && canControlSession,
    canFinishSession: isActingHost,
  };
}
