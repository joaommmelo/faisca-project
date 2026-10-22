import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { SkipCountingGameUtils, type SkipCountingRound, type SkipCountingSkill } from "./utils.ts";

const drawRounds = (skill: SkipCountingSkill): SkipCountingRound[] =>
    Array.from({ length: 200 }, (_, seed) => SkipCountingGameUtils.createRound(skill, createSeededRandom(seed + 1)));

describe("SkipCountingGameUtils.createRound", () => {
    it("jumps by the same step, from a number of the step's table", () => {
        for (const skill of SkipCountingGameUtils.getSkills()) {
            for (const round of drawRounds(skill)) {
                expect(SkipCountingGameUtils.getSteps(skill)).toContain(round.step);
                expect(round.numbers).toHaveLength(SkipCountingGameUtils.getSequenceLength());
                expect(round.numbers[0] % round.step).toBe(0);
                round.numbers.slice(1).forEach((number, index) => expect(number - round.numbers[index]).toBe(round.step));
            }
        }
    });

    it("stays up to 20 in jumps of 1 and inside 12 jumps of the others", () => {
        expect(drawRounds("ones").every((round) => round.numbers[4] <= SkipCountingGameUtils.getMaxOnes())).toBe(true);
        for (const round of drawRounds("bigger-steps")) {
            expect(round.numbers[4]).toBeLessThanOrEqual(round.step * SkipCountingGameUtils.getMaxJumps());
        }
    });

    it("hides any number but the first, and offers it among three", () => {
        for (const skill of SkipCountingGameUtils.getSkills()) {
            for (const round of drawRounds(skill)) {
                expect(round.missingIndex).toBeGreaterThanOrEqual(1);
                expect(round.answer).toBe(round.numbers[round.missingIndex]);
                expect(round.options).toHaveLength(SkipCountingGameUtils.getOptionsCount());
                expect(new Set(round.options).size).toBe(round.options.length);
                expect(round.options).toContain(round.answer);
            }
        }
    });
});
