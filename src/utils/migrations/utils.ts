import { ClockUtils, type ClockSettings } from "../clock/utils.ts";
import type { Difficulty } from "../difficulties/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import type { Tracks } from "../levels/utils.ts";
import type { Operation } from "../operations/utils.ts";
import type { AppData, Profile } from "../profiles/utils.ts";
import type { AnswerLayout, PracticeMode } from "../questions/utils.ts";
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

export class MigrationsUtils {
    public static getOldestMigratableVersion(): number {
        return 1;
    }

    // Brings data from any older version up to the current one, one step at a time.
    public static migrate(data: { version: number }): AppData {
        const versionTwo: VersionTwoData = data.version === 1 ? this.fromVersionOne(data as VersionOneData) : (data as VersionTwoData);
        return this.fromVersionTwo(versionTwo);
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
    private static fromVersionTwo(data: VersionTwoData): AppData {
        return {
            version: 3,
            activeProfileId: data.activeProfileId,
            profiles: data.profiles.map((profile): Profile => {
                const clock: ClockSettings = { ...ClockUtils.createDefault(), isEnabled: profile.settings.isTimerEnabled };
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
}
