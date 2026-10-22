import { OperationsUtils, type Operation } from "../operations/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import type { RoundBase } from "../roundGame/utils.ts";

// From the easiest to the hardest: + or − up to 20, ×, ÷, and any of the four with bigger numbers.
export type MissingSignSkill = "add-subtract" | "multiply" | "divide" | "bigger-numbers";

// "Qual é o sinal?": 6 ? 3 = 18, and the four signs to choose from. When two signs work (2 ? 2 = 4), both are right.
export interface MissingSignRound extends RoundBase {
    game: "missing-sign";
    skill: MissingSignSkill;
    left: number;
    right: number;
    result: number;
    options: Operation[];
    answers: Operation[];
    answer: Operation;
}

interface SignCalculation {
    operation: Operation;
    left: number;
    right: number;
}

export class MissingSignGameUtils {
    public static getSkills(): MissingSignSkill[] {
        return ["add-subtract", "multiply", "divide", "bigger-numbers"];
    }

    // The times tables of the first levels stop at 10; the bigger numbers go up to 12 × 12 and to 100.
    public static getTablesMax(skill: MissingSignSkill): number {
        return skill === "bigger-numbers" ? 12 : 10;
    }

    public static createRound(skill: MissingSignSkill, random: RandomSource = Math.random): MissingSignRound {
        const calculation: SignCalculation = this.drawCalculation(skill, random);
        const { operation, left, right } = calculation;
        const result: number = OperationsUtils.calculate(operation, left, right);

        return {
            game: "missing-sign",
            id: `missing-sign:${left}?${right}=${result}`,
            skill,
            left,
            right,
            result,
            options: OperationsUtils.getValidOperations(),
            answers: this.getAnswers(left, right, result),
            answer: operation
        };
    }

    // Every sign that makes the result: 2 ? 2 = 4 takes + and ×, 4 ? 2 = 2 takes − and ÷.
    public static getAnswers(left: number, right: number, result: number): Operation[] {
        return OperationsUtils.getValidOperations().filter((operation) => OperationsUtils.calculate(operation, left, right) === result);
    }

    // × 1 and ÷ 1 never show up: 6 ? 1 = 6 would take both.
    private static drawCalculation(skill: MissingSignSkill, random: RandomSource): SignCalculation {
        const tablesMax: number = this.getTablesMax(skill);
        const operation: Operation = (() => {
            switch (skill) {
                case "add-subtract":
                    return RandomUtils.pickOne<Operation>(["addition", "subtraction"], random);
                case "multiply":
                    return "multiplication";
                case "divide":
                    return "division";
                default:
                    return RandomUtils.pickOne(OperationsUtils.getValidOperations(), random);
            }
        })();
        const isBig: boolean = skill === "bigger-numbers";
        switch (operation) {
            case "addition": {
                const left: number = isBig ? RandomUtils.integerBetween(10, 90, random) : RandomUtils.integerBetween(1, 10, random);
                const right: number = isBig ? RandomUtils.integerBetween(2, 100 - left, random) : RandomUtils.integerBetween(1, 10, random);
                return { operation, left, right };
            }
            case "subtraction": {
                const left: number = isBig ? RandomUtils.integerBetween(20, 100, random) : RandomUtils.integerBetween(2, 20, random);
                const right: number = RandomUtils.integerBetween(1, Math.min(left - 1, isBig ? left - 1 : 10), random);
                return { operation, left, right };
            }
            case "multiplication":
                return { operation, left: RandomUtils.integerBetween(2, tablesMax, random), right: RandomUtils.integerBetween(2, tablesMax, random) };
            default: {
                const right: number = RandomUtils.integerBetween(2, tablesMax, random);
                return { operation, left: right * RandomUtils.integerBetween(2, tablesMax, random), right };
            }
        }
    }
}
