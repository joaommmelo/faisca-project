import { ArithmeticUtils } from "../arithmetic/utils.ts";
import { ClockUtils, type ClockDirection, type ClockReference, type ClockSettings } from "../clock/utils.ts";
import type { Difficulty } from "../difficulties/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import type { Tracks } from "../levels/utils.ts";
import type { Locale } from "../locales/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import { ProfilesUtils, type AppData, type Profile, type ProfileSettings } from "../profiles/utils.ts";
import { QuestionsUtils, type AnswerLayout, type PracticeMode, type RecentSkillAnswers } from "../questions/utils.ts";
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

// v8 and older had no games of rounds, no Memória and no Mahjong.
type VersionEightSettings = Omit<ProfileSettings, "roundGames" | "memoryGame" | "isMahjongEnabled">;

interface VersionEightProfile extends Omit<Profile, "settings" | "mahjongRecord"> {
    settings: VersionEightSettings;
}

// v7 and older had no Descobre a conta, nor its clock.
type VersionSevenSettings = Omit<VersionEightSettings, "factorGame">;

interface VersionSevenProfile extends Omit<VersionEightProfile, "settings"> {
    settings: VersionSevenSettings;
}

// v5 and older had no challenge to switch on.
type VersionFiveSettings = Omit<VersionSevenSettings, "isChallengeEnabled">;

// v4 decided multiple choice or keypad by the box alone, so it kept no answers per skill.
interface VersionFourProfile {
    id: string;
    name: string;
    settings: VersionFiveSettings;
    boxes: LeitnerBoxes;
    skillBoxes: LeitnerBoxes;
    tracks: Tracks;
    unlockedDifficulties: Record<Operation, Difficulty>;
    wallet: Wallet;
    records: Records;
    stats: PracticeStats;
}

interface VersionFourData {
    version: 4;
    profiles: VersionFourProfile[];
    activeProfileId: string | null;
}

// v5 had no challenge, nor its record.
interface VersionFiveProfile extends VersionFourProfile {
    recentSkillAnswers: RecentSkillAnswers;
}

interface VersionFiveData {
    version: 5;
    profiles: VersionFiveProfile[];
    activeProfileId: string | null;
}

// v6 kept no language: the app only spoke Portuguese.
interface VersionSixData {
    version: 6;
    profiles: VersionSevenProfile[];
    activeProfileId: string | null;
}

interface VersionSevenData {
    version: 7;
    profiles: VersionSevenProfile[];
    activeProfileId: string | null;
    locale: Locale | null;
}

interface VersionEightData {
    version: 8;
    profiles: VersionEightProfile[];
    activeProfileId: string | null;
    locale: Locale | null;
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
        const versionThree: VersionThreeData | null = (() => {
            if (versionTwo !== null) {
                return this.fromVersionTwo(versionTwo);
            }
            return data.version === 3 ? (data as VersionThreeData) : null;
        })();
        const versionFour: VersionFourData | null = (() => {
            if (versionThree !== null) {
                return this.fromVersionThree(versionThree);
            }
            return data.version === 4 ? (data as VersionFourData) : null;
        })();
        const versionFive: VersionFiveData | null = (() => {
            if (versionFour !== null) {
                return this.fromVersionFour(versionFour);
            }
            return data.version === 5 ? (data as VersionFiveData) : null;
        })();
        const versionSix: VersionSixData | null = (() => {
            if (versionFive !== null) {
                return this.fromVersionFive(versionFive);
            }
            return data.version === 6 ? (data as VersionSixData) : null;
        })();
        const versionSeven: VersionSevenData | null = (() => {
            if (versionSix !== null) {
                return this.fromVersionSix(versionSix);
            }
            return data.version === 7 ? (data as VersionSevenData) : null;
        })();
        const versionEight: VersionEightData = versionSeven === null ? (data as VersionEightData) : this.fromVersionSeven(versionSeven);
        return this.fromVersionEight(versionEight);
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
    private static fromVersionThree(data: VersionThreeData): VersionFourData {
        return {
            version: 4,
            activeProfileId: data.activeProfileId,
            profiles: data.profiles.map((profile): VersionFourProfile => {
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

    // v5 decides multiple choice or keypad by each skill's last answers, rebuilt from what the tracks already kept.
    private static fromVersionFour(data: VersionFourData): VersionFiveData {
        return {
            version: 5,
            activeProfileId: data.activeProfileId,
            profiles: data.profiles.map((profile): VersionFiveProfile => ({ ...profile, recentSkillAnswers: this.rebuildRecentSkillAnswers(profile.tracks) }))
        };
    }

    // v6 adds the endless challenge for adults: switched off, and without a record.
    private static fromVersionFive(data: VersionFiveData): VersionSixData {
        return {
            version: 6,
            activeProfileId: data.activeProfileId,
            profiles: data.profiles.map((profile): VersionSevenProfile => ({
                ...profile,
                settings: { ...profile.settings, isChallengeEnabled: false },
                challengeRecord: null
            }))
        };
    }

    // v7 keeps the device's language; null until the app detects it on the next start.
    private static fromVersionSix(data: VersionSixData): VersionSevenData {
        return { ...data, version: 7, locale: null };
    }

    // v8 adds Descobre a conta's own clock, on like every other clock starts.
    private static fromVersionSeven(data: VersionSevenData): VersionEightData {
        return {
            ...data,
            version: 8,
            profiles: data.profiles.map((profile): VersionEightProfile => ({
                ...profile,
                settings: { ...profile.settings, factorGame: { clock: ClockUtils.createDefault() } }
            }))
        };
    }

    // v9 adds the games of rounds and Memória, each with its clock on like every clock starts, and Mahjong for
    // adults: switched off, and without a record.
    private static fromVersionEight(data: VersionEightData): AppData {
        return {
            ...data,
            version: 9,
            profiles: data.profiles.map((profile): Profile => ({
                ...profile,
                settings: {
                    ...profile.settings,
                    roundGames: ProfilesUtils.createDefaultRoundGameSettings(),
                    memoryGame: ProfilesUtils.createDefaultMemoryGameSettings(),
                    isMahjongEnabled: false
                },
                mahjongRecord: null
            }))
        };
    }

    // Each track ("addition:easy", "multiplication:medium") remembers its last answers, and their question ids
    // ("addition:37+5:direct", "multiplication:27×4:direct") say which skill they trained. The times tables (Fácil
    // × and ÷) have no skills.
    private static rebuildRecentSkillAnswers(tracks: Tracks): RecentSkillAnswers {
        const skillAnswers: { skillId: string; isCorrect: boolean }[] = Object.entries(tracks)
            .map(([trackId, track]) => {
                const [operation, difficulty] = trackId.split(":") as [Operation, Difficulty];
                return { operation, difficulty, track };
            })
            .filter(({ operation, difficulty }) => !OperationsUtils.usesTables(operation, difficulty))
            .flatMap(({ operation, difficulty, track }) => {
                return track.recentAnswers.map((answer) => {
                    const [left, right]: number[] = answer.questionId.split(":")[1].split(/\D/).map(Number);
                    const skillId: string = ArithmeticUtils.getSkillId(operation, difficulty, ArithmeticUtils.classify(operation, left, right));
                    return { skillId, isCorrect: answer.isCorrect };
                });
            });
        return skillAnswers.reduce(
            (recentSkillAnswers: RecentSkillAnswers, answer) => QuestionsUtils.recordSkillAnswer(recentSkillAnswers, answer.skillId, answer.isCorrect),
            {}
        );
    }
}
