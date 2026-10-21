import { ArithmeticUtils } from "../arithmetic/utils.ts";
import { FactsUtils } from "../facts/utils.ts";
import type { Question } from "../questions/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

type DistractorSource = Pick<Question, "operation" | "kind" | "left" | "right" | "result" | "answer" | "boxType">;

interface DistractorCandidates {
    close: number[];
    fallback: number[];
    isPlausible: (value: number) => boolean;
}

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
        const candidates: DistractorCandidates = this.getCandidates(question);
        const distractorsCount: number = this.getOptionsCount() - 1;

        const distractors: number[] = [];
        for (const candidate of [...RandomUtils.shuffle(candidates.close, random), ...candidates.fallback]) {
            if (distractors.length === distractorsCount) {
                break;
            }
            if (candidate === question.answer || distractors.includes(candidate) || !candidates.isPlausible(candidate)) {
                continue;
            }
            distractors.push(candidate);
        }
        return distractors;
    }

    // Times-table facts keep their own slips; every other question gets the slips of its operation.
    private static getCandidates(question: DistractorSource): DistractorCandidates {
        const isPositive = (value: number): boolean => value > 0;
        if (question.boxType === "fact") {
            const isFactorAnswer: boolean = question.operation === "division" || question.kind !== "direct";
            if (isFactorAnswer) {
                return {
                    close: this.getCloseFactors(question),
                    fallback: this.getFallbackFactors(question),
                    isPlausible: (value) => FactsUtils.isValidFactor(value)
                };
            }
            return { close: this.getCloseProducts(question), fallback: this.getFallbackProducts(question), isPlausible: isPositive };
        }
        switch (question.operation) {
            case "multiplication":
                return { close: this.getCloseBigProducts(question), fallback: this.getFallbackResults(question), isPlausible: isPositive };
            case "division":
                return { close: this.getCloseQuotients(question), fallback: this.getFallbackResults(question), isPlausible: isPositive };
            default:
                return { close: this.getCloseResults(question), fallback: this.getFallbackResults(question), isPlausible: isPositive };
        }
    }

    // The slips a child really makes on 7 × 8: a neighbour in the table (7 × 7, 7 × 9), an off-by-one, swapped digits.
    private static getCloseProducts(question: DistractorSource): number[] {
        return [...this.getNeighbourProducts(question, 1), question.result - 1, question.result + 1, ...this.getSwappedDigits(question.result)];
    }

    private static getFallbackProducts(question: DistractorSource): number[] {
        const fallbacks: number[] = [];
        for (let distance = 2; distance <= this.getMaxFallbackDistance(); distance++) {
            fallbacks.push(...this.getNeighbourProducts(question, distance), question.result - distance, question.result + distance);
        }
        return fallbacks;
    }

    private static getNeighbourProducts(question: DistractorSource, distance: number): number[] {
        const neighbours: number[] = [];
        for (const offset of [-distance, distance]) {
            if (FactsUtils.isValidFactor(question.right + offset)) {
                neighbours.push(question.left * (question.right + offset));
            }
            if (FactsUtils.isValidFactor(question.left + offset)) {
                neighbours.push((question.left + offset) * question.right);
            }
        }
        return neighbours;
    }

    // Two-digit numbers only (56 → 65). A trailing zero would turn into a leading one (40 → 04).
    private static getSwappedDigits(value: number): number[] {
        if (value < 10 || value > 99) {
            return [];
        }
        const tens: number = Math.floor(value / 10);
        const units: number = value % 10;
        if (units === 0 || units === tens) {
            return [];
        }
        return [units * 10 + tens];
    }

    // On ? × 7 = 56 or 56 ÷ 7 the slips are the numbers next to the answer, or repeating the number already shown.
    private static getCloseFactors(question: DistractorSource): number[] {
        const shownFactor: number = question.kind === "missing-right" ? question.left : question.right;
        return [question.answer - 1, question.answer + 1, shownFactor];
    }

    private static getFallbackFactors(question: DistractorSource): number[] {
        const fallbacks: number[] = [];
        for (let distance = 2; distance <= this.getMaxFallbackDistance(); distance++) {
            fallbacks.push(question.answer - distance, question.answer + distance);
        }
        return fallbacks;
    }

    // The slips on 37 + 25 or 52 − 27: off by one, a ten too many or too few, each column on its own, swapped digits.
    private static getCloseResults(question: DistractorSource): number[] {
        return [
            question.answer - 1,
            question.answer + 1,
            question.answer - 10,
            question.answer + 10,
            this.getColumnSlip(question),
            ...this.getSwappedDigits(question.answer)
        ];
    }

    private static getFallbackResults(question: DistractorSource): number[] {
        const fallbacks: number[] = [];
        for (let distance = 2; distance <= this.getMaxFallbackDistance(); distance++) {
            fallbacks.push(question.answer - distance, question.answer + distance);
        }
        return fallbacks;
    }

    // The slips on 23 × 4 or 157 × 6: one group too many or too few, a ten off, forgetting the carries, swapped digits.
    private static getCloseBigProducts(question: DistractorSource): number[] {
        const smallFactor: number = Math.min(question.left, question.right);
        return [
            question.answer - smallFactor,
            question.answer + smallFactor,
            question.answer - 10,
            question.answer + 10,
            this.getForgottenCarrySlip(question),
            ...this.getSwappedDigits(question.answer)
        ];
    }

    // The slips on 72 ÷ 4: off by one or by a ten, swapped digits.
    private static getCloseQuotients(question: DistractorSource): number[] {
        return [question.answer - 1, question.answer + 1, question.answer - 10, question.answer + 10, ...this.getSwappedDigits(question.answer)];
    }

    // Writing each product without what was carried: 27 × 4 → 88 instead of 108, 157 × 6 → 602 instead of 942.
    private static getForgottenCarrySlip(question: DistractorSource): number {
        const bigFactor: number = Math.max(question.left, question.right);
        const smallFactor: number = Math.min(question.left, question.right);
        const digits: number[] = ArithmeticUtils.getDigits(bigFactor);
        return digits.reduce((slip, digit, column) => {
            const product: number = digit * smallFactor;
            const written: number = column === digits.length - 1 ? product : product % 10;
            return slip + written * 10 ** column;
        }, 0);
    }

    // Working each column alone: forgetting the carry on 37 + 25 gives 52; taking the smaller digit from the larger on 52 − 27 gives 35.
    private static getColumnSlip(question: DistractorSource): number {
        const columnCount: number = Math.max(ArithmeticUtils.getDigits(question.left).length, ArithmeticUtils.getDigits(question.right).length);
        let slip: number = 0;
        for (let column = 0; column < columnCount; column++) {
            const leftDigit: number = ArithmeticUtils.getDigit(question.left, column);
            const rightDigit: number = ArithmeticUtils.getDigit(question.right, column);
            const digit: number = question.operation === "addition" ? (leftDigit + rightDigit) % 10 : Math.abs(leftDigit - rightDigit);
            slip += digit * 10 ** column;
        }
        return slip;
    }
}
