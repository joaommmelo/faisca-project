import { FactsUtils } from "../facts/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import type { Question } from "../questions/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import type { Session } from "../session/utils.ts";
import type { VerticalColumn } from "../vertical/utils.ts";
import { WalletUtils, type Wallet } from "../wallet/utils.ts";

// Steps on the column being written: point at it, show the carry or the borrow, and only then give the digit.
export type VerticalHelpStep = "column" | "marks" | "digit";

// A multiplication the child can lean on, e.g. 7 × 7 = 49 for 7 × 8.
export interface NeighbourFact {
    left: number;
    right: number;
    result: number;
}

// For a typed addition or subtraction: one easy step first (37 + 20 = 57, then + 5), or where to start counting.
export type ArithmeticHint = { kind: "split"; firstStep: NeighbourFact; remaining: number } | { kind: "count"; start: number; steps: number; unit: 1 | 10 };

// Why the help button is off: the piggy bank is empty, or this session's helps are used up.
export type HelpUnavailableReason = "no-coins" | "limit";

export class HelpsUtils {
    public static getMaxHelpsPerSession(): number {
        return 3;
    }

    // Multiple choice keeps the answer and one other option.
    public static getOptionsLeftByHelp(): number {
        return 2;
    }

    // Every question has a help: fewer options, a first step, a neighbouring fact, or the column steps.
    public static canUse(session: Session, wallet: Wallet): boolean {
        if (session.isCurrentHelped) {
            return true;
        }
        return session.helpsUsed < this.getMaxHelpsPerSession() && WalletUtils.canSpend(wallet);
    }

    public static getUnavailableReason(session: Session, wallet: Wallet): HelpUnavailableReason | null {
        if (session.isCurrentHelped) {
            return null;
        }
        if (session.helpsUsed >= this.getMaxHelpsPerSession()) {
            return "limit";
        }
        return WalletUtils.canSpend(wallet) ? null : "no-coins";
    }

    // Hides wrong options not tried yet until only the answer and one other remain visible.
    public static getOptionsToHide(question: Question, missedAttempts: number[], random: RandomSource = Math.random): number[] {
        const untriedWrong: number[] = question.options.filter((option) => option !== question.answer && !missedAttempts.includes(option));
        const visibleCount: number = untriedWrong.length + 1;
        const hideCount: number = Math.max(visibleCount - this.getOptionsLeftByHelp(), 0);
        return RandomUtils.shuffle(untriedWrong, random).slice(0, hideCount);
    }

    // Splits the number added or taken away so the first step is easy and the rest is small; never the answer itself.
    public static getArithmeticHint(question: Question): ArithmeticHint {
        const sign: number = question.operation === "addition" ? 1 : -1;
        const { left, right } = question;
        const units: number = right % 10;
        if (right >= 10 && units === 0) {
            return { kind: "count", start: left, steps: right / 10, unit: 10 };
        }
        if (right >= 10) {
            const firstPart: number = right - units;
            return { kind: "split", firstStep: { left, right: firstPart, result: left + sign * firstPart }, remaining: units };
        }

        // A single digit that crosses a ten goes to the ten first: 8 + 5 = 8 + 2 + 3; 13 − 7 = 13 − 3 − 4.
        const toTen: number = sign === 1 ? 10 - (left % 10) : left % 10;
        const crossesTen: boolean = toTen > 0 && toTen < right;
        if (crossesTen) {
            return { kind: "split", firstStep: { left, right: toTen, result: left + sign * toTen }, remaining: right - toTen };
        }
        return { kind: "count", start: left, steps: right, unit: 1 };
    }

    public static getVerticalSteps(column: VerticalColumn): VerticalHelpStep[] {
        const hasMarks: boolean = column.carryIn || column.workingTop !== null;
        return hasMarks ? ["column", "marks", "digit"] : ["column", "digit"];
    }

    // The fact next to the question that sits in the highest box, i.e. the one the child knows best.
    public static getNeighbourFact(question: Question, boxes: LeitnerBoxes): NeighbourFact {
        const candidates: NeighbourFact[] = this.getNeighbourCandidates(question).filter(
            (fact) => FactsUtils.isValidFactor(fact.left) && FactsUtils.isValidFactor(fact.right)
        );
        if (candidates.length === 0) {
            throw new Error(`No neighbour fact for ${question.id}.`);
        }
        const getBox = (fact: NeighbourFact): number => LeitnerUtils.getBox(boxes, FactsUtils.getFactId(fact.left, fact.right));
        return candidates.reduce((best, candidate) => (getBox(candidate) > getBox(best) ? candidate : best));
    }

    // Neighbours move the hidden number, so the hint leads to the answer without giving it away.
    private static getNeighbourCandidates(question: Question): NeighbourFact[] {
        const createFact = (left: number, right: number): NeighbourFact => ({ left, right, result: left * right });
        if (question.operation === "division") {
            return [createFact(question.right, question.answer - 1), createFact(question.right, question.answer + 1)];
        }
        switch (question.kind) {
            case "missing-left":
                return [createFact(question.answer - 1, question.right), createFact(question.answer + 1, question.right)];
            case "missing-right":
                return [createFact(question.left, question.answer - 1), createFact(question.left, question.answer + 1)];
            default:
                return [
                    createFact(question.left, question.right - 1),
                    createFact(question.left, question.right + 1),
                    createFact(question.left - 1, question.right),
                    createFact(question.left + 1, question.right)
                ];
        }
    }
}
