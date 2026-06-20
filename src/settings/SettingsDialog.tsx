import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CloudUpload from "@mui/icons-material/CloudUpload";
import { useDropzone } from "react-dropzone";
import { scorePresets, defaultSettings } from "../sessionDefaults";
import { ScoreSetSelector } from "./ScoreSetSelector";
import type { ImportedSessionData, Settings } from "../types";

function minimizePreferences(settings: Settings): Partial<Settings> {
  const result: Record<string, unknown> = {};
  (Object.keys(defaultSettings) as (keyof Settings)[]).forEach((key) => {
    if (JSON.stringify(defaultSettings[key]) !== JSON.stringify(settings[key])) {
      result[key] = settings[key];
    }
  });
  return result;
}

interface SettingsDialogProps {
  open: boolean;
  onSave: (settings: Settings) => void;
  onCancel: () => void;
  onImport: (sessionData: ImportedSessionData) => void;
  settings: Settings;
  sessionName: string;
}

export function SettingsDialog({
  open,
  onSave,
  onCancel,
  onImport,
  settings,
  sessionName,
}: SettingsDialogProps) {
  const [scoreSet, setScoreSet] = React.useState(scorePresets[0].scores);
  const [allowParticipantControl, setAllowParticipantControl] = React.useState(
    settings.allowParticipantControl,
  );
  const [allowOpenVoting, setAllowOpenVoting] = React.useState(settings.allowOpenVoting);
  const [allowParticipantPagination, setAllowParticipantPagination] = React.useState(
    settings.allowParticipantPagination,
  );
  const [allowParticipantAddDelete, setAllowParticipantAddDelete] = React.useState(
    settings.allowParticipantAddDelete,
  );
  const [showTimer, setShowTimer] = React.useState(settings.showTimer);

  React.useEffect(() => {
    if (open) {
      setScoreSet(settings.scoreSet);
      setAllowParticipantControl(settings.allowParticipantControl);
      setAllowParticipantPagination(settings.allowParticipantPagination);
      setAllowParticipantAddDelete(settings.allowParticipantAddDelete);
      setAllowOpenVoting(settings.allowOpenVoting);
      setShowTimer(settings.showTimer);
    }
  }, [open]);

  const updatedSettings: Settings = {
    ...settings,
    scoreSet: scoreSet,
    allowParticipantControl: allowParticipantControl,
    allowParticipantPagination: allowParticipantPagination,
    allowParticipantAddDelete: allowParticipantAddDelete,
    allowOpenVoting: allowOpenVoting,
    showTimer: showTimer,
  };
  const minimizedSettings = minimizePreferences(updatedSettings);
  const bookmarklet = `/new?settings=${encodeURIComponent(JSON.stringify(minimizedSettings))}`;

  const exportPages = () => {
    window.open(`/api/sessions/${encodeURIComponent(sessionName)}/export`);
  };

  const handleUpload = (files: File[]) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      onImport(JSON.parse(event.target?.result as string));
    };
    reader.readAsText(files[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: handleUpload,
  });

  const formValid = scoreSet.length >= 2;

  return (
    <Dialog maxWidth="xs" open={open} onClose={onCancel}>
      <DialogTitle>Session settings</DialogTitle>
      <DialogContent>
        <ScoreSetSelector scoreSet={scoreSet} onSetScoreSet={setScoreSet} />
        <FormControlLabel
          style={{ marginTop: 10 }}
          control={
            <Switch
              checked={allowParticipantControl}
              onChange={() => setAllowParticipantControl(!allowParticipantControl)}
            />
          }
          label="Allow everyone to show/hide/clear votes"
        />
        <FormControlLabel
          control={
            <Switch
              checked={allowParticipantPagination}
              onChange={() => setAllowParticipantPagination(!allowParticipantPagination)}
            />
          }
          label="Allow everyone to switch pages for all participants"
        />
        <FormControlLabel
          control={
            <Switch
              checked={allowParticipantAddDelete}
              onChange={() => setAllowParticipantAddDelete(!allowParticipantAddDelete)}
            />
          }
          label="Allow everyone to create and delete pages"
        />
        <FormControlLabel
          control={
            <Switch
              checked={allowOpenVoting}
              onChange={() => setAllowOpenVoting(!allowOpenVoting)}
            />
          }
          label="Allow voting while scores are visible"
        />
        <FormControlLabel
          control={<Switch checked={showTimer} onChange={() => setShowTimer(!showTimer)} />}
          label="Show timer"
        />
        {formValid && (
          <p>
            Bookmarklet for creating new sessions with these settings:{" "}
            <Link href={bookmarklet} title="New Planning Poker session" target="_blank">
              New Planning Poker session
            </Link>
          </p>
        )}
      </DialogContent>

      <Box sx={{ p: 2 }}>
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "divider",
            borderRadius: 1,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            color: "text.secondary",
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload fontSize="large" />
          <Typography>Import exported session</Typography>
        </Box>
      </Box>
      <DialogActions>
        <Button autoFocus onClick={exportPages} color="primary">
          Export session
        </Button>
        <Box sx={{ flex: "1 0 0" }} />
        <Button autoFocus onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button
          disabled={!formValid}
          onClick={() => onSave(updatedSettings)}
          color="primary"
          autoFocus
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
