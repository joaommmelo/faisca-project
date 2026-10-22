import { RandomUtils, type RandomSource } from "../random/utils.ts";
import type { RoundBase } from "../roundGame/utils.ts";

// From the easiest to the hardest, one more open at each level: up to 5 like a die, up to 10 in rows of five, up to
// 10 scattered, two groups to join, and up to 20 in rows of ten.
export type CountingSkill = "to-five" | "to-ten" | "scattered" | "two-groups" | "to-twenty";

// dice: the spots of a die. rows: rows of five (rows of ten split in two from 11 on). scattered: anywhere on a grid.
export type CountingLayout = "dice" | "rows" | "scattered";

// "Quantos são?": bones to count, and the number among three.
export interface CountingRound extends RoundBase {
    game: "counting";
    skill: CountingSkill;
    // One group, or two to join (3 and 4 make 7).
    groups: number[];
    layout: CountingLayout;
    // Scattered only: the cells of the grid that hold a bone.
    spots: number[];
    options: number[];
    answers: number[];
    answer: number;
}

export class CountingGameUtils {
    public static getSkills(): CountingSkill[] {
        return ["to-five", "to-ten", "scattered", "two-groups", "to-twenty"];
    }

    public static getOptionsCount(): number {
        return 3;
    }

    // The scattered bones sit in a grid of 5 by 4, one per cell, so none hides another.
    public static getScatterColumns(): number {
        return 5;
    }

    public static getScatterCells(): number {
        return 20;
    }

    // A die has spots up to 5: each group of two-groups too.
    public static getDiceMax(): number {
        return 5;
    }

    public static createRound(skill: CountingSkill, random: RandomSource = Math.random): CountingRound {
        const groups: number[] = (() => {
            switch (skill) {
                case "to-five":
                    return [RandomUtils.integerBetween(1, 5, random)];
                case "to-ten":
                    return [RandomUtils.integerBetween(6, 10, random)];
                case "scattered":
                    return [RandomUtils.integerBetween(3, 10, random)];
                case "two-groups":
                    return [RandomUtils.integerBetween(1, this.getDiceMax(), random), RandomUtils.integerBetween(1, this.getDiceMax(), random)];
                default:
                    return [RandomUtils.integerBetween(11, 20, random)];
            }
        })();
        const layout: CountingLayout = (() => {
            if (skill === "scattered") {
                return "scattered";
            }
            return skill === "to-five" || skill === "two-groups" ? "dice" : "rows";
        })();
        const count: number = this.getCount(groups);
        const spots: number[] =
            layout === "scattered"
                ? RandomUtils.shuffle(
                      Array.from({ length: this.getScatterCells() }, (_, cell) => cell),
                      random
                  )
                      .slice(0, count)
                      .sort((first, second) => first - second)
                : [];

        return {
            game: "counting",
            id: `counting:${skill}:${groups.join("+")}`,
            skill,
            groups,
            layout,
            spots,
            options: this.getOptions(count, groups, random),
            answers: [count],
            answer: count
        };
    }

    public static getCount(groups: number[]): number {
        return groups.reduce((sum, group) => sum + group, 0);
    }

    // The answer and two slips, in order so the numbers read like counting: one more or one less, or only one of
    // the two groups.
    private static getOptions(count: number, groups: number[], random: RandomSource): number[] {
        const close: number[] = RandomUtils.shuffle([count - 1, count + 1, ...(groups.length > 1 ? groups : [])], random);
        const distractors: number[] = [];
        for (const candidate of [...close, count - 2, count + 2, count + 3]) {
            if (distractors.length === this.getOptionsCount() - 1) {
                break;
            }
            if (candidate < 1 || candidate === count || distractors.includes(candidate)) {
                continue;
            }
            distractors.push(candidate);
        }
        return [count, ...distractors].sort((first, second) => first - second);
    }
}
