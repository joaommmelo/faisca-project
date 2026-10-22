import { ArithmeticUtils, type Operands } from "../arithmetic/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { QuestionsUtils, type QuestionKind } from "../questions/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

// One question of the challenge: always the result, always typed, against its own time.
export interface ChallengeQuestion {
    id: string;
    operation: Operation;
    left: number;
    right: number;
    result: number;
    kind: QuestionKind;
    answer: number;
    // The digits of the biggest number shown: the sum, the number subtracted from, the product, the number divided.
    digits: number;
    timeLimitMilliseconds: number;
}

// The time left on a question. It runs in stretches: it stops while the exit question is open (startedAt null)
// and goes on from where it was.
export interface ChallengeClock {
    startedAt: number | null;
    budgetMilliseconds: number;
}

// wrong: a wrong answer. time: the question's time ran out. stop: the player chose to stop.
export type ChallengeEnding = "wrong" | "time" | "stop";

export interface ChallengeRun {
    correctCount: number;
    lastQuestion: ChallengeQuestion;
    givenAnswer: number | null;
    ending: ChallengeEnding;
    // The record before this run, to tell whether it was beaten.
    previousRecord: number | null;
}

// The endless challenge, for adults: every level brings bigger numbers and less time, and the operations join one by
// one. Past the top level everything stays at its hardest, until the first miss. It never touches the child's progress.
export class ChallengeUtils {
    public static getAnswersPerLevel(): number {
        return 5;
    }

    // Addition first; subtraction, multiplication and division join every two levels.
    public static getOperationEntryGap(): number {
        return 2;
    }

    // Each operation starts with two-digit numbers (37 + 45, 56 ÷ 7) and grows one digit per level.
    public static getMinDigits(): number {
        return 2;
    }

    // Also the most digits the keypad takes: no answer is longer than the biggest number shown.
    public static getMaxDigits(): number {
        return 7;
    }

    // The time of a question grows with its digits, to think and to type.
    public static getBaseMilliseconds(): number {
        return 2000;
    }

    public static getMillisecondsPerDigit(): number {
        return 3000;
    }

    // At the top level a question gets half the time it had at level 1.
    public static getMinSpeedFactor(): number {
        return 0.5;
    }

    // Avoids asking the same question twice in a row.
    public static getMaxDrawAttempts(): number {
        return 50;
    }

    public static getLevel(correctCount: number): number {
        return Math.floor(correctCount / this.getAnswersPerLevel()) + 1;
    }

    public static isLevelUp(correctCount: number): boolean {
        return correctCount > 0 && correctCount % this.getAnswersPerLevel() === 0;
    }

    public static getEntryLevel(operation: Operation): number {
        return 1 + OperationsUtils.getValidOperations().indexOf(operation) * this.getOperationEntryGap();
    }

    public static getOperations(level: number): Operation[] {
        return OperationsUtils.getValidOperations().filter((operation) => this.getEntryLevel(operation) <= level);
    }

    // The operation that joins at this level, if any.
    public static getJoiningOperation(level: number): Operation | null {
        return OperationsUtils.getValidOperations().find((operation) => this.getEntryLevel(operation) === level) ?? null;
    }

    public static getDigits(operation: Operation, level: number): number {
        return Math.min(this.getMaxDigits(), this.getMinDigits() + level - this.getEntryLevel(operation));
    }

    // The level where the last operation to join reaches the most digits; the time is shortest there too.
    public static getTopLevel(): number {
        const lastOperation: Operation = OperationsUtils.getValidOperations()[OperationsUtils.getValidOperations().length - 1];
        return this.getEntryLevel(lastOperation) + this.getMaxDigits() - this.getMinDigits();
    }

    // The share of a question's time given at this level: all of it at level 1, shrinking evenly to the minimum.
    public static getSpeedFactor(level: number): number {
        const climbedShare: number = (Math.min(level, this.getTopLevel()) - 1) / (this.getTopLevel() - 1);
        return 1 - (1 - this.getMinSpeedFactor()) * climbedShare;
    }

    public static getTimeLimitMilliseconds(digits: number, level: number): number {
        return Math.round((this.getBaseMilliseconds() + this.getMillisecondsPerDigit() * digits) * this.getSpeedFactor(level));
    }

