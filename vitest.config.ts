import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/node_modules/**", ".next/**", "supabase/functions/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["app/actions/**", "lib/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
