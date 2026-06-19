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
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

interface ParticipantPanelProps {
  name: string | null;
  participantNames: (string | null)[];
  onJoin: (name: string) => void;
  onLeave: () => void;
}

export function ParticipantPanel({
  name,
  participantNames,
  onJoin,
  onLeave,
}: ParticipantPanelProps) {
  const [selectedName, setSelectedName] = React.useState("");

  React.useEffect(() => {
    if (name) {
      setSelectedName(name);
    }
  }, [name]);

  return (
    <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
      {!name && (
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            onJoin(selectedName);
          }}
        >
          <Grid container direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography>{"You are currently an observer."}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                id="standard-basic"
                variant="standard"
                value={selectedName}
                onChange={(evt) => setSelectedName(evt.target.value)}
                label="Your name"
                style={{ marginTop: -10 }}
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button
                disabled={!selectedName || participantNames.includes(selectedName)}
                variant="outlined"
                color="primary"
                type="submit"
                fullWidth
              >
                Join as voter
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
      {name && (
        <Grid container direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <Typography sx={{ wordBreak: "break-all" }}>
              You are voting as <b>{name}</b>.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <Button onClick={onLeave} variant="outlined" color="secondary" fullWidth>
              Rejoin as observer
            </Button>
          </Grid>
        </Grid>
      )}
    </Card>
  );
}
