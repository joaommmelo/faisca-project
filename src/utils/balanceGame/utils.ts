import { OperationsUtils, type Operation } from "../operations/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import type { RoundBase } from "../roundGame/utils.ts";

// From the easiest to the hardest: two numbers, a sum against a number, two sums or differences, two products, and
// any two calculations.
export type BalanceSkill = "numbers" | "sum-and-number" | "sums" | "products" | "mixed";

// What the child taps: the heavier pan, or the middle when both weigh the same.
export type BalanceSide = "left" | "equal" | "right";

// What a pan holds: a number on its own (operation null, right unused), or a calculation.
export interface BalancePan {
    operation: Operation | null;
    left: number;
    right: number;
}

// "Qual pesa mais?": a calculation on each pan of a balance.
export interface BalanceRound extends RoundBase {
    game: "balance";
    skill: BalanceSkill;
    leftPan: BalancePan;
    rightPan: BalancePan;
    options: BalanceSide[];
    answers: BalanceSide[];
    answer: BalanceSide;
}

export class BalanceGameUtils {
    public static getSkills(): BalanceSkill[] {
        return ["numbers", "sum-and-number", "sums", "products", "mixed"];
    }

    // Left, middle and right, in the place they have on the balance.
    public static getValidSides(): BalanceSide[] {
        return ["left", "equal", "right"];
    }

    // One balance in five weighs the same on both pans.
    public static getEqualShare(): number {
        return 0.2;
    }

    // Close weights make the child work them out instead of guessing from the size of the numbers.
    public static getMaxDifference(skill: BalanceSkill): number {
        return skill === "products" || skill === "mixed" ? 10 : 4;
    }

    // Enough draws to find a balance of the wanted side; every skill finds one long before.
    public static getMaxDraws(): number {
        return 500;
    }

    public static getValue(pan: BalancePan): number {
        return pan.operation === null ? pan.left : OperationsUtils.calculate(pan.operation, pan.left, pan.right);
    }

    public static getSide(leftPan: BalancePan, rightPan: BalancePan): BalanceSide {
        const difference: number = this.getValue(leftPan) - this.getValue(rightPan);
        if (difference === 0) {
            return "equal";
        }
        return difference > 0 ? "left" : "right";
    }

    // The side is decided first, so "equal" comes up as often as it should; then pans are drawn until they fit.
    public static createRound(skill: BalanceSkill, random: RandomSource = Math.random): BalanceRound {
        const wantedSide: BalanceSide = (() => {
            if (random() < this.getEqualShare()) {
                return "equal";
            }
            return RandomUtils.isHeads(random) ? "left" : "right";
        })();
        const [leftPan, rightPan]: BalancePan[] = (() => {
            for (let draw = 0; draw < this.getMaxDraws(); draw++) {
                const pans: BalancePan[] = this.drawPans(skill, random);
                const difference: number = Math.abs(this.getValue(pans[0]) - this.getValue(pans[1]));
                // The same number on both pans weighs the same (7 and 7); the same calculation twice would just be copied.
                const isSameCalculation: boolean = pans[0].operation !== null && this.getPanId(pans[0]) === this.getPanId(pans[1]);
                if (!isSameCalculation && difference <= this.getMaxDifference(skill) && this.getSide(pans[0], pans[1]) === wantedSide) {
                    return pans;
                }
            }
            throw new Error(`No ${wantedSide} balance found for ${skill}.`);
        })();
        const answer: BalanceSide = this.getSide(leftPan, rightPan);

        return {
            game: "balance",
            id: `balance:${this.getPanId(leftPan)}|${this.getPanId(rightPan)}`,
            skill,
            leftPan,
            rightPan,
            options: this.getValidSides(),
            answers: [answer],
            answer
        };
    }

    // The help works out one calculation: the left one, unless only the right pan has one. Two plain numbers have
    // none to work out.
    public static getHintSide(round: BalanceRound): "left" | "right" | null {
        if (round.leftPan.operation !== null) {
            return "left";
        }
        return round.rightPan.operation !== null ? "right" : null;
    }

    public static getPanId(pan: BalancePan): string {
        return pan.operation === null ? String(pan.left) : `${pan.left}${OperationsUtils.getSymbol(pan.operation)}${pan.right}`;
    }

    private static drawPans(skill: BalanceSkill, random: RandomSource): BalancePan[] {
        switch (skill) {
            case "numbers":
                return [this.drawNumber(1, 20, random), this.drawNumber(1, 20, random)];
            case "sum-and-number": {
                const pans: BalancePan[] = [this.drawCalculation("addition", 10, random), this.drawNumber(2, 20, random)];
                return RandomUtils.isHeads(random) ? pans : [pans[1], pans[0]];
            }
            case "sums":
                return [this.drawAdditive(10, random), this.drawAdditive(10, random)];
            case "products":
                return [this.drawCalculation("multiplication", 10, random), this.drawCalculation("multiplication", 10, random)];
            default:
                return [
                    this.drawCalculation(RandomUtils.pickOne(OperationsUtils.getValidOperations(), random), 10, random),
                    this.drawCalculation(RandomUtils.pickOne(OperationsUtils.getValidOperations(), random), 10, random)
                ];
        }
    }

    private static drawNumber(min: number, max: number, random: RandomSource): BalancePan {
        return { operation: null, left: RandomUtils.integerBetween(min, max, random), right: 0 };
    }

    private static drawAdditive(max: number, random: RandomSource): BalancePan {
        return this.drawCalculation(RandomUtils.isHeads(random) ? "addition" : "subtraction", max, random);
    }

    // + and − with numbers up to max (a difference always above 0), × and ÷ inside the times tables up to max.
    private static drawCalculation(operation: Operation, max: number, random: RandomSource): BalancePan {
        switch (operation) {
            case "addition":
                return { operation, left: RandomUtils.integerBetween(1, max, random), right: RandomUtils.integerBetween(1, max, random) };
            case "subtraction": {
                const left: number = RandomUtils.integerBetween(2, 2 * max, random);
                return { operation, left, right: RandomUtils.integerBetween(1, Math.min(left - 1, max), random) };
            }
            case "multiplication":
                return { operation, left: RandomUtils.integerBetween(2, max, random), right: RandomUtils.integerBetween(2, max, random) };
            default: {
                const right: number = RandomUtils.integerBetween(2, max, random);
                return { operation, left: right * RandomUtils.integerBetween(2, max, random), right };
            }
        }
    }
}
