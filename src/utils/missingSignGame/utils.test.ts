import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { OperationsUtils } from "../operations/utils.ts";
import { MissingSignGameUtils, type MissingSignRound, type MissingSignSkill } from "./utils.ts";

const drawRounds = (skill: MissingSignSkill): MissingSignRound[] =>
    Array.from({ length: 300 }, (_, seed) => MissingSignGameUtils.createRound(skill, createSeededRandom(seed + 1)));

describe("MissingSignGameUtils.createRound", () => {
    it("asks + or − first, then ×, then ÷", () => {
        const operations = (skill: MissingSignSkill): Set<unknown> => new Set(drawRounds(skill).map((round) => round.answer));
        expect(operations("add-subtract")).toEqual(new Set(["addition", "subtraction"]));
        expect(operations("multiply")).toEqual(new Set(["multiplication"]));
        expect(operations("divide")).toEqual(new Set(["division"]));
        expect(operations("bigger-numbers")).toEqual(new Set(OperationsUtils.getValidOperations()));
    });

    it("always offers the four signs, takes every sign that makes the result, and never × 1 or ÷ 1", () => {
        for (const skill of MissingSignGameUtils.getSkills()) {
            for (const round of drawRounds(skill)) {
                expect(round.options).toEqual(OperationsUtils.getValidOperations());
                expect(round.answers).toContain(round.answer);
                expect(round.result).toBeGreaterThanOrEqual(1);
                expect(Number.isInteger(round.result)).toBe(true);
                if (round.answer === "multiplication" || round.answer === "division") {
                    expect(round.right).not.toBe(1);
                }
            }
        }
        expect(MissingSignGameUtils.getAnswers(2, 2, 4)).toEqual(["addition", "multiplication"]);
        expect(MissingSignGameUtils.getAnswers(4, 2, 2)).toEqual(["subtraction", "division"]);
    });

    it("keeps + and − up to 20 at first, and goes up to 100 and 12 × 12 with the bigger numbers", () => {
        expect(drawRounds("add-subtract").every((round) => Math.max(round.left, round.result) <= 20)).toBe(true);
        expect(drawRounds("bigger-numbers").every((round) => Math.max(round.left, round.result) <= 144)).toBe(true);
    });
});
