import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfilesUtils, type Profile } from "../profiles/utils.ts";
import { StorageUtils } from "./utils.ts";

function stubStorage(initial: Record<string, string> = {}): Record<string, string> {
    const store: Record<string, string> = { ...initial };
    vi.stubGlobal("window", {
        localStorage: {
            getItem: (key: string) => store[key] ?? null,
            setItem: (key: string, value: string) => {
                store[key] = value;
            },
            removeItem: (key: string) => {
                delete store[key];
            }
        }
    });
    return store;
}

const versionOneData = {
    version: 1,
    profiles: [
        {
            id: "rita-id",
            name: "Rita",
            settings: { tables: [3, 7], mode: "mixed", isTimerEnabled: true },
            boxes: { "7x8": 4, "3x3": 5 },
            stats: { sessionsCompleted: 12, practiceDays: 5, currentStreak: 2, lastPracticeDay: "2026-10-20" }
        }
    ],
    activeProfileId: "rita-id"
};

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("StorageUtils.load", () => {
    it("round-trips the app data", () => {
        stubStorage();
        const data = ProfilesUtils.add(ProfilesUtils.createEmptyData(), "Rita");
        StorageUtils.save(data);
        expect(StorageUtils.load()).toEqual({ data, status: "saved" });
    });

    it("starts fresh on a first visit", () => {
        stubStorage();
        expect(StorageUtils.load()).toEqual({ data: ProfilesUtils.createEmptyData(), status: "saved" });
    });

    it("starts fresh when the stored data is unreadable", () => {
        stubStorage({ [StorageUtils.getStorageKey()]: "{not json" });
        expect(StorageUtils.load()).toEqual({ data: ProfilesUtils.createEmptyData(), status: "saved" });
    });

    it("never overwrites data from a newer version", () => {
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify({ version: 99, profiles: [] }) });
        const result = StorageUtils.load();
        expect(result.status).toBe("newer-version");
        expect(StorageUtils.canSave(result.status)).toBe(false);
    });

    it("migrates v1 progress without losing anything", () => {
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify(versionOneData) });
        const { data, status } = StorageUtils.load();
        const profile: Profile = data.profiles[0];

        expect(status).toBe("saved");
        expect(data.version).toBe(ProfilesUtils.getDataVersion());
        expect(data.activeProfileId).toBe("rita-id");
        expect(profile.id).toBe("rita-id");
        expect(profile.name).toBe("Rita");
        expect(profile.boxes).toEqual({ "7x8": 4, "3x3": 5 });
        expect(profile.stats).toEqual(versionOneData.profiles[0].stats);
        expect(profile.settings.operation).toBe("multiplication");
        expect(profile.settings.multiplication).toEqual({ tables: [3, 7], mode: "mixed" });
        expect(profile.settings.isTimerEnabled).toBe(true);
        expect(profile.wallet).toEqual({ coins: 3, points: 0 });
    });

    it("reports storage the browser blocks and keeps working", () => {
        vi.stubGlobal("window", {
            localStorage: {
                getItem: () => {
                    throw new Error("SecurityError");
                },
                setItem: () => {
                    throw new Error("QuotaExceededError");
                },
                removeItem: () => undefined
            }
        });
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        expect(StorageUtils.load()).toEqual({ data: ProfilesUtils.createEmptyData(), status: "unavailable" });
        expect(StorageUtils.isAvailable()).toBe(false);
        expect(() => StorageUtils.save(ProfilesUtils.createEmptyData())).not.toThrow();
        expect(warn).toHaveBeenCalledOnce();
    });
});
