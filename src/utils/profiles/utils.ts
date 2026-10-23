import { v4 as uuidv4 } from "uuid";
import { ClockUtils, type ClockSettings } from "../clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "../difficulties/utils.ts";
import { FactsUtils } from "../facts/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import type { Tracks } from "../levels/utils.ts";
import type { Locale } from "../locales/utils.ts";
import { MemoryGameUtils, type MemoryContent } from "../memoryGame/utils.ts";
import { MissionsUtils, type Missions } from "../missions/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import { QuestionsUtils, type AnswerLayout, type PracticeMode, type RecentSkillAnswers } from "../questions/utils.ts";
import type { Records } from "../records/utils.ts";
import type { RoundGameId } from "../roundGame/utils.ts";
import { StatsUtils, type PracticeStats } from "../stats/utils.ts";
import { WalletUtils, type Wallet } from "../wallet/utils.ts";

export interface AdditiveSettings {
    difficulty: Difficulty;
    layout: AnswerLayout;
    clock: ClockSettings;
}

export interface MultiplicativeSettings {
    difficulty: Difficulty;
    // Fácil only: the times tables to practise.
    tables: number[];
    // No multiple choice: every answer is typed, even for facts still being learnt.
    isAlwaysTyped: boolean;
    clock: ClockSettings;
}

export interface MultiplicationSettings extends MultiplicativeSettings {
    // Fácil only: also the inverse questions (? × 8 = 56).
    mode: PracticeMode;
}

// What Jogar starts: one operation, or a mix of several.
export type Practice = Operation | "mix";

// Each question of a mix comes from one of these operations, at that operation's own settings.
export interface MixSettings {
    operations: Operation[];
    clock: ClockSettings;
}

// Descobre a conta takes its numbers from the multiplication's tables; only its clock is its own.
export interface FactorGameSettings {
    clock: ClockSettings;
}

// The games of rounds choose their rounds by their own level; only the clock is up to the child.
export interface RoundGameSettings {
    clock: ClockSettings;
}

// Memória: what the pairs match and how many there are. The times tables are the multiplication's.
export interface MemoryGameSettings {
    content: MemoryContent;
    pairCount: number;
    clock: ClockSettings;
}

export interface ProfileSettings {
    practice: Practice;
    addition: AdditiveSettings;
    subtraction: AdditiveSettings;
    multiplication: MultiplicationSettings;
    division: MultiplicativeSettings;
    mix: MixSettings;
    factorGame: FactorGameSettings;
    roundGames: Record<RoundGameId, RoundGameSettings>;
    memoryGame: MemoryGameSettings;
    // The endless challenge and Mahjong, for adults, show on the home screen only when switched on.
    isChallengeEnabled: boolean;
    isMahjongEnabled: boolean;
}

// Why Jogar is off: a times-table practice with no table chosen, or a mix with fewer than two operations.
export type PlayProblem = "no-tables" | "too-few-operations";

export interface Profile {
    id: string;
    name: string;
    settings: ProfileSettings;
    // Times-table facts ("7x8"), shared by Fácil multiplication and division.
    boxes: LeitnerBoxes;
    // Skills of every other practice ("addition:easy:carry", "division:hard:remainder").
    skillBoxes: LeitnerBoxes;
    // What decides whether a skill's questions are chosen or typed.
    recentSkillAnswers: RecentSkillAnswers;
    tracks: Tracks;
    // The highest difficulty open in each operation; every one below it stays open.
    unlockedDifficulties: Record<Operation, Difficulty>;
    wallet: Wallet;
    records: Records;
    stats: PracticeStats;
    // The most right answers in one run of the challenge; null until one has any.
    challengeRecord: number | null;
    // The best time of a Mahjong board cleared without hints; null until one is.
    mahjongRecord: number | null;
    missions: Missions;
}

export interface AppData {
    version: number;
    profiles: Profile[];
    activeProfileId: string | null;
    // The device's language for the app: detected the first time, then kept (so it does not change on a trip) until
    // someone picks another. Null only until that first detection.
    locale: Locale | null;
}

export type ProfileNameProblem = "empty" | "too-long" | "taken";

export class ProfilesUtils {
    public static getDataVersion(): number {
        return 10;
    }

    // A mix of a single operation would just be that operation.
    public static getMinMixOperations(): number {
        return 2;
    }

    public static getMaxNameLength(): number {
        return 20;
    }

    public static createEmptyData(): AppData {
        return { version: this.getDataVersion(), profiles: [], activeProfileId: null, locale: null };
    }

    public static setLocale(data: AppData, locale: Locale): AppData {
        return { ...data, locale };
    }

