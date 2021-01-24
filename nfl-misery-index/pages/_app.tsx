import "../styles/globals.css";
import { ThemeProvider } from "theme-ui";
import type { AppProps } from "next/app";
import theme from "../theme/theme";

export const MyApp = ({
  Component,
  pageProps,
}: AppProps): React.ReactElement => (
  <ThemeProvider theme={theme}>
    <Component {...pageProps} />
  </ThemeProvider>
);

export default MyApp;
