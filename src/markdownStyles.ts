import type { CSSObject, Theme } from "@mui/material/styles";

/** Shared styling for rendered markdown, used by Description and the report page. */
export const mdStyles = (theme: Theme): CSSObject => ({
  "& img": {
    verticalAlign: "sub",
  },
  "& code": {
    fontFamily: "Roboto Mono",
  },
  "& pre": {
    backgroundColor: theme.palette.background.default,
    borderWidth: 1,
    borderColor: theme.palette.divider,
    borderStyle: "solid",
    borderRadius: 4,
    padding: theme.spacing(1),
    overflow: "auto",
  },
  "& blockquote": {
    borderLeft: "2px solid",
    marginLeft: 0,
    paddingLeft: theme.spacing(1),
    borderColor: theme.palette.secondary.light,
  },
  "& table": {
    width: "max-content",
    maxWidth: "100%",
    overflow: "auto",
    borderSpacing: 0,
    borderCollapse: "collapse",
  },
  "& table tr": {
    borderTop: "1px solid #c6cbd1",
  },
  "& table tr td, & table tr th": {
    padding: "6px 13px",
    border: "1px solid #dfe2e5",
  },
  "& table th": {
    fontWeight: 600,
  },
  fontSize: 14,
  // Don't inherit the input's tighter line-height.
  lineHeight: 1.5,
  color: theme.palette.text.primary,
});
