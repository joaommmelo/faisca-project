import { DifficultiesUtils, type Difficulty } from "../difficulties/utils.ts";
import type { ArithmeticOperation } from "../operations/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

// What makes a written sum or subtraction hard: carrying ("e vai 1") and borrowing ("empréstimo").
export type AdditionSkill = "no-carry" | "carry" | "chain-carry";
export type SubtractionSkill = "no-borrow" | "borrow" | "borrow-across-zero";
export type Skill = AdditionSkill | SubtractionSkill;

export interface Operands {
    left: number;
    right: number;
}

export class ArithmeticUtils {
    // Far more than any reachable skill needs; it only stops a skill the difficulty cannot produce.
    public static getMaxGenerationAttempts(): number {
        return 10000;
    }

    // Units first: 403 → [3, 0, 4].
    public static getDigits(value: number): number[] {
        return String(value)
            .split("")
            .reverse()
            .map((digit) => Number(digit));
    }

    // 0 for columns past the number's length.
    public static getDigit(value: number, column: number): number {
        return Math.floor(value / 10 ** column) % 10;
    }

    // Columns (units = 0) that send a 1 to the column on their left.
    public static getCarryColumns(left: number, right: number): number[] {
        const columnCount: number = Math.max(this.getDigits(left).length, this.getDigits(right).length);
        const carryColumns: number[] = [];
        for (let column = 0; column < columnCount; column++) {
            const carryIn: number = carryColumns.includes(column - 1) ? 1 : 0;
            if (this.getDigit(left, column) + this.getDigit(right, column) + carryIn >= 10) {
                carryColumns.push(column);
            }
        }
        return carryColumns;
    }

    // Columns (units = 0) whose top digit, after lending, is too small and takes 10 from the column on their left.
    public static getBorrowColumns(top: number, bottom: number): number[] {
        const borrowColumns: number[] = [];
        for (let column = 0; column < this.getDigits(top).length; column++) {
            const lent: number = borrowColumns.includes(column - 1) ? 1 : 0;
            if (this.getDigit(top, column) - lent < this.getDigit(bottom, column)) {
                borrowColumns.push(column);
            }
        }
        return borrowColumns;
    }

    // Skills open in order, one per level. Chains and zeros need three digits, so they only exist in Difícil.
    public static getSkills(operation: ArithmeticOperation, difficulty: Difficulty): Skill[] {
        const hasHundreds: boolean = DifficultiesUtils.getMinOperand(difficulty) >= 100;
        if (operation === "addition") {
            return hasHundreds ? ["no-carry", "carry", "chain-carry"] : ["no-carry", "carry"];
        }
        return hasHundreds ? ["no-borrow", "borrow", "borrow-across-zero"] : ["no-borrow", "borrow"];
    }

    public static getOpenSkills(operation: ArithmeticOperation, difficulty: Difficulty, level: number): Skill[] {
        return this.getSkills(operation, difficulty).slice(0, Math.max(level, 1));
    }

    public static getSkillId(operation: ArithmeticOperation, difficulty: Difficulty, skill: Skill): string {
        return `${operation}:${difficulty}:${skill}`;
    }

    public static classify(operation: ArithmeticOperation, left: number, right: number): Skill {
        if (operation === "addition") {
            const carryCount: number = this.getCarryColumns(left, right).length;
            if (carryCount === 0) {
                return "no-carry";
            }
            return carryCount === 1 ? "carry" : "chain-carry";
        }

        const borrowColumns: number[] = this.getBorrowColumns(left, right);
        if (borrowColumns.length === 0) {
            return "no-borrow";
        }
        // Taking 10 from a 0 means first taking from the column after it: 403 − 127.
        const topLength: number = this.getDigits(left).length;
        const isAcrossZero: boolean = borrowColumns.some((column) => column + 1 < topLength && this.getDigit(left, column + 1) === 0);
        return isAcrossZero ? "borrow-across-zero" : "borrow";
    }

    public static generate(operation: ArithmeticOperation, difficulty: Difficulty, skill: Skill, random: RandomSource = Math.random): Operands {
        for (let attempt = 0; attempt < this.getMaxGenerationAttempts(); attempt++) {
            const operands: Operands | null = operation === "addition" ? this.drawAddition(difficulty, random) : this.drawSubtraction(difficulty, random);
            if (operands !== null && this.classify(operation, operands.left, operands.right) === skill) {
                return operands;
            }
        }
        throw new Error(`Cannot generate ${operation} with ${skill} in ${difficulty}.`);
    }

    // Both numbers at least the difficulty's minimum; the sum above the previous difficulty's limit.
    private static drawAddition(difficulty: Difficulty, random: RandomSource): Operands | null {
        const minOperand: number = DifficultiesUtils.getMinOperand(difficulty);
        const limit: number = DifficultiesUtils.getLimit(difficulty);
        const left: number = RandomUtils.integerBetween(minOperand, limit - minOperand, random);
        const right: number = RandomUtils.integerBetween(minOperand, limit - left, random);
        return left + right > DifficultiesUtils.getLowerLimit(difficulty) ? { left, right } : null;
    }

    // The number taken away is always smaller, so the result is never negative nor zero.
    private static drawSubtraction(difficulty: Difficulty, random: RandomSource): Operands {
        const minOperand: number = DifficultiesUtils.getMinOperand(difficulty);
        const lowest: number = Math.max(DifficultiesUtils.getLowerLimit(difficulty) + 1, minOperand + 1);
        const left: number = RandomUtils.integerBetween(lowest, DifficultiesUtils.getLimit(difficulty), random);
        const right: number = RandomUtils.integerBetween(minOperand, left - 1, random);
        return { left, right };
    }
}
