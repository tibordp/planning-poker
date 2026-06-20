import * as React from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import FileCopyOutlined from "@mui/icons-material/FileCopyOutlined";
import Tooltip from "@mui/material/Tooltip";

export interface Origin {
  protocol: string;
  host: string;
}

interface SessionUrlProps {
  origin: Origin;
  sessionName: string;
}

export function SessionUrl({ origin, sessionName }: SessionUrlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onClick = () => {
    inputRef.current?.select();
    document.execCommand("copy");
  };

  // Cannot determine hostname easily in SSR context.
  const sessionUrl = `${origin.protocol}//${origin.host}/${encodeURIComponent(sessionName)}`;

  return (
    <TextField
      fullWidth
      value={sessionUrl}
      variant="outlined"
      label="Invite link"
      inputRef={inputRef}
      sx={{ mt: 4, mb: 2 }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Copy to clipboard">
                <IconButton onClick={onClick}>
                  <FileCopyOutlined />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
