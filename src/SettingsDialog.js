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
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Zoom from "@material-ui/core/Zoom";
import ChipInput from "material-ui-chip-input";

export const useStyles = makeStyles(() => ({}));

function findScoreSet(scoreSet) {
  for (const { scores, type } of scorePresets) {
    // Checks if the score sets are equal, with the possible exception of last element (which can be 'Pass')
    if (scoreSet.length >= scores.length - 1 && scoreSet.every((val, i) => scores[i] === val)) {
      return [type, scoreSet.includes("Pass"), []];
    }
  }

  return ["custom", null];
}

function getScoreSet(scoreSetType, allowPass, customScores) {
  const preset = scorePresets.find(({ type }) => type === scoreSetType);

  if (scoreSetType === "custom") {
    return customScores;
  } else {
    return allowPass ? preset.scores : preset.scores.filter((score) => score !== "Pass");
  }
}

export function SettingsDialog({ open, onSave, onCancel, settings }) {
  const classes = useStyles();

  const [selectedScoreSet, setSelectedScoreSet] = React.useState(scorePresets[0].type);
  const [customScores, setCustomScores] = React.useState(scorePresets[0].scores);
  const [passAllowed, setPassAllowed] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      const [type, allowPass] = findScoreSet(settings.scoreSet);
      setSelectedScoreSet(type);
      setPassAllowed(allowPass);
      setCustomScores(settings.scoreSet);
    }
  }, [open, settings.scoreSet.type]);

  function onSaveClicked() {
    const newSettings = {
      ...settings,
      scoreSet: customScores,
    };

    onSave(newSettings);
  }

  const chipRenderer = ({ text, isFocused, handleClick, handleDelete, className }, key) => (
    <Chip
      key={key}
      className={className}
      variant="outlined"
      color="primary"
      style={{
        backgroundColor: isFocused ? "secondary" : undefined,
      }}
      size="medium"
      onClick={handleClick}
      onDelete={handleDelete}
      label={text}
    />
  );

  return (
    <Dialog maxWidth="xs" open={open} onClose={onCancel}>
      <DialogTitle>Session settings</DialogTitle>
      <DialogContent>
        <FormControl fullWidth className={classes.formControl}>
          <InputLabel id="score-set-select">Score set</InputLabel>
          <Select
            labelId="score-set-select"
            value={selectedScoreSet || "unknown"}
            onChange={(evt) => {
              setSelectedScoreSet(evt.target.value);
              setCustomScores(getScoreSet(evt.target.value, passAllowed, customScores));
            }}
          >
            {scorePresets.map(({ type, name }) => (
              <MenuItem key={type} value={type}>
                {name}
              </MenuItem>
            ))}
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>

        {selectedScoreSet === "custom" && (
          <ChipInput
            style={{ marginTop: 10, marginBottom: 20 }}
            chipRenderer={chipRenderer}
            fullWidth
            blurBehavior="add"
            alwaysShowPlaceholder
            helperText="Type new scores and press enter"
            defaultValue={customScores}
            onChange={(chips) => setCustomScores(chips)}
          >
            {" "}
          </ChipInput>
        )}
        {selectedScoreSet !== "custom" && (
          <>
            <FormControlLabel
              style={{ marginTop: 10 }}
              disabled={!selectedScoreSet}
              control={
                <Switch
                  checked={passAllowed}
                  onChange={() => {
                    setPassAllowed(!passAllowed);
                    setCustomScores(getScoreSet(selectedScoreSet, !passAllowed, customScores));
                  }}
                />
              }
              label="Allow participants to pass"
            />
            <Box>
              {customScores.map((score) => (
                <Zoom key={score} in timeout={300} mountOnEnter unmountOnExit>
                  <Chip
                    style={{ margin: 5 }}
                    variant="outlined"
                    size="medium"
                    label={score}
                    color="primary"
                  />
                </Zoom>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button disabled={!customScores.length} onClick={onSaveClicked} color="primary" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
