import { describe, expect, it } from "vitest";
import { LevelsUtils, type TrackProgress } from "./utils.ts";

describe("LevelsUtils.getPointsToLevelUp", () => {
    it("asks 20 + 10 × N typed answers to leave level N, up to a ceiling", () => {
        expect(LevelsUtils.getPointsToLevelUp(1)).toBe(30 * 2);
        expect(LevelsUtils.getPointsToLevelUp(3)).toBe(50 * 2);
        expect(LevelsUtils.getPointsToLevelUp(20)).toBe(100 * 2);
    });
});

describe("LevelsUtils.recordAnswer", () => {
    it("counts a typed answer twice as much as multiple choice", () => {
        const track: TrackProgress = LevelsUtils.createTrack();
        expect(LevelsUtils.recordAnswer(track, { questionId: "a", isCorrect: true, format: "keypad" }).track.points).toBe(2);
        expect(LevelsUtils.recordAnswer(track, { questionId: "a", isCorrect: true, format: "choice" }).track.points).toBe(1);
        expect(LevelsUtils.recordAnswer(track, { questionId: "a", isCorrect: false, format: "vertical" }).track.points).toBe(0);
    });

    it("goes up a level after 30 right typed answers at level 1", () => {
        let track: TrackProgress = LevelsUtils.createTrack();
        const reached: number[] = [];
        for (let answer = 0; answer < 30; answer++) {
            const result = LevelsUtils.recordAnswer(track, { questionId: `q${answer}`, isCorrect: true, format: "vertical" });
            track = result.track;
            reached.push(...result.reachedLevels);
        }
        expect(track.level).toBe(2);
        expect(track.points).toBe(0);
        expect(reached).toEqual([2]);
    });

    it("keeps only the most recent answers and counts them for the safety net", () => {
        let track: TrackProgress = LevelsUtils.createTrack();
        for (let answer = 0; answer < 50; answer++) {
            track = LevelsUtils.recordAnswer(track, { questionId: `q${answer}`, isCorrect: false, format: "keypad" }).track;
        }
        expect(track.recentAnswers).toHaveLength(LevelsUtils.getMaxRecentAnswers());
        expect(track.recentAnswers.at(-1)?.questionId).toBe("q49");
        expect(track.answersSinceSafetyNet).toBe(50);
    });
});
