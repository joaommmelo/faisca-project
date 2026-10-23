import { describe, expect, it } from "vitest";
import { LevelsUtils, type TrackProgress, type Tracks } from "../levels/utils.ts";
import { StarsUtils, type StarsProgress } from "./utils.ts";

const track = (level: number, points: number = 0): TrackProgress => ({ level, points, recentAnswers: [], answersSinceSafetyNet: 0 });

describe("StarsUtils.getProgress", () => {
    it("starts with no stars and asks for 10 right typed answers for the first", () => {
        expect(StarsUtils.getProgress({})).toEqual({ stars: 0, points: 0, pointsToNextStar: 20 });
    });

    it("adds up every point of every game, the levels already passed included", () => {
        const tracks: Tracks = { "addition:easy": track(2, 4), "counting-game": track(1, 10), "memory-game": track(1, 6) };
        expect(StarsUtils.getTotalPoints(tracks)).toBe(LevelsUtils.getPointsToReach(2) + 4 + 10 + 6);
    });

    it("asks a little more for each star: 10, 20, 30 right typed answers", () => {
        expect(StarsUtils.getProgress({ "addition:easy": track(1, 19) }).stars).toBe(0);
        expect(StarsUtils.getProgress({ "addition:easy": track(1, 20) })).toEqual({ stars: 1, points: 0, pointsToNextStar: 40 });
        expect(StarsUtils.getProgress({ "addition:easy": track(2, 0), "balance-game": track(1, 55) })).toEqual({ stars: 2, points: 55, pointsToNextStar: 60 });
    });

    it("says how many right typed answers are left, rounding a half up", () => {
        const progress: StarsProgress = { stars: 2, points: 55, pointsToNextStar: 60 };
        expect(StarsUtils.getAnswersToNextStar(progress)).toBe(3);
        expect(StarsUtils.getProgressRatio(progress)).toBeCloseTo(55 / 60);
    });
});

describe("StarsUtils.getMilestones", () => {
    it("celebrates each star reached between two moments, and nothing otherwise", () => {
        expect(StarsUtils.getMilestones({ "addition:easy": track(1, 10) }, { "addition:easy": track(1, 12) })).toEqual([]);
        expect(StarsUtils.getMilestones({ "addition:easy": track(1, 18) }, { "addition:easy": track(2, 0), "counting-game": track(1, 20) })).toEqual([
            { kind: "star" },
            { kind: "star" }
        ]);
    });
});
