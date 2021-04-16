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
import Pause from "@material-ui/icons/Pause";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Replay from "@material-ui/icons/Replay";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import PropTypes from "prop-types";
import { IS_SSR } from "./remoteState";

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
export function Timer({ timerState, dispatch, canControlTimer }) {
  const [timer, setTimer] = React.useState(0);

  const startTime = new Date(timerState.startTime);
  const pausedTime = timerState.pausedTime ? new Date(timerState.pausedTime) : null;

  React.useEffect(() => {
    const tick = () => {
      let timeOffset = 0;
      if (!IS_SSR) {
        timeOffset = window.__PP_TIME_OFFSET || 0;
      }
      const endTime = pausedTime || new Date() - timeOffset;
      const newValue = endTime - startTime - timerState.pausedTotal;
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

Timer.propTypes = {
  timerState: PropTypes.object.isRequired,
  canControlTimer: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};
