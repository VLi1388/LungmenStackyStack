import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: "esnext",
    outDir: "dist",
  },
  // Havok ships a WASM module; keep it out of dependency pre-bundling.
  optimizeDeps: {
    exclude: ["@babylonjs/havok"],
  },
});
