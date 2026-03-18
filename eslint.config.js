import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript support
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },

  //  React + General Rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, //fixes HTMLInputElement, window, document, etc.
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      //  React
      "react/react-in-jsx-scope": "off",

      //  Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      //  General
      "no-unused-vars": "warn",

      //  Optional (good practice)
      "no-console": "warn",
    },
  },

  //  Ignore folders
  {
    ignores: ["node_modules", "dist", "build"],
  },
];
