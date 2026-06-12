import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.tsx"],
  },
  resolve: {
    alias: {
      "next/link": path.resolve(__dirname, "src/test/next-stubs.tsx"),
      "next/navigation": path.resolve(__dirname, "src/test/next-stubs.tsx"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
