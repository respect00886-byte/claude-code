/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    // jsdom の Blob は IndexedDB に保存できないため、node の Blob を使う
    environment: "node",
    setupFiles: ["fake-indexeddb/auto"],
  },
});
