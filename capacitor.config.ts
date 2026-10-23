import type { CapacitorConfig } from "@capacitor/cli";

// The Android app bundles the same build that GitHub Pages serves (docs/), so web and app never diverge.
const config: CapacitorConfig = {
    // The store identity: it cannot change once the app is published.
    appId: "io.github.joaommmelo.faisca",
    appName: "Faísca",
    webDir: "docs",
    plugins: {
        SystemBars: {
            insetsHandling: "css",
            initialViewportFitValueHint: "cover",
            // Faísca has no dark theme: the status bar icons stay dark on the cream background, also in dark mode.
            style: "LIGHT"
        }
    }
};

export default config;
