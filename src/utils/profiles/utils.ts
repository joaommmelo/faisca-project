import { v4 as uuidv4 } from "uuid";
import { FactsUtils } from "../facts/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import { QuestionsUtils, type PracticeMode } from "../questions/utils.ts";
import { StatsUtils, type PracticeStats } from "../stats/utils.ts";

export interface ProfileSettings {
    tables: number[];
    mode: PracticeMode;
    isTimerEnabled: boolean;
}

export interface Profile {
    id: string;
    name: string;
    settings: ProfileSettings;
    boxes: LeitnerBoxes;
    stats: PracticeStats;
}

export interface AppData {
    version: number;
    profiles: Profile[];
    activeProfileId: string | null;
}

export type ProfileNameProblem = "empty" | "too-long" | "taken";

export class ProfilesUtils {
    public static getDataVersion(): number {
        return 1;
    }

    public static getMaxNameLength(): number {
        return 20;
    }

    public static createEmptyData(): AppData {
        return { version: this.getDataVersion(), profiles: [], activeProfileId: null };
    }

    public static normalizeName(name: string): string {
        return name.trim().replace(/\s+/g, " ");
    }

    public static getNameProblem(data: AppData, name: string): ProfileNameProblem | null {
        const normalizedName: string = this.normalizeName(name);
        if (normalizedName.length === 0) {
            return "empty";
        }
        if (normalizedName.length > this.getMaxNameLength()) {
            return "too-long";
        }
        const isTaken: boolean = data.profiles.some((profile) => profile.name.toLocaleLowerCase("pt-PT") === normalizedName.toLocaleLowerCase("pt-PT"));
        if (isTaken) {
            return "taken";
        }
        return null;
    }

    public static add(data: AppData, name: string): AppData {
        if (this.getNameProblem(data, name) !== null) {
            throw new Error(`Invalid profile name: "${name}".`);
        }
        const profile: Profile = {
            id: uuidv4(),
            name: this.normalizeName(name),
            settings: { tables: FactsUtils.getDefaultTables(), mode: QuestionsUtils.getDefaultMode(), isTimerEnabled: false },
            boxes: {},
            stats: StatsUtils.createEmpty()
        };
        return { ...data, profiles: [...data.profiles, profile], activeProfileId: profile.id };
    }

    public static select(data: AppData, profileId: string): AppData {
        if (!data.profiles.some((profile) => profile.id === profileId)) {
            throw new Error(`Unknown profile: ${profileId}.`);
        }
        return { ...data, activeProfileId: profileId };
    }

    public static update(data: AppData, updatedProfile: Profile): AppData {
        return { ...data, profiles: data.profiles.map((profile) => (profile.id === updatedProfile.id ? updatedProfile : profile)) };
    }

    public static updateActive(data: AppData, change: (profile: Profile) => Profile): AppData {
        const activeProfile: Profile | null = this.getActive(data);
        if (activeProfile === null) {
            throw new Error("There is no active profile to update.");
        }
        return this.update(data, change(activeProfile));
    }

    public static toggleTable(tables: number[], table: number): number[] {
        if (tables.includes(table)) {
            return tables.filter((selectedTable) => selectedTable !== table);
        }
        return [...tables, table].sort((first, second) => first - second);
    }

    public static remove(data: AppData, profileId: string): AppData {
        const profiles: Profile[] = data.profiles.filter((profile) => profile.id !== profileId);
        const activeProfileId: string | null = (() => {
            if (data.activeProfileId !== profileId) {
                return data.activeProfileId;
            }
            return profiles.length === 0 ? null : profiles[0].id;
        })();
        return { ...data, profiles, activeProfileId };
    }

    public static getActive(data: AppData): Profile | null {
        return data.profiles.find((profile) => profile.id === data.activeProfileId) ?? null;
    }
}
