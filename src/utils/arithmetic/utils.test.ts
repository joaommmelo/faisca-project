import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { DifficultiesUtils, type Difficulty } from "../difficulties/utils.ts";
import type { AdditiveOperation } from "../operations/utils.ts";
import { ArithmeticUtils } from "./utils.ts";

const operations: AdditiveOperation[] = ["addition", "subtraction"];

describe("ArithmeticUtils.classify", () => {
    it("tells carries apart", () => {
        expect(ArithmeticUtils.classify("addition", 23, 45)).toBe("no-carry");
        expect(ArithmeticUtils.classify("addition", 37, 25)).toBe("carry");
        expect(ArithmeticUtils.classify("addition", 8, 5)).toBe("carry");
        expect(ArithmeticUtils.classify("addition", 368, 457)).toBe("chain-carry");
    });

    it("tells borrows apart, including borrowing across a zero", () => {
        expect(ArithmeticUtils.classify("subtraction", 47, 23)).toBe("no-borrow");
        expect(ArithmeticUtils.classify("subtraction", 52, 27)).toBe("borrow");
        expect(ArithmeticUtils.classify("subtraction", 13, 7)).toBe("borrow");
        expect(ArithmeticUtils.classify("subtraction", 403, 127)).toBe("borrow-across-zero");
        expect(ArithmeticUtils.classify("subtraction", 1000, 127)).toBe("borrow-across-zero");
        expect(ArithmeticUtils.classify("subtraction", 410, 125)).toBe("borrow");
    });
});

describe("ArithmeticUtils.getBorrowColumns", () => {
    it("follows the borrow through a zero", () => {
        expect(ArithmeticUtils.getBorrowColumns(403, 127)).toEqual([0, 1]);
    });
});

describe("ArithmeticUtils.getSkills", () => {
    it("only offers chains and zeros with three-digit numbers", () => {
        expect(ArithmeticUtils.getSkills("addition", "easy")).toEqual(["no-carry", "carry"]);
        expect(ArithmeticUtils.getSkills("addition", "hard")).toEqual(["no-carry", "carry", "chain-carry"]);
        expect(ArithmeticUtils.getSkills("subtraction", "hard")).toEqual(["no-borrow", "borrow", "borrow-across-zero"]);
    });

    it("opens one more skill per level", () => {
        expect(ArithmeticUtils.getOpenSkills("addition", "hard", 1)).toEqual(["no-carry"]);
        expect(ArithmeticUtils.getOpenSkills("addition", "hard", 2)).toEqual(["no-carry", "carry"]);
        expect(ArithmeticUtils.getOpenSkills("addition", "hard", 9)).toEqual(["no-carry", "carry", "chain-carry"]);
    });
});

describe("ArithmeticUtils.generate", () => {
    const random = createSeededRandom(7);

    for (const operation of operations) {
        for (const difficulty of DifficultiesUtils.getValidDifficulties()) {
            for (const skill of ArithmeticUtils.getSkills(operation, difficulty)) {
                it(`makes ${operation} with ${skill} in ${difficulty} inside the difficulty`, () => {
                    for (let attempt = 0; attempt < 200; attempt++) {
                        const { left, right } = ArithmeticUtils.generate(operation, difficulty, skill, random);
                        const result: number = operation === "addition" ? left + right : left - right;
                        const governing: number = operation === "addition" ? result : left;

                        expect(ArithmeticUtils.classify(operation, left, right)).toBe(skill);
                        expect(Math.min(left, right)).toBeGreaterThanOrEqual(DifficultiesUtils.getMinOperand(difficulty));
                        expect(governing).toBeLessThanOrEqual(DifficultiesUtils.getLimit(difficulty));
                        expect(governing).toBeGreaterThan(DifficultiesUtils.getLowerLimit(difficulty));
                        expect(result).toBeGreaterThan(0);
                    }
                });
            }
        }
    }

    it("never gives a negative subtraction", () => {
        const difficulties: Difficulty[] = DifficultiesUtils.getValidDifficulties();
        for (let attempt = 0; attempt < 500; attempt++) {
            const difficulty: Difficulty = difficulties[attempt % difficulties.length];
            const { left, right } = ArithmeticUtils.generate("subtraction", difficulty, "no-borrow", random);
            expect(left - right).toBeGreaterThan(0);
        }
    });

    it("refuses a skill the difficulty cannot produce", () => {
        expect(() => ArithmeticUtils.generate("addition", "easy", "chain-carry", random)).toThrow();
    });
});

