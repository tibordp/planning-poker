import { createTheme } from "@mui/material/styles";

// Material-UI v5+ changed several default palette values (semantic colors got
// darker, `background.default` went from #fafafa to #fff, `text.secondary` from
// 0.54 to 0.6 opacity). We pin the original Material-UI v4 defaults so the app
// keeps its previous appearance. `contrastText` is intentionally omitted so MUI
// derives it from `main`, exactly as v4 did. Our custom primary/secondary stay.
const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: { light: "#e57373", main: "#f44336", dark: "#d32f2f" },
    warning: { light: "#ffb74d", main: "#ff9800", dark: "#f57c00" },
    info: { light: "#64b5f6", main: "#2196f3", dark: "#1976d2" },
    success: { light: "#81c784", main: "#4caf50", dark: "#388e3c" },
    background: { default: "#fafafa", paper: "#fff" },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
      disabled: "rgba(0, 0, 0, 0.38)",
    },
  },
  components: {
    // Material-UI v4's Alert (lab) used white text on filled variants. MUI v5+
    // derives it from getContrastText(main), which is dark for the v4 colors
    // (e.g. success #4caf50). Restore white text on filled alerts.
    MuiAlert: {
      styleOverrides: {
        filled: { color: "#fff" },
      },
    },
  },
});

export default theme;
