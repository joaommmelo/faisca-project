import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { NumberBondsGameUtils, type NumberBondsRound, type NumberBondsSkill } from "./utils.ts";

const drawRounds = (skill: NumberBondsSkill): NumberBondsRound[] =>
    Array.from({ length: 200 }, (_, seed) => NumberBondsGameUtils.createRound(skill, createSeededRandom(seed + 1)));

describe("NumberBondsGameUtils.createRound", () => {
    it("makes 10 with the frame first, then without it", () => {
        for (const round of drawRounds("ten-frame")) {
            expect(round.whole).toBe(10);
            expect(round.hasFrame).toBe(true);
        }
        expect(drawRounds("ten").every((round) => round.whole === 10 && !round.hasFrame)).toBe(true);
    });

    it("makes 20 across the ten, and 100 from round tens and then from any number", () => {
        expect(drawRounds("twenty").every((round) => round.whole === 20 && round.part !== 10)).toBe(true);
        expect(drawRounds("hundred-tens").every((round) => round.whole === 100 && round.part % 10 === 0)).toBe(true);
        expect(drawRounds("hundred").every((round) => round.whole === 100 && round.part % 10 !== 0 && round.part > 10)).toBe(true);
    });

    it("asks what is missing, among three numbers inside the whole", () => {
        for (const skill of NumberBondsGameUtils.getSkills()) {
            for (const round of drawRounds(skill)) {
                expect(round.answer).toBe(round.whole - round.part);
                expect(round.options).toHaveLength(NumberBondsGameUtils.getOptionsCount());
                expect(new Set(round.options).size).toBe(round.options.length);
                expect(round.options).toContain(round.answer);
                expect(round.options.every((option) => Number(option) >= 1 && Number(option) < round.whole)).toBe(true);
            }
        }
    });

    it("can offer the slip of making each digit up to 10", () => {
        const slips: boolean[] = drawRounds("hundred").map((round) => {
            const digitSlip: number = (10 - Math.floor(round.part / 10)) * 10 + (10 - (round.part % 10));
            return round.options.includes(digitSlip);
        });
        expect(slips).toContain(true);
    });
});
