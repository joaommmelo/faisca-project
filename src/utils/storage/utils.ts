import type { LeitnerBoxes } from "../leitner/utils.ts";
import { ProfilesUtils, type AppData, type Profile } from "../profiles/utils.ts";
import type { PracticeMode } from "../questions/utils.ts";
import type { PracticeStats } from "../stats/utils.ts";

// saved: progress is written to localStorage. unavailable: the browser blocks it (private mode, site data off).
// newer-version: the data was written by a newer Faísca; this one runs in memory and never overwrites it.
export type StorageStatus = "saved" | "unavailable" | "newer-version";

export interface LoadResult {
    data: AppData;
    status: StorageStatus;
}

// The shape written by v1 (multiplication only), kept to migrate it.
interface VersionOneProfile {
    id: string;
    name: string;
    settings: { tables: number[]; mode: PracticeMode; isTimerEnabled: boolean };
    boxes: LeitnerBoxes;
    stats: PracticeStats;
}

interface VersionOneData {
    version: 1;
    profiles: VersionOneProfile[];
    activeProfileId: string | null;
}

// The single place that knows progress lives in localStorage, so it can be swapped later.
export class StorageUtils {
    public static getStorageKey(): string {
        return "faisca:data";
    }

    public static getProbeKey(): string {
        return "faisca:probe";
    }

    // Unreadable data starts the app fresh instead of crashing it. Older versions are migrated.
    public static load(): LoadResult {
        if (!this.isAvailable()) {
            return { data: ProfilesUtils.createEmptyData(), status: "unavailable" };
        }

        const raw: string | null = window.localStorage.getItem(this.getStorageKey());
        if (raw === null) {
            return { data: ProfilesUtils.createEmptyData(), status: "saved" };
        }

        const parsed: unknown = (() => {
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        })();
        if (!this.hasProfiles(parsed)) {
            return { data: ProfilesUtils.createEmptyData(), status: "saved" };
        }
        if (parsed.version > ProfilesUtils.getDataVersion()) {
            return { data: ProfilesUtils.createEmptyData(), status: "newer-version" };
        }
        if (parsed.version === 1) {
            return { data: this.migrateFromVersionOne(parsed as unknown as VersionOneData), status: "saved" };
        }
        if (parsed.version === ProfilesUtils.getDataVersion()) {
            return { data: parsed as unknown as AppData, status: "saved" };
        }
        return { data: ProfilesUtils.createEmptyData(), status: "saved" };
    }

    public static save(data: AppData): void {
        try {
            window.localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
        } catch (error) {
            // The quota can run out after loading; the app keeps working in memory.
            console.warn("Faísca: could not save progress to localStorage.", error);
        }
    }

    public static canSave(status: StorageStatus): boolean {
        return status === "saved";
    }

    // Reading can work while writing throws (old Safari private mode), so this writes for real.
    public static isAvailable(): boolean {
        try {
            window.localStorage.setItem(this.getProbeKey(), "1");
            window.localStorage.removeItem(this.getProbeKey());
            return true;
        } catch {
            return false;
        }
    }

    // Asks the browser not to clear the progress under storage pressure. A refusal changes nothing.
    public static async requestPersistence(): Promise<void> {
        if (typeof navigator === "undefined" || navigator.storage === undefined || typeof navigator.storage.persist !== "function") {
            return;
        }
        try {
            if (!(await navigator.storage.persisted())) {
                await navigator.storage.persist();
            }
        } catch (error) {
            console.warn("Faísca: could not ask for persistent storage.", error);
        }
    }

    // v1 only knew multiplication: its boxes, tables, mode and stats carry over unchanged.
    public static migrateFromVersionOne(data: VersionOneData): AppData {
        const profiles: Profile[] = data.profiles.map((oldProfile) => {
            const profile: Profile = ProfilesUtils.createProfile(oldProfile.name);
            return {
                ...profile,
                id: oldProfile.id,
                settings: {
                    ...profile.settings,
                    operation: "multiplication",
                    isTimerEnabled: oldProfile.settings.isTimerEnabled,
                    multiplication: { tables: oldProfile.settings.tables, mode: oldProfile.settings.mode },
                    division: { tables: oldProfile.settings.tables }
                },
                boxes: oldProfile.boxes,
                stats: oldProfile.stats
            };
        });
        return { version: ProfilesUtils.getDataVersion(), profiles, activeProfileId: data.activeProfileId };
    }

    private static hasProfiles(value: unknown): value is { version: number; profiles: unknown[] } {
        if (typeof value !== "object" || value === null) {
            return false;
        }
        const candidate = value as { version?: unknown; profiles?: unknown };
        return typeof candidate.version === "number" && Array.isArray(candidate.profiles);
    }
}
