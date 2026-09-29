import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// `base: "./"` genera rutas relativas: el build funciona en la raíz de un dominio
// y también en un subpath (por ejemplo GitHub Pages: usuario.github.io/repo).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@emotion/react", "@emotion/styled"],
          charts: ["chart.js", "react-chartjs-2"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
  },
});
