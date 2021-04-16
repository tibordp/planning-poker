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
import GitHubIcon from "@material-ui/icons/GitHub";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { Timer } from "./Timer";
import { useSnackbar } from "notistack";
import { usePermissions } from "./permissions";
import { useRouter } from "next/router";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.grey[700],
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: theme.spacing(6),
    "& *:only-child": {
      marginLeft: "auto",
    },
  },
  timer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  dangerButton: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
  },
}));

export default function Footer({ sessionName, canReactivate, remoteState, dispatch }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const showTimer = !!remoteState && remoteState.settings.showTimer;
  const permissions = usePermissions(remoteState);

  const [open, setOpen] = React.useState(false);

  const reactivateSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(sessionName)}/reactivate`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      router.replace(`/${encodeURIComponent(sessionName)}`);
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Failed to reactivate the session!", { variant: "error" });
    }
  };

  const handleClose = (proceed) => {
    setOpen(false);
    if (proceed) {
      dispatch?.({ action: "finishSession" });
    }
  };

  return (
    <>
      <Divider />
      <Box className={classes.footer}>
        {showTimer && (
          <>
            <Box className={classes.footer}>
              <Timer
                canControlTimer={permissions.canControlTimer}
                timerState={remoteState.timerState}
                dispatch={dispatch}
              />
            </Box>
          </>
        )}
        {dispatch && permissions.canFinishSession && (
          <Button className={classes.button} variant="text" onClick={() => setOpen(true)}>
            Finish session
          </Button>
        )}
        {canReactivate && sessionName && (
          <Button className={classes.button} variant="text" onClick={reactivateSession}>
            Reactivate session
          </Button>
        )}
        <Button
          variant="text"
          target="_blank"
          href="http://www.github.com/tibordp/planning-poker"
          color="default"
          className={classes.button}
          startIcon={<GitHubIcon />}
        >
          View on GitHub
        </Button>
      </Box>
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Finish this session?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Finishing the session will disconnect everyone and afterwards you will be able to review
            the report.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleClose(true)} color="primary" autoFocus>
            Finish session
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

Footer.propTypes = {
  remoteState: PropTypes.object,
  dispatch: PropTypes.func,
  canReactivate: PropTypes.bool,
  sessionName: PropTypes.string,
};
