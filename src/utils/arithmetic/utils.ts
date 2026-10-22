import { DifficultiesUtils, type Difficulty } from "../difficulties/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

// What makes a calculation hard: carrying ("e vai 1"), borrowing ("empréstimo") and, when dividing, what is left
// over between the steps.
export type AdditionSkill = "no-carry" | "carry" | "chain-carry";
export type SubtractionSkill = "no-borrow" | "borrow" | "borrow-across-zero";
// A bigger number times a single digit carries like an addition: 21 × 4, 27 × 4, 157 × 6.
export type MultiplicationSkill = "no-carry" | "carry" | "chain-carry";
// Dividing by a single digit: every step exact (84 ÷ 4), something left over on the way (72 ÷ 4), a zero inside
// the result (412 ÷ 4 = 103).
export type DivisionSkill = "no-remainder" | "remainder" | "zero-in-quotient";
export type Skill = AdditionSkill | SubtractionSkill | MultiplicationSkill | DivisionSkill;

export interface Operands {
    left: number;
    right: number;
}

// Long division, digit by digit from the left.
export interface DivisionSteps {
    hasRemainderOnTheWay: boolean;
    hasZeroInsideQuotient: boolean;
}

export class ArithmeticUtils {
    // Far more than any reachable skill needs; it only stops a skill the difficulty cannot produce.
    public static getMaxGenerationAttempts(): number {
        return 10000;
    }

    // In Médio and Difícil the bigger factor starts past the times tables (12) and the other is a single digit.
    public static getMinBigFactor(): number {
        return 13;
    }

    public static getMinSmallFactor(): number {
        return 2;
    }

