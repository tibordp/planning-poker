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
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

export const useStyles = makeStyles((theme) => ({
  sessionPaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
}));

export function SessionPanel({ remoteState, dispatch }) {
  const classes = useStyles();
  const [selectedName, setSelectedName] = React.useState("");
  const { me } = remoteState;

  const joinSubmit = (evt) => {
    dispatch({ action: "join", name: selectedName });
    evt.preventDefault();
  };

  return (
    <>
      <Card variant="outlined" className={classes.sessionPaper}>
        {!me.name && (
          <form onSubmit={joinSubmit}>
            <Grid container direction="row" alignItems="center" spacing={2}>
              <Grid item xs={12} sm={5}>
                <Typography>You are currently an observer.</Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  className={classes.form}
                  id="standard-basic"
                  value={selectedName}
                  onChange={(evt) => setSelectedName(evt.target.value)}
                  label="Your name"
                  style={{ marginTop: -10 }}
                  margin="dense"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  disabled={!selectedName}
                  variant="outlined"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  Join
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
        {me.name && (
          <Grid container direction="row" alignItems="center" spacing={2}>
            <Grid item xs={12} sm={7}>
              <Typography>
                You are currently joined as <b>{me.name}</b>.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Button
                onClick={() => dispatch({ action: "leave" })}
                variant="outlined"
                color="secondary"
                fullWidth
              >
                Rejoin as observer
              </Button>
            </Grid>
          </Grid>
        )}
      </Card>
    </>
  );
}
