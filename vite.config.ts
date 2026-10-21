import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    // Relative base so the same build works on Netlify (root) and GitHub Pages (/<repo>/).
    base: "./",
    plugins: [react()],
    test: {
        include: ["src/**/*.test.ts"]
    }
});
