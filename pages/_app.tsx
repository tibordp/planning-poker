import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import theme from "../src/theme";

// Emotion uses its default cache on both server and client. The server renders
// the styles inline (so there is no flash of unstyled content), and the client
// re-uses them on hydration — keeping the generated class names identical on
// both sides.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Planning Poker</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <Component {...pageProps} />
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
}
