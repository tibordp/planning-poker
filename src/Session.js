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
import { MainBoard } from "./board/MainBoard";
import { Description } from "./Description";
import { SettingsDialog } from "./settings/SettingsDialog";
import { ParticipantPanel } from "./ParticipantPanel";
import { calculatePermissions } from "./permissions";

export function Session({ remoteState, dispatch }) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const { votesVisible, me, settings, host, clients, description } = remoteState;
  const permissions = calculatePermissions(remoteState);

  return (
    <>
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onCancel={() => setSettingsOpen(false)}
        onSave={(newSettings) => {
          dispatch({ action: "setSettings", settings: newSettings });
          setSettingsOpen(false);
        }}
      />
      <Description
        editingEnabled={permissions.canEditDescription}
        settingsEnabled={permissions.canEditSettings}
        onChange={(value) => dispatch({ action: "setDescription", description: value })}
        description={description}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <VotePanel
        controlEnabled={permissions.canControlVotes}
        scoreSet={settings.scoreSet}
        votesVisible={votesVisible}
        votingEnabled={permissions.canVote}
        selectedScore={me.score}
        onSetVisibility={(visibility) =>
          dispatch({
            action: "setVotesVisible",
            votesVisible: visibility,
          })
        }
        onVote={(score) =>
          dispatch({
            action: "vote",
            score: score,
          })
        }
        onReset={() => dispatch({ action: "resetBoard" })}
      />
      <MainBoard
        clients={clients}
        scoreSet={settings.scoreSet}
        selfClientId={me.clientId}
        hostClientId={host}
        votesVisible={votesVisible}
        canNudge={permissions.canNudge}
        canPromoteToHost={permissions.canPromoteToHost}
        onNudge={(clientId) =>
          dispatch({
            action: "nudge",
            clientId: clientId,
          })
        }
        onPromoteToHost={(clientId) =>
          dispatch({
            action: "setHost",
            clientId: clientId,
          })
        }
        onKick={(clientId) =>
          dispatch({
            action: "kick",
            clientId: clientId,
          })
        }
      />
      <ParticipantPanel
        name={me.name}
        onJoin={(name) =>
          dispatch({
            action: "join",
            name: name,
          })
        }
        onLeave={() => dispatch({ action: "leave" })}
      />
    </>
  );
}

Session.propTypes = {
  remoteState: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
