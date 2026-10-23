import { App as NativeApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { BackUtils, type BackEntry, type BackLayer } from "../utils/back/utils.ts";

// Faísca changes screens without the browser's history, so in the Android app the back gesture would close it in
// the middle of a game. Each screen and sheet says here what back does while it is open.
let entries: BackEntry[] = [];

if (Capacitor.isNativePlatform()) {
    void NativeApp.addListener("backButton", () => {
        const answering: BackEntry | null = BackUtils.getAnswering(entries);
        if (answering === null) {
            // Android's own back on a first screen: the app goes to the background and opens where it was.
            void NativeApp.minimizeApp();
            return;
        }
        answering.onBack();
    });
}

// null: nothing to do at this layer on this screen.
export function useBackButton(layer: BackLayer, onBack: (() => void) | null): void {
    const onBackRef = useRef<(() => void) | null>(onBack);
    const isListening: boolean = onBack !== null;

    useEffect(() => {
        onBackRef.current = onBack;
    });

    useEffect(() => {
        if (!isListening) {
            return;
        }
        const entry: BackEntry = {
            layer,
            onBack: () => {
                if (onBackRef.current !== null) {
                    onBackRef.current();
                }
            }
        };
        entries = [...entries, entry];
        return () => {
            entries = entries.filter((candidate) => candidate !== entry);
        };
    }, [layer, isListening]);
}
