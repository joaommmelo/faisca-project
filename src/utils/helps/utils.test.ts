import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
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
    it("costs a coin and stops at the session limit", () => {
        expect(HelpsUtils.canUse(freshSession(keypadMultiplication), { coins: 1, points: 0 })).toBe(true);
        expect(HelpsUtils.canUse(freshSession(keypadMultiplication), { coins: 0, points: 9 })).toBe(false);
        expect(HelpsUtils.getUnavailableReason(freshSession(keypadMultiplication), { coins: 0, points: 9 })).toBe("no-coins");
        expect(HelpsUtils.canUse(freshSession(keypadMultiplication, HelpsUtils.getMaxHelpsPerSession()), { coins: 5, points: 0 })).toBe(false);
        expect(HelpsUtils.getUnavailableReason(freshSession(keypadMultiplication, HelpsUtils.getMaxHelpsPerSession()), { coins: 5, points: 0 })).toBe("limit");
    });

    it("keeps helping on a question already paid for", () => {
        const paid: Session = { ...freshSession(keypadMultiplication, HelpsUtils.getMaxHelpsPerSession()), isCurrentHelped: true };
        expect(HelpsUtils.canUse(paid, { coins: 0, points: 0 })).toBe(true);
    });
});

describe("HelpsUtils.getOptionsToHide", () => {
    const choice: Question = {
        ...QuestionsUtils.buildMultiplication(factSevenEight, { mode: "direct", boxes: {} }),
        left: 7,
        right: 8,
        options: [48, 56, 63, 65],
        answer: 56
    };

    it("takes away 2 of the 4 options, never the answer", () => {
        const hidden: number[] = HelpsUtils.getOptionsToHide(choice, [], createSeededRandom(1));
        expect(hidden).toHaveLength(2);
        expect(hidden).not.toContain(56);
    });

    it("after a miss leaves the answer and one other untried option", () => {
        const hidden: number[] = HelpsUtils.getOptionsToHide(choice, [48], createSeededRandom(2));
        expect(hidden).toHaveLength(1);
        expect(hidden).not.toContain(56);
        expect(hidden).not.toContain(48);
    });
});

describe("HelpsUtils.getArithmeticHint", () => {
    const build = (operation: "addition" | "subtraction", left: number, right: number): Question =>
        QuestionsUtils.buildForSkill({ isAlwaysTyped: false, operation, difficulty: "medium", skill: "carry", left, right, layout: "result", skillBoxes: {} });

    it("adds the tens first and leaves the units", () => {
        expect(HelpsUtils.getArithmeticHint(build("addition", 37, 25))).toEqual({
            kind: "split",
            firstStep: { left: 37, right: 20, result: 57 },
            remaining: 5
        });
        expect(HelpsUtils.getArithmeticHint(build("subtraction", 52, 27))).toEqual({
            kind: "split",
            firstStep: { left: 52, right: 20, result: 32 },
            remaining: 7
        });
    });

    it("goes to the ten first when a single digit crosses it", () => {
        expect(HelpsUtils.getArithmeticHint(build("addition", 8, 5))).toEqual({ kind: "split", firstStep: { left: 8, right: 2, result: 10 }, remaining: 3 });
        expect(HelpsUtils.getArithmeticHint(build("subtraction", 13, 7))).toEqual({
            kind: "split",
            firstStep: { left: 13, right: 3, result: 10 },
            remaining: 4
        });
    });

    it("says where to start counting otherwise, and never gives the answer", () => {
        expect(HelpsUtils.getArithmeticHint(build("addition", 3, 4))).toEqual({ kind: "count", start: 3, steps: 4, unit: 1 });
        expect(HelpsUtils.getArithmeticHint(build("addition", 7, 3))).toEqual({ kind: "count", start: 7, steps: 3, unit: 1 });
        expect(HelpsUtils.getArithmeticHint(build("subtraction", 20, 7))).toEqual({ kind: "count", start: 20, steps: 7, unit: 1 });
        expect(HelpsUtils.getArithmeticHint(build("addition", 37, 20))).toEqual({ kind: "count", start: 37, steps: 2, unit: 10 });
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
        const addition: Question = QuestionsUtils.buildForSkill({
            isAlwaysTyped: false,
            operation: "addition",
            difficulty: "medium",
            skill: "carry",
            left: 37,
            right: 25,
            layout: "vertical",
            skillBoxes: {}
        });
        const [units, tens] = VerticalUtils.getColumns(addition);
        expect(HelpsUtils.getVerticalSteps(units)).toEqual(["column", "digit"]);
        expect(HelpsUtils.getVerticalSteps(tens)).toEqual(["column", "marks", "digit"]);
    });
});

describe("HelpsUtils.getArithmeticHint with bigger numbers", () => {
    const build = (operation: "multiplication" | "division", left: number, right: number): Question =>
        QuestionsUtils.buildForSkill({ operation, difficulty: "hard", skill: "no-carry", left, right, layout: "result", isAlwaysTyped: false, skillBoxes: {} });

    it("multiplies the biggest place first", () => {
        expect(HelpsUtils.getArithmeticHint(build("multiplication", 23, 4))).toEqual({
            kind: "partial",
            firstStep: { left: 20, right: 4, result: 80 },
            rest: { left: 3, right: 4 }
        });
        expect(HelpsUtils.getArithmeticHint(build("multiplication", 157, 6))).toEqual({
            kind: "partial",
            firstStep: { left: 100, right: 6, result: 600 },
            rest: { left: 57, right: 6 }
        });
    });

    it("divides an easy multiple first", () => {
        expect(HelpsUtils.getArithmeticHint(build("division", 72, 4))).toEqual({
            kind: "partial",
            firstStep: { left: 40, right: 4, result: 10 },
            rest: { left: 32, right: 4 }
        });
        expect(HelpsUtils.getArithmeticHint(build("division", 412, 4))).toEqual({
            kind: "partial",
            firstStep: { left: 400, right: 4, result: 100 },
            rest: { left: 12, right: 4 }
        });
    });

    it("drops the zeros of a round number instead of giving the answer", () => {
        expect(HelpsUtils.getArithmeticHint(build("multiplication", 20, 4))).toEqual({ kind: "round", base: { left: 2, right: 4, result: 8 }, zeros: 1 });
        expect(HelpsUtils.getArithmeticHint(build("division", 80, 4))).toEqual({ kind: "round", base: { left: 8, right: 4, result: 2 }, zeros: 1 });
    });
});
