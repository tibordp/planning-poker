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
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { scorePresets } from "../../server/constants";
import { ScoreSetSelector } from "./ScoreSetSelector";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Link from "@material-ui/core/Link";

export function SettingsDialog({ open, onSave, onCancel, settings }) {
  const [scoreSet, setScoreSet] = React.useState(scorePresets[0].scores);
  const [allowParticipantControl, setAllowParticipantControl] = React.useState(
    settings.allowParticipantControl
  );
  const [allowOpenVoting, setAllowOpenVoting] = React.useState(settings.allowOpenVoting);
  const [showTimer, setShowTimer] = React.useState(settings.showTimer);
  const [resetTimerOnNewEpoch, setResetTimerOnNewEpoch] = React.useState(
    settings.resetTimerOnNewEpoch
  );

  React.useEffect(() => {
    if (open) {
      setScoreSet(settings.scoreSet);
      setAllowParticipantControl(settings.allowParticipantControl);
      setAllowOpenVoting(settings.allowOpenVoting);
      setShowTimer(settings.showTimer);
      setResetTimerOnNewEpoch(settings.resetTimerOnNewEpoch);
    }
  }, [open]);

  const updatedSettings = {
    ...settings,
    scoreSet: scoreSet,
    allowParticipantControl: allowParticipantControl,
    allowOpenVoting: allowOpenVoting,
    showTimer: showTimer,
    resetTimerOnNewEpoch: resetTimerOnNewEpoch,
  };

  return (
    <Dialog maxWidth="xs" open={open} onClose={onCancel}>
      <DialogTitle>Session settings</DialogTitle>
      <DialogContent>
        <ScoreSetSelector scoreSet={scoreSet} onSetScoreSet={setScoreSet} />
        <FormControlLabel
          style={{ marginTop: 10 }}
          control={
            <Switch
              checked={allowParticipantControl}
              onChange={() => setAllowParticipantControl(!allowParticipantControl)}
            />
          }
          label="Allow everyone to control session"
        />
        <FormControlLabel
          control={
            <Switch
              checked={allowOpenVoting}
              onChange={() => setAllowOpenVoting(!allowOpenVoting)}
            />
          }
          label="Allow voting while scores are visible"
        />
        <FormControlLabel
          control={<Switch checked={showTimer} onChange={() => setShowTimer(!showTimer)} />}
          label="Show timer"
        />
        <FormControlLabel
          control={
            <Switch
              disabled={!showTimer}
              checked={resetTimerOnNewEpoch}
              onChange={() => setResetTimerOnNewEpoch(!resetTimerOnNewEpoch)}
            />
          }
          label="Reset timer when the votes are cleared"
        />
        <p>
          Bookmarklet for creating new sessions with the selected settings:{" "}
          <Link
            target="_blank"
            title="New Planning Poker session"
            href={`/new-session?settings=${encodeURIComponent(JSON.stringify(updatedSettings))}`}
          >
            New Planning Poker session
          </Link>
        </p>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button
          disabled={scoreSet.length < 2}
          onClick={() => onSave(updatedSettings)}
          color="primary"
          autoFocus
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};
