import js from "@eslint/js"
import globals from "globals"

export default [js.configs.recommended, {
  files: ["**/*.{js,jsx}"],
  ignores: ["dist/**", "node_modules/**", "**/*.test.js"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021
    },
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
      sourceType: "module"
    }
  },
  rules: {
    "no-unused-vars": "off",
    "no-undef": "off"
  }
}]
