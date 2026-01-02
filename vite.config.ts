import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    open: true,
  },

  esbuild:
    mode === "production"
      ? {
          drop: ["console", "debugger"],
        }
      : {},
}));
