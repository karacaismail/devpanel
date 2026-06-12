/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  /* GitHub Pages: GHPAGES=1 vite build → /devpanel/ alt yolu */
  base: process.env.GHPAGES ? "/devpanel/" : "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: [
            "@tanstack/react-table",
            "@tanstack/react-query",
            "@phosphor-icons/react",
            "zustand",
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
