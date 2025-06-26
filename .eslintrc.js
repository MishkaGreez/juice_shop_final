/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  env: {
    browser: true,
    node: true,
    jasmine: true,
    mocha: true,
    jest: true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  ignorePatterns: [
    ".eslintrc.js",
    "app/private/**",
    "vagrant/**",
    "frontend/**",
    "data/static/codefixes/**",
    "dist/**",
  ],
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      extends: ["standard-with-typescript"],
      rules: {
        "no-void": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
    },
    {
      files: ["**/*.js"],
      excludedFiles: ["**/*.ts"],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
      extends: ["standard"], // Без TypeScript!
      rules: {
        // Здесь можно добавлять JS-специфические правила
      },
    },
  ],
};
