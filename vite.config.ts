// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// -----------------------------------------------------------------------------
// Vite configuration
// -----------------------------------------------------------------------------
export default defineConfig(({ mode }) => ({
  // ---------------------------------------------------------------------------
  // Dev-server settings
  // ---------------------------------------------------------------------------
  server: {
    host: "::",
    port: 8080,
  },

  // ---------------------------------------------------------------------------
  // Plug-ins
  // ---------------------------------------------------------------------------
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  // ---------------------------------------------------------------------------
  // Path aliases
  // ---------------------------------------------------------------------------
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
}));
