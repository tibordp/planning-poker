import * as React from "react";
import Zoom from "@mui/material/Zoom";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Card from "@mui/material/Card";
import { TransitionGroup } from "react-transition-group";
import type { ChipStyle, ScoreDistribution } from "../types";

interface ScoreSummaryProps {
  visible: boolean;
  scoreDistribution: ScoreDistribution;
  chipStyleMap: (score: string | null) => ChipStyle;
  setHighlightedScore: (score: string | null) => void;
  haveConsensus: boolean;
}

export function ScoreSummary({
  visible,
  scoreDistribution,
  chipStyleMap,
  setHighlightedScore,
  haveConsensus,
}: ScoreSummaryProps) {
  return (
    <TransitionGroup>
      {visible && haveConsensus && (
        <Zoom timeout={{ appear: 0, enter: 200, exit: 0 }} in>
          <Alert variant="filled" severity="success" sx={{ mb: 1 }}>
            <AlertTitle>Consensus!</AlertTitle>
            The score is {scoreDistribution[0][0]}
          </Alert>
        </Zoom>
      )}
      {visible && !haveConsensus && (
        <Zoom timeout={{ appear: 0, enter: 200, exit: 0 }} in>
          <Card variant="outlined" sx={{ p: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              {scoreDistribution.map(([score, freq]) => (
                <Box sx={{ fontSize: 14, whiteSpace: "nowrap", my: 0.5, mx: 0.5 }} key={score}>
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
