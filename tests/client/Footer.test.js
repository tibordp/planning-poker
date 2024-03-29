import React from "react";
import renderer from "react-test-renderer";
import Footer from "../../src/Footer";
import { ThemeProvider } from "@material-ui/core";
import theme from "../../src/theme";
import { config } from "react-transition-group";
import * as remoteState from "./remoteState";
import { SnackbarProvider } from "notistack";

beforeEach(() => {
  jest.useFakeTimers("legacy");
});

test.each([
  remoteState.remoteStateAsHost,
  remoteState.remoteStateAsVoterNoControl,
  remoteState.remoteStateNoTimer,
])("renders Footer unchanged %p", (state) => {
  config.disabled = true;
  const constantDate = new Date("2020-06-23T22:31:09.727Z");
  global.Date = class extends Date {
    constructor(...args) {
      super(...args);
      if (!args.length) {
        return constantDate;
      }
    }
  };

  const tree = renderer
    .create(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <Footer remoteState={state} dispatch={jest.fn()} />
        </SnackbarProvider>
      </ThemeProvider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
