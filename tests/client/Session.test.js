import React from "react";
import renderer from "react-test-renderer";
import { Session } from "../../src/Session";
import { ThemeProvider } from "@material-ui/core";
import theme from "../../src/theme";
import { config } from "react-transition-group";
import * as remoteState from "./remoteState";

test.each([
  remoteState.remoteStateAsHost,
  remoteState.remoteStateAsObserver,
  remoteState.remoteStateAsVoter,
  remoteState.remoteStateAsVoterNoControl,
  remoteState.remoteStateVotesVisible,
])("renders Session unchanged %p", (state) => {
  config.disabled = true;

  const tree = renderer
    .create(
      <ThemeProvider theme={theme}>
        <Session remoteState={state} dispatch={jest.fn()} />
      </ThemeProvider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
