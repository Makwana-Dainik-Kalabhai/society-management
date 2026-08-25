import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          ui: ["lucide-react", "recharts"],
        },
      },
    },
  },
  // Environment variables that will be exposed to the client
  define: {
    "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
    "process.env.VITE_SOCKET_URL": JSON.stringify(process.env.VITE_SOCKET_URL),
  },
});
