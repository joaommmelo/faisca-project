import { describe, expect, it } from "vitest";
import { FactsUtils, type Fact } from "../facts/utils.ts";
import { QuestionsUtils, type Question } from "../questions/utils.ts";
import type { Session } from "../session/utils.ts";
import { VerticalUtils } from "../vertical/utils.ts";
import { HelpsUtils } from "./utils.ts";

const factSevenEight: Fact = FactsUtils.getAll().find((fact) => fact.id === "7x8") as Fact;

function freshSession(question: Question, helpsUsed: number = 0): Session {
    return { questions: [question], currentIndex: 0, records: [], missedAttempts: [], isCurrentHelped: false, helpsUsed };
}

const keypadMultiplication: Question = { ...QuestionsUtils.buildMultiplication(factSevenEight, { mode: "direct", boxes: { "7x8": 4 } }), left: 7, right: 8 };

describe("HelpsUtils.canUse", () => {
    it("never helps with multiple choice", () => {
        const choice: Question = QuestionsUtils.buildMultiplication(factSevenEight, { mode: "direct", boxes: {} });
        expect(HelpsUtils.canUse(freshSession(choice), choice, { coins: 5, points: 0 })).toBe(false);
    });

    it("costs a coin and stops at the session limit", () => {
        expect(HelpsUtils.canUse(freshSession(keypadMultiplication), keypadMultiplication, { coins: 1, points: 0 })).toBe(true);
        expect(HelpsUtils.canUse(freshSession(keypadMultiplication), keypadMultiplication, { coins: 0, points: 9 })).toBe(false);
        expect(HelpsUtils.canUse(freshSession(keypadMultiplication, HelpsUtils.getMaxHelpsPerSession()), keypadMultiplication, { coins: 5, points: 0 })).toBe(false);
    });

    it("keeps helping on a question already paid for", () => {
        const paid: Session = { ...freshSession(keypadMultiplication, HelpsUtils.getMaxHelpsPerSession()), isCurrentHelped: true };
        expect(HelpsUtils.canUse(paid, keypadMultiplication, { coins: 0, points: 0 })).toBe(true);
    });
});

describe("HelpsUtils.getNeighbourFact", () => {
    it("shows the neighbour the child knows best", () => {
        expect(HelpsUtils.getNeighbourFact(keypadMultiplication, { "7x9": 4, "7x7": 2 })).toEqual({ left: 7, right: 9, result: 63 });
    });

    it("moves the hidden number in a division", () => {
        const division: Question = { ...QuestionsUtils.buildDivision(factSevenEight, { boxes: {} }), left: 56, right: 7, answer: 8, result: 8 };
        expect(HelpsUtils.getNeighbourFact(division, {})).toEqual({ left: 7, right: 7, result: 49 });
    });
});

describe("HelpsUtils.getVerticalSteps", () => {
    it("shows the carry or the borrow only where there is one", () => {
        const addition: Question = QuestionsUtils.buildArithmetic({ operation: "addition", difficulty: "medium", skill: "carry", left: 37, right: 25, layout: "vertical", skillBoxes: {} });
        const [units, tens] = VerticalUtils.getColumns(addition);
        expect(HelpsUtils.getVerticalSteps(units)).toEqual(["column", "digit"]);
        expect(HelpsUtils.getVerticalSteps(tens)).toEqual(["column", "marks", "digit"]);
    });
});
