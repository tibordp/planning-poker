export function calculatePermissions(remoteState) {
  const { me, clients, settings, host, votesVisible } = remoteState;

  // If the host has disconnected, we allow anyone to control the session until they
  // rejoin.
  const isActingHost = me.clientId === host || !clients.find((client) => client.clientId === host);
  const canControlSession = settings.allowParticipantControl || isActingHost;

  return {
    canEditDescription: canControlSession,
    canEditSettings: isActingHost,
    canVote: me.name !== null && (settings.allowOpenVoting || !votesVisible),
    canControlVotes: canControlSession,
    canNudge: isActingHost,
    canPromoteToHost: isActingHost,
    canControlTimer: canControlSession,
  };
}
