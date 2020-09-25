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
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AddBox from "@material-ui/icons/AddBox";
import Delete from "@material-ui/icons/Delete";
import Settings from "@material-ui/icons/Settings";
import Pagination from "@material-ui/lab/Pagination";
import useMediaQuery from "@material-ui/core/useMediaQuery";

export const useStyles = makeStyles((theme) => ({
  sessionPaper: {
    paddingBottom: theme.spacing(1),
  },
  participantText: {
    wordBreak: "break-all",
  },
}));

export function PaginationPanel({
  pagination,
  onNavigate,
  onSettingsClick,
  onNewPage,
  onDeletePage,
  settingsEnabled,
  paginationEnabled,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const handleChange = (event, value) => {
    onNavigate(value - 1);
  };

  return (
    <Grid
      className={classes.sessionPaper}
      container
      direction="row"
      alignItems="center"
      justify={matches && (paginationEnabled || settingsEnabled) ? "space-between" : "space-around"}
      spacing={1}
    >
      <Grid item>
        <Pagination
          size="medium"
          shape="rounded"
          page={pagination.pageIndex + 1}
          onChange={handleChange}
          count={pagination.pageCount}
          disabled={!paginationEnabled}
        />
      </Grid>
      {(paginationEnabled || settingsEnabled) && (
        <Grid item>
          {paginationEnabled && (
            <>
              <Tooltip title="New page">
                <IconButton onClick={onNewPage}>
                  <AddBox />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete this page">
                <IconButton onClick={onDeletePage} disabled={pagination.pageCount <= 1}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          )}
          {settingsEnabled && (
            <>
              <Tooltip title="Session settings">
                <IconButton onClick={onSettingsClick}>
                  <Settings />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Grid>
      )}
    </Grid>
  );
}

PaginationPanel.propTypes = {
  name: PropTypes.string,
  pagination: PropTypes.shape({ pageIndex: PropTypes.number, pageCount: PropTypes.number })
    .isRequired,
  onNavigate: PropTypes.func.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
  onNewPage: PropTypes.func.isRequired,
  onDeletePage: PropTypes.func.isRequired,
  settingsEnabled: PropTypes.bool,
  paginationEnabled: PropTypes.bool,
};
