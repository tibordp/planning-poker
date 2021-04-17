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
import Link from "@material-ui/core/Link";
import { scorePresets, defaultSettings } from "../../server/constants";
import { ScoreSetSelector } from "./ScoreSetSelector";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { DropzoneAreaBase } from "material-ui-dropzone";

import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  dropArea: {
    padding: theme.spacing(2),
  },
}));

function minimizePreferences(settings) {
  const result = {};
  Object.keys(defaultSettings).forEach((key) => {
    if (JSON.stringify(defaultSettings[key]) !== JSON.stringify(settings[key])) {
      result[key] = settings[key];
    }
  });
  return result;
}

export function SettingsDialog({ open, onSave, onCancel, onImport, settings, sessionName }) {
  const classes = useStyles();

  const [scoreSet, setScoreSet] = React.useState(scorePresets[0].scores);
  const [allowParticipantControl, setAllowParticipantControl] = React.useState(
    settings.allowParticipantControl
  );
  const [allowOpenVoting, setAllowOpenVoting] = React.useState(settings.allowOpenVoting);
  const [allowParticipantPagination, setAllowParticipantPagination] = React.useState(
    settings.allowParticipantPagination
  );
  const [allowParticipantAddDelete, setAllowParticipantAddDelete] = React.useState(
    settings.allowParticipantAddDelete
  );
  const [showTimer, setShowTimer] = React.useState(settings.showTimer);

  React.useEffect(() => {
    if (open) {
      setScoreSet(settings.scoreSet);
      setAllowParticipantControl(settings.allowParticipantControl);
      setAllowParticipantPagination(settings.allowParticipantPagination);
      setAllowParticipantAddDelete(settings.allowParticipantAddDelete);
      setAllowOpenVoting(settings.allowOpenVoting);
      setShowTimer(settings.showTimer);
    }
  }, [open]);

  const updatedSettings = {
    ...settings,
    scoreSet: scoreSet,
    allowParticipantControl: allowParticipantControl,
    allowParticipantPagination: allowParticipantPagination,
    allowParticipantAddDelete: allowParticipantAddDelete,
    allowOpenVoting: allowOpenVoting,
    showTimer: showTimer,
  };
  const minimizedSettings = minimizePreferences(updatedSettings);
  const bookmarklet = `/new?settings=${encodeURIComponent(JSON.stringify(minimizedSettings))}`;

  const exportPages = () => {
    window.open(`/api/sessions/${encodeURIComponent(sessionName)}/export`);
  };

  const handleUpload = (files) => {
    var reader = new FileReader();
    reader.onload = (event) => {
      onImport(JSON.parse(event.target.result));
    };
    reader.readAsText(files[0].file);
  };

  const formValid = scoreSet.length >= 2;

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
          label="Allow everyone to show/hide/clear votes"
        />
        <FormControlLabel
          control={
            <Switch
              checked={allowParticipantPagination}
              onChange={() => setAllowParticipantPagination(!allowParticipantPagination)}
            />
          }
          label="Allow everyone to switch pages for all participants"
        />
        <FormControlLabel
          control={
            <Switch
              checked={allowParticipantAddDelete}
              onChange={() => setAllowParticipantAddDelete(!allowParticipantAddDelete)}
            />
          }
          label="Allow everyone to create and delete pages"
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
        {formValid && (
          <p>
            Bookmarklet for creating new sessions with these settings:{" "}
            <Link href={bookmarklet} title="New Planning Poker session" target="_blank">
              New Planning Poker session
            </Link>
          </p>
        )}
      </DialogContent>

      <div className={classes.dropArea}>
        <DropzoneAreaBase
          dropzoneText="Import exported session"
          onAdd={handleUpload}
          showAlerts={false}
          filesLimit={1}
        />
      </div>
      <DialogActions>
        <Button autoFocus onClick={exportPages} color="primary">
          Export session
        </Button>
        <div style={{ flex: "1 0 0" }} />
        <Button autoFocus onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button
          disabled={!formValid}
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
  onImport: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  sessionName: PropTypes.string.isRequired,
};
