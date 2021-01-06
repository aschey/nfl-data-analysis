module.exports = {
  globals: {
    __PATH_PREFIX__: true,
  },
  parser: `@typescript-eslint/parser`,
  extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'react-app'],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    quotes: 'off',
    indent: ['error', 2, { SwitchCase: 1 }],
    'react/jsx-pascal-case': 'off',
  },
};
