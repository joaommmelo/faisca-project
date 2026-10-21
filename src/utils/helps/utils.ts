import { FactsUtils } from "../facts/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import type { Question } from "../questions/utils.ts";
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

// Why the help button is off: the piggy bank is empty, or this session's helps are used up.
export type HelpUnavailableReason = "no-coins" | "limit";

export class HelpsUtils {
    public static getMaxHelpsPerSession(): number {
        return 3;
    }

    // Columns in additions and subtractions, typed answers in multiplication and division. Multiple choice never.
    public static isAvailableFor(question: Question): boolean {
        if (question.format === "vertical") {
            return true;
        }
        return question.format === "keypad" && (question.operation === "multiplication" || question.operation === "division");
    }

    public static canUse(session: Session, question: Question, wallet: Wallet): boolean {
        if (!this.isAvailableFor(question)) {
            return false;
        }
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
