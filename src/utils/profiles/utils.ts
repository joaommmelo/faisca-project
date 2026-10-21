import { v4 as uuidv4 } from "uuid";
import { ClockUtils, type ClockSettings } from "../clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "../difficulties/utils.ts";
import { FactsUtils } from "../facts/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import type { Tracks } from "../levels/utils.ts";
import { OperationsUtils, type ArithmeticOperation, type Operation } from "../operations/utils.ts";
import { QuestionsUtils, type AnswerLayout, type PracticeMode } from "../questions/utils.ts";
import type { Records } from "../records/utils.ts";
import { StatsUtils, type PracticeStats } from "../stats/utils.ts";
import { WalletUtils, type Wallet } from "../wallet/utils.ts";

export interface ArithmeticSettings {
    difficulty: Difficulty;
    layout: AnswerLayout;
    clock: ClockSettings;
}

export interface TablesSettings {
    tables: number[];
    // No multiple choice: every answer is typed, even for facts still being learnt.
    isAlwaysTyped: boolean;
    clock: ClockSettings;
}

export interface MultiplicationSettings extends TablesSettings {
    mode: PracticeMode;
}

export interface ProfileSettings {
    operation: Operation;
    addition: ArithmeticSettings;
    subtraction: ArithmeticSettings;
    multiplication: MultiplicationSettings;
    division: TablesSettings;
}

export interface Profile {
    id: string;
    name: string;
    settings: ProfileSettings;
    // Multiplication facts ("7x8"), shared by division.
    boxes: LeitnerBoxes;
    // Addition and subtraction skills ("addition:easy:carry").
    skillBoxes: LeitnerBoxes;
    tracks: Tracks;
    // The highest difficulty open in each operation; every one below it stays open.
    unlockedDifficulties: Record<ArithmeticOperation, Difficulty>;
    wallet: Wallet;
    records: Records;
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
        return 3;
    }

    public static getMaxNameLength(): number {
        return 20;
    }

    public static createEmptyData(): AppData {
        return { version: this.getDataVersion(), profiles: [], activeProfileId: null };
    }

    public static createDefaultSettings(): ProfileSettings {
        const arithmetic: ArithmeticSettings = {
            difficulty: DifficultiesUtils.getDefaultDifficulty(),
            layout: QuestionsUtils.getDefaultLayout(),
            clock: ClockUtils.createDefault()
        };
        const tables: TablesSettings = { tables: FactsUtils.getDefaultTables(), isAlwaysTyped: false, clock: ClockUtils.createDefault() };
        return {
            operation: OperationsUtils.getDefaultOperation(),
            addition: arithmetic,
            subtraction: arithmetic,
            multiplication: { ...tables, mode: QuestionsUtils.getDefaultMode() },
            division: tables
        };
    }

    public static getClock(settings: ProfileSettings): ClockSettings {
        return settings[settings.operation].clock;
    }

    public static createProfile(name: string): Profile {
        return {
            id: uuidv4(),
            name: this.normalizeName(name),
            settings: this.createDefaultSettings(),
            boxes: {},
            skillBoxes: {},
            tracks: {},
            unlockedDifficulties: { addition: DifficultiesUtils.getDefaultDifficulty(), subtraction: DifficultiesUtils.getDefaultDifficulty() },
            wallet: WalletUtils.createInitial(),
            records: {},
            stats: StatsUtils.createEmpty()
        };
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
        const profile: Profile = this.createProfile(name);
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

    // Multiplication and division need at least one table; additions and subtractions are always ready.
    public static canPlay(settings: ProfileSettings): boolean {
        if (OperationsUtils.isArithmetic(settings.operation)) {
            return true;
        }
        return settings[settings.operation].tables.length > 0;
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
