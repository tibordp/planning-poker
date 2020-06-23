import React from "react";
import renderer from "react-test-renderer";
import Footer from "../../src/Footer";
import { ThemeProvider } from "@material-ui/core";
import theme from "../../src/theme";
import { config } from "react-transition-group";
import * as remoteState from "./remoteState";

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
        <Footer remoteState={state} dispatch={jest.fn()} />
      </ThemeProvider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
