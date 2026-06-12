import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
const root = path.resolve(__dirname);
export default defineConfig({
  root,
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: [path.resolve(root, "src/test/setup.ts")] },
  resolve: { alias: { "@": path.resolve(root, "src") } },
});
