import { FactsUtils } from "../facts/utils.ts";
import type { Question } from "../questions/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

type DistractorSource = Pick<Question, "kind" | "leftFactor" | "rightFactor" | "product" | "answer">;

export class DistractorsUtils {
    public static getOptionsCount(): number {
        return 4;
    }

    // Far enough to always find three distinct factors between 1 and 12.
    public static getMaxFallbackDistance(): number {
        return FactsUtils.getValidFactors().length - 1;
    }

    public static getOptions(question: DistractorSource, random: RandomSource = Math.random): number[] {
        return RandomUtils.shuffle([question.answer, ...this.getDistractors(question, random)], random);
    }

    public static getDistractors(question: DistractorSource, random: RandomSource = Math.random): number[] {
        const isProductAnswer: boolean = question.kind === "direct";
        const closeCandidates: number[] = isProductAnswer ? this.getCloseProducts(question) : this.getCloseFactors(question);
        const fallbackCandidates: number[] = isProductAnswer ? this.getFallbackProducts(question) : this.getFallbackFactors(question);
        const isPlausible = (value: number): boolean => (isProductAnswer ? value > 0 : FactsUtils.isValidFactor(value));
        const distractorsCount: number = this.getOptionsCount() - 1;

        const distractors: number[] = [];
        for (const candidate of [...RandomUtils.shuffle(closeCandidates, random), ...fallbackCandidates]) {
            if (distractors.length === distractorsCount) {
                break;
            }
            if (candidate === question.answer || distractors.includes(candidate) || !isPlausible(candidate)) {
                continue;
            }
            distractors.push(candidate);
        }
        return distractors;
    }

    // The slips a child really makes on 7 × 8: a neighbour in the table (7 × 7, 7 × 9), an off-by-one, swapped digits.
    private static getCloseProducts(question: DistractorSource): number[] {
        return [
            ...this.getNeighbourProducts(question, 1),
            question.product - 1,
            question.product + 1,
            ...this.getSwappedDigits(question.product)
        ];
    }

    private static getFallbackProducts(question: DistractorSource): number[] {
        const fallbacks: number[] = [];
        for (let distance = 2; distance <= this.getMaxFallbackDistance(); distance++) {
            fallbacks.push(...this.getNeighbourProducts(question, distance), question.product - distance, question.product + distance);
        }
        return fallbacks;
    }

    private static getNeighbourProducts(question: DistractorSource, distance: number): number[] {
        const neighbours: number[] = [];
        for (const offset of [-distance, distance]) {
            if (FactsUtils.isValidFactor(question.rightFactor + offset)) {
                neighbours.push(question.leftFactor * (question.rightFactor + offset));
            }
            if (FactsUtils.isValidFactor(question.leftFactor + offset)) {
                neighbours.push((question.leftFactor + offset) * question.rightFactor);
            }
        }
        return neighbours;
    }

    // Two-digit products only (56 → 65). A trailing zero would turn into a leading one (40 → 04).
    private static getSwappedDigits(product: number): number[] {
        if (product < 10 || product > 99) {
            return [];
        }
        const tens: number = Math.floor(product / 10);
        const units: number = product % 10;
        if (units === 0 || units === tens) {
            return [];
        }
        return [units * 10 + tens];
    }

    // On ? × 7 = 56 the slips are the factors next to the answer, or repeating the factor already shown.
    private static getCloseFactors(question: DistractorSource): number[] {
        const knownFactor: number = question.kind === "missing-left" ? question.rightFactor : question.leftFactor;
        return [question.answer - 1, question.answer + 1, knownFactor];
    }

    private static getFallbackFactors(question: DistractorSource): number[] {
        const fallbacks: number[] = [];
        for (let distance = 2; distance <= this.getMaxFallbackDistance(); distance++) {
            fallbacks.push(question.answer - distance, question.answer + distance);
        }
        return fallbacks;
    }
}
