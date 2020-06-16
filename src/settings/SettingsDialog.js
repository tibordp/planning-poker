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
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { scorePresets } from "../../server/scoreSets";
import { ScoreSetSelector } from "./ScoreSetSelector";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export function SettingsDialog({ open, onSave, onCancel, settings }) {
  const [scoreSet, setScoreSet] = React.useState(scorePresets[0].scores);
  const [allowParticipantControl, setAllowParticipantControl] = React.useState(
    scorePresets[0].scores
  );

  React.useEffect(() => {
    if (open) {
      setScoreSet(settings.scoreSet);
      setAllowParticipantControl(settings.allowParticipantControl);
    }
  }, [open]);

  function onSaveClicked() {
    const newSettings = {
      ...settings,
      scoreSet: scoreSet,
      allowParticipantControl: allowParticipantControl,
    };
    onSave(newSettings);
  }

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
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button disabled={scoreSet.length < 2} onClick={onSaveClicked} color="primary" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
