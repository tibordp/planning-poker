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
import TextField from "@material-ui/core/TextField";
import Settings from "@material-ui/icons/Settings";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import { useTheme } from "@material-ui/core/styles";

export function DescriptionEdit({ disabled, description, onChange, onSettingsClick }) {
  const theme = useTheme();

  const [localDescription, setLocalDescription] = React.useState(description);
  React.useEffect(() => {
    setLocalDescription(description);
  }, [description]);
  return (
    <TextField
      fullWidth
      disabled={disabled}
      multiline
      style={{
        backgroundColor: disabled
          ? theme.palette.background.default
          : theme.palette.background.paper,
      }}
      label="Description"
      variant="outlined"
      value={localDescription}
      onChange={(evt) => setLocalDescription(evt.target.value)}
      onBlur={() => {
        onChange(localDescription);
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={onSettingsClick}>
              <Settings />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
