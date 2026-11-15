import { defineConfig } from "tsup";

// Bundles the app's own source into dist/server.js. npm dependencies stay
// external and are installed on the host.
export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node24",
  outDir: "dist",
  sourcemap: true,
  clean: true,
});
