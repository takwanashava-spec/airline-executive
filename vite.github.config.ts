import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "airline-executive";
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? `/${repositoryName}/` : "/";

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  define: {
    "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify(basePath === "/" ? "" : basePath.slice(0, -1)),
  },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
