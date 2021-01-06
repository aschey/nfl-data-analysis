import '../styles/globals.css';
import { ThemeProvider } from 'theme-ui';
import theme from '../theme/theme';
import type { AppProps } from 'next/app';

export const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp;
