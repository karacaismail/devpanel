import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Test yapılandırması vitest.config.ts'tedir (çift config çakışmasını önlemek için ayrık).
export default defineConfig({
  base: process.env.GHPAGES ? "/devpanel/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
