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
import Box from "@material-ui/core/Box";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Chip from "@material-ui/core/Chip";
import Select from "@material-ui/core/Select";
import { scorePresets } from "../../server/scoreSets";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Zoom from "@material-ui/core/Zoom";
import ChipInput from "material-ui-chip-input";

export function findScorePreset(scoreSet) {
  for (const { scores, type } of scorePresets) {
    // Checks if the score sets are equal, with the possible exception of last element (which can be 'Pass')
    if (scoreSet.length >= scores.length - 1 && scoreSet.every((val, i) => scores[i] === val)) {
      return { presetName: type, passAllowed: scoreSet.includes("Pass") };
    }
  }

  return null;
}

export function getScoreSet(presetName, allowPass) {
  const preset = scorePresets.find(({ type }) => type === presetName);
  if (!preset) {
    return null;
  } else {
    return allowPass ? preset.scores : preset.scores.filter((score) => score !== "Pass");
  }
}

export function ScoreSetSelector({ scoreSet, onSetScoreSet }) {
  const preset = findScorePreset(scoreSet);
  // We track this as a separate item in state to prevent the view from
  // snapping back to a preset if we enter a custom score set that happens to
  // match one of the presets while we are still editing (when we reopen the
  // settings dialog this will still happen, as we only store the array of scores
  // in remote state, not how it was originally selected).
  const [customSelected, setCustomSelected] = React.useState(false);
  React.useEffect(() => {
    if (!preset) {
      setCustomSelected(true);
    }
  }, [scoreSet]);

  const isCustom = customSelected || !preset;

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
    <>
      <FormControl fullWidth>
        <InputLabel id="score-set-select">Score set</InputLabel>
        <Select
          labelId="score-set-select"
          value={isCustom ? "custom" : preset.presetName}
          onChange={(evt) => {
            setCustomSelected(evt.target.value === "custom");
            if (evt.target.value !== "custom") {
              onSetScoreSet(getScoreSet(evt.target.value, true));
            }
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

      {isCustom && (
        <ChipInput
          style={{ marginTop: 10, marginBottom: 20 }}
          chipRenderer={chipRenderer}
          fullWidth
          blurBehavior="add"
          alwaysShowPlaceholder
          helperText={
            scoreSet.length < 2
              ? "You need at least two options"
              : "Type new scores and press enter"
          }
          error={scoreSet.length < 2}
          defaultValue={scoreSet}
          onChange={(scores) => onSetScoreSet(scores)}
        />
      )}
      {!isCustom && (
        <>
          <FormControlLabel
            style={{ marginTop: 10 }}
            control={
              <Switch
                checked={preset.passAllowed}
                onChange={() => {
                  onSetScoreSet(getScoreSet(preset.presetName, !preset.passAllowed));
                }}
              />
            }
            label="Allow participants to pass"
          />
          <Box>
            {scoreSet.map((score) => (
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
    </>
  );
}
