import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import progress from "vite-plugin-progress";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), progress()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    base: env.VITE_BASE_URL,
  };
});
