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
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Zoom from "@material-ui/core/Zoom";
import Chip from "@material-ui/core/Chip";
import TableContainer from "@material-ui/core/TableContainer";
import Slide from "@material-ui/core/Slide";
import { TransitionGroup } from "react-transition-group";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  table: {},
  participantNameCell: {
    fontSize: "larger",
  },
  scoreCell: {
    padding: theme.spacing(0.5),
  },
}));

function ScoreTableRow({ haveConsensus, isSelf, scoresVisible, name, score, ...transitionProps }) {
  const classes = useStyles();
  const isVisible = isSelf || scoresVisible;

  return (
    <Slide direction="right" timeout={500} in mountOnEnter unmountOnExit {...transitionProps}>
      <TableRow hover selected={haveConsensus}>
        <TableCell className={classes.participantNameCell} component="th" scope="row">
          {name}
          {isSelf && <i> (you)</i>}
        </TableCell>
        <TableCell className={classes.scoreCell} align="right">
          {score && (
            // We want the score chip to be re-mounted on every change so that
            // th animation gives a visual indication that something happened,
            // even if the score is still hidden.
            <Zoom key={`${score}_${scoresVisible}`} in mountOnEnter unmountOnExit>
              <Chip
                variant={scoresVisible ? "default" : "outlined"}
                size="medium"
                style={isVisible && { fontWeight: "bold" }}
                label={isVisible ? score : "Hidden"}
                color="primary"
              />
            </Zoom>
          )}
        </TableCell>
      </TableRow>
    </Slide>
  );
}

export function ScoreTable({ clients, selfIdentifier, haveConsensus, scoresVisible }) {
  const classes = useStyles();
  return (
    <TableContainer>
      <Table className={classes.table} size="medium">
        <TransitionGroup component={TableBody}>
          {clients
            .filter(({ name }) => name)
            .map(({ identifier, name, score }) => (
              <ScoreTableRow
                key={identifier}
                scoresVisible={scoresVisible}
                haveConsensus={haveConsensus}
                isSelf={identifier === selfIdentifier}
                name={name}
                score={score}
              />
            ))}
        </TransitionGroup>
      </Table>
    </TableContainer>
  );
}
