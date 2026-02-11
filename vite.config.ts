import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: "/GWSNHIS",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,

    rollupOptions: {
      output: {
        assetFileNames: "assets/RoleIcon/[name][extname]",
        chunkFileNames: "assets/RoleIcon/[name].js",
        entryFileNames: "assets/RoleIcon/[name].js",
      },
    },
  },

  esbuild:
    mode === "production"
      ? {
          drop: ["console", "debugger"],
        }
      : {},
}));