    public static getMaxSmallFactor(): number {
        return 9;
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

    // Digits of the bigger factor (units = 0) whose product, with what came from the right, carries into the next
    // digit. The last digit's product is written whole, so it never counts: 27 × 4 carries once, at the units.
    public static getMultiplicationCarryColumns(bigFactor: number, smallFactor: number): number[] {
        const digits: number[] = this.getDigits(bigFactor);
        const carryColumns: number[] = [];
        let carry: number = 0;
        for (let column = 0; column < digits.length - 1; column++) {
            carry = Math.floor((digits[column] * smallFactor + carry) / 10);
            if (carry > 0) {
                carryColumns.push(column);
            }
        }
        return carryColumns;
    }

    // A remainder on the way is anything left over after a step that is not the last (72 ÷ 4: 7 ÷ 4 leaves 3).
    // A zero inside the result is a 0 that is not its last digit (412 ÷ 4 = 103), the one children often forget.
    public static getDivisionSteps(dividend: number, divisor: number): DivisionSteps {
        const digits: number[] = String(dividend)
            .split("")
            .map((digit) => Number(digit));
        let partial: number = 0;
        let hasStarted: boolean = false;
        let hasRemainderOnTheWay: boolean = false;
        digits.forEach((digit, index) => {
            partial = partial * 10 + digit;
            // The first step takes more digits while they are smaller than the divisor (156 ÷ 6 starts with 15).
            if (!hasStarted && partial < divisor) {
                return;
            }
            hasStarted = true;
            partial = partial % divisor;
            if (partial > 0 && index < digits.length - 1) {
                hasRemainderOnTheWay = true;
            }
        });
        const quotientDigits: string = String(dividend / divisor);
        return { hasRemainderOnTheWay, hasZeroInsideQuotient: quotientDigits.slice(0, -1).includes("0") };
    }

    // Skills open in order, one per level. The times tables (Fácil × and ÷) are practised fact by fact, without skills.
    public static getSkills(operation: Operation, difficulty: Difficulty): Skill[] {
        if (OperationsUtils.usesTables(operation, difficulty)) {
            return [];
        }
        const hasHundreds: boolean = DifficultiesUtils.hasHundreds(difficulty);
        switch (operation) {
            case "addition":
            case "multiplication":
                return hasHundreds ? ["no-carry", "carry", "chain-carry"] : ["no-carry", "carry"];
            case "subtraction":
                return hasHundreds ? ["no-borrow", "borrow", "borrow-across-zero"] : ["no-borrow", "borrow"];
            default:
                return hasHundreds ? ["no-remainder", "remainder", "zero-in-quotient"] : ["no-remainder", "remainder"];
        }
    }

    public static getOpenSkills(operation: Operation, difficulty: Difficulty, level: number): Skill[] {
        return this.getSkills(operation, difficulty).slice(0, Math.max(level, 1));
    }

    public static getSkillId(operation: Operation, difficulty: Difficulty, skill: Skill): string {
        return `${operation}:${difficulty}:${skill}`;
    }

    public static classify(operation: Operation, left: number, right: number): Skill {
        switch (operation) {
            case "addition":
                return this.classifyCarries(this.getCarryColumns(left, right).length);
            case "subtraction":
                return this.classifyBorrows(left, right);
            case "multiplication":
                return this.classifyCarries(this.getMultiplicationCarryColumns(Math.max(left, right), Math.min(left, right)).length);
            default: {
                const steps: DivisionSteps = this.getDivisionSteps(left, right);
                if (steps.hasZeroInsideQuotient) {
                    return "zero-in-quotient";
                }
                return steps.hasRemainderOnTheWay ? "remainder" : "no-remainder";
            }
        }
    }

    public static generate(operation: Operation, difficulty: Difficulty, skill: Skill, random: RandomSource = Math.random): Operands {
        if (OperationsUtils.usesTables(operation, difficulty)) {
            throw new Error("The times tables are practised fact by fact, not generated.");
        }
        for (let attempt = 0; attempt < this.getMaxGenerationAttempts(); attempt++) {
            const operands: Operands | null = this.draw(operation, difficulty, random);
            if (operands !== null && this.classify(operation, operands.left, operands.right) === skill) {
                return operands;
            }
        }
        throw new Error(`Cannot generate ${operation} with ${skill} in ${difficulty}.`);
    }

    private static classifyCarries(carryCount: number): AdditionSkill {
        if (carryCount === 0) {
            return "no-carry";
        }
        return carryCount === 1 ? "carry" : "chain-carry";
    }

    private static classifyBorrows(top: number, bottom: number): SubtractionSkill {
        const borrowColumns: number[] = this.getBorrowColumns(top, bottom);
        if (borrowColumns.length === 0) {
            return "no-borrow";
        }
        // Taking 10 from a 0 means first taking from the column after it: 403 − 127.
        const topLength: number = this.getDigits(top).length;
        const isAcrossZero: boolean = borrowColumns.some((column) => column + 1 < topLength && this.getDigit(top, column + 1) === 0);
        return isAcrossZero ? "borrow-across-zero" : "borrow";
    }

    private static draw(operation: Operation, difficulty: Difficulty, random: RandomSource): Operands | null {
        switch (operation) {
            case "addition":
                return this.drawAddition(difficulty, random);
            case "subtraction":
                return this.drawSubtraction(difficulty, random);
            case "multiplication":
                return this.drawMultiplication(difficulty, random);
            default:
                return this.drawDivision(difficulty, random);
        }
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

    // A factor past the times tables times a single digit, with the product inside the difficulty: 23 × 4 in Médio,
    // 157 × 6 in Difícil. The bigger factor comes first, as children write it.
    private static drawMultiplication(difficulty: Difficulty, random: RandomSource): Operands | null {
        const smallFactor: number = RandomUtils.integerBetween(this.getMinSmallFactor(), this.getMaxSmallFactor(), random);
        const maxBigFactor: number = Math.floor(DifficultiesUtils.getLimit(difficulty) / smallFactor);
        if (maxBigFactor < this.getMinBigFactor()) {
            return null;
        }
        const bigFactor: number = RandomUtils.integerBetween(this.getMinBigFactor(), maxBigFactor, random);
        return bigFactor * smallFactor > DifficultiesUtils.getLowerLimit(difficulty) ? { left: bigFactor, right: smallFactor } : null;
    }

    // The same pairs read backwards, so the division is always exact: 23 × 4 = 92 gives 92 ÷ 4 = 23.
    private static drawDivision(difficulty: Difficulty, random: RandomSource): Operands | null {
        const factors: Operands | null = this.drawMultiplication(difficulty, random);
        return factors === null ? null : { left: factors.left * factors.right, right: factors.right };
    }
}
