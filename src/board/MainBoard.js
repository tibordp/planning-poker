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
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import { TransitionGroup } from "react-transition-group";
import { ScoreTableRow } from "./ScoreTableRow";
import { ScoreSummary } from "./ScoreSummary";
import { useTheme } from "@material-ui/core/styles";

export const makeChipStyle = (color, highlighted) => ({
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
export function getPseudoMedians(scoreSet, allVotesCast) {
  const sortedIndexes = allVotesCast.map((score) => scoreSet.indexOf(score)).sort();
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
  selfClientId,
  hostClientId,
  votesVisible,
  disconnectedClients,
  canSeeDisconnectedClients,
  canNudge,
  canPromoteToHost,
  onNudge,
  onPromoteToHost,
  onKick,
  onKickDisconnected,
}) {
  const theme = useTheme();
  const [highlightedScore, setHighlightedScore] = React.useState(null);

  let allVotesCast = clients
    .filter(({ name, score }) => name && scoreSet.includes(score) && score !== "Pass")
    .map(({ score }) => score);

  if (canSeeDisconnectedClients) {
    allVotesCast = [...allVotesCast, ...Object.values(disconnectedClients)];
  }

  const votesCast = new Set(allVotesCast);
  const scoreDistribution = [...votesCast]
    .map((score) => [score, allVotesCast.filter((s) => score === s).length])
    .sort((a, b) => a[0] - b[0]);
  const haveConsensus = votesCast.size === 1 && votesVisible;
  const summaryVisible = votesVisible && !!scoreDistribution.length;
  const medians = getPseudoMedians(scoreSet, allVotesCast);
  const chipStyleMap = (vote) => {
    const isHighlighted = vote === highlightedScore;

    if (!votesVisible || !votesCast.has(vote)) {
      return makeChipStyle(theme.palette.grey[500], false);
    } else if (haveConsensus && vote === scoreDistribution[0][0]) {
      return makeChipStyle(theme.palette.success.main, true);
    } else if (medians.includes(vote)) {
      return makeChipStyle(
        isHighlighted ? theme.palette.primary.main : theme.palette.secondary.main,
        true
      );
    } else {
      return makeChipStyle(theme.palette.primary.main, isHighlighted);
    }
  };

  // Sort the table by the value of the votes, putting the abstainers at the
  // bottom. If the votes are not visible, we use the default order so as not
  // to leak information about scores before the reveal.
  let displayedClients = clients
    .filter(({ name }) => name)
    .map(({ clientId, name, score }) => ({ clientId, name, score }));

  if (canSeeDisconnectedClients) {
    displayedClients = [
      ...displayedClients,
      ...Object.entries(disconnectedClients).map(([name, score]) => ({
        clientId: null,
        name,
        score,
      })),
    ].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (votesVisible) {
    displayedClients = [
      ...displayedClients
        .filter(({ score }) => votesCast.has(score))
        .sort((a, b) => scoreSet.indexOf(a.score) - scoreSet.indexOf(b.score)),
      ...displayedClients.filter(({ score }) => !votesCast.has(score)),
    ];
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
        <Table size="medium">
          <TransitionGroup component={TableBody}>
            {displayedClients.map(({ clientId, name, score }) => (
              <ScoreTableRow
                key={name}
                votesVisible={votesVisible}
                isSelf={clientId === selfClientId}
                isHost={clientId === hostClientId}
                isDisconnected={!clientId}
                chipStyleMap={chipStyleMap}
                name={name}
                score={score}
                canNudge={clientId && canNudge}
                canPromoteToHost={clientId && canPromoteToHost}
                canKick={canPromoteToHost}
                onNudge={() => onNudge(clientId)}
                onPromoteToHost={() => onPromoteToHost(clientId)}
                onKick={() => (clientId ? onKick(clientId) : onKickDisconnected(name))}
              />
            ))}
          </TransitionGroup>
        </Table>
      </TableContainer>
    </>
  );
}

MainBoard.propTypes = {
  clients: PropTypes.arrayOf(PropTypes.object).isRequired,
  scoreSet: PropTypes.arrayOf(PropTypes.string).isRequired,
  disconnectedClients: PropTypes.object.isRequired,
  selfClientId: PropTypes.string.isRequired,
  hostClientId: PropTypes.string.isRequired,
  votesVisible: PropTypes.bool.isRequired,
  canNudge: PropTypes.bool.isRequired,
  canPromoteToHost: PropTypes.bool.isRequired,
  canSeeDisconnectedClients: PropTypes.bool.isRequired,
  onNudge: PropTypes.func.isRequired,
  onPromoteToHost: PropTypes.func.isRequired,
  onKick: PropTypes.func.isRequired,
  onKickDisconnected: PropTypes.func.isRequired,
};
