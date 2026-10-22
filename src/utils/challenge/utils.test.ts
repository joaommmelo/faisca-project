import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import { createSeededRandom } from "../../test/random.ts";
import { OperationsUtils } from "../operations/utils.ts";
import { ChallengeUtils, type ChallengeQuestion, type ChallengeRun } from "./utils.ts";

const digitsOf = (value: number): number => String(value).length;

describe("ChallengeUtils levels", () => {
    it("goes up a level every 5 right answers", () => {
        expect(ChallengeUtils.getLevel(0)).toBe(1);
        expect(ChallengeUtils.getLevel(4)).toBe(1);
        expect(ChallengeUtils.getLevel(5)).toBe(2);
        expect(ChallengeUtils.isLevelUp(5)).toBe(true);
        expect(ChallengeUtils.isLevelUp(6)).toBe(false);
        expect(ChallengeUtils.isLevelUp(0)).toBe(false);
    });

    it("starts with additions and lets the other operations join every two levels", () => {
        expect(ChallengeUtils.getOperations(1)).toEqual(["addition"]);
        expect(ChallengeUtils.getOperations(2)).toEqual(["addition"]);
        expect(ChallengeUtils.getOperations(3)).toEqual(["addition", "subtraction"]);
        expect(ChallengeUtils.getOperations(5)).toEqual(["addition", "subtraction", "multiplication"]);
        expect(ChallengeUtils.getOperations(7)).toEqual(OperationsUtils.getValidOperations());
        expect(ChallengeUtils.getJoiningOperation(5)).toBe("multiplication");
        expect(ChallengeUtils.getJoiningOperation(6)).toBeNull();
    });

    it("starts each operation at two digits and grows one per level, up to seven", () => {
        expect(ChallengeUtils.getDigits("addition", 1)).toBe(2);
        expect(ChallengeUtils.getDigits("addition", 6)).toBe(7);
        expect(ChallengeUtils.getDigits("addition", 20)).toBe(7);
        expect(ChallengeUtils.getDigits("division", 7)).toBe(2);
        expect(ChallengeUtils.getDigits("division", 12)).toBe(7);
    });

    it("reaches the top at level 12, where every operation has seven digits", () => {
        const topLevel: number = ChallengeUtils.getTopLevel();
        expect(topLevel).toBe(12);
        expect(ChallengeUtils.getOperations(topLevel).map((operation) => ChallengeUtils.getDigits(operation, topLevel))).toEqual([7, 7, 7, 7]);
        expect(ChallengeUtils.getDigits("division", topLevel - 1)).toBe(6);
    });
});

describe("ChallengeUtils time", () => {
    it("shrinks the time evenly to half at the top level, and no further", () => {
        expect(ChallengeUtils.getSpeedFactor(1)).toBe(1);
        expect(ChallengeUtils.getSpeedFactor(ChallengeUtils.getTopLevel())).toBe(0.5);
        expect(ChallengeUtils.getSpeedFactor(40)).toBe(0.5);
        expect(ChallengeUtils.getSpeedFactor(6)).toBeLessThan(ChallengeUtils.getSpeedFactor(5));
    });

    it("gives more time to bigger numbers", () => {
        expect(ChallengeUtils.getTimeLimitMilliseconds(2, 1)).toBe(8000);
        expect(ChallengeUtils.getTimeLimitMilliseconds(7, 1)).toBe(23_000);
        expect(ChallengeUtils.getTimeLimitMilliseconds(7, ChallengeUtils.getTopLevel())).toBe(11_500);
    });

    it("stops the clock and goes on from where it was", () => {
        const clock = ChallengeUtils.startClock(10_000, 1000);
        expect(ChallengeUtils.getRemainingMilliseconds(clock, 4000)).toBe(7000);

        const paused = ChallengeUtils.pauseClock(clock, 4000);
        expect(ChallengeUtils.getRemainingMilliseconds(paused, 60_000)).toBe(7000);

        const resumed = ChallengeUtils.resumeClock(paused, 60_000);
        expect(ChallengeUtils.getRemainingMilliseconds(resumed, 62_000)).toBe(5000);
        expect(ChallengeUtils.getRemainingMilliseconds(resumed, 99_000)).toBe(0);
    });
});