describe("ArithmeticUtils with bigger multiplications and divisions", () => {
    const random = createSeededRandom(31);

    it("classifies carries in a product and steps in a division", () => {
        expect(ArithmeticUtils.classify("multiplication", 21, 4)).toBe("no-carry");
        expect(ArithmeticUtils.classify("multiplication", 27, 4)).toBe("carry");
        expect(ArithmeticUtils.classify("multiplication", 157, 6)).toBe("chain-carry");
        expect(ArithmeticUtils.classify("division", 84, 4)).toBe("no-remainder");
        expect(ArithmeticUtils.classify("division", 72, 4)).toBe("remainder");
        expect(ArithmeticUtils.classify("division", 156, 6)).toBe("remainder");
        expect(ArithmeticUtils.classify("division", 412, 4)).toBe("zero-in-quotient");
        expect(ArithmeticUtils.classify("division", 840, 4)).toBe("no-remainder");
    });

    it("leaves the times tables to the facts", () => {
        expect(ArithmeticUtils.getSkills("multiplication", "easy")).toEqual([]);
        expect(ArithmeticUtils.getSkills("division", "easy")).toEqual([]);
        expect(() => ArithmeticUtils.generate("multiplication", "easy", "carry", random)).toThrow();
    });

    it("only offers chains and zeros inside the result with numbers in the hundreds", () => {
        expect(ArithmeticUtils.getSkills("multiplication", "medium")).toEqual(["no-carry", "carry"]);
        expect(ArithmeticUtils.getSkills("multiplication", "hard")).toEqual(["no-carry", "carry", "chain-carry"]);
        expect(ArithmeticUtils.getSkills("division", "medium")).toEqual(["no-remainder", "remainder"]);
        expect(ArithmeticUtils.getSkills("division", "hard")).toEqual(["no-remainder", "remainder", "zero-in-quotient"]);
    });

    for (const difficulty of ["medium", "hard"] as Difficulty[]) {
        for (const skill of ArithmeticUtils.getSkills("multiplication", difficulty)) {
            it(`multiplies a factor past the tables by one digit, with ${skill} in ${difficulty}`, () => {
                for (let attempt = 0; attempt < 200; attempt++) {
                    const { left, right } = ArithmeticUtils.generate("multiplication", difficulty, skill, random);
                    expect(ArithmeticUtils.classify("multiplication", left, right)).toBe(skill);
                    expect(left).toBeGreaterThanOrEqual(ArithmeticUtils.getMinBigFactor());
                    expect(right).toBeGreaterThanOrEqual(ArithmeticUtils.getMinSmallFactor());
                    expect(right).toBeLessThanOrEqual(ArithmeticUtils.getMaxSmallFactor());
                    expect(left * right).toBeLessThanOrEqual(DifficultiesUtils.getLimit(difficulty));
                    expect(left * right).toBeGreaterThan(DifficultiesUtils.getLowerLimit(difficulty));
                }
            });
        }
        for (const skill of ArithmeticUtils.getSkills("division", difficulty)) {
            it(`divides exactly by one digit, with ${skill} in ${difficulty}`, () => {
                for (let attempt = 0; attempt < 200; attempt++) {
                    const { left, right } = ArithmeticUtils.generate("division", difficulty, skill, random);
                    expect(ArithmeticUtils.classify("division", left, right)).toBe(skill);
                    expect(left % right).toBe(0);
                    expect(left / right).toBeGreaterThanOrEqual(ArithmeticUtils.getMinBigFactor());
                    expect(left).toBeLessThanOrEqual(DifficultiesUtils.getLimit(difficulty));
                    expect(left).toBeGreaterThan(DifficultiesUtils.getLowerLimit(difficulty));
                }
            });
        }
    }
});
