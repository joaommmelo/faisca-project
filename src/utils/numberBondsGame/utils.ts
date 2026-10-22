import { RandomUtils, type RandomSource } from "../random/utils.ts";
import type { RoundBase } from "../roundGame/utils.ts";

// From the easiest to the hardest: 10 with the ten frame to see it, 10 without it, 20, 100 from a round ten
// (30 + 70), and 100 from any number (63 + 37).
export type NumberBondsSkill = "ten-frame" | "ten" | "twenty" | "hundred-tens" | "hundred";

// "Amigos do 10": how much is missing to make the whole, 7 + ? = 10.
export interface NumberBondsRound extends RoundBase {
    game: "number-bonds";
    skill: NumberBondsSkill;
    part: number;
    whole: number;
    // The ten frame: ten spots, the part of them full, so the missing ones can be counted.
    hasFrame: boolean;
    options: number[];
    answers: number[];
    answer: number;
}

export class NumberBondsGameUtils {
    public static getSkills(): NumberBondsSkill[] {
        return ["ten-frame", "ten", "twenty", "hundred-tens", "hundred"];
    }

    public static getOptionsCount(): number {
        return 3;
    }

    public static getFrameSize(): number {
        return 10;
    }

    public static createRound(skill: NumberBondsSkill, random: RandomSource = Math.random): NumberBondsRound {
        const whole: number = (() => {
            switch (skill) {
                case "ten-frame":
                case "ten":
                    return 10;
                case "twenty":
                    return 20;
                default:
                    return 100;
            }
        })();
        const part: number = (() => {
            switch (skill) {
                case "ten-frame":
                case "ten":
                    return RandomUtils.integerBetween(1, 9, random);
                // 10 + 10 is a round ten, not a bond across the ten.
                case "twenty":
                    return RandomUtils.pickOne(
                        Array.from({ length: 19 }, (_, index) => index + 1).filter((value) => value !== 10),
                        random
                    );
                case "hundred-tens":
                    return RandomUtils.integerBetween(1, 9, random) * 10;
                default:
                    return RandomUtils.pickOne(
                        Array.from({ length: 79 }, (_, index) => index + 11).filter((value) => value % 10 !== 0),
                        random
                    );
            }
        })();
        const answer: number = whole - part;

        return {
            game: "number-bonds",
            id: `number-bonds:${part}+?=${whole}`,
            skill,
            part,
            whole,
            hasFrame: skill === "ten-frame",
            options: this.getOptions(part, whole, random),
            answers: [answer],
            answer
        };
    }

    // The answer and two slips, in order: one off, a ten off, and the classic slip on 100, making each digit up to
    // 10 (63 + 47).
    private static getOptions(part: number, whole: number, random: RandomSource): number[] {
        const answer: number = whole - part;
        const digitSlip: number = whole === 100 && part % 10 !== 0 ? (10 - Math.floor(part / 10)) * 10 + (10 - (part % 10)) : answer;
        const close: number[] = RandomUtils.shuffle([answer - 1, answer + 1, ...(whole > 10 ? [answer - 10, answer + 10] : []), digitSlip], random);
        const distractors: number[] = [];
        for (const candidate of [...close, answer - 2, answer + 2, answer + 3]) {
            if (distractors.length === this.getOptionsCount() - 1) {
                break;
            }
            if (candidate < 1 || candidate >= whole || candidate === answer || distractors.includes(candidate)) {
                continue;
            }
            distractors.push(candidate);
        }
        return [answer, ...distractors].sort((first, second) => first - second);
    }
}
