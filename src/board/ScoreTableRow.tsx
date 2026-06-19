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
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Zoom from "@mui/material/Zoom";
import Chip from "@mui/material/Chip";
import Slide, { type SlideProps } from "@mui/material/Slide";
import Box from "@mui/material/Box";
import Notifications from "@mui/icons-material/Notifications";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import RemoveCircleOutline from "@mui/icons-material/RemoveCircleOutlineOutlined";
import WifiOff from "@mui/icons-material/WifiOff";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { ChipStyle } from "../types";

const badgeSx = { height: 18, verticalAlign: "sub" } as const;

type ScoreTableRowProps = {
  isSelf: boolean;
  isHost: boolean;
  isDisconnected: boolean;
  chipStyleMap: (score: string | null) => ChipStyle;
  votesVisible: boolean;
  name: string;
  score: string | null;
  canNudge: boolean;
  canKick: boolean;
  canPromoteToHost: boolean;
  onNudge: () => void;
  onKick: () => void;
  onPromoteToHost: () => void;
} & Partial<Omit<SlideProps, "children">>;

export function ScoreTableRow({
  isSelf,
  isHost,
  isDisconnected,
  chipStyleMap,
  votesVisible,
  name,
  score,
  canNudge,
  canKick,
  canPromoteToHost,
  onNudge,
  onKick,
  onPromoteToHost,
  ...transitionProps
}: ScoreTableRowProps) {
  const [isHover, setIsHover] = React.useState(false);
  const isVisible = isSelf || votesVisible;

  return (
    <Slide direction="right" timeout={500} in mountOnEnter unmountOnExit {...transitionProps}>
      <TableRow onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} hover>
        <TableCell
          sx={{ fontSize: "larger", wordBreak: "break-all" }}
          component="th"
          scope="row"
        >
          <Box component="span" sx={isDisconnected ? { color: "text.secondary" } : undefined}>
            {name}
            {isDisconnected && (
              <Tooltip title="Disconnected">
                <WifiOff sx={badgeSx} />
              </Tooltip>
            )}
          </Box>

          {isHost && isHover && (
            <Tooltip title="Session host">
              <VerifiedUser sx={{ ...badgeSx, color: "text.secondary" }} />
            </Tooltip>
          )}
        </TableCell>
        <TableCell sx={{ p: 0.5, whiteSpace: "nowrap" }} align="right">
          {isHover && !isSelf && !isHost && canKick && (
            <Tooltip title="Kick">
              <IconButton onClick={onKick}>
                <RemoveCircleOutline />
              </IconButton>
            </Tooltip>
          )}
          {isHover && !isHost && canPromoteToHost && (
            <Tooltip title="Promote to host">
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
                sx={{ ml: 1, fontSize: 14 }}
                label={isVisible ? score : "Hidden"}
              />
            </Zoom>
          )}

          {!score && isHover && !isSelf && canNudge && (
            <Tooltip title="Nudge">
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
