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
import Alert from "@material-ui/lab/Alert";
import Settings from "@material-ui/icons/Settings";
import Pagination from "@material-ui/lab/Pagination";
import PaginationItem from "@material-ui/lab/PaginationItem";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Link from "@material-ui/core/Link";
import Zoom from "@material-ui/core/Zoom";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { IncognitoIcon } from "./assets/IncognitoIcon";
import { useConfirmationDialog } from "./utils/useConfirmationDialog";

export const useStyles = makeStyles((theme) => ({
  sessionPaper: {
    paddingBottom: theme.spacing(1),
  },
  participantText: {
    wordBreak: "break-all",
  },
  privatePreviewNotice: {
    marginBottom: theme.spacing(2),
  },
}));

export function PaginationPanel({
  pagination,
  privatePreview,
  onNavigate,
  onSettingsClick,
  onNewPage,
  onDeletePage,
  permissions,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const [incognito, setIncognito] = React.useState(false);
  const [couldPaginate, setCouldPaginate] = React.useState(permissions.canPaginate);

  React.useEffect(() => {
    if (!permissions.isActingHost) {
      if (!couldPaginate && permissions.canPaginate) {
        setIncognito(true);
      }
      setCouldPaginate(permissions.canPaginate);
    }
  }, [permissions]);

  const handleChange = (_, value) => {
    onNavigate(!permissions.canPaginate || incognito, value - 1);
  };

  const handleNewPage = () => {
    onNewPage(!permissions.canPaginate || incognito);
  };

  const pageNumber = privatePreview === null ? pagination.pageIndex : privatePreview;

  const [confirmDelete, dialog] = useConfirmationDialog({
    title: "Delete page?",
    description: "Are you sure you want to delete this page",
    confirmText: "Delete page",
    onConfirm: () => onDeletePage(pageNumber),
  });

  return (
    <>
      <Grid
        className={classes.sessionPaper}
        container
        direction="row"
        alignItems="center"
        justifyContent={
          matches &&
          (permissions.canPaginate || permissions.canAddDeletePages || permissions.canEditSettings)
            ? "space-between"
            : "space-around"
        }
        spacing={1}
      >
        {permissions.canPaginate && (
          <Grid item>
            <Tooltip title="Private navigation">
              <ToggleButton
                value="check"
                size="small"
                color="primary"
                selected={incognito}
                onChange={() => setIncognito(!incognito)}
              >
                <IncognitoIcon />
              </ToggleButton>
            </Tooltip>
          </Grid>
        )}
        <Grid item>
          <Pagination
            size="medium"
            shape="rounded"
            page={pageNumber + 1}
            onChange={handleChange}
            count={pagination.pageCount}
            renderItem={(item) => (
              <PaginationItem
                {...item}
                variant={
                  item.type == "page" &&
                  privatePreview !== null &&
                  item.page === pagination.pageIndex + 1
                    ? "outlined"
                    : "text"
                }
              />
            )}
          />
        </Grid>
        {(permissions.canAddDeletePages || permissions.canEditSettings) && (
          <Grid item>
            {permissions.canAddDeletePages && (
              <>
                <Tooltip title="New page">
                  <IconButton onClick={handleNewPage}>
                    <AddBox />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete this page">
                  <IconButton onClick={confirmDelete} disabled={pagination.pageCount <= 1}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {permissions.canEditSettings && (
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
      {privatePreview !== null && (
        <Zoom timeout={{ appear: 0, enter: 200, exit: 0 }} in>
          <Alert className={classes.privatePreviewNotice} severity="info">
            You are privately viewing this page. Click{" "}
            <Link href="javascript:void(0)" onClick={() => onNavigate(true, pagination.pageIndex)}>
              here
            </Link>{" "}
            to return to the active page.
          </Alert>
        </Zoom>
      )}
      {dialog}
    </>
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
  privatePreview: PropTypes.number,
  permissions: PropTypes.object.isRequired,
};
