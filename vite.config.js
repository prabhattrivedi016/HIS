import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // if using React
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // custom port
    open: true, // open browser on server start
  },
});
