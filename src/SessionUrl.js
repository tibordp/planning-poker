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
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import FileCopyOutlined from "@material-ui/icons/FileCopyOutlined";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  sessionUrl: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
}));

export function SessionUrl({ origin, sessionName }) {
  const classes = useStyles();
  const inputRef = React.useRef();

  const onClick = () => {
    inputRef.current.select();
    document.execCommand("copy");
  };

  // Cannot determine hostname easily in SSR context.
  let sessionUrl = `${origin.protocol}//${origin.host}/${sessionName}`;

  return (
    <TextField
      fullWidth
      value={sessionUrl}
      variant="outlined"
      label="Invite link"
      inputRef={inputRef}
      classes={{
        root: classes.sessionUrl,
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={onClick}>
                <FileCopyOutlined />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}

SessionUrl.propTypes = {
  sessionName: PropTypes.string.isRequired,
  origin: PropTypes.shape({ protocol: PropTypes.string, host: PropTypes.string }).isRequired,
};
