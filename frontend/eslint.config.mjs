import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Module boundaries (see docs/architecture/frontend-architecture.md):
// app → modules → shared. Other modules are imported only through their
// public entry points: `@/modules/<name>` (UI, types) or
// `@/modules/<name>/server` (server-only data access).
const deepModuleImport = {
  regex: "^@/modules/[^/]+/(?!server$).+",
  message: "Import other modules through @/modules/<name> or @/modules/<name>/server.",
};
const axiosOutsideShared = {
  group: ["axios"],
  message: "Use the Axios clients in @/shared/api from a module's api/ service.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/shared/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [deepModuleImport, axiosOutsideShared] },
      ],
    },
  },
  {
    // Only `home` composes other modules; feature modules stay independent.
    files: ["src/modules/!(home)/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            deepModuleImport,
            axiosOutsideShared,
            { regex: "^@/modules/", message: "Feature modules must not import other modules." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { regex: "^@/(modules|app)(/|$)", message: "shared/ must not depend on modules or routes." },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
