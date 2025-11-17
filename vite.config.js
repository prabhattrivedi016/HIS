import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react"; // if using React
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // custom port
    open: true, // open browser on server start
  },
});
