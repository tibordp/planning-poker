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
import SvgIcon from "@material-ui/core/SvgIcon";

export function IncognitoIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        fill="currentColor"
        d="M17.06 13C15.2 13 13.64 14.33 13.24 16.1C12.29 15.69 11.42 15.8 10.76 16.09C10.35 14.31 8.79 13 6.94 13C4.77 13 3 14.79 3 17C3 19.21 4.77 21 6.94 21C9 21 10.68 19.38 10.84 17.32C11.18 17.08 12.07 16.63 13.16 17.34C13.34 19.39 15 21 17.06 21C19.23 21 21 19.21 21 17C21 14.79 19.23 13 17.06 13M6.94 19.86C5.38 19.86 4.13 18.58 4.13 17S5.39 14.14 6.94 14.14C8.5 14.14 9.75 15.42 9.75 17S8.5 19.86 6.94 19.86M17.06 19.86C15.5 19.86 14.25 18.58 14.25 17S15.5 14.14 17.06 14.14C18.62 14.14 19.88 15.42 19.88 17S18.61 19.86 17.06 19.86M22 10.5H2V12H22V10.5M15.53 2.63C15.31 2.14 14.75 1.88 14.22 2.05L12 2.79L9.77 2.05L9.72 2.04C9.19 1.89 8.63 2.17 8.43 2.68L6 9H18L15.56 2.68L15.53 2.63Z"
      />
    </SvgIcon>
  );
}

export function IncognitoOffIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        fill="currentColor"
        d="M22.11 21.46L2.39 1.73L1.11 3L6.31 8.2L6 9H7.11L8.61 10.5H2V12H10.11L13.5 15.37C13.38 15.61 13.3 15.85 13.24 16.1C12.29 15.69 11.41 15.8 10.76 16.09C10.35 14.31 8.79 13 6.94 13C4.77 13 3 14.79 3 17C3 19.21 4.77 21 6.94 21C9 21 10.68 19.38 10.84 17.32C11.18 17.08 12.07 16.63 13.16 17.34C13.34 19.39 15 21 17.06 21C17.66 21 18.22 20.86 18.72 20.61L20.84 22.73L22.11 21.46M6.94 19.86C5.38 19.86 4.13 18.58 4.13 17C4.13 15.42 5.39 14.14 6.94 14.14C8.5 14.14 9.75 15.42 9.75 17C9.75 18.58 8.5 19.86 6.94 19.86M17.06 19.86C15.5 19.86 14.25 18.58 14.25 17C14.25 16.74 14.29 16.5 14.36 16.25L17.84 19.73C17.59 19.81 17.34 19.86 17.06 19.86M22 12H15.2L13.7 10.5H22V12M17.06 13C19.23 13 21 14.79 21 17C21 17.25 20.97 17.5 20.93 17.73L19.84 16.64C19.68 15.34 18.66 14.32 17.38 14.17L16.29 13.09C16.54 13.03 16.8 13 17.06 13M12.2 9L7.72 4.5L8.43 2.68C8.63 2.17 9.19 1.89 9.72 2.04L9.77 2.05L12 2.79L14.22 2.05C14.75 1.88 15.32 2.14 15.54 2.63L15.56 2.68L18 9H12.2Z"
      />
    </SvgIcon>
  );
}
