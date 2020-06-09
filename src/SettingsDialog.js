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
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Chip from "@material-ui/core/Chip";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import { scorePresets } from "../server/scoreSets";

export const useStyles = makeStyles(() => ({}));

export function SettingsDialog({ open, onSave, onCancel, settings }) {
  const classes = useStyles();
  const [selectedScoreSet, setSelectedScoreSet] = React.useState(settings.scoreSet.type);
  React.useEffect(() => {
    if (open) {
      setSelectedScoreSet(settings.scoreSet.type);
    }
  }, [open, settings.scoreSet.type]);

  function onSaveClicked() {
    const newSettings = {
      ...settings,
      scoreSet: scorePresets.find(({ type }) => type === selectedScoreSet),
    };

    onSave(newSettings);
  }

  return (
    <Dialog maxWidth="xs" fullWidth open={open} onClose={onCancel}>
      <DialogTitle>Session settings</DialogTitle>
      <DialogContent>
        <FormControl fullWidth className={classes.formControl}>
          <InputLabel id="score-set-select">Score set</InputLabel>
          <Select
            labelId="score-set-select"
            value={selectedScoreSet}
            onChange={(evt) => setSelectedScoreSet(evt.target.value)}
          >
            {scorePresets.map(({ type, name }) => (
              <MenuItem key={type} value={type}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box padding={1}>
          {scorePresets
            .find(({ type }) => type === selectedScoreSet)
            .scores.map((score) => (
              <Chip
                style={{ margin: 5 }}
                variant="outlined"
                size="medium"
                label={score}
                color="primary"
              />
            ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button
          disabled={selectedScoreSet === settings.scoreSet.type}
          onClick={onSaveClicked}
          color="primary"
          autoFocus
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
