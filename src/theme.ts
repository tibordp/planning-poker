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
