import * as React from "react";
import { render } from "@testing-library/react";
import { Session } from "../../src/Session";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../src/theme";
import { config } from "react-transition-group";
import * as remoteState from "./remoteState";
import { SnackbarProvider } from "notistack";

test.each([
  remoteState.remoteStateAsHost,
  remoteState.remoteStateAsObserver,
  remoteState.remoteStateAsVoter,
  remoteState.remoteStateAsVoterNoControl,
  remoteState.remoteStateVotesVisible,
  remoteState.remoteStateWithPrivatePagination,
])("renders Session unchanged %p", (state) => {
  config.disabled = true;

  const { asFragment } = render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <Session remoteState={state} dispatch={jest.fn()} sessionName="session" />
      </SnackbarProvider>
    </ThemeProvider>,
  );
  expect(asFragment()).toMatchSnapshot();
});
