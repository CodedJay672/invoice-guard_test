import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["apps/*", "../apps/*", "../../apps/*"],
              message: "Apps must not be imported directly across workspace boundaries.",
            },
          ],
        },
      ],
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: [
      "dist/**",
      ".next/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "node_modules/**",
      "**/node_modules/**",
    ],
  },
];

/**
 * TypeScript-only shared rules for packages that do not contain source yet.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const typescriptSourceConfig = [
  ...config,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
        },
      ],
    },
  },
];
