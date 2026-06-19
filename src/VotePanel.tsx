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
