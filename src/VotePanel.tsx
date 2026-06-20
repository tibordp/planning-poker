import * as React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

interface VotePanelProps {
  scoreSet: string[];
  votesVisible: boolean;
  votingEnabled: boolean;
  controlEnabled: boolean;
  selectedScore: string | null;
  onVote: (score: string | null) => void;
  onReset: () => void;
  onSetVisibility: (visibility: boolean) => void;
}

export function VotePanel({
  scoreSet,
  votesVisible,
  votingEnabled,
  controlEnabled,
  selectedScore,
  onVote,
  onReset,
  onSetVisibility,
}: VotePanelProps) {
  return (
    <Grid
      container
      direction="row"
      sx={{ justifyContent: "space-between", alignItems: "center", my: 1 }}
    >
      <Grid size={{ xs: 12, sm: controlEnabled ? 9 : 12 }} sx={{ textAlign: "center" }}>
        {scoreSet.map((score) => (
          <Button
            disabled={!votingEnabled}
            key={score}
            onClick={() => onVote(selectedScore === score ? null : score)}
            sx={{ m: 1 }}
            variant={selectedScore === score ? "outlined" : "text"}
            color="secondary"
          >
            {score}
          </Button>
        ))}
      </Grid>
      {controlEnabled && (
        <Grid size={{ xs: 12, sm: 3 }}>
          <Button
            disabled={!controlEnabled}
            sx={{ my: 1 }}
            onClick={() => onSetVisibility(!votesVisible)}
            fullWidth
            variant="outlined"
            color="secondary"
          >
            {votesVisible && "Hide votes"}
            {!votesVisible && "Show votes"}
          </Button>

          <Button
            disabled={!controlEnabled}
            sx={{ my: 1 }}
            fullWidth
            onClick={() => onReset()}
            variant="outlined"
            color="primary"
          >
            Clear votes
          </Button>
        </Grid>
      )}
    </Grid>
  );
}
