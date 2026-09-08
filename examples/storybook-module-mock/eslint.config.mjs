/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import eslintPluginStorybook from "eslint-plugin-storybook";
import tslint from "typescript-eslint";

export default tslint.config(
  {
    extends: [eslint.configs.recommended, ...tslint.configs.recommended],
    plugins: { import: importPlugin },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "typescript-eslint": tslint.plugin,
      import: importPlugin,
      "eslint-plugin-storybook": eslintPluginStorybook,
    },
    languageOptions: {
      parserOptions: {
        parser: tslint.parser,
        sourceType: "module",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": 0,
      "@typescript-eslint/no-unused-vars": 0,
      "no-empty-pattern": 0,
      "no-empty": 0,
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "object",
            "type",
            "index",
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  eslintConfigPrettier
);
