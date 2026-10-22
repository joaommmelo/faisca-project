import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { BalanceGameUtils, type BalanceRound, type BalanceSkill } from "./utils.ts";

const drawRounds = (skill: BalanceSkill): BalanceRound[] =>
    Array.from({ length: 300 }, (_, seed) => BalanceGameUtils.createRound(skill, createSeededRandom(seed + 1)));

describe("BalanceGameUtils.createRound", () => {
    it("tips to the heavier pan, or stays level when both weigh the same", () => {
        for (const skill of BalanceGameUtils.getSkills()) {
            for (const round of drawRounds(skill)) {
                const difference: number = BalanceGameUtils.getValue(round.leftPan) - BalanceGameUtils.getValue(round.rightPan);
                const side: string = difference === 0 ? "equal" : difference > 0 ? "left" : "right";
                expect(round.answer).toBe(side);
                expect(round.options).toEqual(BalanceGameUtils.getValidSides());
                expect(Math.abs(difference)).toBeLessThanOrEqual(BalanceGameUtils.getMaxDifference(skill));
                if (round.leftPan.operation !== null) {
                    expect(BalanceGameUtils.getPanId(round.leftPan)).not.toBe(BalanceGameUtils.getPanId(round.rightPan));
                }
            }
        }
    });

    it("weighs the same now and then, and tips both ways", () => {
        const sides: string[] = drawRounds("products").map((round) => String(round.answer));
        expect(sides).toContain("equal");
        expect(sides).toContain("left");
        expect(sides).toContain("right");
        expect(sides.filter((side) => side === "equal").length).toBeLessThan(sides.length / 2);
    });

    it("puts plain numbers first, then a sum against a number, then products", () => {
        expect(drawRounds("numbers").every((round) => round.leftPan.operation === null && round.rightPan.operation === null)).toBe(true);
        for (const round of drawRounds("sum-and-number")) {
            expect([round.leftPan.operation, round.rightPan.operation].sort()).toEqual(["addition", null].sort());
        }
        expect(drawRounds("products").every((round) => round.leftPan.operation === "multiplication")).toBe(true);
    });

    it("works out the left calculation, or the right one when the left pan holds a number", () => {
        const [sumOnRight] = drawRounds("sum-and-number").filter((round) => round.leftPan.operation === null);
        expect(BalanceGameUtils.getHintSide(sumOnRight)).toBe("right");
        expect(BalanceGameUtils.getHintSide(drawRounds("products")[0])).toBe("left");
        expect(BalanceGameUtils.getHintSide(drawRounds("numbers")[0])).toBeNull();
    });
});
