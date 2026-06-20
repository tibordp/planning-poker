import * as React from "react";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Replay from "@mui/icons-material/Replay";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { IS_SSR } from "./remoteState";
import type { Dispatch } from "./remoteState";
import type { TimerState } from "./types";

export function formatDuration(milliseconds: number): string {
  return new Date(Math.max(0, milliseconds)).toISOString().substring(11, 19);
}

interface TimerProps {
  timerState: TimerState;
  dispatch: Dispatch;
  canControlTimer: boolean;
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
export function Timer({ timerState, dispatch, canControlTimer }: TimerProps) {
  const [timer, setTimer] = React.useState(0);

  const startTime = new Date(timerState.startTime);
  const pausedTime = timerState.pausedTime ? new Date(timerState.pausedTime) : null;

  React.useEffect(() => {
    const tick = () => {
      let timeOffset = 0;
      if (!IS_SSR) {
        timeOffset = window.__PP_TIME_OFFSET || 0;
      }
      const endTime = pausedTime ? pausedTime.getTime() : Date.now() - timeOffset;
      const newValue = endTime - startTime.getTime() - timerState.pausedTotal;
      setTimer(newValue);
    };

    if (pausedTime) {
      tick();
      return () => {};
    } else {
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [timerState]);

  return (
    <>
      <Typography variant="body1">{formatDuration(timer)}</Typography>
      {canControlTimer && (
        <>
          {!pausedTime && (
            <Tooltip title="Pause the timer">
              <IconButton onClick={() => dispatch({ action: "pauseTimer" })}>
                <Pause />
              </IconButton>
            </Tooltip>
          )}
          {!!pausedTime && (
            <Tooltip title="Start the timer">
              <IconButton onClick={() => dispatch({ action: "startTimer" })}>
                <PlayArrow />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Reset the timer">
            <IconButton onClick={() => dispatch({ action: "resetTimer" })}>
              <Replay />
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
}
