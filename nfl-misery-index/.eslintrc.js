module.exports = {
  globals: {
    __PATH_PREFIX__: true,
    React: "writable",
  },
  parser: `@typescript-eslint/parser`,
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  extends: [
    "eslint-config-airbnb",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "react-app",
    "prettier/@typescript-eslint",
  ],
  plugins: [
    "@typescript-eslint",
    "prettier",
    "eslint-plugin-import",
    "eslint-plugin-jsx-a11y",
    "eslint-plugin-react-hooks",
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    quotes: "off",
    indent: ["error", 2, { SwitchCase: 1 }],
    "react/jsx-pascal-case": "off",
    "react/react-in-jsx-scope": "off",
    "no-use-before-define": "off",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "react/prop-types": "off",
    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],
    "implicit-arrow-linebreak": "off",
    "object-curly-newline": "off",
    "no-plusplus": "off",
    "operator-linebreak": 0,
    "react/require-default-props": "off",
    "react/jsx-curly-newline": "off",
    "react/jsx-props-no-spreading": "off",
    "function-paren-newline": 0,
  },
};
