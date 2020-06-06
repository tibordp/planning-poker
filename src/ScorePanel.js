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
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  actionButton: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  scoreButton: {
    margin: theme.spacing(1),
  },
}));

export function ScorePanel({
  scoresVisible,
  scoringEnabled,
  controlEnabled,
  selectedScore,
  onScore,
  onReset,
  onSetVisibility,
}) {
  const classes = useStyles();
  const scores = [0.5, 1, 2, 3, 5, 8, 13, 21, 100, "Pass"];
  return (
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Grid item sm={9} xs={12}>
        {scores.map((score) => (
          <Button
            disabled={!scoringEnabled}
            key={score}
            onClick={() => onScore(selectedScore === score ? null : score)}
            className={classes.scoreButton}
            variant={selectedScore === score ? "outlined" : "text"}
            color="secondary"
          >
            {score}
          </Button>
        ))}
      </Grid>
      <Grid item sm={3} xs={12}>
        <Button
          disabled={!controlEnabled}
          className={classes.actionButton}
          onClick={() => onSetVisibility(!scoresVisible)}
          fullWidth
          variant={scoresVisible ? "contained" : "outlined"}
          color="secondary"
        >
          {scoresVisible && "Hide votes"}
          {!scoresVisible && "Show votes"}
        </Button>

        <Button
          disabled={!controlEnabled}
          className={classes.actionButton}
          fullWidth
          onClick={() => onReset()}
          variant="outlined"
          color="primary"
        >
          Clear votes
        </Button>
      </Grid>
    </Grid>
  );
}
