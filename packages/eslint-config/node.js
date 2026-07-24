import globals from "globals";

import { typescriptSourceConfig } from "./base.js";

/**
 * Shared ESLint configuration for Node.js workspaces.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nodeConfig = [
  ...typescriptSourceConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
