import moment from "moment";
import { describe, expect, it } from "vitest";
import { StatsUtils, type PracticeStats } from "./utils.ts";

const day = (value: string, time: string = "18:30") => moment(`${value} ${time}`, "YYYY-MM-DD HH:mm");

describe("StatsUtils.registerSession", () => {
    it("starts a streak on the first session", () => {
        const stats: PracticeStats = StatsUtils.registerSession(StatsUtils.createEmpty(), day("2026-10-21"));
        expect(stats).toEqual({ sessionsCompleted: 1, practiceDays: 1, currentStreak: 1, lastPracticeDay: "2026-10-21" });
    });

    it("counts extra sessions on the same day without growing the streak", () => {
        const first: PracticeStats = StatsUtils.registerSession(StatsUtils.createEmpty(), day("2026-10-21", "09:00"));
        const second: PracticeStats = StatsUtils.registerSession(first, day("2026-10-21", "20:00"));
        expect(second.sessionsCompleted).toBe(2);
        expect(second.practiceDays).toBe(1);
        expect(second.currentStreak).toBe(1);
    });

    it("grows the streak on consecutive days, even across midnight", () => {
        const first: PracticeStats = StatsUtils.registerSession(StatsUtils.createEmpty(), day("2026-10-21", "23:50"));
        const second: PracticeStats = StatsUtils.registerSession(first, day("2026-10-22", "00:10"));
        expect(second.currentStreak).toBe(2);
    });

    it("starts again from 1 after a gap, keeping the total of practice days", () => {
        const first: PracticeStats = StatsUtils.registerSession(StatsUtils.createEmpty(), day("2026-10-21"));
        const second: PracticeStats = StatsUtils.registerSession(first, day("2026-10-22"));
        const afterGap: PracticeStats = StatsUtils.registerSession(second, day("2026-10-25"));
        expect(afterGap.currentStreak).toBe(1);
        expect(afterGap.practiceDays).toBe(3);
    });
});

describe("StatsUtils.getVisibleStreak", () => {
    const stats: PracticeStats = { sessionsCompleted: 5, practiceDays: 4, currentStreak: 3, lastPracticeDay: "2026-10-21" };

    it("shows the streak today and the day after", () => {
        expect(StatsUtils.getVisibleStreak(stats, day("2026-10-21"))).toBe(3);
        expect(StatsUtils.getVisibleStreak(stats, day("2026-10-22"))).toBe(3);
    });

    it("hides it once a day is missed", () => {
        expect(StatsUtils.getVisibleStreak(stats, day("2026-10-23"))).toBe(0);
    });

    it("is zero before any practice", () => {
        expect(StatsUtils.getVisibleStreak(StatsUtils.createEmpty(), day("2026-10-21"))).toBe(0);
    });
});
