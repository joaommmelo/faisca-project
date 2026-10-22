import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { CountingGameUtils, type CountingRound, type CountingSkill } from "./utils.ts";

const drawRounds = (skill: CountingSkill): CountingRound[] =>
    Array.from({ length: 200 }, (_, seed) => CountingGameUtils.createRound(skill, createSeededRandom(seed + 1)));

describe("CountingGameUtils.createRound", () => {
    it("counts up to 5 like a die, then up to 10 and 20 in rows", () => {
        for (const round of drawRounds("to-five")) {
            expect(round.layout).toBe("dice");
            expect(round.answer).toBeGreaterThanOrEqual(1);
            expect(round.answer).toBeLessThanOrEqual(5);
        }
        for (const round of drawRounds("to-ten")) {
            expect(round.layout).toBe("rows");
            expect(round.answer).toBeGreaterThanOrEqual(6);
            expect(round.answer).toBeLessThanOrEqual(10);
        }
        for (const round of drawRounds("to-twenty")) {
            expect(round.answer).toBeGreaterThanOrEqual(11);
            expect(round.answer).toBeLessThanOrEqual(20);
        }
    });

    it("scatters one bone per cell of the grid", () => {
        for (const round of drawRounds("scattered")) {
            expect(round.spots).toHaveLength(round.answer);
            expect(new Set(round.spots).size).toBe(round.spots.length);
            expect(round.spots.every((spot) => spot >= 0 && spot < CountingGameUtils.getScatterCells())).toBe(true);
        }
    });

    it("joins two groups of up to 5", () => {
        for (const round of drawRounds("two-groups")) {
            expect(round.groups).toHaveLength(2);
            expect(round.answer).toBe(round.groups[0] + round.groups[1]);
            expect(Math.max(...round.groups)).toBeLessThanOrEqual(CountingGameUtils.getDiceMax());
        }
    });

    it("offers the answer and two other numbers above 0, in order", () => {
        for (const skill of CountingGameUtils.getSkills()) {
            for (const round of drawRounds(skill)) {
                expect(round.options).toHaveLength(CountingGameUtils.getOptionsCount());
                expect(new Set(round.options).size).toBe(round.options.length);
                expect(round.options).toContain(round.answer);
                expect(round.answers).toEqual([round.answer]);
                expect([...round.options].sort((first, second) => Number(first) - Number(second))).toEqual(round.options);
                expect(round.options.every((option) => Number(option) >= 1)).toBe(true);
            }
        }
    });
});