describe("ChallengeUtils.generate", () => {
    const random = createSeededRandom(11);

    for (const operation of OperationsUtils.getValidOperations()) {
        for (let digits = ChallengeUtils.getMinDigits(); digits <= ChallengeUtils.getMaxDigits(); digits++) {
            it(`makes ${operation} with ${digits} digits`, () => {
                for (let attempt = 0; attempt < 200; attempt++) {
                    const { left, right } = ChallengeUtils.generate(operation, digits, random);
                    const result: number = OperationsUtils.calculate(operation, left, right);
                    const biggest: number = Math.max(left, right, result);

                    expect(digitsOf(biggest)).toBe(digits);
                    expect(Number.isInteger(result)).toBe(true);
                    expect(result).toBeGreaterThanOrEqual(1);
                    if (OperationsUtils.isAdditive(operation)) {
                        expect(digitsOf(Math.min(left, right))).toBeGreaterThanOrEqual(Math.max(2, digits - 1));
                    } else {
                        expect(right).toBeGreaterThanOrEqual(2);
                        expect(right).toBeLessThanOrEqual(9);
                    }
                }
            });
        }
    }
});

describe("ChallengeUtils.createQuestion", () => {
    it("asks only the operations open at the level, against the level's time", () => {
        const random = createSeededRandom(3);
        const correctCount: number = 2 * ChallengeUtils.getAnswersPerLevel();
        for (let attempt = 0; attempt < 100; attempt++) {
            const question: ChallengeQuestion = ChallengeUtils.createQuestion(correctCount, null, random);
            expect(ChallengeUtils.getOperations(3)).toContain(question.operation);
            expect(question.digits).toBe(ChallengeUtils.getDigits(question.operation, 3));
            expect(question.answer).toBe(question.result);
            expect(question.timeLimitMilliseconds).toBe(ChallengeUtils.getTimeLimitMilliseconds(question.digits, 3));
        }
    });

    it("never asks the same question twice in a row", () => {
        const random = createSeededRandom(5);
        let previous: ChallengeQuestion | null = null;
        for (let attempt = 0; attempt < 300; attempt++) {
            const question: ChallengeQuestion = ChallengeUtils.createQuestion(0, previous, random);
            expect(question.id).not.toBe(previous?.id);
            previous = question;
        }
    });
});

describe("ChallengeUtils records", () => {
    const run = (correctCount: number, previousRecord: number | null): ChallengeRun => ({
        correctCount,
        lastQuestion: ChallengeUtils.createQuestion(correctCount, null, createSeededRandom(1)),
        givenAnswer: null,
        ending: "time",
        previousRecord
    });

    it("keeps the most right answers in one run", () => {
        const profile = createTestProfile({}, { challengeRecord: 12 });
        expect(ChallengeUtils.finishRun(profile, run(15, 12)).challengeRecord).toBe(15);
        expect(ChallengeUtils.finishRun(profile, run(9, 12)).challengeRecord).toBe(12);
        expect(ChallengeUtils.finishRun(profile, run(12, 12)).challengeRecord).toBe(12);
    });

    it("needs at least one right answer for a first record", () => {
        expect(ChallengeUtils.isNewRecord(run(0, null))).toBe(false);
        expect(ChallengeUtils.isNewRecord(run(1, null))).toBe(true);
    });

    it("changes nothing else in the profile", () => {
        const profile = createTestProfile();
        const finished = ChallengeUtils.finishRun(profile, run(7, null));
        expect(finished).toEqual({ ...profile, challengeRecord: 7 });
    });
});
