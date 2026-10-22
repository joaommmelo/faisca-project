import type moment from "moment";
import { FactsUtils } from "../facts/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import { LevelsUtils, type RecentAnswer, type RecordTrackAnswerResult } from "../levels/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { ProgressionUtils, type ApplyRecordResult, type ClockOutcome, type Milestone, type TimedProfile } from "../progression/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import { RecordsUtils } from "../records/utils.ts";
import { SessionUtils } from "../session/utils.ts";
import { StatsUtils } from "../stats/utils.ts";
import { WalletUtils, type AddWalletPointsResult } from "../wallet/utils.ts";

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
    isHelped: boolean;
}

export interface FactorGame {
    rounds: FactorRound[];
    currentIndex: number;
    // The pairs already missed on the current round.
    missedPairs: FactorPair[];
    results: FactorRoundResult[];
    isCurrentHelped: boolean;
    helpsUsed: number;
}

export type FactorAttemptOutcome = "correct" | "try-again" | "wrong";

export interface FactorAttemptResult {
    game: FactorGame;
    outcome: FactorAttemptOutcome;
    // The round's result once it is answered; null when the child gets a second chance.
    result: FactorRoundResult | null;
}

export interface FactorGameSummary {
    correctAtFirstTry: number;
    helpedCount: number;
    roundCount: number;
    // The numbers not found alone at the first try, to see every multiplication that makes them.
    roundsToPractise: FactorRound[];
}

// The end of a game, as the game screen hands it over.
export interface FinishedFactorGame {
    summary: FactorGameSummary;
    elapsedMilliseconds: number | null;
    milestones: Milestone[];
}

// What the screen after a game shows.
export interface FactorGameOutcome extends FinishedFactorGame {
    clock: ClockOutcome | null;
}

// "Descobre a conta": the times tables the other way round. A number shows and the child finds a multiplication that
// makes it, and any one counts (24 is 3 × 8 as much as 4 × 6). Coins, helps, the clock and the boxes of the facts
// work as in the practice; the level is the game's own, so it never opens the multiplication's next difficulty.
export class FactorGameUtils {
    public static getRoundsPerGame(): number {
        return 10;
    }

    // × 1 makes every number, so it would answer everything and teach nothing: the pad starts at 2.
    public static getMinFactor(): number {
        return 2;
    }

    public static getTrackId(): string {
        return "factor-game";
    }

    // As much as a typed answer: two taps out of eleven numbers are never a lucky guess among four options.
    public static getPointsForAnswer(): number {
        return LevelsUtils.getPointsForAnswer("keypad");
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
        return {
            rounds: targets.map((target) => this.createRound(target, tables)),
            currentIndex: 0,
            missedPairs: [],
            results: [],
            isCurrentHelped: false,
            helpsUsed: 0
        };
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
            return { game: { ...game, missedPairs: [...game.missedPairs, pair] }, outcome: "try-again", result: null };
        }
        const result: FactorRoundResult = { round, givenPairs: [...game.missedPairs, pair], isCorrect, isHelped: game.isCurrentHelped };
        return { game: { ...game, results: [...game.results, result] }, outcome: isCorrect ? "correct" : "wrong", result };
    }

    // The help gives one factor of the answer, the bigger one, so what is left to find is the smaller.
    public static getHintFactor(round: FactorRound): number {
        return round.answer.second;
    }

    // The coin is paid once per round.
    public static registerHelp(game: FactorGame): FactorGame {
        if (this.getCurrentResult(game) !== null) {
            throw new Error("The current round was already answered.");
        }
        return { ...game, isCurrentHelped: true, helpsUsed: game.isCurrentHelped ? game.helpsUsed : game.helpsUsed + 1 };
    }

    public static advance(game: FactorGame): FactorGame {
        return { ...game, currentIndex: game.currentIndex + 1, missedPairs: [], isCurrentHelped: false };
    }

    public static isFinished(game: FactorGame): boolean {
        return game.currentIndex >= game.rounds.length;
    }

    public static isFirstTryCorrect(result: FactorRoundResult): boolean {
        return result.isCorrect && result.givenPairs.length === 1;
    }

    // What the slots show once answered: the child's own multiplication when right, otherwise the answer. It is also
    // the fact the round trains.
    public static getShownPair(result: FactorRoundResult): FactorPair {
        return result.isCorrect ? result.givenPairs[result.givenPairs.length - 1] : result.round.answer;
    }

    // The other multiplications that make the same number, shown once it is answered.
    public static getOtherPairs(result: FactorRoundResult): FactorPair[] {
        const shownPair: FactorPair = this.getShownPair(result);
        return result.round.pairs.filter((pair) => !this.isSamePair(pair, shownPair));
    }

    // As in the practice, only the first try counts, and a helped round shows what the child does with support:
    // it moves no box, level or coin. Right at the first try, the fact found goes up a box and earns points; otherwise
    // the fact shown goes back to the first box, like a missed fact.
    public static applyResult(profile: Profile, result: FactorRoundResult): ApplyRecordResult {
        if (result.isHelped) {
            return { profile, milestones: [] };
        }

        const isCorrect: boolean = this.isFirstTryCorrect(result);
        const pair: FactorPair = this.getShownPair(result);
        const boxes: LeitnerBoxes = LeitnerUtils.applyAnswer(profile.boxes, FactsUtils.getFactId(pair.first, pair.second), isCorrect);
        const recentAnswer: RecentAnswer = { questionId: `${this.getTrackId()}:${result.round.target}`, isCorrect, format: "keypad" };
        const trackResult: RecordTrackAnswerResult = LevelsUtils.recordAnswer(LevelsUtils.getTrack(profile.tracks, this.getTrackId()), recentAnswer);
        const walletResult: AddWalletPointsResult = isCorrect
            ? WalletUtils.addPoints(profile.wallet, this.getPointsForAnswer())
            : { wallet: profile.wallet, coinsEarned: 0 };

        return {
            profile: { ...profile, boxes, tracks: { ...profile.tracks, [this.getTrackId()]: trackResult.track }, wallet: walletResult.wallet },
            milestones: [
                ...Array.from({ length: walletResult.coinsEarned }, (): Milestone => ({ kind: "coin" })),
                ...trackResult.reachedLevels.map((level): Milestone => ({ kind: "level-up", level }))
            ]
        };
    }

    public static getSummary(game: FactorGame): FactorGameSummary {
        const isAlone = (result: FactorRoundResult): boolean => this.isFirstTryCorrect(result) && !result.isHelped;
        return {
            correctAtFirstTry: game.results.filter(isAlone).length,
            helpedCount: game.results.filter((result) => result.isHelped).length,
            roundCount: game.rounds.length,
            roundsToPractise: game.results.filter((result) => !isAlone(result)).map((result) => result.round)
        };
    }

    // Counts the game and the practice day, and its time against the record of the same tables.
    public static finish(profile: Profile, now: moment.Moment, finished: FinishedFactorGame): TimedProfile {
        const { summary } = finished;
        const timed: TimedProfile = ProgressionUtils.registerTime(
            profile,
            profile.settings.factorGame.clock,
            RecordsUtils.getFactorGameCategory(profile.settings.multiplication.tables),
            finished.elapsedMilliseconds,
            RecordsUtils.isPerfect({ correctAtFirstTry: summary.correctAtFirstTry, firstTryCount: summary.roundCount })
        );
        return { profile: { ...timed.profile, stats: StatsUtils.registerSession(profile.stats, now) }, clock: timed.clock };
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
