import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Zoom from "@mui/material/Zoom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { scorePresets } from "../sessionDefaults";

export function findScorePreset(
  scoreSet: string[],
): { presetName: string; passAllowed: boolean } | null {
  for (const { scores, type } of scorePresets) {
    // Checks if the score sets are equal, with the possible exception of last element (which can be 'Pass')
    if (scoreSet.length >= scores.length - 1 && scoreSet.every((val, i) => scores[i] === val)) {
      return { presetName: type, passAllowed: scoreSet.includes("Pass") };
    }
  }

  return null;
}

export function getScoreSet(presetName: string, allowPass: boolean): string[] | null {
  const preset = scorePresets.find(({ type }) => type === presetName);
  if (!preset) {
    return null;
  } else {
    return allowPass ? preset.scores : preset.scores.filter((score) => score !== "Pass");
  }
}

interface ScoreSetSelectorProps {
  scoreSet: string[];
  onSetScoreSet: (scoreSet: string[]) => void;
}

export function ScoreSetSelector({ scoreSet, onSetScoreSet }: ScoreSetSelectorProps) {
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

  return (
    <>
      {/* mt gives the floating "Score set" label room: MUI removes DialogContent's
          top padding when it follows a DialogTitle, which would clip the label. */}
      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel id="score-set-select">Score set</InputLabel>
        <Select
          labelId="score-set-select"
          label="Score set"
          value={isCustom ? "custom" : preset!.presetName}
          onChange={(evt: SelectChangeEvent) => {
            setCustomSelected(evt.target.value === "custom");
            if (evt.target.value !== "custom") {
              onSetScoreSet(getScoreSet(evt.target.value, true) ?? []);
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
        <>
          <Autocomplete
            multiple
            freeSolo
            autoSelect
            options={[] as string[]}
            value={scoreSet}
            onChange={(_, newValue) => onSetScoreSet(newValue as string[])}
            sx={{ mt: "10px", mb: "20px" }}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <Chip
                    key={key}
                    variant="outlined"
                    color="primary"
                    size="medium"
                    label={option}
                    {...itemProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={scoreSet.length < 2}
                helperText={
                  scoreSet.length < 2
                    ? "You need at least two options"
                    : "Type new scores and press enter"
                }
              />
            )}
          />
          <p>The order in which the scores are defined will be used for computing the median.</p>
        </>
      )}
      {!isCustom && (
        <>
          <FormControlLabel
            style={{ marginTop: 10 }}
            control={
              <Switch
                checked={preset!.passAllowed}
                onChange={() => {
                  onSetScoreSet(getScoreSet(preset!.presetName, !preset!.passAllowed) ?? []);
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
