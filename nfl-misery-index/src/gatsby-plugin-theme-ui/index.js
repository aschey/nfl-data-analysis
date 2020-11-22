import { setOpacity } from '../util/util';

const textColor = 'rgba(193,193,199,1)';

export default {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  breakpoints: ['40em', '70em'],
  colors: {
    text: textColor,
    background: 'rgba(30,35,46,1)',
    primary: 'rgba(53,170,196,1)',
    secondary: 'rgba(23,27,36,1)',
    muted: 'rgba(246,246,246,1)',
    selected: 'rgba(54,63,84,1)',
    hover: 'rgba(36,42,56,1)',
    highlightPositive: 'rgba(50,168,142,1)',
    highlightNegative: 'rgba(168,99,50,1)',
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    h1: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 5,
    },
    h2: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 4,
    },
    h3: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 3,
    },
    h4: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 2,
    },
    h5: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 1,
    },
    h6: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 0,
    },
    p: {
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
    },
    a: {
      color: 'primary',
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      borderRadius: 5,
      borderColor: 'white',
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
      borderWidth: 1,
      borderColor: setOpacity(textColor, 0.2),
      position: 'sticky',
      top: 0,
      backgroundColor: 'background'
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
      borderWidth: 1,
      borderColor: setOpacity(textColor, 0.2),
      padding: 2,
    },
    img: {
      maxWidth: '100%',
    },
  },
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)',
    },
  },
};
