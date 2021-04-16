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
import React from "react";
import PropTypes from "prop-types";
import { VotePanel } from "./VotePanel";
import { PaginationPanel } from "./PaginationPanel";
import { MainBoard } from "./board/MainBoard";
import { Description } from "./Description";
import { SettingsDialog } from "./settings/SettingsDialog";
import { ParticipantPanel } from "./ParticipantPanel";
import { usePermissions } from "./permissions";
import { useSnackbar } from "notistack";

export function Session({ remoteState, dispatch, sessionName }) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [previousPermissions, setPreviousPermissions] = React.useState(null);

  const {
    votesVisible,
    me,
    settings,
    host,
    clients,
    description,
    disconnectedClients,
    pagination,
  } = remoteState;
  const permissions = usePermissions(remoteState);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (previousPermissions) {
      if (!previousPermissions.isHost && permissions.isHost) {
        enqueueSnackbar("You are the new session host!", { variant: "info" });
      } else if (!previousPermissions.isActingHost && permissions.isActingHost) {
        enqueueSnackbar("You are the new acting host as the session host has disconnected.", {
          variant: "info",
        });
      }
    }
    setPreviousPermissions(permissions);
  }, [remoteState]);

  return (
    <>
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        sessionName={sessionName}
        onCancel={() => setSettingsOpen(false)}
        onSave={(newSettings) => {
          dispatch?.({ action: "setSettings", settings: newSettings });
          setSettingsOpen(false);
        }}
        onImport={(sessionData) => {
          dispatch?.({ action: "importSession", sessionData });
          setSettingsOpen(false);
        }}
      />
      <PaginationPanel
        pagination={pagination}
        settingsEnabled={permissions.canEditSettings}
        paginationEnabled={permissions.canPaginate}
        onNewPage={() => dispatch?.({ action: "newPage" })}
        onDeletePage={() => dispatch?.({ action: "deletePage" })}
        onNavigate={(index) => dispatch?.({ action: "navigate", pageIndex: index })}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <Description
        editingEnabled={permissions.canEditDescription}
        onChange={(value) => dispatch?.({ action: "setDescription", description: value })}
        description={description}
      />
      <VotePanel
        controlEnabled={permissions.canControlVotes}
        scoreSet={settings.scoreSet}
        votesVisible={votesVisible}
        votingEnabled={permissions.canVote}
        selectedScore={me.score}
        onSetVisibility={(visibility) =>
          dispatch?.({
            action: "setVotesVisible",
            votesVisible: visibility,
          })
        }
        onVote={(score) =>
          dispatch?.({
            action: "vote",
            score: score,
          })
        }
        onReset={() => dispatch?.({ action: "resetBoard" })}
      />
      <MainBoard
        clients={clients}
        scoreSet={settings.scoreSet}
        selfClientId={me.clientId}
        hostClientId={host}
        votesVisible={votesVisible}
        canNudge={permissions.canNudge}
        disconnectedClients={disconnectedClients}
        canSeeDisconnectedClients={permissions.canSeeDisconnectedClients}
        canPromoteToHost={permissions.canPromoteToHost}
        onNudge={(clientId) =>
          dispatch?.({
            action: "nudge",
            clientId,
          })
        }
        onPromoteToHost={(clientId) =>
          dispatch?.({
            action: "setHost",
            clientId,
          })
        }
        onKick={(clientId) =>
          dispatch?.({
            action: "kick",
            clientId,
          })
        }
        onKickDisconnected={(name) =>
          dispatch?.({
            action: "kickDisconnected",
            name,
          })
        }
      />
      <ParticipantPanel
        name={me.name}
        participantNames={clients.map(({ name }) => name)}
        onJoin={(name) =>
          dispatch?.({
            action: "join",
            name: name,
          })
        }
        onLeave={() => dispatch?.({ action: "leave" })}
      />
    </>
  );
}

Session.propTypes = {
  remoteState: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  sessionName: PropTypes.string.isRequired,
};
