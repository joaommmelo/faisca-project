import { describe, expect, it } from "vitest";
import { FactsUtils, type Fact } from "../facts/utils.ts";
import { LeitnerUtils } from "./utils.ts";

function getFact(firstFactor: number, secondFactor: number): Fact {
    const fact: Fact | undefined = FactsUtils.getAll().find((candidate) => candidate.id === FactsUtils.getFactId(firstFactor, secondFactor));
    if (fact === undefined) {
        throw new Error(`Unknown fact ${firstFactor}×${secondFactor}`);
    }
    return fact;
}

describe("LeitnerUtils.applyAnswer", () => {
    it("moves a new fact from box 1 to box 2 when correct", () => {
        expect(LeitnerUtils.applyAnswer({}, "7x8", true)).toEqual({ "7x8": 2 });
    });

    it("moves a fact up one box when correct", () => {
        expect(LeitnerUtils.applyAnswer({ "7x8": 3 }, "7x8", true)["7x8"]).toBe(4);
    });

    it("never goes past box 5", () => {
        expect(LeitnerUtils.applyAnswer({ "7x8": 5 }, "7x8", true)["7x8"]).toBe(5);
    });

    it("sends a fact back to box 1 when wrong", () => {
        expect(LeitnerUtils.applyAnswer({ "7x8": 4 }, "7x8", false)["7x8"]).toBe(1);
    });

    it("does not mutate the original boxes", () => {
        const boxes = { "7x8": 2 };
        LeitnerUtils.applyAnswer(boxes, "7x8", true);
        expect(boxes).toEqual({ "7x8": 2 });
    });
});

describe("LeitnerUtils.getBox", () => {
    it("treats a never-practised fact as box 1", () => {
        expect(LeitnerUtils.getBox({}, "6x7")).toBe(1);
        expect(LeitnerUtils.isPractised({}, "6x7")).toBe(false);
    });
});

describe("LeitnerUtils.getDrawWeight", () => {
    it("is inversely proportional to the box", () => {
        const fact = getFact(7, 8);
        expect(LeitnerUtils.getDrawWeight(fact, { "7x8": 1 })).toBe(1);
        expect(LeitnerUtils.getDrawWeight(fact, { "7x8": 2 })).toBe(0.5);
        expect(LeitnerUtils.getDrawWeight(fact, { "7x8": 5 })).toBe(0.2);
    });

    it("reduces the weight of facts with 1 or 10", () => {
        const hardFact = getFact(7, 8);
        const factWithTen = getFact(7, 10);
        const factWithOne = getFact(1, 8);
        expect(LeitnerUtils.getDrawWeight(factWithTen, {})).toBeLessThan(LeitnerUtils.getDrawWeight(hardFact, {}));
        expect(LeitnerUtils.getDrawWeight(factWithOne, {})).toBeLessThan(LeitnerUtils.getDrawWeight(hardFact, {}));
    });
});
