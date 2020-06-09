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
import { VotePanel } from "./VotePanel";
import { ScoreTable } from "./ScoreTable";
import { DescriptionEdit } from "./DescriptionEdit";
import { SettingsDialog } from "./SettingsDialog";

export function MainBoard({ remoteState, dispatch }) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const { votesVisible, clients, me, settings } = remoteState;
  const votesCast = new Set(clients.filter(({ name }) => name).map(({ score }) => score));
  const haveConsensus = votesCast.size === 1 && !votesCast.has(null) && votesVisible;

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
      <DescriptionEdit
        onChange={(value) => dispatch({ action: "setDescription", value: value })}
        description={remoteState.description}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <VotePanel
        controlEnabled
        availableScores={settings.scoreSet.scores}
        votesVisible={votesVisible}
        votingEnabled={me.name !== null}
        selectedScore={me.score}
        onSetVisibility={(visibility) =>
          dispatch({
            action: "setVisibility",
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
      <ScoreTable
        clients={remoteState.clients}
        selfIdentifier={me.identifier}
        haveConsensus={haveConsensus}
        votesVisible={votesVisible}
      />
    </>
  );
}
