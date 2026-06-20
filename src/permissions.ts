import type { Permissions, RemoteState } from "./types";

const NO_PERMISSIONS: Permissions = {
  isHost: false,
  isActingHost: false,
  canEditDescription: false,
  canEditSettings: false,
  canVote: false,
  canPaginate: false,
  canAddDeletePages: false,
  canControlVotes: false,
  canSeeDisconnectedClients: false,
  canNudge: false,
  canPromoteToHost: false,
  canControlTimer: false,
  canFinishSession: false,
};

export function usePermissions(remoteState: RemoteState | null | undefined): Permissions {
  if (!remoteState) {
    return NO_PERMISSIONS;
  }

  const { me, clients, settings, host, votesVisible, privatePreview } = remoteState;

  // If the host has disconnected, we allow anyone to control the session until they
  // rejoin.
  const isHost = me?.clientId === host;
  const isActingHost = isHost || !clients.find((client) => client.clientId === host);
  const canControlSession = settings.allowParticipantControl || isActingHost;
  const isPrivatelyPreviewing = privatePreview !== null;

  return {
    isHost,
    isActingHost,

    canEditDescription: canControlSession,
    canEditSettings: isActingHost,
    canVote:
      !isPrivatelyPreviewing &&
      (me?.name ?? null) !== null &&
      (settings.allowOpenVoting || !votesVisible),
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
