import { Capacitor } from "@capacitor/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/nunito";
import "./index.css";
import { App } from "./App.tsx";

// Only the production build has a sw.js; in development every reload must hit the dev server. The Android app carries
// its files inside it, so it works offline without one.
if (import.meta.env.PROD && !Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch((error: unknown) => console.warn("Faísca: could not register the service worker.", error));
    });
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
