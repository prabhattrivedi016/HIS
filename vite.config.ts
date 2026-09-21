import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: "/GWSNHIS",

  plugins: [react(), tailwindcss()],

  optimizeDeps: {
    exclude: ["react-toastify"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 5173,
    open: true,
    proxy: {
      "/snowstorm": {
        target: "https://snowstorm.ihtsdotools.org",
        changeOrigin: true,
        secure: false,
      },
      "/HISWEBAPI": {
        target: "http://103.217.247.236",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,

    rollupOptions: {
      output: {
        assetFileNames: "assets/RoleIcon/[name]-[hash][extname]",
        chunkFileNames: "assets/RoleIcon/[name]-[hash].js",
        entryFileNames: "assets/RoleIcon/[name]-[hash].js",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("pdfmake")) {
              return "vendor-pdfmake";
            }
            if (id.includes("html2canvas")) {
              return "vendor-html2canvas";
            }
            if (id.includes("xlsx")) {
              return "vendor-xlsx";
            }
            if (
              id.includes("react/") ||
              id.includes("react-dom/") ||
              id.includes("react-router") ||
              id.includes("@remix-run")
            ) {
              return "vendor-react";
            }
          }
        },
      },
    },
  },

  esbuild:
    mode === "production"
      ? {
          drop: ["console", "debugger"],
        }
      : {},
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
}));
