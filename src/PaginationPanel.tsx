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
import * as React from "react";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import AddBox from "@mui/icons-material/AddBox";
import Delete from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import Settings from "@mui/icons-material/Settings";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "@mui/material/Link";
import Zoom from "@mui/material/Zoom";
import ToggleButton from "@mui/material/ToggleButton";
import { IncognitoIcon } from "./assets/IncognitoIcon";
import { useConfirmationDialog } from "./utils/useConfirmationDialog";
import type { Permissions } from "./types";

interface PaginationPanelProps {
  pagination: { pageIndex: number; pageCount: number };
  privatePreview: number | null;
  onNavigate: (incognito: boolean, index: number) => void;
  onSettingsClick: () => void;
  onNewPage: (incognito: boolean) => void;
  onDeletePage: (index: number) => void;
  permissions: Permissions;
}

export function PaginationPanel({
  pagination,
  privatePreview,
  onNavigate,
  onSettingsClick,
  onNewPage,
  onDeletePage,
  permissions,
}: PaginationPanelProps) {
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

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
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
        container
        direction="row"
        spacing={1}
        sx={{
          pb: 1,
          alignItems: "center",
          justifyContent:
            matches &&
            (permissions.canPaginate ||
              permissions.canAddDeletePages ||
              permissions.canEditSettings)
              ? "space-between"
              : "space-around",
        }}
      >
        {permissions.canPaginate && (
          <Grid>
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
        <Grid>
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
          <Grid>
            {permissions.canAddDeletePages && (
              <>
                <Tooltip title="New page">
                  <IconButton onClick={handleNewPage}>
                    <AddBox />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete this page">
                  {/* span wrapper so the Tooltip works even when the button is disabled */}
                  <span>
                    <IconButton onClick={confirmDelete} disabled={pagination.pageCount <= 1}>
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
            {permissions.canEditSettings && (
              <Tooltip title="Session settings">
                <IconButton onClick={onSettingsClick}>
                  <Settings />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        )}
      </Grid>
      {privatePreview !== null && (
        <Zoom timeout={{ appear: 0, enter: 200, exit: 0 }} in>
          <Alert sx={{ mb: 2 }} severity="info">
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
