import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/test/**",
        // Fichiers Three.js / immersive — non testables en jsdom
        "src/pages/ChapterPage/immersive/**",
        // Re-exports et types seuls
        "**/index.ts",
        "**/*.types.ts",
        "src/pages/CourseCatalogPage/types.ts",
        "src/pages/CourseCatalogPage/courses.data.ts",
        // Layouts simples sans logique
        "src/layouts/**",
        "src/shared/layout/**",
        // Pages statiques sans logique métier
        "src/pages/NotFoundPage.tsx",
        "src/pages/LandingPage.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
