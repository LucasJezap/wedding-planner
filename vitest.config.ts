import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "features/**/*.test.ts",
      "features/**/*.test.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "services/**/*.ts",
        "features/**/hooks/**/*.ts",
        "features/**/types/**/*.ts",
        "lib/format.ts",
        "lib/utils.ts",
      ],
      exclude: [
        "app/**",
        "components/**",
        "db/**",
        "e2e/**",
        "lib/api-client.ts",
        "lib/auth.ts",
        "lib/planner-domain.ts",
        "lib/planner-seed.ts",
        "lib/require-auth.ts",
        "scripts/**",
        "server/**",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
