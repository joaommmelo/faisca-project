import { Capacitor } from "@capacitor/core";
import { useSyncExternalStore } from "react";
import { InstallUtils, type InstallMethod } from "../utils/install/utils.ts";

// Chromium's install dialog; lib.dom does not describe it.
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
}

interface InstallState {
    promptEvent: BeforeInstallPromptEvent | null;
    isInstalled: boolean;
}

export interface InstallPrompt {
    method: InstallMethod;
    install: () => void;
}

// The browser offers its dialog once, at a moment of its choosing (often mid-session), so the offer is kept here
// rather than in a screen that may not be on view.
let installState: InstallState = { promptEvent: null, isInstalled: false };
const listeners: Set<() => void> = new Set();

const setInstallState = (next: InstallState): void => {
    installState = next;
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

window.addEventListener("beforeinstallprompt", (event) => {
    // Faísca makes its own suggestion; the browser's banner would only repeat it.
    event.preventDefault();
    setInstallState({ ...installState, promptEvent: event as BeforeInstallPromptEvent });
});

window.addEventListener("appinstalled", () => setInstallState({ promptEvent: null, isInstalled: true }));

// navigator.standalone is how iOS says the page was opened from the home screen. The app from the store is installed
// already.
const isStandalone: boolean =
    Capacitor.isNativePlatform() ||
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true);

export function useInstallPrompt(): InstallPrompt {
    const { promptEvent, isInstalled } = useSyncExternalStore(subscribe, () => installState);

    const method: InstallMethod = InstallUtils.getMethod({
        isStandalone,
        isInstalled,
        canPrompt: promptEvent !== null,
        userAgent: navigator.userAgent,
        maxTouchPoints: navigator.maxTouchPoints
    });

    const install = (): void => {
        if (promptEvent === null) {
            return;
        }
        void promptEvent.prompt();
        // Each offer opens the dialog only once; after a refusal the browser makes a new offer later.
        setInstallState({ ...installState, promptEvent: null });
    };

    return { method, install };
}
