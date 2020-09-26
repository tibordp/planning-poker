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
import Zoom from "@material-ui/core/Zoom";
import Chip from "@material-ui/core/Chip";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Card from "@material-ui/core/Card";
import { TransitionGroup } from "react-transition-group";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  summaryChip: {
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  summaryCard: {
    padding: theme.spacing(1),
  },
  consensusAlert: {
    marginBottom: theme.spacing(1),
  },
}));

export function ScoreSummary({
  visible,
  scoreDistribution,
  chipStyleMap,
  setHighlightedScore,
  haveConsensus,
}) {
  const classes = useStyles();

  return (
    <TransitionGroup>
      {visible && haveConsensus && (
        <Zoom timeout={{ appear: 0, enter: 200, exit: 0 }} in>
          <Alert variant="filled" severity="success" className={classes.consensusAlert}>
            <AlertTitle>Consensus!</AlertTitle>
            The score is {scoreDistribution[0][0]}
          </Alert>
        </Zoom>
      )}
      {visible && !haveConsensus && (
        <Zoom timeout={{ appear: 0, enter: 200, exit: 0 }} in>
          <Card variant="outlined" className={classes.summaryCard}>
            <Box
              display="flex"
              flexWrap="wrap"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-evenly"
            >
              {scoreDistribution.map(([score, freq]) => (
                <Box className={classes.summaryChip} my={0.5} mx={0.5} key={score}>
                  <span>{`${freq} × `}</span>
                  <Zoom
                    timeout={{ appear: 0, enter: 400, exit: 400 }}
                    in
                    unmountOnExit
                    key={`${score}_${freq}`}
                  >
                    <Chip
                      onMouseEnter={() => setHighlightedScore(score)}
                      onMouseLeave={() => setHighlightedScore(null)}
                      {...chipStyleMap(score)}
                      size="medium"
                      label={score}
                    />
                  </Zoom>
                </Box>
              ))}
            </Box>
          </Card>
        </Zoom>
      )}
    </TransitionGroup>
  );
}

ScoreSummary.propTypes = {
  visible: PropTypes.bool.isRequired,
  scoreDistribution: PropTypes.array.isRequired,
  chipStyleMap: PropTypes.func.isRequired,
  setHighlightedScore: PropTypes.func.isRequired,
  haveConsensus: PropTypes.bool.isRequired,
};
