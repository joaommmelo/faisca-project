import { ClockUtils, type ClockDirection, type ClockReference, type ClockSettings } from "../clock/utils.ts";
import type { Difficulty } from "../difficulties/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import type { Tracks } from "../levels/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import type { AppData, Profile } from "../profiles/utils.ts";
import type { AnswerLayout, PracticeMode } from "../questions/utils.ts";
import { RecordsUtils, type BestTime, type RecordCategory, type Records } from "../records/utils.ts";
import type { PracticeStats } from "../stats/utils.ts";
import type { Wallet } from "../wallet/utils.ts";

// The shapes older versions wrote, frozen here so each migration keeps working after the current shape moves on.

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

interface VersionTwoProfile {
    id: string;
    name: string;
    settings: {
        operation: Operation;
        isTimerEnabled: boolean;
        addition: { difficulty: Difficulty; layout: AnswerLayout };
        subtraction: { difficulty: Difficulty; layout: AnswerLayout };
        multiplication: { tables: number[]; mode: PracticeMode };
        division: { tables: number[] };
    };
    boxes: LeitnerBoxes;
    skillBoxes: LeitnerBoxes;
    tracks: Tracks;
    unlockedDifficulties: { addition: Difficulty; subtraction: Difficulty };
    wallet: Wallet;
    stats: PracticeStats;
}

interface VersionTwoData {
    version: 2;
    profiles: VersionTwoProfile[];
    activeProfileId: string | null;
}

interface VersionThreeClock {
    isEnabled: boolean;
    direction: ClockDirection;
    reference: ClockReference;
}

// Multiplication and division had no difficulty yet: their records had none either.
interface VersionThreeRecordCategory {
    operation: Operation;
    difficulty: Difficulty | null;
    layout: AnswerLayout | null;
    tables: number[] | null;
    mode: PracticeMode | null;
    isAlwaysTyped: boolean;
}

interface VersionThreeProfile {
    id: string;
    name: string;
    settings: {
        operation: Operation;
        addition: { difficulty: Difficulty; layout: AnswerLayout; clock: VersionThreeClock };
        subtraction: { difficulty: Difficulty; layout: AnswerLayout; clock: VersionThreeClock };
        multiplication: { tables: number[]; mode: PracticeMode; isAlwaysTyped: boolean; clock: VersionThreeClock };
        division: { tables: number[]; isAlwaysTyped: boolean; clock: VersionThreeClock };
    };
    boxes: LeitnerBoxes;
    skillBoxes: LeitnerBoxes;
    // Multiplication and division had one track each, keyed by the operation alone.
    tracks: Tracks;
    unlockedDifficulties: { addition: Difficulty; subtraction: Difficulty };
    wallet: Wallet;
    records: Record<string, { category: VersionThreeRecordCategory; milliseconds: number }>;
    stats: PracticeStats;
}

interface VersionThreeData {
    version: 3;
    profiles: VersionThreeProfile[];
    activeProfileId: string | null;
}

export class MigrationsUtils {
    public static getOldestMigratableVersion(): number {
        return 1;
    }

    // Brings data from any older version up to the current one, one step at a time.
    public static migrate(data: { version: number }): AppData {
        const versionTwo: VersionTwoData | null = (() => {
            if (data.version === 1) {
                return this.fromVersionOne(data as VersionOneData);
            }
            return data.version === 2 ? (data as VersionTwoData) : null;
        })();
        const versionThree: VersionThreeData = versionTwo === null ? (data as VersionThreeData) : this.fromVersionTwo(versionTwo);
        return this.fromVersionThree(versionThree);
    }

    // v1 only knew multiplication: its boxes, tables, mode, timer and stats carry over unchanged.
    private static fromVersionOne(data: VersionOneData): VersionTwoData {
        return {
            version: 2,
            activeProfileId: data.activeProfileId,
            profiles: data.profiles.map((profile) => ({
                id: profile.id,
                name: profile.name,
                settings: {
                    operation: "multiplication",
                    isTimerEnabled: profile.settings.isTimerEnabled,
                    addition: { difficulty: "easy", layout: "result" },
                    subtraction: { difficulty: "easy", layout: "result" },
                    multiplication: { tables: profile.settings.tables, mode: profile.settings.mode },
                    division: { tables: profile.settings.tables }
                },
                boxes: profile.boxes,
                skillBoxes: {},
                tracks: {},
                unlockedDifficulties: { addition: "easy", subtraction: "easy" },
                wallet: { coins: 3, points: 0 },
                stats: profile.stats
            }))
        };
    }

    // v3 gives each operation its own clock (the old on/off timer counts up in all of them), the "always type"
    // option and the records.
    private static fromVersionTwo(data: VersionTwoData): VersionThreeData {
        return {
            version: 3,
            activeProfileId: data.activeProfileId,
            profiles: data.profiles.map((profile): VersionThreeProfile => {
                const clock: VersionThreeClock = { isEnabled: profile.settings.isTimerEnabled, direction: "up", reference: "default" };
                const { settings } = profile;
                return {
                    ...profile,
                    settings: {
                        operation: settings.operation,
                        addition: { ...settings.addition, clock },
                        subtraction: { ...settings.subtraction, clock },
                        multiplication: { ...settings.multiplication, isAlwaysTyped: false, clock },
                        division: { ...settings.division, isAlwaysTyped: false, clock }
                    },
                    records: {}
                };
            })
        };
    }

    // v4 gives multiplication and division difficulties: what they practised so far, the times tables, becomes Fácil,
    // with its level and records. It adds the mix, and switches on every clock nobody had touched, because the clock
    // now starts on (counting up to 3 minutes).
    private static fromVersionThree(data: VersionThreeData): AppData {
        return {
            version: 4,
            activeProfileId: data.activeProfileId,
            profiles: data.profiles.map((profile): Profile => {
                const { settings } = profile;
                const withDefaultClock = (clock: VersionThreeClock): ClockSettings => {
                    const isUntouched: boolean = !clock.isEnabled && clock.direction === "up" && clock.reference === "default";
                    return isUntouched ? ClockUtils.createDefault() : clock;
                };
                const tracks: Tracks = Object.fromEntries(
                    Object.entries(profile.tracks).map(([trackId, track]) => {
                        const isTablesTrack: boolean = trackId === "multiplication" || trackId === "division";
                        return [isTablesTrack ? `${trackId}:easy` : trackId, track];
                    })
                );
                const records: Records = Object.fromEntries(
                    Object.values(profile.records).map((best): [string, BestTime] => {
                        const category: RecordCategory = {
                            ...best.category,
                            kind: "operation",
                            difficulty: best.category.difficulty === null ? "easy" : best.category.difficulty
                        };
                        return [RecordsUtils.getCategoryId(category), { category, milliseconds: best.milliseconds }];
                    })
                );
                return {
                    ...profile,
                    settings: {
                        practice: settings.operation,
                        addition: { ...settings.addition, clock: withDefaultClock(settings.addition.clock) },
                        subtraction: { ...settings.subtraction, clock: withDefaultClock(settings.subtraction.clock) },
                        multiplication: { ...settings.multiplication, difficulty: "easy", clock: withDefaultClock(settings.multiplication.clock) },
                        division: { ...settings.division, difficulty: "easy", clock: withDefaultClock(settings.division.clock) },
                        mix: { operations: OperationsUtils.getValidOperations(), clock: ClockUtils.createDefault() }
                    },
                    tracks,
                    unlockedDifficulties: { ...profile.unlockedDifficulties, multiplication: "easy", division: "easy" },
                    records
                };
            })
        };
    }
}
