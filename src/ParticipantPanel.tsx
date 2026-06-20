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
