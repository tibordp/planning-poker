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