    // The biggest number of the question has exactly this many digits. In additions and subtractions the other one
    // has at least two digits and at most one fewer: 37 + 45, 1 234 567 + 345 678, never 1 + 25 nor 1 234 567 + 3.
    // Subtractions stay positive and divisions exact, by a single digit.
    public static generate(operation: Operation, digits: number, random: RandomSource = Math.random): Operands {
        const lowest: number = 10 ** (digits - 1);
        const highest: number = 10 ** digits - 1;
        const smallestOther: number = 10 ** Math.max(1, digits - 2);
        switch (operation) {
            case "addition": {
                const sum: number = RandomUtils.integerBetween(Math.max(lowest, 2 * smallestOther), highest, random);
                const left: number = RandomUtils.integerBetween(smallestOther, sum - smallestOther, random);
                return { left, right: sum - left };
            }
            case "subtraction": {
                const left: number = RandomUtils.integerBetween(Math.max(lowest, smallestOther + 1), highest, random);
                return { left, right: RandomUtils.integerBetween(smallestOther, left - 1, random) };
            }
            case "multiplication":
                return this.drawFactors(lowest, highest, random);
            default: {
                const factors: Operands = this.drawFactors(lowest, highest, random);
                return { left: factors.left * factors.right, right: factors.right };
            }
        }
    }

    public static createQuestion(correctCount: number, previous: ChallengeQuestion | null, random: RandomSource = Math.random): ChallengeQuestion {
        const level: number = this.getLevel(correctCount);
        let candidate: ChallengeQuestion | null = null;
        for (let attempt = 0; attempt < this.getMaxDrawAttempts(); attempt++) {
            candidate = this.drawQuestion(level, random);
            if (previous === null || candidate.id !== previous.id) {
                return candidate;
            }
        }
        if (candidate === null) {
            throw new Error("Could not draw a challenge question.");
        }
        return candidate;
    }

    public static startClock(budgetMilliseconds: number, now: number): ChallengeClock {
        return { startedAt: now, budgetMilliseconds };
    }

    public static getRemainingMilliseconds(clock: ChallengeClock, now: number): number {
        if (clock.startedAt === null) {
            return clock.budgetMilliseconds;
        }
        return Math.max(0, clock.budgetMilliseconds - (now - clock.startedAt));
    }

    public static pauseClock(clock: ChallengeClock, now: number): ChallengeClock {
        return { startedAt: null, budgetMilliseconds: this.getRemainingMilliseconds(clock, now) };
    }

    public static resumeClock(clock: ChallengeClock, now: number): ChallengeClock {
        return clock.startedAt === null ? this.startClock(clock.budgetMilliseconds, now) : clock;
    }

    public static isNewRecord(run: ChallengeRun): boolean {
        return run.correctCount > 0 && (run.previousRecord === null || run.correctCount > run.previousRecord);
    }

    // Only the record changes: no boxes, levels, coins or practice days.
    public static finishRun(profile: Profile, run: ChallengeRun): Profile {
        return this.isNewRecord(run) ? { ...profile, challengeRecord: run.correctCount } : profile;
    }

    private static drawQuestion(level: number, random: RandomSource): ChallengeQuestion {
        const operation: Operation = RandomUtils.pickOne(this.getOperations(level), random);
        const digits: number = this.getDigits(operation, level);
        const { left, right } = this.generate(operation, digits, random);
        const result: number = OperationsUtils.calculate(operation, left, right);
        return {
            id: QuestionsUtils.getQuestionId(operation, left, right, "direct"),
            operation,
            left,
            right,
            result,
            kind: "direct",
            answer: result,
            digits,
            timeLimitMilliseconds: this.getTimeLimitMilliseconds(digits, level)
        };
    }

    // A single digit times a bigger factor, with the product inside the range. The bigger factor comes first.
    private static drawFactors(lowest: number, highest: number, random: RandomSource): Operands {
        const smallFactor: number = RandomUtils.integerBetween(ArithmeticUtils.getMinSmallFactor(), ArithmeticUtils.getMaxSmallFactor(), random);
        const minBigFactor: number = Math.max(ArithmeticUtils.getMinSmallFactor(), Math.ceil(lowest / smallFactor));
        const bigFactor: number = RandomUtils.integerBetween(minBigFactor, Math.floor(highest / smallFactor), random);
        return { left: bigFactor, right: smallFactor };
    }
}
