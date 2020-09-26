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
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Zoom from "@material-ui/core/Zoom";
import Chip from "@material-ui/core/Chip";
import Slide from "@material-ui/core/Slide";
import Notifications from "@material-ui/icons/Notifications";
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import RemoveCircleOutline from "@material-ui/icons/RemoveCircleOutline";
import WifiOff from "@material-ui/icons/WifiOff";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  participantNameCell: {
    fontSize: "larger",
    wordBreak: "break-all",
  },
  scoreCell: {
    padding: theme.spacing(0.5),
    whiteSpace: "nowrap",
  },
  scoreChip: {
    marginLeft: theme.spacing(1),
    fontSize: 14,
  },
  hostBadge: {
    color: theme.palette.text.secondary,
    height: 18,
    verticalAlign: "sub",
  },
  disconnected: {
    color: theme.palette.text.secondary,
  },
  disconnectedBadge: {
    height: 18,
    verticalAlign: "sub",
  },
}));

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
}) {
  const classes = useStyles();
  const [isHover, setIsHover] = React.useState(false);
  const isVisible = isSelf || votesVisible;

  return (
    <Slide direction="right" timeout={500} in mountOnEnter unmountOnExit {...transitionProps}>
      <TableRow onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} hover>
        <TableCell className={classes.participantNameCell} component="th" scope="row">
          <span className={isDisconnected ? classes.disconnected : undefined}>
            {name}
            {isDisconnected && (
              <Tooltip title="Disconnected">
                <WifiOff className={classes.disconnectedBadge} />
              </Tooltip>
            )}
          </span>

          {isHost && isHover && (
            <Tooltip title="Session host">
              <VerifiedUser className={classes.hostBadge} />
            </Tooltip>
          )}
        </TableCell>
        <TableCell className={classes.scoreCell} align="right">
          {isHover && !isSelf && !isHost && canKick && (
            <Tooltip title={`Kick`}>
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

ScoreTableRow.propTypes = {
  isSelf: PropTypes.bool.isRequired,
  isHost: PropTypes.bool.isRequired,
  isDisconnected: PropTypes.bool.isRequired,
  chipStyleMap: PropTypes.func.isRequired,
  votesVisible: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  score: PropTypes.string,
  canNudge: PropTypes.bool.isRequired,
  canKick: PropTypes.bool.isRequired,
  canPromoteToHost: PropTypes.bool.isRequired,
  onNudge: PropTypes.func.isRequired,
  onKick: PropTypes.func.isRequired,
  onPromoteToHost: PropTypes.func.isRequired,
};
