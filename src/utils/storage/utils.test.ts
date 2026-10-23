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
        expect(profile.settings.practice).toBe("multiplication");
        expect(profile.settings.multiplication).toMatchObject({ tables: [3, 7], mode: "mixed", isAlwaysTyped: false });
        expect(profile.settings.multiplication.clock).toEqual({ isEnabled: true, direction: "up", reference: "default" });
        expect(profile.wallet).toEqual({ coins: 3, points: 0 });
        expect(profile.records).toEqual({});
    });

    it("migrates v2 progress, switching on every clock nobody had touched", () => {
        const versionTwo = {
            version: 2,
            activeProfileId: "tomas-id",
            profiles: [
                {
                    id: "tomas-id",
                    name: "Tomás",
                    settings: {
                        operation: "subtraction",
                        isTimerEnabled: false,
                        addition: { difficulty: "medium", layout: "vertical" },
                        subtraction: { difficulty: "hard", layout: "result" },
                        multiplication: { tables: [7], mode: "direct" },
                        division: { tables: [7, 8] }
                    },
                    boxes: { "7x8": 3 },
                    skillBoxes: { "subtraction:hard:borrow": 4 },
                    tracks: { "subtraction:hard": { level: 3, points: 12, recentAnswers: [], answersSinceSafetyNet: 2 } },
                    unlockedDifficulties: { addition: "medium", subtraction: "hard" },
                    wallet: { coins: 4, points: 6 },
                    stats: versionOneData.profiles[0].stats
                }
            ]
        };
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify(versionTwo) });
        const profile: Profile = StorageUtils.load().data.profiles[0];

        expect(profile.settings.practice).toBe("subtraction");
        expect(profile.settings.addition).toEqual({
            difficulty: "medium",
            layout: "vertical",
            clock: { isEnabled: true, direction: "up", reference: "default" }
        });
        expect(profile.settings.division).toMatchObject({ tables: [7, 8], isAlwaysTyped: false });
        expect(profile.skillBoxes).toEqual(versionTwo.profiles[0].skillBoxes);
        expect(profile.tracks).toEqual(versionTwo.profiles[0].tracks);
        expect(profile.unlockedDifficulties).toEqual({ addition: "medium", subtraction: "hard", multiplication: "easy", division: "easy" });
        expect(profile.settings.multiplication.difficulty).toBe("easy");
        expect(profile.wallet).toEqual({ coins: 4, points: 6 });
    });

    it("migrates v3 progress: the times tables become Fácil, with their level and records, and each skill gets its last answers", () => {
        const answer = (questionId: string, isCorrect: boolean) => ({ questionId, isCorrect, format: "keypad" });
        const clock = (isEnabled: boolean, direction: "up" | "down" = "up") => ({ isEnabled, direction, reference: "default" });
        const tablesCategory = { operation: "multiplication", difficulty: null, layout: null, tables: [2, 5], mode: "direct", isAlwaysTyped: false };
        const versionThree = {
            version: 3,
            activeProfileId: "ana-id",
            profiles: [
                {
                    id: "ana-id",
                    name: "Ana",
                    settings: {
                        operation: "division",
                        addition: { difficulty: "medium", layout: "result", clock: clock(false) },
                        subtraction: { difficulty: "easy", layout: "vertical", clock: clock(false, "down") },
                        multiplication: { tables: [2, 5], mode: "direct", isAlwaysTyped: true, clock: clock(true) },
                        division: { tables: [3], isAlwaysTyped: false, clock: clock(false) }
                    },
                    boxes: { "2x5": 5 },
                    skillBoxes: { "addition:medium:carry": 3 },
                    tracks: {
                        multiplication: { level: 2, points: 10, recentAnswers: [answer("multiplication:7×8:direct", true)], answersSinceSafetyNet: 0 },
                        "addition:medium": {
                            level: 1,
                            points: 4,
                            recentAnswers: [
                                answer("addition:37+25:direct", true),
                                answer("addition:32+25:direct", true),
                                answer("addition:48+36:direct", false)
                            ],
                            answersSinceSafetyNet: 0
                        },
                        "subtraction:easy": {
                            level: 2,
                            points: 0,
                            recentAnswers: [answer("subtraction:13−7:direct", true), answer("subtraction:18−5:direct", false)],
                            answersSinceSafetyNet: 0
                        }
                    },
                    unlockedDifficulties: { addition: "medium", subtraction: "easy" },
                    wallet: { coins: 2, points: 4 },
                    records: { "multiplication:::2-5:direct:": { category: tablesCategory, milliseconds: 61_000 } },
                    stats: versionOneData.profiles[0].stats
                }
            ]
        };
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify(versionThree) });
        const profile: Profile = StorageUtils.load().data.profiles[0];

        expect(profile.settings.practice).toBe("division");
        expect(profile.settings.multiplication).toMatchObject({ difficulty: "easy", tables: [2, 5], isAlwaysTyped: true });
        expect(profile.settings.division.difficulty).toBe("easy");
        expect(profile.settings.mix.operations).toEqual(["addition", "subtraction", "multiplication", "division"]);
        expect(profile.settings.addition.clock.isEnabled).toBe(true);
        expect(profile.settings.subtraction.clock).toEqual({ isEnabled: false, direction: "down", reference: "default" });
        expect(Object.keys(profile.tracks).sort()).toEqual(["addition:medium", "multiplication:easy", "subtraction:easy"]);
        expect(profile.tracks["multiplication:easy"].level).toBe(2);
        expect(profile.recentSkillAnswers).toEqual({
            "addition:medium:carry": [true, false],
            "addition:medium:no-carry": [true],
            "subtraction:easy:borrow": [true],
            "subtraction:easy:no-borrow": [false]
        });
        expect(profile.unlockedDifficulties).toEqual({ addition: "medium", subtraction: "easy", multiplication: "easy", division: "easy" });
        expect(Object.values(profile.records)).toEqual([{ category: { ...tablesCategory, kind: "operation", difficulty: "easy" }, milliseconds: 61_000 }]);
        expect(Object.keys(profile.records)).toEqual(["multiplication:easy::2-5:direct:"]);
    });

    it("migrates v4 progress: each skill gets its last answers from its track, and nothing else changes", () => {
        const answer = (questionId: string, isCorrect: boolean) => ({ questionId, isCorrect, format: "keypad" });
        const track = (recentAnswers: ReturnType<typeof answer>[]) => ({ level: 2, points: 6, recentAnswers, answersSinceSafetyNet: 3 });
        const { recentSkillAnswers: _, challengeRecord: __, settings, ...current } = ProfilesUtils.createProfile("Rui");
        const { isChallengeEnabled: ___, ...versionFourSettings } = settings;
        const versionFourProfile = {
            ...current,
            settings: versionFourSettings,
            skillBoxes: { "multiplication:medium:carry": 5 },
            tracks: {
                "multiplication:easy": track([answer("multiplication:7×8:direct", false)]),
                "multiplication:medium": track([answer("multiplication:27×4:direct", true), answer("multiplication:31×2:direct", true)]),
                "division:medium": track([answer("division:84÷4:direct", false)]),
                "addition:easy": track([answer("addition:12+5:direct", true)])
            }
        };
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify({ version: 4, activeProfileId: current.id, profiles: [versionFourProfile] }) });
        const { data, status } = StorageUtils.load();

        expect(status).toBe("saved");
        expect(data.version).toBe(ProfilesUtils.getDataVersion());
        expect(data.profiles[0]).toEqual({
            ...versionFourProfile,
            settings,
            recentSkillAnswers: {
                "multiplication:medium:carry": [true],
                "multiplication:medium:no-carry": [true],
                "division:medium:no-remainder": [false],
                "addition:easy:no-carry": [true]
            },
            challengeRecord: null
        });
    });

    it("migrates v5 progress: the challenge starts switched off and without a record, and nothing else changes", () => {
        const { challengeRecord: _, settings, ...current } = ProfilesUtils.createProfile("Rui");
        const { isChallengeEnabled: __, factorGame, ...versionFiveSettings } = settings;
        const versionFiveProfile = {
            ...current,
            settings: { ...versionFiveSettings, practice: "mix" },
            recentSkillAnswers: { "addition:easy:carry": [true, false, true] },
            wallet: { coins: 4, points: 6 }
        };
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify({ version: 5, activeProfileId: current.id, profiles: [versionFiveProfile] }) });
        const { data, status } = StorageUtils.load();

        expect(status).toBe("saved");
        expect(data.version).toBe(ProfilesUtils.getDataVersion());
        expect(data.activeProfileId).toBe(current.id);
        expect(data.profiles[0]).toEqual({
            ...versionFiveProfile,
            settings: { ...versionFiveProfile.settings, isChallengeEnabled: false, factorGame },
            challengeRecord: null
        });
    });

    it("migrates v6 progress: the language waits to be detected, and nothing else changes", () => {
        const profile: Profile = ProfilesUtils.createProfile("Rui");
        const { factorGame: _, ...versionSixSettings } = profile.settings;
        const versionSixProfile = { ...profile, settings: versionSixSettings };
        stubStorage({ [StorageUtils.getStorageKey()]: JSON.stringify({ version: 6, activeProfileId: profile.id, profiles: [versionSixProfile] }) });

        expect(StorageUtils.load()).toEqual({
            data: { version: ProfilesUtils.getDataVersion(), activeProfileId: profile.id, profiles: [profile], locale: null },
            status: "saved"
        });
    });

    it("migrates v7 progress: Descobre a conta gets its own clock, on like every clock starts, and nothing else changes", () => {
        const profile: Profile = ProfilesUtils.createProfile("Rui");
        const { factorGame, roundGames, memoryGame, isMahjongEnabled, ...versionSevenSettings } = profile.settings;
        const versionSevenProfile = {
            ...profile,
            settings: { ...versionSevenSettings, multiplication: { ...versionSevenSettings.multiplication, tables: [3, 7] } },
            wallet: { coins: 4, points: 6 }
        };
        stubStorage({
            [StorageUtils.getStorageKey()]: JSON.stringify({ version: 7, activeProfileId: profile.id, profiles: [versionSevenProfile], locale: "fr" })
        });

        expect(factorGame).toEqual({ clock: { isEnabled: true, direction: "up", reference: "default" } });
        expect(StorageUtils.load()).toEqual({
            data: {
                version: ProfilesUtils.getDataVersion(),
                activeProfileId: profile.id,
                profiles: [{ ...versionSevenProfile, settings: { ...versionSevenProfile.settings, factorGame, roundGames, memoryGame, isMahjongEnabled } }],
                locale: "fr"
            },
            status: "saved"
        });
    });

    it("migrates v8 progress: the new games get their clocks, on like every clock starts, Mahjong starts switched off, and nothing else changes", () => {
        const { mahjongRecord: _, ...profile } = ProfilesUtils.createProfile("Rui");
        const { roundGames, memoryGame, isMahjongEnabled: __, ...versionEightSettings } = profile.settings;
        const versionEightProfile = {
            ...profile,
            settings: { ...versionEightSettings, practice: "division" },
            tracks: { "factor-game": { level: 2, points: 6, recentAnswers: [], answersSinceSafetyNet: 3 } },
            wallet: { coins: 4, points: 6 }
        };
        stubStorage({
            [StorageUtils.getStorageKey()]: JSON.stringify({ version: 8, activeProfileId: profile.id, profiles: [versionEightProfile], locale: "de" })
        });

        expect(roundGames.counting).toEqual({ clock: { isEnabled: true, direction: "up", reference: "default" } });
        expect(memoryGame).toEqual({ content: "additions", pairCount: 6, clock: { isEnabled: true, direction: "up", reference: "default" } });
        expect(StorageUtils.load()).toEqual({
            data: {
                version: ProfilesUtils.getDataVersion(),
                activeProfileId: profile.id,
                profiles: [
                    {
                        ...versionEightProfile,
                        settings: { ...versionEightProfile.settings, roundGames, memoryGame, isMahjongEnabled: false },
                        mahjongRecord: null
                    }
                ],
                locale: "de"
            },
            status: "saved"
        });
    });

    it("migrates v9 progress: no mission drawn yet and none done, and nothing else changes", () => {
        const { missions, ...versionNineProfile } = { ...ProfilesUtils.createProfile("Rui"), wallet: { coins: 4, points: 6 }, mahjongRecord: 61000 };
        stubStorage({
            [StorageUtils.getStorageKey()]: JSON.stringify({ version: 9, activeProfileId: versionNineProfile.id, profiles: [versionNineProfile], locale: "it" })
        });

        expect(missions).toEqual({ current: null, doneDays: [], doneCount: 0 });
        expect(StorageUtils.load()).toEqual({
            data: {
                version: ProfilesUtils.getDataVersion(),
                activeProfileId: versionNineProfile.id,
                profiles: [{ ...versionNineProfile, missions }],
                locale: "it"
            },
            status: "saved"
        });
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
