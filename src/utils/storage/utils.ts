import { MigrationsUtils } from "../migrations/utils.ts";
import { ProfilesUtils, type AppData } from "../profiles/utils.ts";

// saved: progress is written to localStorage. unavailable: the browser blocks it (private mode, site data off).
// newer-version: the data was written by a newer Faísca; this one runs in memory and never overwrites it.
export type StorageStatus = "saved" | "unavailable" | "newer-version";

// What a saved text holds: progress this version can use, progress a newer Faísca wrote, or nothing it can read (not
// JSON, not Faísca's, or older than any migration).
export type ParsedData = { kind: "data"; data: AppData } | { kind: "newer-version" } | { kind: "unreadable" };

export interface LoadResult {
    data: AppData;
    status: StorageStatus;
}

// The single place that knows progress lives in localStorage, so it can be swapped later.
export class StorageUtils {
    public static getStorageKey(): string {
        return "faisca:data";
    }

    public static getProbeKey(): string {
        return "faisca:probe";
    }

    // Unreadable data starts the app fresh instead of crashing it.
    public static load(): LoadResult {
        if (!this.isAvailable()) {
            return { data: ProfilesUtils.createEmptyData(), status: "unavailable" };
        }

        const raw: string | null = window.localStorage.getItem(this.getStorageKey());
        if (raw === null) {
            return { data: ProfilesUtils.createEmptyData(), status: "saved" };
        }

        const parsed: ParsedData = this.parse(raw);
        if (parsed.kind === "newer-version") {
            return { data: ProfilesUtils.createEmptyData(), status: "newer-version" };
        }
        if (parsed.kind === "unreadable") {
            return { data: ProfilesUtils.createEmptyData(), status: "saved" };
        }
        return { data: parsed.data, status: "saved" };
    }

    // The text localStorage keeps, which is also what a backup file holds. Older versions are migrated.
    public static parse(raw: string): ParsedData {
        const parsed: unknown = (() => {
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        })();
        if (!this.hasProfiles(parsed)) {
            return { kind: "unreadable" };
        }
        if (parsed.version > ProfilesUtils.getDataVersion()) {
            return { kind: "newer-version" };
        }
        if (parsed.version === ProfilesUtils.getDataVersion()) {
            return { kind: "data", data: parsed as unknown as AppData };
        }
        if (parsed.version >= MigrationsUtils.getOldestMigratableVersion()) {
            return { kind: "data", data: MigrationsUtils.migrate(parsed) };
        }
        return { kind: "unreadable" };
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

    private static hasProfiles(value: unknown): value is { version: number; profiles: unknown[] } {
        if (typeof value !== "object" || value === null) {
            return false;
        }
        const candidate = value as { version?: unknown; profiles?: unknown };
        return typeof candidate.version === "number" && Array.isArray(candidate.profiles) && candidate.profiles.every((profile) => this.isProfile(profile));
    }

    // Every version's profiles have an id and a name; a file without them is not Faísca's.
    private static isProfile(value: unknown): boolean {
        if (typeof value !== "object" || value === null) {
            return false;
        }
        const candidate = value as { id?: unknown; name?: unknown };
        return typeof candidate.id === "string" && typeof candidate.name === "string";
    }
}
