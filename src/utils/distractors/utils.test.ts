import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { FactsUtils } from "../facts/utils.ts";
import type { QuestionKind } from "../questions/utils.ts";
import { DistractorsUtils } from "./utils.ts";

function directQuestion(leftFactor: number, rightFactor: number) {
    const product: number = leftFactor * rightFactor;
    return { kind: "direct" as QuestionKind, leftFactor, rightFactor, product, answer: product };
}

describe("DistractorsUtils.getOptions", () => {
    const random = createSeededRandom(2026);
    const kinds: QuestionKind[] = ["direct", "missing-left", "missing-right"];

    for (const kind of kinds) {
        it(`gives 4 distinct, sensible options for every fact (${kind})`, () => {
            for (const fact of FactsUtils.getAll()) {
                for (const [leftFactor, rightFactor] of [[fact.smallerFactor, fact.largerFactor], [fact.largerFactor, fact.smallerFactor]]) {
                    const answer: number = kind === "direct" ? fact.product : kind === "missing-left" ? leftFactor : rightFactor;
                    const options: number[] = DistractorsUtils.getOptions({ kind, leftFactor, rightFactor, product: fact.product, answer }, random);

                    expect(options).toHaveLength(4);
                    expect(new Set(options).size).toBe(4);
                    expect(options).toContain(answer);
                    expect(options.every((option) => option > 0)).toBe(true);
                    if (kind !== "direct") {
                        expect(options.every((option) => FactsUtils.isValidFactor(option))).toBe(true);
                    }
                }
            }
        });
    }
});

describe("DistractorsUtils.getDistractors", () => {
    it("uses table neighbours, ±1 and swapped digits for 7 × 8", () => {
        const plausibleMistakes: number[] = [49, 63, 48, 64, 55, 57, 65];
        const random = createSeededRandom(8);
        for (let attempt = 0; attempt < 50; attempt++) {
            const distractors: number[] = DistractorsUtils.getDistractors(directQuestion(7, 8), random);
            expect(distractors.every((distractor) => plausibleMistakes.includes(distractor))).toBe(true);
        }
    });

    it("still finds three distractors for 1 × 1", () => {
        const distractors: number[] = DistractorsUtils.getDistractors(directQuestion(1, 1), createSeededRandom(1));
        expect(distractors).toHaveLength(3);
        expect(distractors).not.toContain(1);
        expect(distractors.every((distractor) => distractor > 0)).toBe(true);
    });

    it("never turns a product ending in zero into a leading zero", () => {
        const random = createSeededRandom(40);
        for (let attempt = 0; attempt < 50; attempt++) {
            expect(DistractorsUtils.getDistractors(directQuestion(4, 10), random)).not.toContain(4);
        }
    });

    it("offers nearby factors and the shown factor for ? × 7 = 56", () => {
        const distractors: number[] = DistractorsUtils.getDistractors(
            { kind: "missing-left", leftFactor: 8, rightFactor: 7, product: 56, answer: 8 },
            createSeededRandom(3)
        );
        expect([...distractors].sort((first, second) => first - second)).toEqual([6, 7, 9]);
    });
});
