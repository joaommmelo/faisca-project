import { ProfilesUtils, type AppData } from "../profiles/utils.ts";

export class StorageUtils {
    public static getStorageKey(): string {
        return "faisca:data";
    }

    // Data that is missing, unreadable or from another version starts the app fresh instead of crashing it.
    public static load(): AppData {
        const raw: string | null = this.readRaw();
        if (raw === null) {
            return ProfilesUtils.createEmptyData();
        }

        const parsed: unknown = (() => {
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        })();
        if (!this.isCurrentData(parsed)) {
            return ProfilesUtils.createEmptyData();
        }
        return parsed;
    }

    public static save(data: AppData): void {
        try {
            window.localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
        } catch (error) {
            // Storage can be blocked (private browsing, site data disabled) or full; the app keeps working in memory.
            console.warn("Faísca: could not save progress to localStorage.", error);
        }
    }

    private static readRaw(): string | null {
        try {
            return window.localStorage.getItem(this.getStorageKey());
        } catch {
            // Accessing localStorage throws when the browser blocks site data; behave as a first visit.
            return null;
        }
    }

    private static isCurrentData(value: unknown): value is AppData {
        if (typeof value !== "object" || value === null) {
            return false;
        }
        const candidate = value as Partial<AppData>;
        return candidate.version === ProfilesUtils.getDataVersion() && Array.isArray(candidate.profiles);
    }
}
