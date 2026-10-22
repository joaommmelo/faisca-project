import { FactsUtils } from "../facts/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import { SessionUtils } from "../session/utils.ts";

// Two factors, in the order the child picked them: 4 × 6 and 6 × 4 both make 24.
export interface FactorPair {
    first: number;
    second: number;
}

// One number to find a multiplication for.
export interface FactorRound {
    target: number;
    // Every multiplication of the pad that makes the target, smaller factor first: 24 → 2 × 12, 3 × 8, 4 × 6.
    pairs: FactorPair[];
    // The one shown after two misses: one with a table the child chose.
    answer: FactorPair;
}

export interface FactorRoundResult {
    round: FactorRound;
    // Every pair tried, the last one included.
    givenPairs: FactorPair[];
    isCorrect: boolean;
}

export interface FactorGame {
    rounds: FactorRound[];
    currentIndex: number;
    // The pairs already missed on the current round.
    missedPairs: FactorPair[];
    results: FactorRoundResult[];
}

export type FactorAttemptOutcome = "correct" | "try-again" | "wrong";

export interface FactorAttemptResult {
    game: FactorGame;
    outcome: FactorAttemptOutcome;
}

// What the screen after a game shows.
export interface FactorGameOutcome {
    correctAtFirstTry: number;
    roundCount: number;
    // The numbers not found at the first try, to see every multiplication that makes them.
    roundsToPractise: FactorRound[];
}

// "Descobre a conta": the times tables the other way round. A number shows and the child finds a multiplication that
// makes it, and any one counts (24 is 3 × 8 as much as 4 × 6). It never touches the child's progress.
export class FactorGameUtils {
    public static getRoundsPerGame(): number {
        return 10;
    }

    // × 1 makes every number, so it would answer everything and teach nothing: the pad starts at 2.
    public static getMinFactor(): number {
        return 2;
    }

    public static getFactors(): number[] {
        return FactsUtils.getValidFactors().filter((factor) => factor >= this.getMinFactor());
    }

    public static getPairs(target: number): FactorPair[] {
        return this.getFactors()
            .filter((factor) => target % factor === 0 && factor <= target / factor && this.getFactors().includes(target / factor))
            .map((factor) => ({ first: factor, second: target / factor }));
    }

    // The numbers of the chosen tables, each once: the products of their facts, without × 1.
    public static getTargets(tables: number[]): number[] {
        const products: number[] = FactsUtils.getForTables(tables)
            .filter((fact) => fact.smallerFactor >= this.getMinFactor())
            .map((fact) => fact.product);
        return [...new Set(products)].sort((first, second) => first - second);
    }

    // Without × 1, the table of 1 alone has no number to find.
    public static canPlay(tables: number[]): boolean {
        return this.getTargets(tables).length > 0;
    }

    // Different numbers in every round. Any table from 2 to 12 has 11, so a game always has its 10.
    public static create(tables: number[], random: RandomSource = Math.random): FactorGame {
        const targets: number[] = RandomUtils.shuffle(this.getTargets(tables), random).slice(0, this.getRoundsPerGame());
        return { rounds: targets.map((target) => this.createRound(target, tables)), currentIndex: 0, missedPairs: [], results: [] };
    }

    public static getCurrentRound(game: FactorGame): FactorRound {
        return game.rounds[game.currentIndex];
    }

    // The current round's result once it is answered, or null while the child is still trying.
    public static getCurrentResult(game: FactorGame): FactorRoundResult | null {
        return game.results.length > game.currentIndex ? game.results[game.currentIndex] : null;
    }

    // The same two tries as in the practice: the first miss only says to try again.
    public static submit(game: FactorGame, pair: FactorPair): FactorAttemptResult {
        const round: FactorRound = this.getCurrentRound(game);
        const isCorrect: boolean = pair.first * pair.second === round.target;
        const hasAnotherAttempt: boolean = game.missedPairs.length + 1 < SessionUtils.getAttemptsPerQuestion();
        if (!isCorrect && hasAnotherAttempt) {
            return { game: { ...game, missedPairs: [...game.missedPairs, pair] }, outcome: "try-again" };
        }
        const result: FactorRoundResult = { round, givenPairs: [...game.missedPairs, pair], isCorrect };
        return { game: { ...game, results: [...game.results, result] }, outcome: isCorrect ? "correct" : "wrong" };
    }

    public static advance(game: FactorGame): FactorGame {
        return { ...game, currentIndex: game.currentIndex + 1, missedPairs: [] };
    }

    public static isFinished(game: FactorGame): boolean {
        return game.currentIndex >= game.rounds.length;
    }

    public static isFirstTryCorrect(result: FactorRoundResult): boolean {
        return result.isCorrect && result.givenPairs.length === 1;
    }

    // What the slots show once answered: the child's own multiplication when right, otherwise the answer.
    public static getShownPair(result: FactorRoundResult): FactorPair {
        return result.isCorrect ? result.givenPairs[result.givenPairs.length - 1] : result.round.answer;
    }

    // The other multiplications that make the same number, shown once it is answered.
    public static getOtherPairs(result: FactorRoundResult): FactorPair[] {
        const shownPair: FactorPair = this.getShownPair(result);
        return result.round.pairs.filter((pair) => !this.isSamePair(pair, shownPair));
    }

    public static getOutcome(game: FactorGame): FactorGameOutcome {
        return {
            correctAtFirstTry: game.results.filter((result) => this.isFirstTryCorrect(result)).length,
            roundCount: game.rounds.length,
            roundsToPractise: game.results.filter((result) => !this.isFirstTryCorrect(result)).map((result) => result.round)
        };
    }

    private static createRound(target: number, tables: number[]): FactorRound {
        const pairs: FactorPair[] = this.getPairs(target);
        const answer: FactorPair | undefined = pairs.find((pair) => tables.includes(pair.first) || tables.includes(pair.second));
        if (answer === undefined) {
            throw new Error(`${target} is not a product of the tables ${tables.join(", ")}.`);
        }
        return { target, pairs, answer };
    }

    private static isSamePair(pair: FactorPair, otherPair: FactorPair): boolean {
        return (
            Math.min(pair.first, pair.second) === Math.min(otherPair.first, otherPair.second) && pair.first * pair.second === otherPair.first * otherPair.second
        );
    }
}
