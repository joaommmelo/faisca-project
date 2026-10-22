import { RandomUtils, type RandomSource } from "../random/utils.ts";
import type { RoundBase } from "../roundGame/utils.ts";

// From the easiest to the hardest: jumps of 1, of 2, of 5 or 10, of 3 or 4, and of 6 to 9. Jumping is saying a times
// table out loud, so every jump but the ones lands on the table's numbers.
export type SkipCountingSkill = "ones" | "twos" | "fives-tens" | "threes-fours" | "bigger-steps";

// "Salta com o Faísca": five numbers that jump by the same step, one of them hidden: 3, 6, ?, 12, 15.
export interface SkipCountingRound extends RoundBase {
    game: "skip-counting";
    skill: SkipCountingSkill;
    numbers: number[];
    missingIndex: number;
    step: number;
    options: number[];
    answers: number[];
    answer: number;
}

export class SkipCountingGameUtils {
    public static getSkills(): SkipCountingSkill[] {
        return ["ones", "twos", "fives-tens", "threes-fours", "bigger-steps"];
    }

    public static getOptionsCount(): number {
        return 3;
    }

    public static getSequenceLength(): number {
        return 5;
    }

    // Jumps of 1 count up to 20; the others stay inside the times tables, up to 12 jumps.
    public static getMaxOnes(): number {
        return 20;
    }

    public static getMaxJumps(): number {
        return 12;
    }

    public static getSteps(skill: SkipCountingSkill): number[] {
        switch (skill) {
            case "ones":
                return [1];
            case "twos":
                return [2];
            case "fives-tens":
                return [5, 10];
            case "threes-fours":
                return [3, 4];
            default:
                return [6, 7, 8, 9];
        }
    }

    // The first number is never the hidden one: it shows where the jumps start.
    public static createRound(skill: SkipCountingSkill, random: RandomSource = Math.random): SkipCountingRound {
        const step: number = RandomUtils.pickOne(this.getSteps(skill), random);
        const lastStart: number = (step === 1 ? this.getMaxOnes() : step * this.getMaxJumps()) - step * (this.getSequenceLength() - 1);
        const start: number = step * RandomUtils.integerBetween(1, lastStart / step, random);
        const numbers: number[] = Array.from({ length: this.getSequenceLength() }, (_, index) => start + step * index);
        const missingIndex: number = RandomUtils.integerBetween(1, this.getSequenceLength() - 1, random);
        const answer: number = numbers[missingIndex];

        return {
            game: "skip-counting",
            id: `skip-counting:${numbers.join(",")}:${missingIndex}`,
            skill,
            numbers,
            missingIndex,
            step,
            options: this.getOptions(answer, step, random),
            answers: [answer],
            answer
        };
    }

    // The answer and two slips, in order: one off, or a jump of 1 out of habit (3, 6, 7).
    private static getOptions(answer: number, step: number, random: RandomSource): number[] {
        const close: number[] = RandomUtils.shuffle([answer - 1, answer + 1, answer - step + 1], random);
        const distractors: number[] = [];
        for (const candidate of [...close, answer + 2, answer - 2, answer + 3]) {
            if (distractors.length === this.getOptionsCount() - 1) {
                break;
            }
            if (candidate < 1 || candidate === answer || distractors.includes(candidate)) {
                continue;
            }
            distractors.push(candidate);
        }
        return [answer, ...distractors].sort((first, second) => first - second);
    }
}
