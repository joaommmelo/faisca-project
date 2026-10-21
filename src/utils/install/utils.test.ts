import { describe, expect, it } from "vitest";
import { InstallUtils, type InstallContext } from "./utils.ts";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const IPAD_AS_MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const createContext = (overrides: Partial<InstallContext>): InstallContext => ({
    isStandalone: false,
    isInstalled: false,
    canPrompt: false,
    userAgent: DESKTOP,
    maxTouchPoints: 0,
    ...overrides
});

describe("InstallUtils.getMethod", () => {
    it("suggests nothing once the app runs from the home screen or has just been installed", () => {
        expect(InstallUtils.getMethod(createContext({ isStandalone: true, canPrompt: true }))).toBe("none");
        expect(InstallUtils.getMethod(createContext({ isInstalled: true, userAgent: ANDROID }))).toBe("none");
    });

    it("uses the browser's own dialog whenever it is offered", () => {
        expect(InstallUtils.getMethod(createContext({ canPrompt: true, userAgent: ANDROID }))).toBe("prompt");
        expect(InstallUtils.getMethod(createContext({ canPrompt: true }))).toBe("prompt");
    });

    it("explains the share menu on iPhone and iPad", () => {
        expect(InstallUtils.getMethod(createContext({ userAgent: IPHONE, maxTouchPoints: 5 }))).toBe("share-menu");
        expect(InstallUtils.getMethod(createContext({ userAgent: IPAD_AS_MAC, maxTouchPoints: 5 }))).toBe("share-menu");
    });

    it("explains the browser menu on Android until the dialog is offered", () => {
        expect(InstallUtils.getMethod(createContext({ userAgent: ANDROID, maxTouchPoints: 5 }))).toBe("browser-menu");
    });

    it("suggests nothing on a desktop without the dialog", () => {
        expect(InstallUtils.getMethod(createContext({}))).toBe("none");
        expect(InstallUtils.getMethod(createContext({ userAgent: IPAD_AS_MAC, maxTouchPoints: 0 }))).toBe("none");
    });
});
