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
import GitHubIcon from "@mui/icons-material/GitHub";
import DoneIcon from "@mui/icons-material/Done";
import ReplayIcon from "@mui/icons-material/Replay";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { Timer } from "./Timer";
import { useSnackbar } from "notistack";
import { usePermissions } from "./permissions";
import { useRouter } from "next/router";
import { useConfirmationDialog } from "./utils/useConfirmationDialog";
import type { Dispatch } from "./remoteState";
import type { RemoteState } from "./types";

const buttonSx = { color: "grey.700" };

interface FooterProps {
  sessionName?: string;
  canReactivate?: boolean;
  remoteState?: RemoteState | null;
  dispatch?: Dispatch | null;
}

export default function Footer({ sessionName, canReactivate, remoteState, dispatch }: FooterProps) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const showTimer = !!remoteState && remoteState.settings.showTimer;
  const permissions = usePermissions(remoteState);

  const [confirmFinish, dialog] = useConfirmationDialog({
    title: "Finish this session?",
    description:
      "Finishing the session will disconnect everyone and afterwards you will be able to review the report.",
    confirmText: "Finish session",
    onConfirm: () => dispatch?.({ action: "finishSession" }),
  });

  const reactivateSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(sessionName ?? "")}/reactivate`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      router.replace({
        pathname: "/[session]",
        query: { session: sessionName },
      });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Failed to reactivate the session!", { variant: "error" });
    }
  };

  return (
    <>
      <Divider />
      <Grid
        container
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-around", mt: 1 }}
      >
        {showTimer && (
          <Grid
            sx={{ mt: -1, mb: -1, display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            <Timer
              canControlTimer={permissions.canControlTimer}
              timerState={remoteState.timerState}
              dispatch={dispatch!}
            />
          </Grid>
        )}
        {dispatch && permissions.canFinishSession && (
          <Grid>
            <Button variant="text" onClick={confirmFinish} startIcon={<DoneIcon />} sx={buttonSx}>
              Finish session
            </Button>
          </Grid>
        )}
        {canReactivate && sessionName && (
          <Grid>
            <Button
              variant="text"
              onClick={reactivateSession}
              startIcon={<ReplayIcon />}
              sx={buttonSx}
            >
              Reactivate session
            </Button>
          </Grid>
        )}
        <Grid>
          <Button
            variant="text"
            target="_blank"
            href="http://www.github.com/tibordp/planning-poker"
            startIcon={<GitHubIcon />}
            sx={buttonSx}
          >
            View on GitHub
          </Button>
        </Grid>
      </Grid>
      {dialog}
    </>
  );
}
