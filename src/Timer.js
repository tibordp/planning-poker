import React from "react";
import Pause from "@material-ui/icons/Pause";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Replay from "@material-ui/icons/Replay";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import PropTypes from "prop-types";

export function formatDuration(milliseconds) {
  return new Date(Math.max(0, milliseconds)).toISOString().substr(11, 8);
}

/**
 * Timer is represented by 3 values in remote state: startTime, pausedTime and pausedTotal
 * pausedTotal accumulates the number of milliseconds that the timer has been paused, which
 * allows us to drive the timer locally without requiring synchronization on every tick.
 *
 * In addition, there is serverTime parameter passed from the remoteState, which contains the
 * date the server sent the response. This allows for rudimentary time drift correction if the
 * difference between server and local time is large.
 */
export function Timer({ timerState, dispatch, timeDrift }) {
  const [timer, setTimer] = React.useState(0);

  const startTime = new Date(timerState.startTime);
  const pausedTime = timerState.pausedTime ? new Date(timerState.pausedTime) : null;

  const tick = () => {
    const endTime = pausedTime || new Date();
    const newValue = endTime - startTime - timerState.pausedTotal + timeDrift;
    setTimer(newValue);
  };

  React.useEffect(() => {
    if (pausedTime) {
      tick();
      return () => {};
    } else {
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [pausedTime]);

  return (
    <>
      <Typography variant="body1">{formatDuration(timer)}</Typography>
      {!pausedTime && (
        <IconButton onClick={() => dispatch({ action: "pauseTimer" })}>
          <Pause />
        </IconButton>
      )}
      {!!pausedTime && (
        <IconButton onClick={() => dispatch({ action: "startTimer" })}>
          <PlayArrow />
        </IconButton>
      )}
      <IconButton onClick={() => dispatch({ action: "resetTimer" })}>
        <Replay />
      </IconButton>
    </>
  );
}

Timer.propTypes = {
  timerState: PropTypes.object,
  dispatch: PropTypes.func,
  timeDrift: PropTypes.number.isRequired,
};
