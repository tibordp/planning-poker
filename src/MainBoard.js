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
import Notifications from "@material-ui/icons/Notifications";
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import RemoveCircleOutline from "@material-ui/icons/RemoveCircleOutline";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Card from "@material-ui/core/Card";
import { TransitionGroup } from "react-transition-group";
import { makeStyles, useTheme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  table: {},
  participantNameCell: {
    fontSize: "larger",
  },
  scoreCell: {
    padding: theme.spacing(0.5),
  },
  scoreChip: {
    marginLeft: theme.spacing(1),
    fontSize: 14,
  },
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
  hostBadge: {
    color: theme.palette.text.secondary,
    height: 18,
    verticalAlign: "sub",
  },
  summaryPanel: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const makeChipStyle = (color, highlighted) => ({
  variant: highlighted ? "default" : "outlined",
  style: highlighted
    ? {
        backgroundColor: color,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "transparent",
        color: "#fff",
      }
    : {
        borderColor: color,
        color: color,
      },
});

function ScoreTableRow({
  isSelf,
  isHost,
  chipStyleMap,
  votesVisible,
  name,
  score,
  canNudge,
  canPromoteToHost,
  onNudge,
  onKick,
  onPromoteToHost,
  ...transitionProps
}) {
  const classes = useStyles();
  const [isHover, setIsHover] = React.useState(false);
  const isVisible = isSelf || votesVisible;

  return (
    <Slide direction="right" timeout={500} in mountOnEnter unmountOnExit {...transitionProps}>
      <TableRow onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} hover>
        <TableCell className={classes.participantNameCell} component="th" scope="row">
          {name}
          {isHost && isHover && (
            <Tooltip title="Session host">
              <VerifiedUser className={classes.hostBadge} />
            </Tooltip>
          )}
        </TableCell>
        <TableCell className={classes.scoreCell} align="right">
          {isHover && !isSelf && !isHost && canPromoteToHost && (
            <Tooltip title={`Remove as voter`}>
              <IconButton onClick={onKick}>
                <RemoveCircleOutline />
              </IconButton>
            </Tooltip>
          )}
          {isHover && !isHost && canPromoteToHost && (
            <Tooltip title={`Promote to host`}>
              <IconButton onClick={onPromoteToHost}>
                <VerifiedUser />
              </IconButton>
            </Tooltip>
          )}
          {score && (
            // We want the score chip to be re-mounted on every change so that
            // th animation gives a visual indication that something happened,
            // even if the score is still hidden.
            <Zoom key={`${score}_${votesVisible}`} in mountOnEnter unmountOnExit>
              <Chip
                {...chipStyleMap(score)}
                size="medium"
                className={classes.scoreChip}
                label={isVisible ? score : "Hidden"}
              />
            </Zoom>
          )}

          {!score && isHover && !isSelf && canNudge && (
            <Tooltip title={`Nudge`}>
              <IconButton onClick={onNudge}>
                <Notifications />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>
    </Slide>
  );
}

function ScoreSummary({
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

/**
 * Get pseudo medians of the vote set. As the votes can be non-numeric, we order the scores
 * according to the order of the score set (which we can usually assume to be monotonic).
 *
 * If there is an odd number of voters or the midpoint of the ordered list happens to fall
 * between two scores that coincide, we return the true median. Otherwise, we
 * return a score that lies in the middle of two midpoint votes, which can be a score that
 * nobody actually voted for. If we are still split between two adjecent votes, we return both.
 * @param {*} scoreSet
 * @param {*} allVotesCast
 */
function getPseudoMedians(scoreSet, allVotesCast) {
  const sortedIndexes = allVotesCast.map((score) => scoreSet.indexOf(score)).sort();
  console.log(sortedIndexes);
  let indexes = [];
  if (!sortedIndexes.length) {
    indexes = [];
  } else if (sortedIndexes.length % 2 == 1) {
    indexes = [sortedIndexes[(sortedIndexes.length - 1) / 2]];
  } else {
    const lowerIndex = sortedIndexes[sortedIndexes.length / 2 - 1];
    const upperIndex = sortedIndexes[sortedIndexes.length / 2];

    if ((upperIndex - lowerIndex) % 2 == 0) {
      indexes = [(upperIndex + lowerIndex) / 2];
    } else {
      indexes = [(upperIndex + lowerIndex - 1) / 2, (upperIndex + lowerIndex + 1) / 2];
    }
  }

  return indexes.map((index) => scoreSet[index]);
}

export function MainBoard({
  clients,
  scoreSet,
  selfIdentifier,
  hostIdentifier,
  votesVisible,
  canNudge,
  canPromoteToHost,
  onNudge,
  onPromoteToHost,
  onKick,
}) {
  const theme = useTheme();
  const classes = useStyles();
  const [highlightedScore, setHighlightedScore] = React.useState(null);

  const allVotesCast = clients
    .filter(({ name, score }) => name && scoreSet.includes(score) && score !== "Pass")
    .map(({ score }) => score);
  const votesCast = new Set(allVotesCast);
  const scoreDistribution = [...votesCast]
    .map((score) => [score, allVotesCast.filter((s) => score === s).length])
    .sort((a, b) => a[0] - b[0]);
  const haveConsensus = votesCast.size === 1 && votesVisible;
  const summaryVisible = votesVisible && !!scoreDistribution.length;
  const medians = getPseudoMedians(scoreSet, allVotesCast);
  console.log(scoreSet, allVotesCast, medians);
  const chipStyleMap = (vote) => {
    const isHighlighted = vote === highlightedScore;
    const ordinaryColor = isHighlighted ? theme.palette.secondary.main : theme.palette.primary.main;

    if (!votesVisible || !votesCast.has(vote)) {
      return makeChipStyle(theme.palette.grey[500], false);
    } else if (haveConsensus && vote === scoreDistribution[0][0]) {
      return makeChipStyle(theme.palette.success.main, true);
    } else if (medians.includes(vote)) {
      return makeChipStyle(ordinaryColor, true);
    } else {
      return makeChipStyle(ordinaryColor, isHighlighted);
    }
  };

  // Sort the table by the value of the votes, putting the abstainers at the
  // bottom. If the votes are not visible, we use the default order so as not
  // to leak information about scores before the reveal.
  let sortedClients;
  if (votesVisible) {
    sortedClients = [
      ...clients
        .filter(({ score }) => votesCast.has(score))
        .sort((a, b) => scoreSet.indexOf(a.score) - scoreSet.indexOf(b.score)),
      ...clients.filter(({ score }) => !votesCast.has(score)),
    ];
  } else {
    sortedClients = clients;
  }

  return (
    <>
      <ScoreSummary
        visible={summaryVisible}
        haveConsensus={haveConsensus}
        scoreDistribution={scoreDistribution}
        chipStyleMap={chipStyleMap}
        setHighlightedScore={setHighlightedScore}
      />
      <TableContainer>
        <Table className={classes.table} size="medium">
          <TransitionGroup component={TableBody}>
            {sortedClients
              .filter(({ name }) => name)
              .map(({ identifier, name, score }) => (
                <ScoreTableRow
                  key={identifier}
                  votesVisible={votesVisible}
                  isSelf={identifier === selfIdentifier}
                  isHost={identifier === hostIdentifier}
                  chipStyleMap={chipStyleMap}
                  name={name}
                  score={score}
                  canNudge={canNudge}
                  canPromoteToHost={canPromoteToHost}
                  onNudge={() => onNudge(identifier)}
                  onPromoteToHost={() => onPromoteToHost(identifier)}
                  onKick={() => onKick(identifier)}
                />
              ))}
          </TransitionGroup>
        </Table>
      </TableContainer>
    </>
  );
}
