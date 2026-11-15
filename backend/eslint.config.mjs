import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Layer rules: routes → controllers → services → repositories → database.
const restrict = (patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

export default defineConfig([
  globalIgnores(["dist/**", "src/database/migrations/**"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
    },
  },
  {
    files: ["src/routes/**"],
    rules: restrict([
      { group: ["**/services/**", "**/repositories/**", "**/database", "**/database/**"], message: "Routes bind controllers; they don't call services, repositories or the database." },
    ]),
  },
  {
    files: ["src/controllers/**"],
    rules: restrict([
      { group: ["**/repositories/**", "**/database", "**/database/**", "drizzle-orm", "drizzle-orm/*"], message: "Controllers call services only." },
    ]),
  },
  {
    files: ["src/services/**"],
    rules: restrict([
      { group: ["express", "**/controllers/**", "**/routes/**", "**/database", "**/database/**", "drizzle-orm", "drizzle-orm/*"], message: "Services hold business logic: no HTTP, and data access goes through repositories." },
    ]),
  },
  {
    files: ["src/repositories/**"],
    rules: restrict([
      { group: ["express", "**/controllers/**", "**/routes/**", "**/services/**", "**/exceptions/**"], message: "Repositories only query the database and return data." },
    ]),
  },
  {
    files: ["src/models/**", "src/dtos/**", "src/types/**", "src/utils/**"],
    rules: restrict([
      { group: ["**/services/**", "**/repositories/**", "**/controllers/**", "**/routes/**"], message: "Shared layers must not depend on application layers." },
    ]),
  },
]);
