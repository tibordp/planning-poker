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
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
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
  hostBadge: {
    color: theme.palette.text.secondary,
    height: 18,
    verticalAlign: "sub",
  },
}));

export function ScoreTableRow({
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

ScoreTableRow.propTypes = {
  isSelf: PropTypes.bool.isRequired,
  isHost: PropTypes.bool.isRequired,
  chipStyleMap: PropTypes.func.isRequired,
  votesVisible: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  score: PropTypes.string,
  canNudge: PropTypes.bool.isRequired,
  canPromoteToHost: PropTypes.bool.isRequired,
  onNudge: PropTypes.func.isRequired,
  onKick: PropTypes.func.isRequired,
  onPromoteToHost: PropTypes.func.isRequired,
};
