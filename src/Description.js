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
import Link from "@material-ui/core/Link";
import ReactMarkdown from "react-markdown";
import { makeStyles } from "@material-ui/core/styles";

export const mdStyles = (theme) => ({
  "& img": {
    verticalAlign: "sub",
  },
  "& code": {
    fontFamily: "Roboto Mono",
  },
  "& pre": {
    backgroundColor: theme.palette.background.default,
    borderWidth: 1,
    borderColor: theme.palette.divider,
    borderStyle: "solid",
    borderRadius: 4,
    padding: theme.spacing(1),
    overflow: "auto",
  },
  "& blockquote": {
    borderLeft: "2px solid",
    marginLeft: 0,
    paddingLeft: theme.spacing(1),
    borderColor: theme.palette.secondary.light,
  },
  fontSize: theme.typography.fontSize,
  color: theme.palette.text.primary,
});

export const useStyles = makeStyles((theme) => ({
  table: {},
  description: {
    fontFamily: "Roboto Mono",
    fontSize: theme.typography.fontSize,
  },
  container: {
    backgroundColor: theme.palette.background.paper,
  },
  markdown: {
    marginBottom: -theme.spacing(2),
    marginTop: -theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    "& *:first-child": {
      marginTop: 0,
    },
    "& *:last-child": {
      marginBottom: 0,
    },
    ...mdStyles(theme),
    "&:before": {
      content: '""',
      width: "100%",
      height: "100%",
      position: "absolute",
      left: 0,
      top: 0,
      pointerEvents: "none",
      background: `linear-gradient(${theme.palette.background.paper} 0%, transparent 10%, transparent 90%, ${theme.palette.background.paper} 100%)`,
    },
    overflowX: "hidden",
    maxHeight: 400,
  },
}));

export function Description({ editingEnabled, description, onChange }) {
  const classes = useStyles();

  const [localDescription, setLocalDescription] = React.useState(description);
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    setLocalDescription(description);
  }, [description]);

  return (
    <>
      {editing && (
        <TextField
          fullWidth
          multiline
          label="Description"
          variant="outlined"
          value={localDescription}
          onChange={(evt) => setLocalDescription(evt.target.value)}
          onBlur={() => {
            const newDescription = localDescription.trim();
            setLocalDescription(newDescription);
            onChange(newDescription);
            setEditing(false);
          }}
          InputProps={{
            className: classes.description,
            autoFocus: true,
            onFocus: (evt) => evt.target.select(),
          }}
        />
      )}
      {!editing && (
        <TextField
          fullWidth
          variant="outlined"
          multiline
          label="Description"
          value={localDescription}
          onClick={(evt) => {
            // So we can click on links in description
            if (editingEnabled && !evt.target.href) {
              setEditing(true);
            }
          }}
          classes={{
            root: classes.container,
          }}
          InputLabelProps={{ shrink: !!localDescription }}
          InputProps={{
            inputComponent: ReactMarkdown,
            inputProps: {
              source: localDescription || "&nbsp;",
              linkTarget: "_blank",
              className: classes.markdown,
              escapeHtml: true,
              renderers: {
                link: Link,
              },
            },
          }}
        />
      )}
    </>
  );
}

Description.propTypes = {
  editingEnabled: PropTypes.bool.isRequired,
  description: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
