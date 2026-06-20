import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import { readRuntimeConfig } from "../src/config";
import theme from "../src/theme";

interface MyDocumentProps extends DocumentInitialProps {
  runtimeConfig: string;
}

export default function MyDocument({ runtimeConfig }: MyDocumentProps) {
  return (
    <Html lang="en">
      <Head>
        {/* PWA primary color */}
        <meta name="theme-color" content={theme.palette.primary.main} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono&display=swap"
        />
      </Head>
      <body>
        {/* Runtime configuration injected at request time (see src/config.ts). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PP_CONFIG=${runtimeConfig}`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext): Promise<MyDocumentProps> => {
  const initialProps = await Document.getInitialProps(ctx);
  return {
    ...initialProps,
    runtimeConfig: JSON.stringify(readRuntimeConfig()),
  };
};
