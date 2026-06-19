import * as React from "react";
import { render } from "@testing-library/react";
import Footer from "../../src/Footer";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../src/theme";
import { config } from "react-transition-group";
import * as remoteState from "./remoteState";
import { SnackbarProvider } from "notistack";

jest.mock("next/router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), prefetch: jest.fn() }),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2020-06-23T22:31:09.727Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

test.each([
  remoteState.remoteStateAsHost,
  remoteState.remoteStateAsVoterNoControl,
  remoteState.remoteStateNoTimer,
])("renders Footer unchanged %p", (state) => {
  config.disabled = true;

  const { asFragment } = render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <Footer remoteState={state} dispatch={jest.fn()} />
      </SnackbarProvider>
    </ThemeProvider>
  );
  expect(asFragment()).toMatchSnapshot();
});