    public static createDefaultSettings(): ProfileSettings {
        const additive: AdditiveSettings = {
            difficulty: DifficultiesUtils.getDefaultDifficulty(),
            layout: QuestionsUtils.getDefaultLayout(),
            clock: ClockUtils.createDefault()
        };
        const multiplicative: MultiplicativeSettings = {
            difficulty: DifficultiesUtils.getDefaultDifficulty(),
            tables: FactsUtils.getDefaultTables(),
            isAlwaysTyped: false,
            clock: ClockUtils.createDefault()
        };
        return {
            practice: OperationsUtils.getDefaultOperation(),
            addition: additive,
            subtraction: additive,
            multiplication: { ...multiplicative, mode: QuestionsUtils.getDefaultMode() },
            division: multiplicative,
            mix: { operations: OperationsUtils.getValidOperations(), clock: ClockUtils.createDefault() },
            factorGame: { clock: ClockUtils.createDefault() },
            roundGames: this.createDefaultRoundGameSettings(),
            memoryGame: this.createDefaultMemoryGameSettings(),
            isChallengeEnabled: false,
            isMahjongEnabled: false
        };
    }

    public static createDefaultRoundGameSettings(): Record<RoundGameId, RoundGameSettings> {
        return {
            counting: { clock: ClockUtils.createDefault() },
            "number-bonds": { clock: ClockUtils.createDefault() },
            "skip-counting": { clock: ClockUtils.createDefault() },
            "missing-sign": { clock: ClockUtils.createDefault() },
            balance: { clock: ClockUtils.createDefault() }
        };
    }

    public static createDefaultMemoryGameSettings(): MemoryGameSettings {
        return { content: MemoryGameUtils.getDefaultContent(), pairCount: MemoryGameUtils.getDefaultPairCount(), clock: ClockUtils.createDefault() };
    }

    public static getPracticeOperations(settings: ProfileSettings): Operation[] {
        return settings.practice === "mix" ? settings.mix.operations : [settings.practice];
    }

    public static getDifficulty(settings: ProfileSettings, operation: Operation): Difficulty {
        return settings[operation].difficulty;
    }

    public static getClock(settings: ProfileSettings): ClockSettings {
        return settings.practice === "mix" ? settings.mix.clock : settings[settings.practice].clock;
    }

    // Multiplication and division always ask for the result; only additions and subtractions go in columns.
    public static getLayout(settings: ProfileSettings, operation: Operation): AnswerLayout {
        return OperationsUtils.isAdditive(operation) ? settings[operation].layout : "result";
    }

    public static isAlwaysTyped(settings: ProfileSettings, operation: Operation): boolean {
        return OperationsUtils.isMultiplicative(operation) ? settings[operation].isAlwaysTyped : false;
    }

    public static createProfile(name: string): Profile {
        return {
            id: uuidv4(),
            name: this.normalizeName(name),
            settings: this.createDefaultSettings(),
            boxes: {},
            skillBoxes: {},
            recentSkillAnswers: {},
            tracks: {},
            unlockedDifficulties: {
                addition: DifficultiesUtils.getDefaultDifficulty(),
                subtraction: DifficultiesUtils.getDefaultDifficulty(),
                multiplication: DifficultiesUtils.getDefaultDifficulty(),
                division: DifficultiesUtils.getDefaultDifficulty()
            },
            wallet: WalletUtils.createInitial(),
            records: {},
            stats: StatsUtils.createEmpty(),
            challengeRecord: null,
            mahjongRecord: null,
            missions: MissionsUtils.createEmpty()
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

    public static canPlay(settings: ProfileSettings): boolean {
        return this.getPlayProblem(settings) === null;
    }

    // The times tables need at least one table chosen, also inside a mix; a mix needs two operations.
    public static getPlayProblem(settings: ProfileSettings): PlayProblem | null {
        const operations: Operation[] = this.getPracticeOperations(settings);
        if (settings.practice === "mix" && operations.length < this.getMinMixOperations()) {
            return "too-few-operations";
        }
        const isMissingTables: boolean = operations.some(
            (operation) =>
                OperationsUtils.isMultiplicative(operation) &&
                OperationsUtils.usesTables(operation, settings[operation].difficulty) &&
                settings[operation].tables.length === 0
        );
        return isMissingTables ? "no-tables" : null;
    }

    // Keeps the operations in menu order.
    public static toggleMixOperation(operations: Operation[], operation: Operation): Operation[] {
        if (operations.includes(operation)) {
            return operations.filter((selected) => selected !== operation);
        }
        return OperationsUtils.getValidOperations().filter((candidate) => candidate === operation || operations.includes(candidate));
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
