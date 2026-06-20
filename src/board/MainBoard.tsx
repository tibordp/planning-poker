import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import { TransitionGroup } from "react-transition-group";
import { ScoreTableRow } from "./ScoreTableRow";
import { ScoreSummary } from "./ScoreSummary";
import { useTheme } from "@mui/material/styles";
import type { ChipStyle, ScoreDistribution, SerializedClient, Votes } from "../types";

export const makeChipStyle = (color: string, highlighted: boolean): ChipStyle => ({
  variant: highlighted ? "filled" : "outlined",
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
 */
export function getPseudoMedians(scoreSet: string[], allVotesCast: string[]): string[] {
  const sortedIndexes = allVotesCast.map((score) => scoreSet.indexOf(score)).sort();
  let indexes: number[] = [];
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

interface MainBoardProps {
  clients: SerializedClient[];
  scoreSet: string[];
  selfClientId: string | null;
  hostClientId: string | null;
  votesVisible: boolean;
  disconnectedClients: Votes;
  canSeeDisconnectedClients: boolean;
  canNudge: boolean;
  canPromoteToHost: boolean;
  onNudge: (clientId: string | null) => void;
  onPromoteToHost: (clientId: string | null) => void;
  onKick: (clientId: string) => void;
  onKickDisconnected: (name: string) => void;
}

interface DisplayedClient {
  clientId: string | null;
  name: string;
  score: string | null;
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
}: MainBoardProps) {
  const theme = useTheme();
  const [highlightedScore, setHighlightedScore] = React.useState<string | null>(null);

  let allVotesCast: string[] = clients
    .filter(
      ({ name, score }) => name && score !== null && scoreSet.includes(score) && score !== "Pass",
    )
    .map(({ score }) => score as string);

  if (canSeeDisconnectedClients) {
    allVotesCast = [...allVotesCast, ...Object.values(disconnectedClients)];
  }

  const votesCast = new Set(allVotesCast);
  const scoreDistribution: ScoreDistribution = [...votesCast]
    .map((score): [string, number] => [score, allVotesCast.filter((s) => score === s).length])
    .sort((a, b) => Number(a[0]) - Number(b[0]));
  const haveConsensus = votesCast.size === 1 && votesVisible;
  const summaryVisible = votesVisible && !!scoreDistribution.length;
  const medians = getPseudoMedians(scoreSet, allVotesCast);
  const chipStyleMap = (vote: string | null): ChipStyle => {
    const isHighlighted = vote === highlightedScore;

    if (!votesVisible || vote === null || !votesCast.has(vote)) {
      return makeChipStyle(theme.palette.grey[500], false);
    } else if (haveConsensus && vote === scoreDistribution[0][0]) {
      return makeChipStyle(theme.palette.success.main, true);
    } else if (medians.includes(vote)) {
      return makeChipStyle(
        isHighlighted ? theme.palette.primary.main : theme.palette.secondary.main,
        true,
      );
    } else {
      return makeChipStyle(theme.palette.primary.main, isHighlighted);
    }
  };

  // Sort the table by the value of the votes, putting the abstainers at the
  // bottom. If the votes are not visible, we use the default order so as not
  // to leak information about scores before the reveal.
  let displayedClients: DisplayedClient[] = clients
    .filter(({ name }) => name)
    .map(({ clientId, name, score }) => ({ clientId, name: name as string, score }));

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
        .filter(({ score }) => score !== null && votesCast.has(score))
        .sort((a, b) => scoreSet.indexOf(a.score as string) - scoreSet.indexOf(b.score as string)),
      ...displayedClients.filter(({ score }) => score === null || !votesCast.has(score)),
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
                canNudge={!!clientId && canNudge}
                canPromoteToHost={!!clientId && canPromoteToHost}
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
