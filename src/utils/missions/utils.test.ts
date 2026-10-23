import moment from "moment";
import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { createTestProfile } from "../../test/profiles.ts";
import type { TrackProgress } from "../levels/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import type { ApplyRecordResult } from "../progression/utils.ts";
import { WalletUtils } from "../wallet/utils.ts";
import { MissionsUtils, type MissionGame } from "./utils.ts";

const day = (value: string, time: string = "18:30") => moment(`${value} ${time}`, "YYYY-MM-DD HH:mm");
const track = (level: number): TrackProgress => ({ level, points: 0, recentAnswers: [], answersSinceSafetyNet: 0 });

const withMission = (profile: Profile, missionDay: string, game: MissionGame): Profile => ({
    ...profile,
    missions: { ...profile.missions, current: { day: missionDay, game, isDone: false } }
});

describe("MissionsUtils.refresh", () => {
    it("draws today's mission once and keeps it for the whole day", () => {
        const morning: Profile = MissionsUtils.refresh(createTestProfile(), day("2026-10-23", "08:00"), createSeededRandom(1));
        expect(morning.missions.current).toEqual({ day: "2026-10-23", game: expect.any(String), isDone: false });
        expect(MissionsUtils.refresh(morning, day("2026-10-23", "21:00"), createSeededRandom(2))).toBe(morning);
    });

    it("draws a new mission on the next day", () => {
        const yesterday: Profile = withMission(createTestProfile(), "2026-10-22", "addition");
        const today: Profile = MissionsUtils.refresh(yesterday, day("2026-10-23", "00:05"), createSeededRandom(1));
        expect(today.missions.current?.day).toBe("2026-10-23");
    });
});

describe("MissionsUtils.drawGame", () => {
    it("starts with the games for the youngest before anything is played", () => {
        for (let seed = 0; seed < 50; seed++) {
            expect(MissionsUtils.getStarterGames()).toContain(MissionsUtils.drawGame(createTestProfile(), createSeededRandom(seed)));
        }
    });

    it("only draws games already played once there are enough of them", () => {
        const profile: Profile = createTestProfile({}, { tracks: { "multiplication:easy": track(1), "memory-game": track(1), "balance-game": track(1) } });
        for (let seed = 0; seed < 50; seed++) {
            expect(["multiplication", "memory", "balance"]).toContain(MissionsUtils.drawGame(profile, createSeededRandom(seed)));
        }
    });

    it("never draws yesterday's game again when there is another", () => {
        const profile: Profile = withMission(
            createTestProfile({}, { tracks: { "addition:easy": track(1), "counting-game": track(1) } }),
            "2026-10-22",
            "addition"
        );
        for (let seed = 0; seed < 50; seed++) {
            expect(MissionsUtils.drawGame(profile, createSeededRandom(seed))).toBe("counting");
        }
    });

    it("draws the games at a lower level more often", () => {
        const profile: Profile = createTestProfile({}, { tracks: { "addition:easy": track(1), "counting-game": track(5) } });
        const draws: MissionGame[] = Array.from({ length: 600 }, (_, seed) => MissionsUtils.drawGame(profile, createSeededRandom(seed)));
        const additions: number = draws.filter((game) => game === "addition").length;
        expect(additions).toBeGreaterThan(400);
        expect(additions).toBeLessThan(600);
    });

    it("counts an operation as played at any difficulty", () => {
        const profile: Profile = createTestProfile({}, { tracks: { "subtraction:medium": track(1), "factor-game": track(1) } });
        expect(MissionsUtils.hasPlayed(profile, "subtraction")).toBe(true);
        expect(MissionsUtils.hasPlayed(profile, "addition")).toBe(false);
    });
});

describe("MissionsUtils.complete", () => {
    it("pays a coin and fills today's circle when today's game is finished", () => {
        const profile: Profile = withMission(createTestProfile({}, { wallet: { coins: 2, points: 4 } }), "2026-10-23", "counting");
        const result: ApplyRecordResult = MissionsUtils.complete(profile, day("2026-10-23"), "counting");

        expect(result.milestones).toEqual([{ kind: "mission", isWeekComplete: false }, { kind: "coin" }]);
        expect(result.profile.wallet).toEqual({ coins: 3, points: 4 });
        expect(result.profile.missions).toEqual({ current: { day: "2026-10-23", game: "counting", isDone: true }, doneDays: ["2026-10-23"], doneCount: 1 });
    });

    it("counts only once a day", () => {
        const profile: Profile = withMission(createTestProfile(), "2026-10-23", "memory");
        const first: ApplyRecordResult = MissionsUtils.complete(profile, day("2026-10-23"), "memory");
        const second: ApplyRecordResult = MissionsUtils.complete(first.profile, day("2026-10-23", "20:00"), "memory");
        expect(second).toEqual({ profile: first.profile, milestones: [] });
    });

    it("ignores other games, a mix, and yesterday's mission", () => {
        const profile: Profile = withMission(createTestProfile(), "2026-10-23", "addition");
        expect(MissionsUtils.complete(profile, day("2026-10-23"), "subtraction").milestones).toEqual([]);
        expect(MissionsUtils.complete(profile, day("2026-10-23"), "mix").milestones).toEqual([]);
        expect(MissionsUtils.complete(profile, day("2026-10-24", "00:10"), "addition").milestones).toEqual([]);
    });

    it("keeps the coin waiting when the piggy bank is full", () => {
        const full: Profile = withMission(createTestProfile({}, { wallet: { coins: WalletUtils.getMaxCoins(), points: 4 } }), "2026-10-23", "balance");
        const result: ApplyRecordResult = MissionsUtils.complete(full, day("2026-10-23"), "balance");
        expect(result.milestones).toEqual([{ kind: "mission", isWeekComplete: false }]);
        expect(result.profile.wallet).toEqual({ coins: WalletUtils.getMaxCoins(), points: WalletUtils.getPointsPerCoin() });
    });

    it("says when the last circle of the week fills", () => {
        const weekSoFar: string[] = ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24"];
        const profile: Profile = withMission(
            createTestProfile({}, { missions: { current: null, doneDays: weekSoFar, doneCount: 6 } }),
            "2026-10-25",
            "addition"
        );
        const result: ApplyRecordResult = MissionsUtils.complete(profile, day("2026-10-25"), "addition");
        expect(result.milestones[0]).toEqual({ kind: "mission", isWeekComplete: true });
        expect(result.profile.missions.doneCount).toBe(7);
    });
});

describe("MissionsUtils.getWeek", () => {
    it("goes from Monday to Sunday, with the days done and today, and a missed day only left empty", () => {
        const week = MissionsUtils.getWeek({ current: null, doneDays: ["2026-10-16", "2026-10-19", "2026-10-21"], doneCount: 9 }, day("2026-10-23"));
        expect(week.map((weekDay) => weekDay.day)).toEqual(["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25"]);
        expect(week.map((weekDay) => weekDay.isDone)).toEqual([true, false, true, false, false, false, false]);
        expect(week.map((weekDay) => weekDay.isToday)).toEqual([false, false, false, false, true, false, false]);
    });

    it("keeps only the last week of days done", () => {
        let profile: Profile = createTestProfile();
        for (let date = 1; date <= 10; date++) {
            const today: moment.Moment = day(`2026-10-${String(date).padStart(2, "0")}`);
            profile = MissionsUtils.complete(withMission(profile, today.format("YYYY-MM-DD"), "addition"), today, "addition").profile;
        }
        expect(profile.missions.doneDays).toEqual(["2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10"]);
        expect(profile.missions.doneCount).toBe(10);
    });
});
