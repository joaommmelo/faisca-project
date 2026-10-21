import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

// Writes sw.js with the exact list of built and public files, so the installed app works offline from the
// first visit. The cache version changes whenever any file does, which makes the browser install the update.
function serviceWorker(): Plugin {
    return {
        name: "faisca-service-worker",
        apply: "build",
        generateBundle(_options, bundle) {
            const publicFiles: string[] = readdirSync("public", { recursive: true, withFileTypes: true })
                .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
                .map((entry) => `${entry.parentPath.replace(/^public\/?/, "")}/${entry.name}`.replace(/^\//, ""));
            const files: string[] = [...Object.keys(bundle), ...publicFiles].sort();
            const version: string = createHash("sha256")
                .update(files.join("\n"))
                .update(publicFiles.map((file) => readFileSync(`public/${file}`)).join(""))
                .digest("hex")
                .slice(0, 12);
            const source: string = readFileSync("pwa/service-worker.js", "utf8")
                .replace("__CACHE_VERSION__", version)
                .replace("__PRECACHE_URLS__", JSON.stringify(["./", ...files.map((file) => `./${file}`)], null, 4));
            this.emitFile({ type: "asset", fileName: "sw.js", source });
        }
    };
}

export default defineConfig({
    // Relative base so the same build works on Netlify (root) and GitHub Pages (/<repo>/).
    base: "./",
    // GitHub Pages serves the committed build from the docs/ folder of the branch ("Deploy from a branch").
    build: {
        outDir: "docs",
        emptyOutDir: true
    },
    plugins: [react(), serviceWorker()],
    test: {
        include: ["src/**/*.test.ts"]
    }
});
