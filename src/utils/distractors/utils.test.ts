import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { ArithmeticUtils } from "../arithmetic/utils.ts";
import { DifficultiesUtils } from "../difficulties/utils.ts";
import { FactsUtils } from "../facts/utils.ts";
import type { ArithmeticOperation } from "../operations/utils.ts";
import type { QuestionKind } from "../questions/utils.ts";
import { DistractorsUtils } from "./utils.ts";

function multiplication(left: number, right: number, kind: QuestionKind = "direct") {
    const result: number = left * right;
    const answer: number = kind === "direct" ? result : kind === "missing-left" ? left : right;
    return { operation: "multiplication" as const, kind, left, right, result, answer };
}

function arithmetic(operation: ArithmeticOperation, left: number, right: number) {
    const result: number = operation === "addition" ? left + right : left - right;
    return { operation, kind: "direct" as const, left, right, result, answer: result };
}

describe("DistractorsUtils.getOptions", () => {
    const random = createSeededRandom(2026);
    const kinds: QuestionKind[] = ["direct", "missing-left", "missing-right"];

    for (const kind of kinds) {
        it(`gives 4 distinct, sensible options for every fact (${kind})`, () => {
            for (const fact of FactsUtils.getAll()) {
                for (const [left, right] of [[fact.smallerFactor, fact.largerFactor], [fact.largerFactor, fact.smallerFactor]]) {
                    const question = multiplication(left, right, kind);
                    const options: number[] = DistractorsUtils.getOptions(question, random);

                    expect(options).toHaveLength(4);
                    expect(new Set(options).size).toBe(4);
                    expect(options).toContain(question.answer);
                    expect(options.every((option) => option > 0)).toBe(true);
                    if (kind !== "direct") {
                        expect(options.every((option) => FactsUtils.isValidFactor(option))).toBe(true);
                    }
                }
            }
        });
    }

    it("gives 4 distinct factors for every division", () => {
        for (const fact of FactsUtils.getAll()) {
            const question = { operation: "division" as const, kind: "direct" as const, left: fact.product, right: fact.smallerFactor, result: fact.largerFactor, answer: fact.largerFactor };
            const options: number[] = DistractorsUtils.getOptions(question, random);
            expect(new Set(options).size).toBe(4);
            expect(options).toContain(fact.largerFactor);
            expect(options.every((option) => FactsUtils.isValidFactor(option))).toBe(true);
        }
    });

    it("gives 4 distinct positive options for additions and subtractions of every difficulty", () => {
        for (const operation of ["addition", "subtraction"] as ArithmeticOperation[]) {
            for (const difficulty of DifficultiesUtils.getValidDifficulties()) {
                for (const skill of ArithmeticUtils.getSkills(operation, difficulty)) {
                    for (let attempt = 0; attempt < 50; attempt++) {
                        const { left, right } = ArithmeticUtils.generate(operation, difficulty, skill, random);
                        const question = arithmetic(operation, left, right);
                        const options: number[] = DistractorsUtils.getOptions(question, random);
                        expect(new Set(options).size).toBe(4);
                        expect(options).toContain(question.answer);
                        expect(options.every((option) => option > 0)).toBe(true);
                    }
                }
            }
        }
    });
});

describe("DistractorsUtils.getDistractors", () => {
    it("uses table neighbours, ±1 and swapped digits for 7 × 8", () => {
        const plausibleMistakes: number[] = [49, 63, 48, 64, 55, 57, 65];
        const random = createSeededRandom(8);
        for (let attempt = 0; attempt < 50; attempt++) {
            const distractors: number[] = DistractorsUtils.getDistractors(multiplication(7, 8), random);
            expect(distractors.every((distractor) => plausibleMistakes.includes(distractor))).toBe(true);
        }
    });

    it("still finds three distractors for 1 × 1", () => {
        const distractors: number[] = DistractorsUtils.getDistractors(multiplication(1, 1), createSeededRandom(1));
        expect(distractors).toHaveLength(3);
        expect(distractors).not.toContain(1);
        expect(distractors.every((distractor) => distractor > 0)).toBe(true);
    });

    it("never turns a product ending in zero into a leading zero", () => {
        const random = createSeededRandom(40);
        for (let attempt = 0; attempt < 50; attempt++) {
            expect(DistractorsUtils.getDistractors(multiplication(4, 10), random)).not.toContain(4);
        }
    });

    it("offers nearby factors and the shown factor for ? × 7 = 56", () => {
        const distractors: number[] = DistractorsUtils.getDistractors(multiplication(8, 7, "missing-left"), createSeededRandom(3));
        expect([...distractors].sort((first, second) => first - second)).toEqual([6, 7, 9]);
    });

    it("includes the classic column slips", () => {
        const random = createSeededRandom(4);
        const additionSlips = new Set(Array.from({ length: 40 }, () => DistractorsUtils.getDistractors(arithmetic("addition", 37, 25), random)).flat());
        const subtractionSlips = new Set(Array.from({ length: 40 }, () => DistractorsUtils.getDistractors(arithmetic("subtraction", 52, 27), random)).flat());
        expect(additionSlips.has(52)).toBe(true);
        expect(subtractionSlips.has(35)).toBe(true);
    });
});
