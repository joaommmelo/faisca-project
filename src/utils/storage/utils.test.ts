import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfilesUtils } from "../profiles/utils.ts";
import { StorageUtils } from "./utils.ts";

function stubStorage(initial: Record<string, string> = {}): Record<string, string> {
    const store: Record<string, string> = { ...initial };
    vi.stubGlobal("window", {
        localStorage: {
            getItem: (key: string) => store[key] ?? null,
            setItem: (key: string, value: string) => {
                store[key] = value;
            }
        }
    });
    return store;
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("StorageUtils", () => {
    it("round-trips the app data", () => {
        stubStorage();
        const data = ProfilesUtils.add(ProfilesUtils.createEmptyData(), "Rita");
        StorageUtils.save(data);
        expect(StorageUtils.load()).toEqual(data);
    });

    it("starts fresh on a first visit", () => {
        stubStorage();
        expect(StorageUtils.load()).toEqual(ProfilesUtils.createEmptyData());
    });

    it("starts fresh when the stored data is unreadable", () => {
        stubStorage({ [StorageUtils.getStorageKey()]: "{not json" });
        expect(StorageUtils.load()).toEqual(ProfilesUtils.createEmptyData());
    });

    it("starts fresh when the stored data has another version", () => {
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify({ version: 99, profiles: [] }) });
        expect(StorageUtils.load()).toEqual(ProfilesUtils.createEmptyData());
    });

    it("keeps working when the browser blocks storage", () => {
        vi.stubGlobal("window", {
            localStorage: {
                getItem: () => {
                    throw new Error("SecurityError");
                },
                setItem: () => {
                    throw new Error("QuotaExceededError");
                }
            }
        });
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        expect(StorageUtils.load()).toEqual(ProfilesUtils.createEmptyData());
        expect(() => StorageUtils.save(ProfilesUtils.createEmptyData())).not.toThrow();
        expect(warn).toHaveBeenCalledOnce();
    });
});
